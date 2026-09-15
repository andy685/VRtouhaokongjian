"""
VR头号空间 — 店铺AI运营诊断报告生成器
用法:
  python generate_report.py                    # 生成所有店铺当月报告
  python generate_report.py --shop 1           # 生成指定店铺当月报告
  python generate_report.py --shop 1 --month 2026-08  # 指定月份
  python generate_report.py --shop 1 --month 2026-08 --output report.md

依赖: pip install openai python-dotenv
配置: bailian-setup/.env (DASHSCOPE_API_KEY)
"""
import os
import sys
import json
import argparse
from datetime import datetime, timedelta

# 将 bailian-setup 加入 path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
BAILIAN_DIR = os.path.join(PROJECT_ROOT, "bailian-setup")
sys.path.insert(0, BAILIAN_DIR)

from client import chat

# ============================================================
# 1. Mock 数据生成器（后续替换为真实 API 调用）
# ============================================================

SHOPS = [
    {"id": "1", "name": "卓远萝岗区店"},
    {"id": "2", "name": "卓远萧山区店"},
    {"id": "3", "name": "卓远亚运城店"},
    {"id": "4", "name": "卓远文鼎路店"},
]

GAMES = [
    "过山车VR", "恐怖医院", "极速赛车", "深海探险", "太空漫步",
    "恐龙世界", "魔法城堡", "星际穿越", "极限跳伞", "海盗船",
]


def _seed(val: int) -> float:
    """确定性伪随机，保证同一店铺同一月数据一致"""
    return ((val * 9301 + 49297) % 233280) / 233280


def collect_shop_data(shop_id: str, shop_name: str, month: str) -> dict:
    """收集指定店铺指定月份的运营数据（当前为 Mock）"""

    # 用 shop_id + month 生成确定性随机种子
    seed_val = int(shop_id) * 100 + int(month.split("-")[1])
    r = _seed(seed_val)
    r2 = _seed(seed_val + 77)
    r3 = _seed(seed_val + 153)

    # === 核心指标 ===
    revenue_total = int(220000 + r * 900000)  # 22万~112万
    revenue_last_month = int(revenue_total * (0.82 + r2 * 0.25))  # 环比 ±18%
    order_count = int(1200 + r * 1200)
    order_count_last_month = int(order_count * (0.85 + r2 * 0.2))
    atv = round(revenue_total / order_count, 1)
    atv_last = round(revenue_last_month / order_count_last_month, 1)
    member_visits = int(order_count * (0.6 + r * 0.3))
    new_members = int(80 + r * 120)
    device_online_rate = round(0.85 + r * 0.14, 3)

    # === 营收拆分 ===
    biz = {
        "预存充值": int(revenue_total * 0.50),
        "开卡费": int(revenue_total * 0.03),
        "游戏点播": int(revenue_total * 0.21),
        "项目套餐": int(revenue_total * 0.19),
        "商品销售": int(revenue_total * 0.07),
    }
    channel = {
        "cashier_system": int(revenue_total * 0.70),
        "ondemand_system": revenue_total - int(revenue_total * 0.70),
    }
    payment = {
        "微信": int(revenue_total * 0.50),
        "支付宝": int(revenue_total * 0.25),
        "现金": int(revenue_total * 0.08),
        "会员余额": int(revenue_total * 0.17),
    }

    # === 日趋势 ===
    day_in_month = 31 if month.split("-")[1] in ["01","03","05","07","08","10","12"] else 30
    daily_trend = []
    for d in range(1, day_in_month + 1):
        rd = _seed(seed_val + d)
        # 周末营收高
        weekend_boost = 1.4 if d % 7 in [0, 6] else 1.0
        daily_rev = int(revenue_total / day_in_month * weekend_boost * (0.7 + rd * 0.6))
        daily_ord = int(order_count / day_in_month * weekend_boost * (0.7 + rd * 0.6))
        daily_trend.append({"date": f"{month.split('-')[1]}-{d:02d}", "revenue": daily_rev, "orders": daily_ord})

    # === 会员 ===
    top5 = []
    for i in range(5):
        rd = _seed(seed_val + i * 13)
        top5.append({
            "name": f"会员{i+1}0{int(rd*9)}",
            "phone": f"138****{int(rd*9000)+1000}",
            "amount": int(3000 + rd * 8000),
        })
    top5.sort(key=lambda x: -x["amount"])

    level_dist = {
        "普通": int(member_visits * 0.55),
        "银卡": int(member_visits * 0.25),
        "金卡": int(member_visits * 0.15),
        "钻石": int(member_visits * 0.05),
    }

    # === 设备 ===
    host_total = 8
    host_online = int(host_total * device_online_rate)
    headset_total = 16
    headset_online = int(headset_total * device_online_rate)
    runtime_hours = int(1000 + r * 800)
    experience_hours = int(runtime_hours * 0.75)

    # === 内容/游戏 ===
    top10 = []
    for i, g in enumerate(GAMES):
        gd = _seed(seed_val + i * 7)
        launches = int(150 + gd * 350)
        visitors = int(launches * (2.0 + gd * 0.8))
        top10.append({
            "name": g,
            "launches": launches,
            "visitors": visitors,
            "avg_per_session": round(visitors / launches, 1),
        })
    top10.sort(key=lambda x: -x["launches"])
    total_on_demand = sum(g["launches"] for g in top10)
    total_visitors = sum(g["visitors"] for g in top10)

    # === 员工 ===
    staff_names = ["王小丫", "李明", "张华", "赵四"]
    ranking = []
    for i, sn in enumerate(staff_names):
        sd = _seed(seed_val + i * 31)
        cash_total = int(revenue_total * (0.15 + sd * 0.1))
        ranking.append({
            "name": sn,
            "cash_total": cash_total,
            "count": int(order_count * (0.15 + sd * 0.1)),
            "actual": int(cash_total * 0.95),
        })
    ranking.sort(key=lambda x: -x["cash_total"])

    # === 目标 ===
    monthly_target = int(revenue_total / (0.75 + r3 * 0.2))
    achieved = revenue_total
    completion_rate = round(achieved / monthly_target, 3)

    return {
        "shop_name": shop_name,
        "month": month,
        "summary": {
            "revenue_total": revenue_total,
            "revenue_last_month": revenue_last_month,
            "revenue_change_pct": round((revenue_total - revenue_last_month) / revenue_last_month * 100, 1),
            "order_count": order_count,
            "order_count_last_month": order_count_last_month,
            "order_change_pct": round((order_count - order_count_last_month) / order_count_last_month * 100, 1),
            "avg_transaction_value": atv,
            "atv_last_month": atv_last,
            "atv_change_pct": round((atv - atv_last) / atv_last * 100, 1),
            "member_visits": member_visits,
            "new_members": new_members,
            "repeat_rate": round(0.55 + r * 0.25, 2),
            "device_online_rate": device_online_rate,
        },
        "revenue": {
            "daily_trend": daily_trend,
            "business_breakdown": biz,
            "channel": channel,
            "payment": payment,
        },
        "members": {
            "total_visits": member_visits,
            "new_members": new_members,
            "repeat_rate": round(0.55 + r * 0.25, 2),
            "top5_consumers": top5,
            "level_distribution": level_dist,
            "balance_change": biz["预存充值"],
        },
        "devices": {
            "host": {"total": host_total, "online": host_online, "offline": host_total - host_online, "fault": max(0, host_total - host_online - 1), "online_rate": round(host_online / host_total, 2)},
            "headset": {"total": headset_total, "online": headset_online, "offline": headset_total - headset_online, "fault": 1, "online_rate": round(headset_online / headset_total, 2), "bind_rate": round(0.88 + r * 0.1, 2)},
            "total_runtime_hours": runtime_hours,
            "total_experience_hours": experience_hours,
            "verification_count": total_on_demand,
            "anomaly_count": int(r2 * 8),
            "fault_count": 1,
        },
        "content": {
            "top10_games": top10,
            "total_on_demand": total_on_demand,
            "total_visitors": total_visitors,
            "avg_per_session": round(total_visitors / total_on_demand, 2),
        },
        "staff": {
            "ranking": ranking,
            "shifts_anomaly": int(r3 * 4),
        },
        "revenue_target": {
            "monthly_target": monthly_target,
            "achieved": achieved,
            "completion_rate": completion_rate,
            "remaining_days": 0,
        },
    }


# ============================================================
# 2. Prompt 构建
# ============================================================

SYSTEM_PROMPT = """你是 VR 头号空间的资深运营分析师AI。请根据提供的店铺月度运营数据，生成一份专业的AI运营诊断报告。

报告要求：
1. 标题格式: 《{店铺名} · AI运营诊断报告 — {YYYY年M月}》
2. 包含以下8个模块（必须完整）：
   一、经营总览：核心指标速览 + 环比变化 + 健康度评分(0-100) + 一句话总评
   二、营收分析：月营收趋势 + 业务营收占比 + 渠道对比 + 支付方式 + AI洞察
   三、客流与会员分析：到店会员 + 新增会员 + 复购率 + 会员消费TOP5 + 会员级别分布 + AI洞察
   四、设备运营分析：在线率 + 使用率 + 异常故障 + AI洞察
   五、游戏内容分析：点播TOP10 + 热度分布 + 场均人次 + AI洞察
   六、员工绩效分析：销售排名 + 交班异常 + AI洞察
   七、营收目标达成：完成率 + 预测 + AI洞察
   八、AI行动建议：短期建议(3-5条) + 中期建议(2-3条) + 风险预警(如有)

3. 健康度评分从6个维度评分，各维度0-100分：
   - 营收增长力：看营收环比增长
   - 客流活力：看到店人数和新增会员
   - 设备利用率：看在线率和使用时长
   - 内容吸引力：看点播次数和热门游戏占比
   - 运营效率：看客单价和员工绩效
   - 目标达成度：看月度目标完成率

4. 数据分析要有深度：不只是罗列数字，要给出趋势判断、原因推测、与行业对比
5. 行动建议要具体可执行：比如"建议将冷门游戏X替换为热门游戏Y"，而不是"建议优化游戏内容"
6. 金额用¥符号，千分位逗号格式
7. 输出格式: Markdown
8. 报告语气: 专业但易懂，面向店长/老板"""


def build_user_prompt(data: dict) -> str:
    return f"""以下是 {data['shop_name']} {data['month']} 的运营数据（JSON格式）：

```json
{json.dumps(data, ensure_ascii=False, indent=2)}
```

请根据以上数据，生成完整的AI运营诊断报告。"""


# ============================================================
# 3. 报告生成
# ============================================================

def generate_report(shop_id: str, month: str = None, output_path: str = None) -> str:
    """生成单店月度诊断报告"""
    shop = next((s for s in SHOPS if s["id"] == shop_id), None)
    if not shop:
        print(f"[ERROR] 未找到店铺ID={shop_id}")
        return ""

    if not month:
        # 默认上个月
        now = datetime.now()
        last = now.replace(day=1) - timedelta(days=1)
        month = f"{last.year}-{last.month:02d}"

    print(f"正在生成报告: {shop['name']} - {month}")

    # 1. 收集数据
    data = collect_shop_data(shop_id, shop["name"], month)
    print(f"  数据收集完成: 营收¥{data['summary']['revenue_total']:,}, 订单{data['summary']['order_count']}")

    # 2. 构建 Prompt
    user_msg = build_user_prompt(data)

    # 3. 调用大模型
    print(f"  调用百炼大模型生成报告...")
    report_md = chat(user_msg, system=SYSTEM_PROMPT)

    # 4. 保存报告
    if not output_path:
        output_dir = os.path.join(PROJECT_ROOT, "outputs", "ai-diagnostic", shop_id)
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{month}.md")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report_md)

    print(f"  报告已保存: {output_path}")
    print(f"  报告长度: {len(report_md)} 字符")

    return report_md


def generate_all(month: str = None):
    """生成所有店铺的报告"""
    for shop in SHOPS:
        generate_report(shop["id"], month)
        print()


# ============================================================
# 4. 入口
# ============================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VR头号空间 - 店铺AI运营诊断报告生成器")
    parser.add_argument("--shop", type=str, help="店铺ID (1-4)，不传则生成所有")
    parser.add_argument("--month", type=str, help="月份 (YYYY-MM)，默认上个月")
    parser.add_argument("--output", type=str, help="输出文件路径")
    args = parser.parse_args()

    if args.shop:
        generate_report(args.shop, args.month, args.output)
    else:
        generate_all(args.month)
