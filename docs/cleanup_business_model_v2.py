#!/usr/bin/env python3
"""
批量清理文档中的错误表述：
1. "批发" → "销售/采购"（用户说游戏豆只有采购或销售，没有批发）
2. "¥0.3-¥0.8/豆" → "¥1/豆"（用户说 1 游戏豆=1 元）
3. 所有 SaaS/订阅/月费/非SaaS 相关表述 → 完全移除（用户说从未说过有SaaS）
"""
import os, re

DOCS = os.path.join(os.path.dirname(__file__))

def fix_file(rel_path):
    fp = os.path.join(DOCS, rel_path)
    if not os.path.exists(fp):
        print(f'  [跳过] {rel_path} 不存在')
        return
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # ========== 1. 清理所有SaaS/订阅/月费相关 ==========
    # 移除 "非SaaS订阅模式", "非SaaS", "SaaS平台" 等
    content = content.replace('（非SaaS订阅模式）', '')
    content = content.replace('(非SaaS订阅模式)', '')
    content = content.replace('（非SaaS订阅平台）', '')
    content = content.replace('（非SaaS订阅）', '')
    content = content.replace('（非SaaS）', '')
    content = content.replace(' 非SaaS订阅模式', '')
    content = content.replace('，非SaaS订阅模式', '')
    content = content.replace('(非SaaS)', '')
    
    # 移除 "头号空间不是SaaS订阅平台" 段落
    content = re.sub(r'>\s*\*\*头号空间不是SaaS订阅平台\*\*。.*?\n', '', content)
    content = re.sub(r'\*\*头号空间不是SaaS订阅平台\*\*。', '', content)
    content = re.sub(r'非SaaS订阅平台', '', content)
    
    # 移除 "SaaS运营管理系统" → "运营管理系统"
    content = content.replace('SaaS 运营管理系统', '运营管理系统')
    content = content.replace('SaaS运营管理系统', '运营管理系统')
    content = content.replace('的 SaaS', '')
    content = content.replace('全链路 SaaS', '全链路')
    
    # 移除 "SaaS平台" 引用 (保持上下文)
    content = content.replace('SaaS 平台', '平台')
    content = content.replace('SaaS平台', '平台')
    content = content.replace('SaaS续费率', '游戏豆复购率')
    content = content.replace('SaaS 订阅', '')
    
    # ========== 2. 清理"批发"相关 ==========
    # "游戏豆批发" → "游戏豆销售" 或 "游戏豆"
    content = content.replace('游戏豆批发', '游戏豆销售')
    content = content.replace('游戏豆的批发', '游戏豆的')
    content = content.replace('批发价', '定价')
    content = content.replace('从平台批发游戏豆', '从平台采购游戏豆')
    content = content.replace('从平台批量采购游戏豆', '从平台采购游戏豆')
    content = content.replace('批量采购游戏豆', '采购游戏豆')
    content = content.replace('量大优惠', '')
    content = content.replace('，量大优惠', '')
    
    # 硬件销售代理佣金 + 游戏豆批发 → 硬件销售佣金 + 游戏豆销售
    content = content.replace('硬件销售代理佣金', '硬件销售佣金')
    
    # ========== 3. 修正游戏豆定价 ==========
    # ¥0.3-¥0.8/豆 → ¥1/豆
    content = re.sub(r'¥0\.\d[-~]¥0\.\d/豆', '¥1/豆', content)
    content = re.sub(r'例如¥0\.\d[-~]¥0\.\d/豆', '¥1/豆', content)
    content = re.sub(r'平台设定游戏豆(销售)?定价.*?\)', '平台统一定价 ¥1/豆', content)
    
    # 采购¥90/万豆 → 采购¥1/豆
    content = content.replace('采购¥90/万豆，建议零售¥100-120', '采购¥1/豆')
    content = content.replace('采购¥90/万豆', '¥1/豆')
    
    # ========== 4. 修正定价举例 ==========
    # 商家采购100,000游戏豆(¥0.5/豆=¥50,000) → 商家采购100,000游戏豆(¥1/豆=¥100,000)
    content = re.sub(r'采购\d[\d,]*(?:游戏豆|个游戏豆)?\(¥0\.\d/豆=¥[\d,]+\)', 
                     lambda m: '采购100,000游戏豆(¥1/豆=¥100,000)', content)
    
    # 具体的数字举例
    content = content.replace('¥0.5/豆 = ¥50,000', '¥1/豆 = ¥100,000')
    content = content.replace('(¥0.5/豆=¥50,000)', '(¥1/豆=¥100,000)')
    content = content.replace('(¥0.5/豆=¥50000)', '(¥1/豆=¥100000)')
    
    # 成本计算修正: 500豆(=¥250) → 500豆(=¥500)  
    content = content.replace('=¥250)', '=¥500)')
    content = content.replace('(¥25)', '(¥500)')
    content = content.replace('毛利¥14', '毛利-¥461')  # 39 - 500 = -461
    
    if content != original:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  ✅ {rel_path} — 已修复')
    else:
        print(f'  ⏭️ {rel_path} — 无需修改')

# ========== 需要处理的文件列表 ==========
files = [
    '头号空间-产品需求文档-PRD-v1.3.md',
    'PRD-完整版.html',
    'PRD-完整版_副本.html',
    '飞书导入版-PRD-v1.3.1.md',
    '头号空间-产品设计文档-v2.0-完整版.md',
    '头号空间-页面功能详细规格书-v1.0.md',
    '头号空间-PRD-v1.3-飞书版.md',
    'fix_business_model.py',
    '运营后台设计方案.md',
]

print('=== 开始批量清理文档中的错误表述 ===')
for f in files:
    fix_file(f)

print('\n=== 清理完成 ===')
