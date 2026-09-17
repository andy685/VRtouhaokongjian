"""阿里云百炼知识库（RAG）本地代理服务 · 全功能版。

能力覆盖（对应 https://docs.bailian.console.aliyun.com/zh/model-studio/api-bailian-2023-12-29-dir-knowledge-base）：
  索引：CreateIndex / SubmitIndexJob / GetIndexJobStatus / UpdateIndex / DeleteIndex / ListIndices / GetIndexMonitor
  文档：ListIndexDocuments / ListIndexFileDetails / SubmitIndexAddDocumentsJob / DeleteIndexDocument
  文件：ApplyFileUploadLease + 上传 + AddFile / ListFile / DeleteFiles
  切片：ListChunks / AddChunk / UpdateChunk / DeleteChunk
  检索：Retrieve（单库）/ 跨库知识检索（/api/v1/indices/knowledge/search）

为什么要有这一层：
  百炼知识库 OpenAPI 需要 RAM AccessKey 做请求签名，且浏览器无法跨域直连，
  密钥也不能下发到前端，因此所有调用统一由本服务代签转发。

启动：
    pip install -r requirements.txt
    python server/bailian_knowledge.py        # http://127.0.0.1:9610

凭据优先级：请求体 > server/.env > bailian-setup/.env
  ALIBABA_CLOUD_ACCESS_KEY_ID / ALIBABA_CLOUD_ACCESS_KEY_SECRET / WORKSPACE_ID
  DASHSCOPE_API_KEY（跨库检索使用）
"""

import hashlib
import json
import os
from typing import Any, Dict, List, Optional

import requests
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from alibabacloud_bailian20231229 import models as bailian_models
from alibabacloud_bailian20231229.client import Client as BailianClient
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_util import models as util_models
from alibabacloud_tea_util.client import Client as UtilClient

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(HERE)
load_dotenv(os.path.join(HERE, ".env"))
load_dotenv(os.path.join(PROJECT_ROOT, "bailian-setup", ".env"))

DEFAULT_ENDPOINT = "bailian.cn-beijing.aliyuncs.com"
DEFAULT_CATEGORY = "DEFAULT"

app = FastAPI(title="Bailian Knowledge Proxy", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 基础模型 ----------
class Credentials(BaseModel):
    accessKeyId: str = ""
    accessKeySecret: str = ""
    workspaceId: str = ""
    endpoint: str = ""


class EmptyPayload(Credentials):
    pass


class IndexIdPayload(Credentials):
    indexId: str = ""


class CreateIndexPayload(Credentials):
    name: str
    description: str = ""
    structureType: str = "unstructured"
    sourceType: str = "DATA_CENTER_FILE"
    sinkType: str = "BUILT_IN"
    embeddingModelName: str = "text-embedding-v4"
    chunkSize: int = 512
    overlapSize: int = 64
    separator: str = ""
    enableRewrite: bool = False
    rerankMode: str = ""
    rerankModelName: str = ""
    rerankMinScore: float = 0.0


class UpdateIndexPayload(Credentials):
    indexId: str = ""
    name: str = ""
    description: str = ""
    denseSimilarityTopK: Optional[int] = None
    sparseSimilarityTopK: Optional[int] = None
    rerankMinScore: Optional[float] = None


class AddDocumentsPayload(Credentials):
    indexId: str = ""
    documentIds: List[str] = []
    chunkSize: int = 512
    overlapSize: int = 64
    separator: str = ""
    chunkMode: str = ""
    enableHeaders: bool = False


class DeleteDocumentsPayload(Credentials):
    indexId: str = ""
    documentIds: List[str] = []


class JobStatusPayload(Credentials):
    indexId: str = ""
    jobId: str = ""
    pageNumber: int = 1
    pageSize: int = 10


class DocumentsPayload(Credentials):
    indexId: str = ""
    documentName: str = ""
    documentStatus: str = ""
    enableNameLike: bool = False
    pageNumber: int = 1
    pageSize: int = 20


class ListFilesPayload(Credentials):
    categoryId: str = DEFAULT_CATEGORY
    fileName: str = ""
    maxResults: int = 20
    nextToken: str = ""


class AddCategoryPayload(Credentials):
    categoryName: str = ""
    categoryType: str = DEFAULT_CATEGORY
    parentCategoryId: str = ""
    connectorId: str = ""


class DeleteCategoryPayload(Credentials):
    categoryId: str = ""


class FileIdPayload(Credentials):
    fileId: str = ""


class FileTagPayload(Credentials):
    fileId: str = ""
    tags: List[str] = []


class BatchFileTagPayload(Credentials):
    fileInfos: List[Dict[str, Any]] = []
    updateMode: str = "OVERWRITE"


class OssFileDetail(BaseModel):
    fileName: str = ""
    ossKey: str = ""
    parser: str = ""


class AddOssFilesPayload(Credentials):
    categoryId: str = DEFAULT_CATEGORY
    categoryType: str = DEFAULT_CATEGORY
    ossBucketName: str = ""
    ossRegionId: str = ""
    overwriteFileByOssKey: bool = False
    tags: List[str] = []
    fileDetails: List[OssFileDetail] = []


class DeleteFilesPayload(Credentials):
    fileIds: List[str] = []


class ChunksPayload(Credentials):
    indexId: str = ""
    fileId: Optional[str] = None
    pageNum: int = 1
    pageSize: int = 10


class AddChunkPayload(Credentials):
    indexId: str = ""
    title: str = ""
    content: str = ""
    dataId: str = ""


class UpdateChunkPayload(Credentials):
    indexId: str = ""
    chunkId: str = ""
    title: str = ""
    content: str = ""


class DeleteChunksPayload(Credentials):
    indexId: str = ""
    chunkIds: List[str] = []


class RetrievePayload(Credentials):
    indexId: str = ""
    query: str = ""
    topK: int = 5
    enableReranking: bool = True
    enableRewrite: bool = False


class SearchPayload(Credentials):
    query: str = ""
    agentId: str = ""
    apiKey: str = ""
    images: List[str] = []


class MonitorPayload(Credentials):
    indexId: str = ""
    startTimestamp: int = 0
    endTimestamp: int = 0


# ---------- 工具 ----------
def _resolve(payload: Credentials):
    ak = payload.accessKeyId or os.getenv("ALIBABA_CLOUD_ACCESS_KEY_ID", "")
    sk = payload.accessKeySecret or os.getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET", "")
    ws = payload.workspaceId or os.getenv("WORKSPACE_ID", "")
    if not ak or not sk:
        raise HTTPException(
            status_code=400,
            detail="缺少阿里云 AccessKey：请在页面填写，或在 server/.env 配置 ALIBABA_CLOUD_ACCESS_KEY_ID / SECRET",
        )
    if not ws:
        raise HTTPException(status_code=400, detail="缺少百炼业务空间 ID（WORKSPACE_ID）")
    endpoint = (payload.endpoint or os.getenv("BAILIAN_ENDPOINT") or DEFAULT_ENDPOINT).strip()
    for prefix in ("https://", "http://"):
        if endpoint.startswith(prefix):
            endpoint = endpoint[len(prefix):]
    return ak, sk, ws, endpoint.rstrip("/")


def _client(ak: str, sk: str, endpoint: str) -> BailianClient:
    config = open_api_models.Config(access_key_id=ak, access_key_secret=sk)
    config.endpoint = endpoint or DEFAULT_ENDPOINT
    return BailianClient(config)


def _runtime() -> util_models.RuntimeOptions:
    runtime = util_models.RuntimeOptions()
    runtime.connect_timeout = 10000
    runtime.read_timeout = 30000
    return runtime


def _body(response) -> Dict[str, Any]:
    try:
        return response.body.to_map() or {}
    except Exception:
        try:
            return json.loads(UtilClient.to_jsonstring(response.body))
        except Exception:
            return {}


def _data(response) -> Dict[str, Any]:
    return _body(response).get("Data") or {}


def ok(data: Any = None, message: str = "success"):
    return {"success": True, "message": message, "data": data}


def _call(func, *args, action: str):
    try:
        response = func(*args, {}, _runtime())
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"{action}失败：{exc}")
    body = _body(response)
    if body.get("Success") not in (True, "true"):
        raise HTTPException(
            status_code=502,
            detail=f"{action}失败：{body.get('Message') or body.get('Code') or '未知错误'}（requestId={body.get('RequestId')}）",
        )
    return response


# ---------- 健康检查 / 连通性 ----------
@app.get("/api/bailian/health")
def health():
    return ok(
        {
            "service": "bailian-knowledge-proxy",
            "version": "2.0.0",
            "hasEnvCredentials": bool(
                os.getenv("ALIBABA_CLOUD_ACCESS_KEY_ID") and os.getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET")
            ),
            "hasWorkspaceId": bool(os.getenv("WORKSPACE_ID")),
            "hasDashscopeKey": bool(os.getenv("DASHSCOPE_API_KEY")),
        }
    )


@app.post("/api/bailian/test")
def test_connection(payload: Credentials):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    response = _call(client.list_indices_with_options, ws, bailian_models.ListIndicesRequest(), action="连通性测试")
    indices = (_data(response).get("Indices")) or []
    return ok(
        {
            "workspaceId": ws,
            "endpoint": endpoint,
            "count": len(indices),
            "names": [i.get("Name") for i in indices][:10],
        },
        "百炼知识库配置正常",
    )


# ---------- 索引 ----------
@app.post("/api/bailian/indices")
def list_indices(payload: Credentials):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    response = _call(client.list_indices_with_options, ws, bailian_models.ListIndicesRequest(), action="拉取知识库列表")
    data = _data(response)
    items = []
    for item in data.get("Indices") or []:
        doc_ids = item.get("DocumentIds") or []
        items.append(
            {
                "id": item.get("Id"),
                "name": item.get("Name"),
                "description": item.get("Description") or "",
                "sourceType": item.get("SourceType"),
                "sinkType": item.get("SinkType"),
                "structureType": item.get("StructureType"),
                "chunkSize": item.get("ChunkSize"),
                "embeddingModelName": item.get("EmbeddingModelName"),
                "rerankModelName": item.get("RerankModelName"),
                "documents": len(doc_ids),
                "documentIds": doc_ids,
                "updatedAt": "-",
                "source": "cloud",
            }
        )
    return ok({"total": data.get("TotalCount") or len(items), "items": items})


@app.post("/api/bailian/index/create")
def create_index(payload: CreateIndexPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    request = bailian_models.CreateIndexRequest(
        name=payload.name,
        description=payload.description,
        structure_type=payload.structureType,
        source_type=payload.sourceType,
        sink_type=payload.sinkType,
        embedding_model_name=payload.embeddingModelName,
        chunk_size=payload.chunkSize,
        overlap_size=payload.overlapSize,
        enable_rewrite=payload.enableRewrite,
    )
    if payload.separator:
        request.separator = payload.separator
    if payload.rerankMode:
        request.rerank_mode = payload.rerankMode
        request.rerank_model_name = payload.rerankModelName
        request.rerank_min_score = payload.rerankMinScore
    response = _call(client.create_index_with_options, ws, request, action="创建知识库")
    data = _data(response)
    index_id = data.get("Id")
    if not index_id:
        body = _body(response)
        raise HTTPException(
            status_code=502,
            detail=f"创建知识库失败：百炼未返回知识库 ID（requestId={body.get('RequestId') or '-'}）",
        )
    job = _call(
        client.submit_index_job_with_options,
        ws,
        bailian_models.SubmitIndexJobRequest(index_id=index_id),
        action="提交知识库任务",
    )
    job_id = _data(job).get("Id") or _data(job).get("JobId")
    return ok({"indexId": index_id, "jobId": job_id}, "知识库已创建")


@app.post("/api/bailian/index/submit-job")
def submit_index_job(payload: IndexIdPayload):
    """提交知识库创建/导入任务。"""
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    response = _call(
        client.submit_index_job_with_options,
        ws,
        bailian_models.SubmitIndexJobRequest(index_id=payload.indexId),
        action="提交知识库任务",
    )
    return ok({"jobId": _data(response).get("Id") or _data(response).get("JobId")}, "任务已提交")


@app.post("/api/bailian/index/job-status")
def get_index_job_status(payload: JobStatusPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    request = bailian_models.GetIndexJobStatusRequest(
        index_id=payload.indexId,
        page_number=payload.pageNumber,
        page_size=payload.pageSize,
    )
    if payload.jobId:
        request.job_id = payload.jobId
    response = _call(client.get_index_job_status_with_options, ws, request, action="查询任务状态")
    data = _data(response)
    documents = []
    for item in data.get("Documents") or []:
        documents.append(
            {
                "id": item.get("Id"),
                "name": item.get("Name"),
                "status": item.get("Status"),
            }
        )
    return ok({"jobId": data.get("JobId"), "status": data.get("Status"), "documents": documents})


@app.post("/api/bailian/index/update")
def update_index(payload: UpdateIndexPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    request = bailian_models.UpdateIndexRequest(id=payload.indexId)
    if payload.name:
        request.name = payload.name
    if payload.description:
        request.description = payload.description
    if payload.denseSimilarityTopK is not None:
        request.dense_similarity_top_k = payload.denseSimilarityTopK
    if payload.sparseSimilarityTopK is not None:
        request.sparse_similarity_top_k = payload.sparseSimilarityTopK
    if payload.rerankMinScore is not None:
        request.rerank_min_score = payload.rerankMinScore
    _call(client.update_index_with_options, ws, request, action="更新知识库")
    return ok(message="知识库已更新")


@app.post("/api/bailian/index/delete")
def delete_index(payload: IndexIdPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    _call(
        client.delete_index_with_options,
        ws,
        bailian_models.DeleteIndexRequest(index_id=payload.indexId),
        action="删除知识库",
    )
    return ok(message="知识库已删除")


@app.post("/api/bailian/index/monitor")
def get_index_monitor(payload: MonitorPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    request = bailian_models.GetIndexMonitorRequest(
        index_id=payload.indexId,
        start_timestamp=payload.startTimestamp,
        end_timestamp=payload.endTimestamp,
    )
    response = _call(client.get_index_monitor_with_options, ws, request, action="查询监控数据")
    return ok(_data(response))


# ---------- 文档 ----------
def _documents(client, ws, payload: DocumentsPayload, action: str, details: bool = False):
    request = bailian_models.ListIndexDocumentsRequest(
        index_id=payload.indexId,
        page_number=payload.pageNumber,
        page_size=payload.pageSize,
    )
    if payload.documentName:
        request.document_name = payload.documentName
        request.enable_name_like = payload.enableNameLike
    if payload.documentStatus:
        request.document_status = payload.documentStatus
    if details:
        request = bailian_models.ListIndexFileDetailsRequest(
            index_id=payload.indexId,
            page_number=payload.pageNumber,
            page_size=payload.pageSize,
        )
        if payload.documentName:
            request.document_name = payload.documentName
            request.enable_name_like = payload.enableNameLike
        if payload.documentStatus:
            request.document_status = payload.documentStatus
        response = _call(client.list_index_file_details_with_options, ws, request, action=action)
        data = _data(response)
        items = [
            {
                "fileId": i.get("FileId") or i.get("Id"),
                "name": i.get("FileName") or i.get("Name"),
                "format": i.get("DocumentType") or i.get("FileType"),
                "status": i.get("Status"),
                "sizeInBytes": i.get("SizeInBytes") or i.get("Size"),
                "createTime": i.get("CreateTime") or i.get("GmtModified"),
                "url": i.get("Url") or i.get("FileUrl"),
                "sourceId": i.get("SourceId"),
                "errorMessage": i.get("Message"),
            }
            for i in (data.get("Files") or data.get("Documents") or [])
        ]
        return {"total": data.get("TotalCount") or len(items), "items": items}
    response = _call(client.list_index_documents_with_options, ws, request, action=action)
    data = _data(response)
    items = [
        {
            "fileId": i.get("FileId") or i.get("Id"),
            "name": i.get("FileName") or i.get("Name"),
            "format": i.get("DocumentType") or i.get("FileType"),
            "status": i.get("Status"),
            "sizeInBytes": i.get("SizeInBytes") or i.get("Size"),
            "createTime": i.get("CreateTime") or i.get("GmtModified"),
            "sourceId": i.get("SourceId"),
            "errorMessage": i.get("Message"),
        }
        for i in (data.get("Documents") or [])
    ]
    return {"total": data.get("TotalCount") or len(items), "items": items}


@app.post("/api/bailian/documents")
def list_documents(payload: DocumentsPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    return ok(_documents(client, ws, payload, "查询知识库文件"))


@app.post("/api/bailian/documents/details")
def list_document_details(payload: DocumentsPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    return ok(_documents(client, ws, payload, "查询文件详情", details=True))


@app.post("/api/bailian/documents/add")
def add_documents(payload: AddDocumentsPayload):
    """把已上传的文件加入知识库并触发解析（增量导入）。"""
    ak, sk, ws, endpoint = _resolve(payload)
    if not payload.indexId or not payload.documentIds:
        raise HTTPException(status_code=400, detail="缺少知识库 ID 或文件 ID")
    client = _client(ak, sk, endpoint)
    request = bailian_models.SubmitIndexAddDocumentsJobRequest(
        index_id=payload.indexId,
        source_type="DATA_CENTER",
        document_ids=payload.documentIds,
        chunk_size=payload.chunkSize,
        overlap_size=payload.overlapSize,
        enable_headers=payload.enableHeaders,
    )
    if payload.separator:
        request.separator = payload.separator
    if payload.chunkMode:
        request.chunk_mode = payload.chunkMode
    response = _call(client.submit_index_add_documents_job_with_options, ws, request, action="导入文档")
    return ok({"jobId": _data(response).get("Id")}, "文档导入任务已提交")


@app.post("/api/bailian/documents/delete")
def delete_documents(payload: DeleteDocumentsPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    _call(
        client.delete_index_document_with_options,
        ws,
        bailian_models.DeleteIndexDocumentRequest(index_id=payload.indexId, document_ids=payload.documentIds),
        action="删除知识库文件",
    )
    return ok(message="文件已删除")


# ---------- 文件（资料库） ----------
@app.post("/api/bailian/files")
def list_files(payload: ListFilesPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    request = bailian_models.ListFileRequest(
        category_id=payload.categoryId or DEFAULT_CATEGORY,
        max_results=payload.maxResults,
    )
    if payload.fileName:
        request.file_name = payload.fileName
    if payload.nextToken:
        request.next_token = payload.nextToken
    response = _call(client.list_file_with_options, ws, request, action="查询资料文件列表")
    data = _data(response)
    items = [
        {
            "fileId": i.get("FileId"),
            "name": i.get("FileName"),
            "sizeInBytes": i.get("SizeInBytes"),
            "status": i.get("Status"),
            "uploadTime": i.get("UploadTime") or i.get("CreateTime"),
        }
        for i in (data.get("FileList") or [])
    ]
    return ok(
        {"total": data.get("TotalCount") or len(items), "items": items, "nextToken": data.get("NextToken")}
    )


@app.post("/api/bailian/files/describe")
def describe_file(payload: FileIdPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    if not payload.fileId:
        raise HTTPException(status_code=400, detail="缺少文件 ID")
    client = _client(ak, sk, endpoint)
    response = _call(
        client.describe_file_with_options,
        ws,
        payload.fileId,
        bailian_models.DescribeFileRequest(),
        action="查询文件详情",
    )
    data = _data(response)
    return ok(
        {
            "fileId": data.get("FileId") or payload.fileId,
            "name": data.get("FileName"),
            "format": data.get("FileType"),
            "status": data.get("Status"),
            "sizeInBytes": data.get("SizeInBytes"),
            "createTime": data.get("CreateTime"),
            "parseResultDownloadUrl": data.get("ParseResultDownloadUrl"),
            "parser": data.get("Parser"),
            "errorMessage": data.get("ParseErrorMessage"),
        }
    )


@app.post("/api/bailian/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    accessKeyId: str = Form(""),
    accessKeySecret: str = Form(""),
    workspaceId: str = Form(""),
    endpoint: str = Form(""),
    indexId: str = Form(""),
):
    """上传本地文件到百炼资料库：申请上传租约 → PUT 到 OSS → AddFile。

    indexId 非空时，额外调用 SubmitIndexAddDocumentsJob 直接把该文件导入知识库并解析。
    """
    ak, sk, ws, ep = _resolve(Credentials(accessKeyId=accessKeyId, accessKeySecret=accessKeySecret,
                                          workspaceId=workspaceId, endpoint=endpoint))
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="文件内容为空")
    client = _client(ak, sk, ep)
    filename = file.filename or "upload.txt"
    md5 = hashlib.md5(content).hexdigest()

    lease_request = bailian_models.ApplyFileUploadLeaseRequest(
        category_type=DEFAULT_CATEGORY,
        file_name=filename,
        md_5=md5,
        size_in_bytes=len(content),
    )
    lease = _call(client.apply_file_upload_lease_with_options, ws, lease_request, action="申请上传凭证")
    lease_data = _data(lease)
    lease_id = lease_data.get("FileUploadLeaseId")
    param = lease_data.get("Param") or {}
    url, method = param.get("Url"), (param.get("Method") or "PUT").upper()
    headers = param.get("Headers") or {}
    if isinstance(headers, str):
        try:
            headers = json.loads(headers)
        except Exception:
            headers = {}
    if not url:
        raise HTTPException(status_code=502, detail="申请上传凭证返回缺少上传地址")
    resp = requests.request(method, url, data=content, headers=headers, timeout=120)
    if resp.status_code >= 300:
        raise HTTPException(status_code=502, detail=f"文件上传失败：HTTP {resp.status_code} {resp.text[:200]}")

    add = _call(
        client.add_file_with_options,
        ws,
        bailian_models.AddFileRequest(
            category_id=DEFAULT_CATEGORY,
            category_type=DEFAULT_CATEGORY,
            lease_id=lease_id,
            original_file_url=url,
        ),
        action="登记文件",
    )
    file_id = _data(add).get("FileId")
    result: Dict[str, Any] = {"fileId": file_id, "fileName": filename, "sizeInBytes": len(content)}

    if indexId:
        job = _call(
            client.submit_index_add_documents_job_with_options,
            ws,
            bailian_models.SubmitIndexAddDocumentsJobRequest(
                index_id=indexId,
                source_type="DATA_CENTER",
                document_ids=[file_id],
                chunk_size=512,
                overlap_size=64,
            ),
            action="导入文档",
        )
        result["jobId"] = _data(job).get("Id")
        result["imported"] = True
    return ok(result, "文件已上传并登记")


@app.post("/api/bailian/files/delete")
def delete_files(payload: DeleteFilesPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    _call(
        client.delete_files_with_options,
        ws,
        bailian_models.DeleteFilesRequest(file_ids=payload.fileIds),
        action="删除资料文件",
    )
    return ok(message="文件已删除")


@app.get("/api/bailian/categories")
def list_categories(accessKeyId: str = "", accessKeySecret: str = "", workspaceId: str = "", endpoint: str = ""):
    ak, sk, ws, ep = _resolve(Credentials(accessKeyId=accessKeyId, accessKeySecret=accessKeySecret,
                                          workspaceId=workspaceId, endpoint=endpoint))
    client = _client(ak, sk, ep)
    response = _call(client.list_category_with_options, ws, bailian_models.ListCategoryRequest(), action="查询类目")
    data = _data(response)
    return ok({"items": data.get("CategoryList") or []})


@app.post("/api/bailian/categories")
def list_categories_post(payload: Credentials):
    ak, sk, ws, ep = _resolve(payload)
    client = _client(ak, sk, ep)
    response = _call(client.list_category_with_options, ws, bailian_models.ListCategoryRequest(), action="查询类目")
    data = _data(response)
    return ok({"items": data.get("CategoryList") or []})


@app.post("/api/bailian/categories/add")
def add_category(payload: AddCategoryPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    if not payload.categoryName:
        raise HTTPException(status_code=400, detail="缺少分类名称")
    client = _client(ak, sk, endpoint)
    response = _call(
        client.add_category_with_options,
        ws,
        bailian_models.AddCategoryRequest(
            category_name=payload.categoryName,
            category_type=payload.categoryType or DEFAULT_CATEGORY,
            parent_category_id=payload.parentCategoryId or None,
            connector_id=payload.connectorId or None,
        ),
        action="新增资料分类",
    )
    return ok(_data(response), "分类已新增")


@app.post("/api/bailian/categories/delete")
def delete_category(payload: DeleteCategoryPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    if not payload.categoryId:
        raise HTTPException(status_code=400, detail="缺少分类 ID")
    client = _client(ak, sk, endpoint)
    try:
        response = client.delete_category_with_options(
            payload.categoryId,
            ws,
            bailian_models.DeleteCategoryRequest(),
            {},
            _runtime(),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"删除资料分类失败：{exc}")
    body = _body(response)
    if body.get("Success") not in (True, "true"):
        raise HTTPException(status_code=502, detail=f"删除资料分类失败：{body.get('Message') or body.get('Code') or '未知错误'}")
    return ok(message="分类已删除")


@app.post("/api/bailian/files/tag")
def update_file_tag(payload: FileTagPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    if not payload.fileId:
        raise HTTPException(status_code=400, detail="缺少文件 ID")
    client = _client(ak, sk, endpoint)
    _call(
        client.update_file_tag_with_options,
        ws,
        payload.fileId,
        bailian_models.UpdateFileTagRequest(tags=payload.tags),
        action="更新文件标签",
    )
    return ok(message="文件标签已更新")


@app.post("/api/bailian/files/tags/batch")
def batch_update_file_tag(payload: BatchFileTagPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    infos = [
        bailian_models.BatchUpdateFileTagRequestFileInfos(
            file_id=str(item.get("fileId") or ""),
            tags=item.get("tags") or [],
        )
        for item in payload.fileInfos
        if item.get("fileId")
    ]
    if not infos:
        raise HTTPException(status_code=400, detail="缺少文件标签信息")
    _call(
        client.batch_update_file_tag_with_options,
        ws,
        bailian_models.BatchUpdateFileTagRequest(file_infos=infos, update_mode=payload.updateMode or "OVERWRITE"),
        action="批量更新文件标签",
    )
    return ok(message="文件标签已批量更新")


@app.post("/api/bailian/files/add-from-oss")
def add_files_from_authorized_oss(payload: AddOssFilesPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    if not payload.ossBucketName or not payload.ossRegionId or not payload.fileDetails:
        raise HTTPException(status_code=400, detail="缺少 OSS Bucket、Region 或文件明细")
    client = _client(ak, sk, endpoint)
    details = [
        bailian_models.AddFilesFromAuthorizedOssRequestFileDetails(
            file_name=item.fileName,
            oss_key=item.ossKey,
            parser=item.parser or None,
        )
        for item in payload.fileDetails
        if item.ossKey
    ]
    response = _call(
        client.add_files_from_authorized_oss_with_options,
        ws,
        bailian_models.AddFilesFromAuthorizedOssRequest(
            category_id=payload.categoryId or DEFAULT_CATEGORY,
            category_type=payload.categoryType or DEFAULT_CATEGORY,
            oss_bucket_name=payload.ossBucketName,
            oss_region_id=payload.ossRegionId,
            over_write_file_by_oss_key=payload.overwriteFileByOssKey,
            tags=payload.tags,
            file_details=details,
        ),
        action="从授权 OSS 添加文件",
    )
    return ok(_data(response), "OSS 文件已添加")


# ---------- 切片 ----------
@app.post("/api/bailian/chunks")
def list_chunks(payload: ChunksPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    request = bailian_models.ListChunksRequest(
        index_id=payload.indexId,
        page_num=payload.pageNum,
        page_size=payload.pageSize,
    )
    if payload.fileId:
        request.file_id = payload.fileId
    response = _call(client.list_chunks_with_options, ws, request, action="查询切片")
    data = _data(response)
    chunks = []
    for node in data.get("Nodes") or []:
        meta = node.get("Metadata") or node.get("metadata") or {}
        chunks.append(
            {
                "chunkId": meta.get("_id") or meta.get("Id"),
                "docId": meta.get("doc_id") or meta.get("docId"),
                "docName": meta.get("doc_name") or meta.get("docName") or "",
                "title": meta.get("title") or meta.get("Title") or "",
                "text": node.get("Text") or node.get("text") or "",
            }
        )
    return ok({"total": data.get("Total") or len(chunks), "items": chunks})


@app.post("/api/bailian/chunks/add")
def add_chunk(payload: AddChunkPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    _call(
        client.add_chunk_with_options,
        ws,
        bailian_models.AddChunkRequest(
            pipeline_id=payload.indexId,
            data_id=payload.dataId or payload.title or "manual",
            field={"title": payload.title, "content": payload.content},
        ),
        action="新增切片",
    )
    return ok(message="切片已新增")


@app.post("/api/bailian/chunks/update")
def update_chunk(payload: UpdateChunkPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    request = bailian_models.UpdateChunkRequest(
        pipeline_id=payload.indexId,
        chunk_id=payload.chunkId,
        title=payload.title,
        content=payload.content,
    )
    _call(client.update_chunk_with_options, ws, request, action="修改切片")
    return ok(message="切片已更新")


@app.post("/api/bailian/chunks/delete")
def delete_chunks(payload: DeleteChunksPayload):
    ak, sk, ws, endpoint = _resolve(payload)
    client = _client(ak, sk, endpoint)
    _call(
        client.delete_chunk_with_options,
        ws,
        bailian_models.DeleteChunkRequest(pipeline_id=payload.indexId, chunk_ids=payload.chunkIds),
        action="删除切片",
    )
    return ok(message="切片已删除")


# ---------- 检索 ----------
@app.post("/api/bailian/retrieve")
def retrieve(payload: RetrievePayload):
    ak, sk, ws, endpoint = _resolve(payload)
    if not payload.indexId or not payload.query:
        raise HTTPException(status_code=400, detail="缺少知识库 ID 或检索词")
    client = _client(ak, sk, endpoint)
    request = bailian_models.RetrieveRequest(
        index_id=payload.indexId,
        query=payload.query,
        dense_similarity_top_k=payload.topK,
        enable_reranking=payload.enableReranking,
        enable_rewrite=payload.enableRewrite,
    )
    response = _call(client.retrieve_with_options, ws, request, action="检索")
    data = _data(response)
    nodes = []
    for node in data.get("Nodes") or []:
        meta = node.get("Metadata") or node.get("metadata") or {}
        nodes.append(
            {
                "score": node.get("Score") or node.get("score"),
                "text": node.get("Text") or node.get("text") or "",
                "docName": meta.get("doc_name") or meta.get("docName") or "",
            }
        )
    return ok({"items": nodes})


@app.post("/api/bailian/search")
def knowledge_search(payload: SearchPayload):
    """跨知识库联合检索（需先在控制台创建并发布「知识检索」服务，取得 agent_id）。"""
    ws = payload.workspaceId or os.getenv("WORKSPACE_ID", "")
    api_key = payload.apiKey or os.getenv("DASHSCOPE_API_KEY", "")
    agent_id = payload.agentId or os.getenv("BAILIAN_AGENT_ID", "")
    if not ws or not api_key or not agent_id:
        raise HTTPException(
            status_code=400,
            detail="跨库检索需要 workspaceId、DASHSCOPE_API_KEY 与已发布的知识检索服务 agent_id",
        )
    url = f"https://{ws}.cn-beijing.maas.aliyuncs.com/api/v1/indices/knowledge/search"
    try:
        resp = requests.post(
            url,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"agent_id": agent_id, "query": payload.query, "images": payload.images or []},
            timeout=60,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"跨库检索请求失败：{exc}")
    try:
        result = resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail=f"跨库检索返回非 JSON：{resp.text[:200]}")
    if not result.get("success"):
        raise HTTPException(
            status_code=502,
            detail=f"跨库检索失败：{result.get('message') or result.get('code')}（requestId={result.get('request_id')}）",
        )
    data = result.get("data") or {}
    nodes = []
    for node in data.get("nodes") or []:
        meta = node.get("metadata") or {}
        nodes.append(
            {
                "score": node.get("score"),
                "text": node.get("text"),
                "docName": meta.get("doc_name"),
                "pipelineId": meta.get("pipeline_id"),
            }
        )
    return ok({"total": data.get("total"), "costTime": data.get("cost_time"), "items": nodes})


if __name__ == "__main__":
    port = int(os.getenv("BAILIAN_PROXY_PORT", "9610"))
    print(f"百炼知识库代理服务启动：http://127.0.0.1:{port}/api/bailian/health")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
