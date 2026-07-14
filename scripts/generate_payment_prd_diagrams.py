from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "deliverables" / "user-payment-prd-assets"
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"


def font(size: int):
    try:
        return ImageFont.truetype(FONT_PATH, size=size)
    except Exception:
        return ImageFont.load_default()


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt, max_width: int) -> str:
    lines = []
    for raw in text.split("\n"):
        current = ""
        for ch in raw:
            trial = current + ch
            bbox = draw.textbbox((0, 0), trial, font=fnt)
            if bbox[2] - bbox[0] > max_width and current:
                lines.append(current)
                current = ch
            else:
                current = trial
        if current:
            lines.append(current)
    return "\n".join(lines)


def svg_header(w: int, h: int) -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'


def svg_box(x, y, w, h, text, fill, stroke, fs=22, radius=18) -> str:
    lines = text.split("\n")
    text_parts = []
    for idx, line in enumerate(lines):
        text_parts.append(f'<tspan x="{x + w/2}" dy="{0 if idx==0 else fs + 6}">{escape(line)}</tspan>')
    text_y = y + h/2 - ((len(lines)-1) * (fs + 6))/2
    return (
        f'<rect x="{x}" y="{y}" rx="{radius}" ry="{radius}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>'
        f'<text x="{x + w/2}" y="{text_y}" font-family="Arial Unicode MS, Arial" font-size="{fs}" font-weight="600" '
        f'text-anchor="middle" dominant-baseline="middle" fill="#0F172A">{"".join(text_parts)}</text>'
    )


def svg_arrow(x1, y1, x2, y2, label=None) -> str:
    parts = [f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#2563EB" stroke-width="4" marker-end="url(#arrow)"/>']
    if label:
        lx = (x1 + x2) / 2
        ly = (y1 + y2) / 2 - 16
        parts.append(f'<rect x="{lx-92}" y="{ly-16}" width="184" height="28" rx="8" fill="#DBEAFE" stroke="#93C5FD"/>')
        parts.append(f'<text x="{lx}" y="{ly+2}" font-family="Arial Unicode MS, Arial" font-size="16" text-anchor="middle" fill="#1E3A8A">{escape(label)}</text>')
    return "".join(parts)


def build_overall() -> None:
    w, h = 1440, 900
    # SVG
    parts = [svg_header(w, h), '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#2563EB"/></marker></defs>', '<rect width="100%" height="100%" fill="#F8FBFF"/>']
    parts.append('<text x="40" y="50" font-family="Arial Unicode MS, Arial" font-size="34" font-weight="700" fill="#0F172A">玩家玩游戏支付主流程</text>')
    top = [
        ("1. 到达设备\n选择内容 / 设备", 50),
        ("2. 触发支付\n散客直付 / 会员主动扫码 / 会员码反扫 / 店员扫码", 260),
        ("3. 展示支付明细\n金额、优惠、支付资产", 620),
        ("4. 确认支付\n扣款 / 外部支付", 915),
        ("5. 订单创建\n写入支付流水", 1170),
    ]
    widths = [180, 300, 240, 210, 210]
    for (text, x), bw in zip(top, widths):
        parts.append(svg_box(x, 170, bw, 110, text, "#EFF6FF", "#2563EB", 20))
    parts += [
        svg_arrow(230, 225, 260, 225),
        svg_arrow(560, 225, 620, 225),
        svg_arrow(860, 225, 915, 225),
        svg_arrow(1125, 225, 1170, 225),
        svg_arrow(1275, 280, 1275, 350),
        svg_arrow(1275, 350, 235, 350, "支付成功后进入设备控制"),
        svg_arrow(235, 350, 235, 470),
    ]
    bottom = [
        ("6. 下发开局指令", 160, 220, "#ECFDF5", "#10B981"),
        ("7. 设备开局成功\n进入游玩中", 430, 220, "#ECFDF5", "#10B981"),
        ("8. 游玩结束\n回传结束原因", 735, 220, "#EFF6FF", "#2563EB"),
        ("9. 正常完成 / 异常闭环\n补开局 / 退款 / 复核", 1015, 280, "#FEF3C7", "#F59E0B"),
    ]
    for text, x, bw, fill, stroke in bottom:
        parts.append(svg_box(x, 470, bw, 110, text, fill, stroke, 20))
    parts += [svg_arrow(380, 525, 430, 525), svg_arrow(650, 525, 735, 525), svg_arrow(955, 525, 1015, 525)]
    parts.append('<text x="50" y="720" font-family="Arial Unicode MS, Arial" font-size="20" fill="#475569">说明：</text>')
    parts.append('<text x="50" y="750" font-family="Arial Unicode MS, Arial" font-size="20" fill="#475569">• 支付环节以“支付成功、开局成功、结束回传、订单归档”为主链路。</text>')
    parts.append('<text x="50" y="780" font-family="Arial Unicode MS, Arial" font-size="20" fill="#475569">• 任一环节失败都需要有异常订单记录，并能进入补开局、人工复核或退款流程。</text>')
    parts.append('</svg>')
    (OUT_DIR / "overall_flow.svg").write_text("".join(parts), encoding="utf-8")

    # PNG
    img = Image.new("RGB", (w, h), "#F8FBFF")
    draw = ImageDraw.Draw(img)
    title_font = font(34)
    draw.text((40, 28), "玩家玩游戏支付主流程", font=title_font, fill="#0F172A")
    box_font = font(20)
    for (text, x), bw in zip(top, widths):
        draw.rounded_rectangle([x, 170, x + bw, 280], radius=18, fill="#EFF6FF", outline="#2563EB", width=3)
        wrapped = wrap(draw, text, box_font, bw - 18)
        bbox = draw.multiline_textbbox((0, 0), wrapped, font=box_font, spacing=5)
        draw.multiline_text((x + bw/2 - (bbox[2]-bbox[0])/2, 225 - (bbox[3]-bbox[1])/2), wrapped, font=box_font, fill="#0F172A", spacing=5, align="center")
    for (text, x, bw, fill, stroke) in bottom:
        draw.rounded_rectangle([x, 470, x + bw, 580], radius=18, fill=fill, outline=stroke, width=3)
        wrapped = wrap(draw, text, box_font, bw - 18)
        bbox = draw.multiline_textbbox((0, 0), wrapped, font=box_font, spacing=5)
        draw.multiline_text((x + bw/2 - (bbox[2]-bbox[0])/2, 525 - (bbox[3]-bbox[1])/2), wrapped, font=box_font, fill="#0F172A", spacing=5, align="center")
    def arrow(a, b, label=None):
        draw.line([a, b], fill="#2563EB", width=4)
        if b[0] == a[0]:
            draw.polygon([b, (b[0]-8, b[1]-12), (b[0]+8, b[1]-12)], fill="#2563EB")
        else:
            draw.polygon([b, (b[0]-12, b[1]-8), (b[0]-12, b[1]+8)], fill="#2563EB")
        if label:
            lf = font(16)
            bbox = draw.textbbox((0, 0), label, font=lf)
            lx = (a[0]+b[0])/2 - (bbox[2]-bbox[0])/2
            ly = (a[1]+b[1])/2 - 24
            draw.rounded_rectangle([lx-8, ly-4, lx+(bbox[2]-bbox[0])+8, ly+20], radius=8, fill="#DBEAFE", outline="#93C5FD")
            draw.text((lx, ly), label, font=lf, fill="#1E3A8A")
    arrow((230,225),(260,225)); arrow((560,225),(620,225)); arrow((860,225),(915,225)); arrow((1125,225),(1170,225))
    draw.line([(1275,280),(1275,350),(235,350),(235,470)], fill="#2563EB", width=4)
    draw.polygon([(235,470),(227,458),(243,458)], fill="#2563EB")
    lf = font(16); label="支付成功后进入设备控制"; bbox = draw.textbbox((0,0),label,font=lf); lx=650-(bbox[2]-bbox[0])/2; ly=334
    draw.rounded_rectangle([lx-8, ly-4, lx+(bbox[2]-bbox[0])+8, ly+20], radius=8, fill="#DBEAFE", outline="#93C5FD"); draw.text((lx,ly),label,font=lf,fill="#1E3A8A")
    arrow((380,525),(430,525)); arrow((650,525),(735,525)); arrow((955,525),(1015,525))
    small = font(20)
    draw.text((50,720),"说明：",font=small,fill="#475569")
    draw.text((50,750),"• 支付环节以“支付成功、开局成功、结束回传、订单归档”为主链路。",font=small,fill="#475569")
    draw.text((50,780),"• 任一环节失败都需要有异常订单记录，并能进入补开局、人工复核或退款流程。",font=small,fill="#475569")
    img.save(OUT_DIR / "overall_flow.png")


def build_reverse() -> None:
    w, h = 1440, 980
    parts = [svg_header(w,h), '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#2563EB"/></marker></defs>', '<rect width="100%" height="100%" fill="#FFFDF8"/>']
    parts.append('<text x="40" y="50" font-family="Arial Unicode MS, Arial" font-size="34" font-weight="700" fill="#0F172A">会员码反扫支付闭环（重点流程）</text>')
    left = [
        "A1. 玩家出示会员码\n设备端 / 扫码枪完成反扫",
        "A2. 系统识别会员身份\n校验会员状态、会员资产、设备可用性",
        "A3. 小程序展示支付明细\n展示扣减资产、补差金额、优惠信息",
        "A4. 玩家确认扣款\n进入支付处理中",
        "A5. 扣款成功\n生成支付流水与点播订单",
        "A6. 系统下发开局指令\n设备回传开局结果",
    ]
    right = [
        "B1. 开局成功\n订单状态=进行中，进入游玩阶段",
        "B2. 正常结束\n回传结束原因=正常完成",
        "B3. 订单完结\n记录时长、内容、支付方式、设备",
        "B4. 异常场景一：支付成功未开局\n自动转异常订单，待补开局或退款",
        "B5. 异常场景二：中途退出 / 人工强停\n根据规则处理，不退款或进入人工复核",
        "B6. 退款闭环\n未结算走原路退回；已结算走线下退款+凭证",
    ]
    y=120
    for text in left:
        parts.append(svg_box(70,y,520,88,text,"#EFF6FF","#2563EB",20)); y+=118
    y=120
    for idx,text in enumerate(right):
        fill = "#ECFDF5" if idx<3 else "#FEF3C7"; stroke = "#10B981" if idx<3 else "#F59E0B"
        parts.append(svg_box(820,y,550,88,text,fill,stroke,20)); y+=118
    for i in range(5):
        yy=120+i*118+88
        parts.append(svg_arrow(330,yy,330,yy+30)); parts.append(svg_arrow(1095,yy,1095,yy+30))
    parts.append(svg_arrow(590,605,820,165,"开局成功"))
    parts.append(svg_arrow(590,487,820,515,"扣款成功但开局失败"))
    notes = [
        "闭环要求：",
        "1. 扫码成功不等于支付成功，必须经过会员识别、资产校验、确认扣款。",
        "2. 扣款成功不等于业务完成，必须继续校验开局结果。",
        "3. 结束时必须有结束原因；异常结束要进入异常订单或退款流程。",
        "4. 退款必须能回溯到订单、支付方式、设备、操作人和退款凭证。",
    ]
    y=840
    for idx,n in enumerate(notes):
        parts.append(f'<text x="70" y="{y+idx*30}" font-family="Arial Unicode MS, Arial" font-size="20" fill="#475569">{escape(n)}</text>')
    parts.append("</svg>")
    (OUT_DIR / "reverse_scan_flow.svg").write_text("".join(parts), encoding="utf-8")

    img = Image.new("RGB",(w,h),"#FFFDF8"); draw=ImageDraw.Draw(img); title_font=font(34); box_font=font(20)
    draw.text((40,28),"会员码反扫支付闭环（重点流程）",font=title_font,fill="#0F172A")
    y=120
    for text in left:
        draw.rounded_rectangle([70,y,590,y+88],radius=18,fill="#EFF6FF",outline="#2563EB",width=3)
        wr=wrap(draw,text,box_font,500); bbox=draw.multiline_textbbox((0,0),wr,font=box_font,spacing=5)
        draw.multiline_text((330-(bbox[2]-bbox[0])/2,y+44-(bbox[3]-bbox[1])/2),wr,font=box_font,fill="#0F172A",spacing=5,align="center")
        y+=118
    y=120
    for idx,text in enumerate(right):
        fill = "#ECFDF5" if idx<3 else "#FEF3C7"; stroke = "#10B981" if idx<3 else "#F59E0B"
        draw.rounded_rectangle([820,y,1370,y+88],radius=18,fill=fill,outline=stroke,width=3)
        wr=wrap(draw,text,box_font,530); bbox=draw.multiline_textbbox((0,0),wr,font=box_font,spacing=5)
        draw.multiline_text((1095-(bbox[2]-bbox[0])/2,y+44-(bbox[3]-bbox[1])/2),wr,font=box_font,fill="#0F172A",spacing=5,align="center")
        y+=118
    def arrow(a,b,label=None):
        draw.line([a,b],fill="#2563EB",width=4)
        if a[0]==b[0]:
            draw.polygon([b,(b[0]-8,b[1]-12),(b[0]+8,b[1]-12)],fill="#2563EB")
        elif b[0]>a[0]:
            draw.polygon([b,(b[0]-12,b[1]-8),(b[0]-12,b[1]+8)],fill="#2563EB")
        else:
            draw.polygon([b,(b[0]+12,b[1]-8),(b[0]+12,b[1]+8)],fill="#2563EB")
        if label:
            lf=font(16); bbox=draw.textbbox((0,0),label,font=lf); lx=(a[0]+b[0])/2-(bbox[2]-bbox[0])/2; ly=(a[1]+b[1])/2-24
            draw.rounded_rectangle([lx-8,ly-4,lx+(bbox[2]-bbox[0])+8,ly+20],radius=8,fill="#DBEAFE",outline="#93C5FD")
            draw.text((lx,ly),label,font=lf,fill="#1E3A8A")
    for i in range(5):
        yy=120+i*118+88; arrow((330,yy),(330,yy+30)); arrow((1095,yy),(1095,yy+30))
    arrow((590,605),(820,165),"开局成功"); arrow((590,487),(820,515),"扣款成功但开局失败")
    notes_font=font(20)
    for idx,n in enumerate(notes):
        draw.text((70,840+idx*30),n,font=notes_font,fill="#475569")
    img.save(OUT_DIR / "reverse_scan_flow.png")


def build_architecture() -> None:
    w,h=1440,900
    parts=[svg_header(w,h),'<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#2563EB"/></marker></defs>','<rect width="100%" height="100%" fill="#F8FAFC"/>']
    parts.append('<text x="40" y="50" font-family="Arial Unicode MS, Arial" font-size="34" font-weight="700" fill="#0F172A">支付与点播能力工程结构示意</text>')
    boxes = [
        (70,120,260,100,"用户侧\n微信小程序 / H5","#EFF6FF","#2563EB"),
        (420,120,320,100,"门店侧\n点播终端 / 扫码枪 / 头显主机","#F0FDF4","#10B981"),
        (850,120,280,100,"后台运营侧\n商家后台 / 总运营后台","#FEF3C7","#F59E0B"),
        (90,380,230,100,"订单服务\n创建订单 / 状态流转 / 结算","#FFFFFF","#2563EB"),
        (380,380,250,100,"支付服务\n金额拆分 / 扣款 / 第三方支付","#FFFFFF","#2563EB"),
        (690,380,260,100,"会员资产服务\n预存款 / 会员余额 / 游戏币","#FFFFFF","#2563EB"),
        (1020,380,250,100,"设备编排服务\n下发开局 / 结束回传 / 心跳","#FFFFFF","#2563EB"),
        (270,640,330,95,"异常订单中心\n支付异常 / 开局异常 / 人工复核","#FEF2F2","#DC2626"),
        (760,640,320,95,"退款中心\n原路退回 / 线下退款 / 凭证留存","#FFF7ED","#EA580C"),
    ]
    for b in boxes: parts.append(svg_box(*b))
    parts += [svg_arrow(200,220,200,380),svg_arrow(580,220,505,380),svg_arrow(990,220,1145,380),svg_arrow(320,430,380,430),svg_arrow(630,430,690,430),svg_arrow(950,430,1020,430),svg_arrow(505,480,430,640,"异常回流"),svg_arrow(1145,480,920,640,"退款 / 补偿")]
    parts.append('<text x="70" y="790" font-family="Arial Unicode MS, Arial" font-size="20" fill="#334155">设计原则：支付、订单、会员资产、设备控制四个能力必须解耦，但要通过订单号贯穿全链路，保证支付成功、开局、结束、异常、退款可追踪。</text>')
    parts.append("</svg>")
    (OUT_DIR / "architecture.svg").write_text("".join(parts), encoding="utf-8")

    img=Image.new("RGB",(w,h),"#F8FAFC"); draw=ImageDraw.Draw(img); title_font=font(34); box_font=font(20)
    draw.text((40,28),"支付与点播能力工程结构示意",font=title_font,fill="#0F172A")
    for x,y,bw,bh,text,fill,stroke in boxes:
        draw.rounded_rectangle([x,y,x+bw,y+bh],radius=18,fill=fill,outline=stroke,width=3)
        wr=wrap(draw,text,box_font,bw-18); bbox=draw.multiline_textbbox((0,0),wr,font=box_font,spacing=5)
        draw.multiline_text((x+bw/2-(bbox[2]-bbox[0])/2,y+bh/2-(bbox[3]-bbox[1])/2),wr,font=box_font,fill="#0F172A",spacing=5,align="center")
    def arrow(a,b,label=None):
        draw.line([a,b],fill="#2563EB",width=4)
        if a[0]==b[0]:
            draw.polygon([b,(b[0]-8,b[1]-12),(b[0]+8,b[1]-12)],fill="#2563EB")
        elif b[0]>a[0]:
            draw.polygon([b,(b[0]-12,b[1]-8),(b[0]-12,b[1]+8)],fill="#2563EB")
        else:
            draw.polygon([b,(b[0]+12,b[1]-8),(b[0]+12,b[1]+8)],fill="#2563EB")
        if label:
            lf=font(16); bbox=draw.textbbox((0,0),label,font=lf); lx=(a[0]+b[0])/2-(bbox[2]-bbox[0])/2; ly=(a[1]+b[1])/2-24
            draw.rounded_rectangle([lx-8,ly-4,lx+(bbox[2]-bbox[0])+8,ly+20],radius=8,fill="#DBEAFE",outline="#93C5FD")
            draw.text((lx,ly),label,font=lf,fill="#1E3A8A")
    arrow((200,220),(200,380)); arrow((580,220),(505,380)); arrow((990,220),(1145,380)); arrow((320,430),(380,430)); arrow((630,430),(690,430)); arrow((950,430),(1020,430)); arrow((505,480),(430,640),"异常回流"); arrow((1145,480),(920,640),"退款 / 补偿")
    draw.text((70,790),"设计原则：支付、订单、会员资产、设备控制四个能力必须解耦，但要通过订单号贯穿全链路，保证支付成功、开局、结束、异常、退款可追踪。",font=font(20),fill="#334155")
    img.save(OUT_DIR / "architecture.png")


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    build_overall()
    build_reverse()
    build_architecture()
    print(OUT_DIR)
