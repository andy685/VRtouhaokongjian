const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "头号空间";
pres.title = "头号空间 · 资金流通全景图";

// ====== 配色方案 ======
const C = {
  bg:       "0F172A",   // 深色背景
  cardBg:   "1E293B",   // 卡片背景
  border:   "334155",   // 边框
  text:     "F1F5F9",   // 主文字
  muted:    "94A3B8",   // 次要文字
  blue:     "3B82F6",   // C端
  amber:    "F59E0B",   // 商家
  green:    "10B981",   // 平台
  purple:   "8B5CF6",   // 代理商
  arrow:    "64748B",   // 箭头
  white:    "FFFFFF",
};

// ====== 辅助函数 ======
const makeShadow = () => ({
  type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.3,
});

// 箭头 (从左到右的水平箭头)
function addArrow(slide, x, y, w, color, labelAbove, subAbove) {
  // 箭头线
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width: 2.5 },
  });
  // 箭头头部 (小三角用短线模拟)
  slide.addShape(pres.shapes.LINE, {
    x: x + w - 0.08, y: y - 0.08, w: 0, h: 0.16,
    line: { color, width: 2.5 },
  });
  // 标签
  if (labelAbove) {
    slide.addText(labelAbove, {
      x: x - 0.35, y: y - 0.55, w: w + 0.7, h: 0.3,
      fontSize: 9, fontFace: "Microsoft YaHei",
      color: C.white, bold: true, align: "center", valign: "bottom",
      margin: 0,
    });
  }
  if (subAbove) {
    slide.addText(subAbove, {
      x: x - 0.35, y: y - 0.3, w: w + 0.7, h: 0.2,
      fontSize: 7, fontFace: "Microsoft YaHei",
      color: C.muted, align: "center", valign: "top",
      margin: 0,
    });
  }
}

// 角色卡片
function addCard(slide, x, y, w, h, color, title, subtitle, detail) {
  // 顶部色条
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.06, fill: { color },
  });
  // 卡片主体
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y: y + 0.06, w, h: h - 0.06,
    fill: { color: C.cardBg },
    shadow: makeShadow(),
  });
  // 色块图标 (左上角小方块)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.15, y: y + 0.25, w: 0.32, h: 0.32,
    fill: { color, transparency: 18 },
  });
  // 图标文字
  slide.addText(title.charAt(0), {
    x: x + 0.15, y: y + 0.25, w: 0.32, h: 0.32,
    fontSize: 14, fontFace: "Microsoft YaHei",
    color, bold: true, align: "center", valign: "middle",
    margin: 0,
  });
  // 标题
  slide.addText(title, {
    x: x + 0.55, y: y + 0.23, w: w - 0.7, h: 0.35,
    fontSize: 13, fontFace: "Microsoft YaHei",
    color: C.white, bold: true, align: "left", valign: "middle",
    margin: 0,
  });
  // 副标题
  slide.addText(subtitle, {
    x: x + 0.15, y: y + 0.65, w: w - 0.3, h: 0.3,
    fontSize: 8, fontFace: "Microsoft YaHei",
    color: C.muted, align: "left", valign: "middle",
    margin: 0,
  });
  // 详情 (底部)
  if (detail) {
    slide.addText(detail, {
      x: x + 0.15, y: y + h - 0.65, w: w - 0.3, h: 0.5,
      fontSize: 8, fontFace: "Microsoft YaHei",
      color: C.muted, align: "left", valign: "top",
      margin: 0,
    });
  }
}

// ====== 第1页: 封面 ======
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };

  // 装饰圆
  slide.addShape(pres.shapes.OVAL, {
    x: -1.5, y: -1.5, w: 4, h: 4,
    fill: { color: C.blue, transparency: 92 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 7.5, y: 3, w: 4, h: 4,
    fill: { color: C.purple, transparency: 92 },
  });

  // 标题
  slide.addText("头号空间", {
    x: 0, y: 1.2, w: 10, h: 0.9,
    fontSize: 40, fontFace: "Microsoft YaHei",
    color: C.white, bold: true, align: "center", valign: "middle",
    margin: 0,
  });
  // 副标题
  slide.addText("VR 线下体验店 · 资金流通全景图", {
    x: 0, y: 2.05, w: 10, h: 0.6,
    fontSize: 18, fontFace: "Microsoft YaHei",
    color: C.muted, align: "center", valign: "middle",
    margin: 0,
  });
  // 分隔线
  slide.addShape(pres.shapes.LINE, {
    x: 3.5, y: 2.9, w: 3, h: 0,
    line: { color: C.blue, width: 1.5 },
  });
  // 说明文字
  slide.addText("C端 / B端 全链路资金流转一览", {
    x: 0, y: 3.2, w: 10, h: 0.4,
    fontSize: 11, fontFace: "Microsoft YaHei",
    color: C.muted, align: "center", valign: "middle",
    margin: 0,
  });
}

// ====== 第2页: 主流程图 (横向 C→商→平→代) ======
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };

  // 页面标题
  slide.addText("资金流通全景", {
    x: 0.4, y: 0.2, w: 9.2, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei",
    color: C.white, bold: true, align: "left", valign: "middle",
    margin: 0,
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.4, y: 0.72, w: 1.6, h: 0,
    line: { color: C.blue, width: 2 },
  });

  // ---------- 上层: C端 → 商家 消费付款 ----------
  const y1 = 1.2;
  addCard(slide, 0.4,  y1, 2.1, 1.5, C.blue,   "C端用户", "游客 / 会员",
    "• 到店消费 VR 体验\n• 充值会员余额\n• 按次/按时长付费");
  addArrow(slide, 2.5, y1 + 0.75, 0.5, C.blue, "消费付款", "微信 / 支付宝 / 现金");
  addCard(slide, 3.0,  y1, 2.1, 1.5, C.amber,  "商家 / 门店", "收银 / 运营",
    "• 收款 100% 归商家\n• 消耗游戏豆启动游戏\n• 管理门店库存");

  // ---------- 下层: 商家 → 平台 采购游戏豆 ----------
  const y2 = 3.3;
  addCard(slide, 3.0,  y2, 2.1, 1.5, C.amber,  "商家 / 门店", "采购方",
    "• 预存款充值到平台\n• 批量采购游戏豆\n• 微信 / 支付宝 / 对公转账");
  addArrow(slide, 5.1, y2 + 0.75, 0.5, C.green, "采购游戏豆", "¥1 / 豆");

  addCard(slide, 5.6,  y2, 2.1, 1.5, C.green,  "平台运营", "超管 / 财务",
    "• 收款 & 配发游戏豆\n• 游戏豆消耗归平台\n• 平台核心营收来源");

  // ---------- 下层: 平台 → 代理商 分润 ----------
  addArrow(slide, 7.7, y2 + 0.75, 0.5, C.purple, "分润", "T+1 月结");
  addCard(slide, 8.2,  y2, 1.4, 1.5, C.purple, "代理商", "城市 / 区域 / 省",
    "• 按月采购额分润\n• 阶梯系数 3%~12%\n• 拉卡拉打款");

  // ---------- 连接线: 上层商家 → 下层商家 ----------
  slide.addShape(pres.shapes.LINE, {
    x: 4.05, y: y1 + 1.5, w: 0, h: y2 - (y1 + 1.5),
    line: { color: C.amber, width: 1.5, dashType: "dash" },
  });

  // ---------- 流程编号标注 ----------
  // ①
  slide.addShape(pres.shapes.OVAL, {
    x: 2.38, y: y1 + 0.25, w: 0.3, h: 0.3,
    fill: { color: C.blue },
  });
  slide.addText("①", {
    x: 2.38, y: y1 + 0.25, w: 0.3, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.white,
    bold: true, align: "center", valign: "middle", margin: 0,
  });
  // ②
  slide.addShape(pres.shapes.OVAL, {
    x: 4.98, y: y2 + 0.25, w: 0.3, h: 0.3,
    fill: { color: C.green },
  });
  slide.addText("②", {
    x: 4.98, y: y2 + 0.25, w: 0.3, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.white,
    bold: true, align: "center", valign: "middle", margin: 0,
  });
  // ③
  slide.addShape(pres.shapes.OVAL, {
    x: 7.58, y: y2 + 0.25, w: 0.3, h: 0.3,
    fill: { color: C.purple },
  });
  slide.addText("③", {
    x: 7.58, y: y2 + 0.25, w: 0.3, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.white,
    bold: true, align: "center", valign: "middle", margin: 0,
  });

  // ---------- 底部图例 ----------
  const legendY = 5.0;
  const legends = [
    { color: C.blue,   label: "① C端消费 → 商家收银，100%归商家" },
    { color: C.amber,  label: "商家采购游戏豆 (虚线连接同一角色)" },
    { color: C.green,  label: "② 商家 → 平台采购游戏豆 ¥1/豆" },
    { color: C.purple, label: "③ 平台 → 代理商分润 T+1月结" },
  ];
  legends.forEach((l, i) => {
    const lx = 0.4 + i * 2.5;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: lx, y: legendY, w: 0.2, h: 0.2, fill: { color: l.color },
    });
    slide.addText(l.label, {
      x: lx + 0.3, y: legendY - 0.02, w: 2.2, h: 0.24,
      fontSize: 7, fontFace: "Microsoft YaHei",
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });
  });

  // 页码
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4, fill: { color: C.blue },
  });
  slide.addText("2", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: C.white,
    bold: true, align: "center", valign: "middle",
  });
}

// ====== 输出 ======
const outPath = "./figma-panels/output/头号空间-资金流通全景图.pptx";
const fs = require("fs");
const path = require("path");
fs.mkdirSync(path.dirname(outPath), { recursive: true });

pres.writeFile({ fileName: outPath }).then(() => {
  console.log("✅ 已生成: " + outPath);
});
