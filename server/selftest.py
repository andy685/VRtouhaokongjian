"""百炼知识库 API 端到端自检脚本。

用途：验证本地代理服务 + 百炼知识库 API 是否真正跑通（创建知识库 → 上传资料 →
解析入库 → 切片 → 检索 → 清理）。

前置：
  1. 启动代理服务：python server/bailian_knowledge.py
  2. 配置凭据（server/.env 或命令行参数）：
     ALIBABA_CLOUD_ACCESS_KEY_ID / ALIBABA_CLOUD_ACCESS_KEY_SECRET / WORKSPACE_ID

运行：
  python server/selftest.py
  python server/selftest.py --ak xxx --sk xxx --workspace ws-xxx --keep   # --keep 保留测试知识库
"""

import argparse
import os
import sys
import time
from typing import Any, Dict, Optional

import requests

BASE = "http://127.0.0.1:9610"
PASS, FAIL, SKIP = "PASS", "FAIL", "SKIP"


def load_env():
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.dirname(here)
    for path in (os.path.join(here, ".env"), os.path.join(root, "bailian-setup", ".env")):
        if not os.path.exists(path):
            continue
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def post(path: str, payload: Dict[str, Any]):
    resp = requests.post(f"{BASE}{path}", json=payload, timeout=60)
    try:
        body = resp.json()
    except Exception:
        body = {"success": False, "message": resp.text[:200]}
    return resp.status_code, body


def post_file(path: str, data: Dict[str, str], files):
    resp = requests.post(f"{BASE}{path}", data=data, files=files, timeout=120)
    try:
        body = resp.json()
    except Exception:
        body = {"success": False, "message": resp.text[:200]}
    return resp.status_code, body


def report(step: str, status: str, detail: str = ""):
    icon = {"PASS": "[OK]", "FAIL": "[!!]", "SKIP": "[--]"}[status]
    print(f"{icon} {step}{(' - ' + detail) if detail else ''}")
    return status == PASS


def main():
    global BASE
    load_env()
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=BASE)
    parser.add_argument("--ak", default=os.getenv("ALIBABA_CLOUD_ACCESS_KEY_ID", ""))
    parser.add_argument("--sk", default=os.getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET", ""))
    parser.add_argument("--workspace", default=os.getenv("WORKSPACE_ID", ""))
    parser.add_argument("--query", default="头号空间的退款规则是什么")
    parser.add_argument("--keep", action="store_true", help="保留测试知识库，不删除")
    args = parser.parse_args()

    BASE = args.base_url.rstrip("/")

    if not (args.ak and args.sk and args.workspace):
        print("缺少凭据：请设置 server/.env 中的 ALIBABA_CLOUD_ACCESS_KEY_ID / SECRET / WORKSPACE_ID，或用命令行传入")
        sys.exit(2)

    creds = {"accessKeyId": args.ak, "accessKeySecret": args.sk, "workspaceId": args.workspace}
    results = []

    # 1 健康检查
    try:
        resp = requests.get(f"{BASE}/api/bailian/health", timeout=10).json()
        results.append(report("1. 代理服务健康", PASS if resp.get("success") else FAIL, str(resp.get("data"))))
    except Exception as exc:
        print(f"[!!] 代理服务未启动：{exc}")
        sys.exit(1)

    # 2 连通性
    code, body = post("/api/bailian/test", creds)
    results.append(report("2. 凭据连通性(ListIndices)", PASS if body.get("success") else FAIL,
                          body.get("detail") or f"知识库数量={body.get('data', {}).get('count')}"))
    if not body.get("success"):
        sys.exit(1)

    # 3 列表
    code, body = post("/api/bailian/indices", creds)
    results.append(report("3. 拉取云端知识库列表", PASS if body.get("success") else FAIL,
                          f"共 {len(body.get('data', {}).get('items', []))} 个"))
    if not body.get("success"):
        sys.exit(1)

    index_id = None
    # 4 创建知识库
    name = f"头号空间-自检-{int(time.time())}"
    code, body = post("/api/bailian/index/create", {
        **creds,
        "name": name,
        "description": "由 server/selftest.py 自动创建的自检知识库",
    })
    results.append(report("4. 创建知识库(CreateIndex)", PASS if body.get("success") else FAIL, body.get("detail") or name))
    if body.get("success"):
        index_id = body["data"]["indexId"]
    else:
        sys.exit(1)

    # 5 上传资料并导入
    sample = (
        "头号空间 VR 门店服务说明\n"
        "退款规则：开台后 15 分钟内未开始体验可全额退款；超过 15 分钟按已使用时长折算。\n"
        "营业时间：每日 10:00-22:00。\n"
        "常见问答：设备如何连接？打开头号空间 App，扫描设备二维码即可连接。\n"
    ).encode("utf-8")
    code, body = post_file(
        "/api/bailian/files/upload",
        {**creds, "indexId": index_id},
        {"file": ("头号空间服务说明.txt", sample, "text/plain")},
    )
    file_id = None
    job_id = None
    if body.get("success"):
        file_id = body["data"].get("fileId")
        job_id = body["data"].get("jobId")
    results.append(report("5. 上传资料(Lease+AddFile+导入)", PASS if body.get("success") else FAIL,
                          body.get("detail") or f"fileId={file_id}"))

    # 6 解析任务状态
    if job_id:
        status = ""
        for _ in range(12):
            time.sleep(5)
            code, body = post("/api/bailian/index/job-status", {**creds, "indexId": index_id, "jobId": job_id})
            if body.get("success"):
                status = (body.get("data") or {}).get("status") or ""
                if status in ("COMPLETED", "FINISHED", "SUCCESS", "FAILED", "FAIL"):
                    break
        results.append(report("6. 解析任务状态(GetIndexJobStatus)", PASS if status else FAIL, f"status={status}"))
    else:
        results.append(report("6. 解析任务状态", SKIP, "未返回 jobId"))

    # 7 文档列表
    code, body = post("/api/bailian/documents", {**creds, "indexId": index_id})
    docs = body.get("data", {}).get("items", []) if body.get("success") else []
    results.append(report("7. 文档列表(ListIndexDocuments)", PASS if docs else FAIL, f"{len(docs)} 个文件"))

    # 8 切片列表
    code, body = post("/api/bailian/chunks", {**creds, "indexId": index_id, "pageSize": 5})
    chunks = body.get("data", {}).get("items", []) if body.get("success") else []
    results.append(report("8. 切片列表(ListChunks)", PASS if chunks else FAIL, f"{len(chunks)} 个切片"))

    # 9 检索
    code, body = post("/api/bailian/retrieve", {**creds, "indexId": index_id, "query": args.query, "topK": 3})
    hits = body.get("data", {}).get("items", []) if body.get("success") else []
    results.append(report("9. 单库检索(Retrieve)", PASS if hits else FAIL, f"命中 {len(hits)} 条"))

    # 10 清理
    if args.keep:
        results.append(report("10. 清理测试知识库", SKIP, f"--keep，保留 {index_id}"))
    else:
        code, body = post("/api/bailian/index/delete", {**creds, "indexId": index_id})
        results.append(report("10. 删除知识库(DeleteIndex)", PASS if body.get("success") else FAIL, body.get("detail") or ""))

    passed = sum(1 for r in results if r)
    print(f"\n结果：{passed}/{len(results)} 项通过")
    print(f"知识库 ID：{index_id}" if args.keep else "")
    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
