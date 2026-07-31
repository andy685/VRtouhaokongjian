<script setup lang="ts">
import brandLogo from '../assets/site/brand-logo.png'
import heroBg from '../assets/site/vr-venue-hero.jpg'
import bodyBg from '../assets/site/vr-venue-body.jpg'

const cashierCapabilities = ['收银开单', '会员办卡', '会员充值', '商品售卖', '订单退款', '交班对账']
const vodCapabilities = ['游戏点播', '扫码支付', '设备启动', '订单回收', '现场引导', '后台联动']

const businessCapabilities = [
  { title: '收银开单', desc: '散客消费、会员消费、套餐核销一处完成', tone: 'blue', icon: 'terminal' },
  { title: '会员办卡与充值', desc: '会员档案、储值、游戏币与折扣统一管理', tone: 'green', icon: 'member' },
  { title: '商品售卖', desc: '周边商品、饮品零售与库存动作串联', tone: 'blue', icon: 'bag' },
  { title: '订单退款', desc: '收银订单与点播订单都能按规则追踪处理', tone: 'green', icon: 'wallet' },
  { title: '交班对账', desc: '前台交班、收款核对、门店账目更清楚', tone: 'blue', icon: 'checklist' },
  { title: '游戏点播', desc: '玩家现场选游戏、看详情、扫码后快速启动', tone: 'green', icon: 'game' },
  { title: '扫码支付', desc: '微信、支付宝与会员码支付在体验现场直接承接', tone: 'blue', icon: 'qr' },
  { title: '设备启动', desc: '点播客户端承接内容、设备与启动状态', tone: 'blue', icon: 'power' },
  { title: '后台联动', desc: '商家后台同步订单、会员、商品和现场记录', tone: 'green', icon: 'cloud' },
  { title: '会员权益', desc: '储值、折扣、次数与权益在门店消费链路里直接生效', tone: 'green', icon: 'shield' }
]

const workflow = [
  { title: '收银', desc: '开单 / 充值 / 商品' },
  { title: '点播', desc: '选游戏 / 支付 / 分配' },
  { title: '启动', desc: '现场引导 / 设备进入状态' },
  { title: '回收', desc: '订单回写 / 异常可查' },
  { title: '联动', desc: '后台沉淀经营记录' }
]

const scenes = [
  { title: '前台收银', desc: '散客、会员、商品和退款在同一台前台电脑完成', tone: 'blue' },
  { title: '现场点播', desc: '玩家看游戏、扫码支付，服务人员按屏幕引导体验', tone: 'green' },
  { title: '设备启动', desc: '点播客户端承接内容、设备和现场启动状态', tone: 'blue' },
  { title: '订单回收', desc: '游玩结束后订单、异常和现场记录回到后台', tone: 'gold' }
]

const downloadOptions = [
  {
    key: 'cashier',
    title: '头号掌柜收银客户端',
    subtitle: '收银管理一体化，经营更高效',
    href: '/downloads/headspace-cashier-latest.exe',
    tone: 'cashier',
    footnote: '适用于收银台 / 管理电脑',
    bullets: ['收银开单', '会员办卡与充值', '商品售卖与退款', '交班对账', '扫码支付'],
    icon: 'screen'
  },
  {
    key: 'vod',
    title: '电脑点播客户端',
    subtitle: '游戏点播更流畅，设备启动更智能',
    href: '/downloads/headspace-vod-latest.exe',
    tone: 'vod',
    footnote: '适用于点播电脑 / 启动设备',
    bullets: ['游戏点播', '设备启动', '订单回收', '扫码支付', '后台联动'],
    icon: 'play'
  }
]

const footerColumns = [
  { title: '产品能力', links: ['收银客户端', '点播客户端', '业务能力'] },
  { title: '客户端下载', links: ['收银客户端下载', '点播客户端下载', '客户端安装帮助'] },
  { title: '门店流程', links: ['流程介绍', '场景说明', '启动与回收'] },
  { title: '安装帮助', links: ['安装指引', '常见问题', '重新绑定说明'] },
  { title: '联系我们', links: ['服务时间：9:00 - 21:00', '联系席位：在线客服', '商务合作：官方渠道'] }
]
</script>

<template>
  <div class="site-page" :style="{ '--hero-image': `url(${heroBg})`, '--body-image': `url(${bodyBg})` }">
    <header class="site-header">
      <a class="brand-link" href="#top" aria-label="头号空间官网">
        <img :src="brandLogo" alt="头号空间 ALPHA SPACE 飞天云动 FLOWING CLOUD" />
      </a>

      <nav class="site-nav" aria-label="官网导航">
        <a href="#capabilities">产品能力</a>
        <a href="#downloads">客户端下载</a>
        <a href="#workflow">门店流程</a>
        <a href="#install">安装帮助</a>
        <a href="#contact">联系我们</a>
      </nav>
    </header>

    <main id="top">
      <section class="hero-section">
        <div class="hero-backdrop" aria-hidden="true"></div>
        <div class="hero-inner">
          <div class="hero-copy">
            <p class="section-kicker">沉浸娱乐门店客户端中心</p>
            <h1>头号空间</h1>
            <p class="hero-lead">
              面向线下 VR 娱乐门店，把前台收银、会员经营、现场点播和订单回收串成一套可落地的工作流。
            </p>

            <div class="hero-actions" aria-label="客户端下载">
              <a class="download-card download-card-cashier" href="/downloads/headspace-cashier-latest.exe" download>
                <span class="download-icon screen-icon" aria-hidden="true"></span>
                <span>
                  <strong>下载收银客户端</strong>
                  <small>适用于前台收银 / 会员 / 商品</small>
                </span>
              </a>
              <a class="download-card download-card-vod" href="/downloads/headspace-vod-latest.exe" download>
                <span class="download-icon play-icon" aria-hidden="true"></span>
                <span>
                  <strong>下载点播客户端</strong>
                  <small>适用于现场点播 / 支付 / 启动</small>
                </span>
              </a>
            </div>

            <div class="hero-points" aria-label="核心能力">
              <span>收银与会员一体化</span>
              <span>点播与设备联动</span>
              <span>订单回写到后台</span>
            </div>
          </div>

          <aside class="hero-showcase" aria-label="头号空间客户端展示">
            <div class="showcase-shell">
              <div class="showcase-top">
                <span>客户端工作台</span>
                <strong>前台经营 + 现场体验</strong>
              </div>
              <div class="showcase-stage">
                <div class="terminal terminal-cashier">
                  <span class="screen-icon small-icon" aria-hidden="true"></span>
                  <strong>收银客户端</strong>
                  <div class="terminal-screen cashier-screen" aria-hidden="true">
                    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                  </div>
                </div>
                <div class="terminal terminal-vod">
                  <span class="play-icon small-icon" aria-hidden="true"></span>
                  <strong>点播客户端</strong>
                  <div class="terminal-screen vod-screen" aria-hidden="true">
                    <i></i><i></i><i></i><i></i><i></i><i></i>
                  </div>
                </div>
              </div>
              <div class="showcase-caption">
                <span>收银与会员</span>
                <i></i>
                <span>游戏点播与启动</span>
                <i></i>
                <span>订单回写后台</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="capabilities" class="section product-section">
        <div class="section-title">
          <p class="section-kicker">产品能力</p>
          <h2>两套客户端，覆盖门店前台和现场体验。</h2>
          <p>收银客户端负责经营动作，点播客户端负责体验动作。官网不只给下载，也要让门店快速理解为什么需要这两套客户端。</p>
        </div>

        <div class="product-grid">
          <article class="product-card product-card-cashier">
            <div class="product-copy">
              <span class="product-icon screen-icon" aria-hidden="true"></span>
              <h3>头号掌柜收银客户端</h3>
              <p>面向前台员工和店长，承接日常收款、会员、商品、订单和交班。</p>
            </div>
            <div class="product-visual cashier-visual" aria-hidden="true">
              <div class="visual-sidebar"></div>
              <div class="visual-grid">
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div class="chip-list">
              <span v-for="item in cashierCapabilities" :key="item">{{ item }}</span>
            </div>
          </article>

          <article class="product-card product-card-vod">
            <div class="product-copy">
              <span class="product-icon play-icon" aria-hidden="true"></span>
              <h3>电脑点播客户端</h3>
              <p>面向现场玩家和服务人员，承接游戏展示、扫码支付、设备启动和订单回收。</p>
            </div>
            <div class="product-visual vod-visual" aria-hidden="true">
              <div class="visual-sidebar"></div>
              <div class="poster-wall">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>
            </div>
            <div class="chip-list">
              <span v-for="item in vodCapabilities" :key="item">{{ item }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="section business-section">
        <div class="section-title compact">
          <p class="section-kicker">业务能力</p>
          <h2>门店高频动作，不再分散在不同工具里。</h2>
          <p>我们把前台收银、会员经营、商品售卖、现场点播和后台联动放在同一条业务线上，让门店少切系统、少做重复动作。</p>
        </div>

        <div class="business-grid">
          <article v-for="item in businessCapabilities" :key="item.title" class="ability-card" :class="`ability-${item.tone}`">
            <span class="ability-mark" :class="`ability-icon-${item.icon}`" aria-hidden="true"></span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <section class="section scene-section">
        <div class="scene-heading">
          <p class="section-kicker">场景化能力</p>
          <h2>不是下载两个软件，而是把门店现场跑起来。</h2>
          <p>官网需要让商家看到完整业务闭环：前台收款、玩家点播、设备启动、订单回收，这些环节最终都回到后台沉淀。</p>
        </div>

        <div class="scene-strip">
          <article v-for="item in scenes" :key="item.title" class="scene-card" :class="`scene-${item.tone}`">
            <div class="scene-art" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <section id="workflow" class="section workflow-section">
        <div class="section-title compact center">
          <p class="section-kicker">门店流程</p>
          <h2>从收银到点播，再回到后台。</h2>
        </div>

        <div class="workflow-track">
          <article v-for="(item, index) in workflow" :key="item.title" class="workflow-node">
            <span>{{ item.title }}</span>
            <p>{{ item.desc }}</p>
            <i v-if="index < workflow.length - 1" aria-hidden="true"></i>
          </article>
        </div>
      </section>

      <section id="downloads" class="section download-section">
        <div class="download-panel">
          <div class="section-title compact">
            <p class="section-kicker">客户端下载</p>
            <h2>按门店场景选择客户端。</h2>
            <p>前台电脑安装收银客户端，现场点播主机安装点播客户端。两者配合使用，业务链路更完整。</p>
          </div>

          <div class="download-grid">
            <article
              v-for="item in downloadOptions"
              :key="item.key"
              class="download-detail"
              :class="`download-detail-${item.tone}`"
            >
              <div class="download-copy">
                <span
                  class="download-icon"
                  :class="item.icon === 'screen' ? 'screen-icon' : 'play-icon'"
                  aria-hidden="true"
                ></span>
                <strong>{{ item.title }}</strong>
                <small>{{ item.subtitle }}</small>
                <ul class="download-bullets">
                  <li v-for="bullet in item.bullets" :key="bullet">{{ bullet }}</li>
                </ul>
                <a
                  class="download-button"
                  :class="`download-button-${item.tone}`"
                  :href="item.href"
                  download
                >
                  {{ item.tone === 'cashier' ? '下载收银客户端' : '下载点播客户端' }}
                </a>
                <em>{{ item.footnote }}</em>
              </div>

              <div class="download-monitor" :class="`download-monitor-${item.tone}`" aria-hidden="true">
                <div class="monitor-shell">
                  <div class="monitor-screen" :class="`monitor-screen-${item.tone}`">
                    <div class="monitor-sidebar"></div>
                    <div v-if="item.tone === 'cashier'" class="monitor-grid monitor-grid-cashier">
                      <span v-for="n in 10" :key="n"></span>
                    </div>
                    <div v-else class="monitor-grid monitor-grid-vod">
                      <span v-for="n in 8" :key="n"></span>
                    </div>
                  </div>
                  <div class="monitor-base"></div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="install" class="install-note">
        <div class="install-inner">
          <strong>安装提醒</strong>
          <span>首次安装、卸载重装、清除本地数据或更换主机后，请按后台配置重新绑定对应客户端。</span>
        </div>
      </section>
    </main>

    <footer id="contact" class="site-footer">
      <div class="footer-brand">
        <img :src="brandLogo" alt="头号空间" />
        <p>沉浸娱乐门店数字化管理平台，让门店经营更高效，让现场体验更沉浸。</p>
      </div>

      <div class="footer-columns">
        <section v-for="column in footerColumns" :key="column.title" class="footer-column">
          <h3>{{ column.title }}</h3>
          <a
            v-for="link in column.links"
            :key="link"
            href="#top"
            :class="{ 'footer-text-link': column.title === '联系我们' }"
          >
            {{ link }}
          </a>
        </section>
      </div>

      <div class="footer-bottom">
        <span>© 头号空间 版权所有</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
:global(html) {
  scroll-behavior: smooth;
}

:global(body) {
  background: #071017;
}

.site-page {
  --bg: #071017;
  --bg-soft: #0b1620;
  --panel: rgba(12, 25, 36, .78);
  --panel-strong: rgba(12, 28, 40, .92);
  --line: rgba(162, 226, 255, .18);
  --line-green: rgba(178, 255, 71, .28);
  --text: #f5fbff;
  --muted: #a8b7c5;
  --blue: #31caff;
  --green: #a7ff3d;
  --gold: #ffd06d;
  min-height: 100vh;
  color: var(--text);
  background:
    radial-gradient(circle at 14% 5%, rgba(49, 202, 255, .2), transparent 30%),
    radial-gradient(circle at 86% 23%, rgba(167, 255, 61, .12), transparent 24%),
    linear-gradient(180deg, #060b10 0%, #071017 48%, #05090d 100%);
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  overflow-x: hidden;
}

.site-page * {
  box-sizing: border-box;
}

.site-header,
.hero-inner,
.section,
.install-inner,
.site-footer {
  width: min(1240px, calc(100% - 72px));
  margin: 0 auto;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  height: 78px;
  padding: 0 max(36px, calc((100vw - 1240px) / 2));
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(5, 10, 15, .78);
  backdrop-filter: blur(18px);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  width: 286px;
  min-width: 220px;
}

.brand-link img {
  width: 100%;
  height: auto;
  display: block;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 44px;
}

.site-nav a,
.site-footer a {
  color: rgba(245, 251, 255, .78);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: color .18s ease;
}

.site-nav a:hover,
.site-footer a:hover {
  color: var(--green);
}

.hero-section {
  position: relative;
  min-height: 720px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, .08);
}

.hero-backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(5, 10, 15, .98) 0%, rgba(5, 10, 15, .78) 38%, rgba(5, 10, 15, .36) 72%, rgba(5, 10, 15, .84) 100%),
    var(--hero-image) center right / cover no-repeat;
}

.hero-backdrop::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 210px;
  background: linear-gradient(180deg, transparent, var(--bg));
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, .86fr) minmax(520px, .95fr);
  align-items: center;
  gap: 58px;
  padding: 82px 0 70px;
}

.section-kicker {
  margin: 0;
  color: var(--green);
  font-size: 15px;
  font-weight: 800;
}

.hero-copy h1,
.section-title h2 {
  margin: 0;
  letter-spacing: 0;
}

.hero-copy h1 {
  margin-top: 20px;
  font-size: clamp(64px, 8vw, 112px);
  line-height: .95;
  font-weight: 900;
}

.hero-lead {
  max-width: 610px;
  margin: 28px 0 0;
  color: rgba(245, 251, 255, .78);
  font-size: 20px;
  line-height: 1.75;
}

.hero-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  max-width: 700px;
  margin-top: 42px;
}

.download-card,
.download-tile {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 96px;
  padding: 22px 24px;
  color: var(--text);
  text-decoration: none;
  border: 1px solid var(--line);
  background: rgba(11, 24, 34, .76);
  box-shadow: 0 20px 55px rgba(0, 0, 0, .26);
  transition: transform .18s ease, border-color .18s ease, background .18s ease;
}

.download-card:hover,
.download-tile:hover,
.product-card:hover,
.ability-card:hover {
  transform: translateY(-4px);
}

.download-card strong,
.download-tile strong {
  display: block;
  font-size: 20px;
  line-height: 1.2;
}

.download-card small,
.download-tile small {
  display: block;
  margin-top: 9px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.download-card-cashier,
.download-tile-cashier {
  border-color: rgba(49, 202, 255, .42);
}

.download-card-vod,
.download-tile-vod {
  border-color: rgba(167, 255, 61, .42);
}

.download-card-vod:hover,
.download-tile-vod:hover {
  background: rgba(35, 68, 20, .55);
}

.download-card-cashier:hover,
.download-tile-cashier:hover {
  background: rgba(16, 55, 74, .55);
}

.download-icon,
.product-icon,
.small-icon {
  position: relative;
  flex: 0 0 auto;
  display: inline-grid;
  place-items: center;
  border: 1px solid currentColor;
}

.download-icon {
  width: 54px;
  height: 54px;
  border-radius: 15px;
}

.small-icon {
  width: 28px;
  height: 28px;
  border-radius: 9px;
}

.product-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  margin-bottom: 26px;
}

.screen-icon {
  color: var(--blue);
  background: rgba(49, 202, 255, .1);
}

.screen-icon::before {
  content: "";
  width: 48%;
  height: 34%;
  border: 2px solid currentColor;
  border-radius: 3px;
}

.screen-icon::after {
  content: "";
  position: absolute;
  bottom: 12px;
  width: 34%;
  height: 2px;
  background: currentColor;
}

.small-icon.screen-icon::after {
  bottom: 5px;
}

.play-icon {
  color: var(--green);
  background: rgba(167, 255, 61, .1);
}

.play-icon::before {
  content: "";
  width: 0;
  height: 0;
  margin-left: 4px;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
  border-left: 14px solid currentColor;
}

.small-icon.play-icon::before {
  border-top-width: 6px;
  border-bottom-width: 6px;
  border-left-width: 9px;
}

.hero-points {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

.hero-points span {
  padding: 8px 12px;
  color: rgba(245, 251, 255, .82);
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, .12);
  background: rgba(255, 255, 255, .06);
}

.hero-showcase {
  position: relative;
  min-height: 430px;
}

.hero-showcase::before,
.hero-showcase::after {
  content: "";
  position: absolute;
  border: 1px solid rgba(49, 202, 255, .2);
  pointer-events: none;
}

.hero-showcase::before {
  inset: 40px 0 36px 58px;
  transform: skewX(-7deg);
  background: linear-gradient(135deg, rgba(49, 202, 255, .08), rgba(167, 255, 61, .04));
}

.hero-showcase::after {
  inset: 84px 44px 0 0;
  border-color: rgba(167, 255, 61, .18);
  transform: skewX(8deg);
}

.showcase-shell {
  position: relative;
  z-index: 1;
  padding: 26px;
  border: 1px solid rgba(49, 202, 255, .36);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .1), rgba(255, 255, 255, .035)),
    rgba(5, 13, 20, .76);
  box-shadow: 0 34px 90px rgba(0, 0, 0, .42);
  backdrop-filter: blur(18px);
}

.showcase-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.showcase-top span {
  color: var(--muted);
  font-size: 14px;
}

.showcase-top strong {
  color: rgba(245, 251, 255, .88);
  font-size: 15px;
}

.showcase-stage {
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 18px;
  align-items: stretch;
}

.terminal {
  min-height: 270px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, .12);
  background: rgba(6, 14, 22, .78);
}

.terminal-vod {
  transform: translateY(24px);
  border-color: rgba(167, 255, 61, .24);
  background: linear-gradient(180deg, rgba(167, 255, 61, .08), rgba(6, 14, 22, .8));
}

.terminal strong {
  font-size: 15px;
}

.terminal-screen {
  flex: 1;
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, .12);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, .08) 0 44px, transparent 44px),
    rgba(0, 0, 0, .34);
}

.terminal-screen i {
  display: block;
  min-height: 28px;
  background: rgba(49, 202, 255, .18);
}

.cashier-screen {
  grid-template-columns: repeat(2, 1fr);
  padding-left: 64px;
}

.cashier-screen i:nth-child(3n) {
  background: rgba(167, 255, 61, .18);
}

.vod-screen {
  grid-template-columns: repeat(2, 1fr);
  padding-left: 60px;
}

.vod-screen i {
  min-height: 42px;
  background: linear-gradient(135deg, rgba(49, 202, 255, .24), rgba(167, 255, 61, .16));
}

.showcase-caption {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr auto;
  gap: 12px;
  align-items: center;
  margin-top: 34px;
  color: rgba(245, 251, 255, .7);
  font-size: 13px;
}

.showcase-caption i {
  height: 1px;
  background: linear-gradient(90deg, var(--blue), var(--green));
  opacity: .65;
}

.hero-preview {
  padding: 22px;
  border: 1px solid rgba(49, 202, 255, .36);
  background: rgba(5, 13, 20, .72);
  box-shadow: 0 34px 90px rgba(0, 0, 0, .42);
  backdrop-filter: blur(18px);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  color: rgba(245, 251, 255, .8);
  font-size: 14px;
  font-weight: 700;
}

.preview-header i {
  width: 44px;
  height: 2px;
  background: linear-gradient(90deg, var(--blue), var(--green));
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.client-preview {
  min-height: 255px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, .12);
  background: linear-gradient(180deg, rgba(255, 255, 255, .08), rgba(255, 255, 255, .035));
}

.client-preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  font-size: 14px;
}

.mock-window {
  height: 172px;
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, .13);
  background: rgba(4, 9, 14, .8);
}

.mock-sidebar {
  border-right: 1px solid rgba(255, 255, 255, .09);
  background:
    linear-gradient(var(--blue), var(--blue)) 12px 20px / 24px 4px no-repeat,
    linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)) 12px 42px / 18px 4px no-repeat,
    linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)) 12px 62px / 22px 4px no-repeat;
}

.mock-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.mock-content span,
.poster-grid span {
  border: 1px solid rgba(255, 255, 255, .1);
  background: rgba(49, 202, 255, .15);
}

.mock-content span:nth-child(3n) {
  background: rgba(167, 255, 61, .14);
}

.poster-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.poster-grid span {
  min-height: 43px;
  background:
    linear-gradient(135deg, rgba(49,202,255,.24), rgba(167,255,61,.11)),
    rgba(255, 255, 255, .08);
}

.section {
  padding: 94px 0;
}

.section-title {
  display: grid;
  grid-template-columns: minmax(0, .72fr) minmax(360px, .38fr);
  gap: 64px;
  align-items: end;
  margin-bottom: 36px;
}

.section-title > .section-kicker {
  grid-column: 1 / -1;
}

.section-title.compact {
  display: block;
  max-width: 650px;
}

.section-title.center {
  max-width: 760px;
  margin-right: auto;
  margin-left: auto;
  text-align: center;
}

.section-title h2 {
  margin-top: 13px;
  font-size: clamp(34px, 4.2vw, 54px);
  line-height: 1.14;
  font-weight: 900;
}

.section-title p:last-child {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.8;
}

.product-section {
  padding-top: 104px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.product-card {
  min-height: 430px;
  display: grid;
  grid-template-columns: minmax(0, .72fr) minmax(220px, .62fr);
  grid-template-rows: 1fr auto;
  gap: 28px;
  padding: 34px;
  border: 1px solid var(--line);
  background:
    radial-gradient(circle at 90% 12%, rgba(49, 202, 255, .12), transparent 28%),
    var(--panel);
  transition: transform .18s ease, border-color .18s ease;
}

.product-card-vod {
  border-color: var(--line-green);
  background:
    radial-gradient(circle at 90% 12%, rgba(167, 255, 61, .13), transparent 28%),
    var(--panel);
}

.product-card h3,
.ability-card h3 {
  margin: 0;
  font-size: 26px;
  line-height: 1.25;
}

.product-card p,
.ability-card p,
.workflow-node p {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.75;
}

.chip-list {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.chip-list span {
  padding: 8px 12px;
  color: rgba(245, 251, 255, .86);
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, .12);
  background: rgba(255, 255, 255, .06);
}

.product-visual {
  min-height: 210px;
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 14px;
  align-self: end;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, .12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .07), rgba(255, 255, 255, .025)),
    rgba(0, 0, 0, .18);
  box-shadow: inset 0 0 34px rgba(49, 202, 255, .05);
}

.vod-visual {
  box-shadow: inset 0 0 34px rgba(167, 255, 61, .06);
}

.visual-sidebar {
  border-right: 1px solid rgba(255, 255, 255, .1);
  background:
    linear-gradient(var(--blue), var(--blue)) 8px 20px / 28px 4px no-repeat,
    linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)) 8px 46px / 20px 4px no-repeat,
    linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)) 8px 70px / 24px 4px no-repeat,
    linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)) 8px 94px / 18px 4px no-repeat;
}

.vod-visual .visual-sidebar {
  background:
    linear-gradient(var(--green), var(--green)) 8px 20px / 28px 4px no-repeat,
    linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)) 8px 46px / 20px 4px no-repeat,
    linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)) 8px 70px / 24px 4px no-repeat,
    linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)) 8px 94px / 18px 4px no-repeat;
}

.visual-grid,
.poster-wall {
  display: grid;
  gap: 10px;
}

.visual-grid {
  grid-template-columns: repeat(3, 1fr);
}

.visual-grid span,
.poster-wall span {
  min-height: 42px;
  border: 1px solid rgba(255, 255, 255, .1);
  background: rgba(49, 202, 255, .15);
}

.visual-grid span:nth-child(4n),
.visual-grid span:nth-child(5n) {
  background: rgba(167, 255, 61, .15);
}

.poster-wall {
  grid-template-columns: repeat(2, 1fr);
}

.poster-wall span {
  min-height: 60px;
  background:
    linear-gradient(135deg, rgba(49,202,255,.18), rgba(167,255,61,.17)),
    rgba(255,255,255,.07);
}

.business-section {
  padding-top: 64px;
}

.business-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-top: 34px;
}

.ability-card {
  min-height: 178px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, .11);
  background: rgba(11, 24, 34, .66);
  transition: transform .18s ease, border-color .18s ease;
}

.ability-blue:hover {
  border-color: rgba(49, 202, 255, .38);
}

.ability-green:hover {
  border-color: rgba(167, 255, 61, .38);
}

.ability-mark {
  position: relative;
  display: block;
  width: 42px;
  height: 42px;
  margin-bottom: 26px;
  border: 1px solid currentColor;
  border-radius: 0;
  color: var(--blue);
  background: rgba(49, 202, 255, .1);
}

.ability-mark::before,
.ability-mark::after {
  content: "";
  position: absolute;
  display: block;
}

.ability-green .ability-mark {
  color: var(--green);
  background: rgba(167, 255, 61, .1);
}

.ability-icon-terminal::before {
  inset: 10px 8px 14px;
  border: 2px solid currentColor;
}

.ability-icon-terminal::after {
  left: 12px;
  right: 12px;
  bottom: 9px;
  height: 2px;
  background: currentColor;
}

.ability-icon-member {
  border-radius: 50%;
}

.ability-icon-member::before {
  width: 12px;
  height: 12px;
  left: 14px;
  top: 8px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.ability-icon-member::after {
  width: 24px;
  height: 12px;
  left: 8px;
  bottom: 8px;
  border: 2px solid currentColor;
  border-radius: 14px 14px 4px 4px;
}

.ability-icon-bag::before {
  left: 9px;
  right: 9px;
  bottom: 8px;
  height: 22px;
  border: 2px solid currentColor;
}

.ability-icon-bag::after {
  width: 14px;
  height: 8px;
  left: 14px;
  top: 8px;
  border: 2px solid currentColor;
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
}

.ability-icon-wallet::before {
  left: 8px;
  right: 7px;
  top: 12px;
  height: 20px;
  border: 2px solid currentColor;
  border-radius: 3px;
}

.ability-icon-wallet::after {
  right: 7px;
  top: 17px;
  width: 14px;
  height: 10px;
  border: 2px solid currentColor;
  background: rgba(0, 0, 0, .18);
}

.ability-icon-checklist::before {
  left: 10px;
  top: 8px;
  width: 22px;
  height: 26px;
  border: 2px solid currentColor;
}

.ability-icon-checklist::after {
  left: 15px;
  top: 15px;
  width: 14px;
  height: 8px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(-45deg);
}

.ability-icon-game {
  border-radius: 14px;
}

.ability-icon-game::before {
  left: 8px;
  right: 8px;
  top: 15px;
  height: 14px;
  border: 2px solid currentColor;
  border-radius: 10px;
}

.ability-icon-game::after {
  left: 13px;
  top: 18px;
  width: 6px;
  height: 6px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
}

.ability-icon-qr::before {
  inset: 8px;
  background:
    linear-gradient(currentColor, currentColor) 0 0 / 10px 2px no-repeat,
    linear-gradient(currentColor, currentColor) 0 0 / 2px 10px no-repeat,
    linear-gradient(currentColor, currentColor) 20px 0 / 10px 2px no-repeat,
    linear-gradient(currentColor, currentColor) 28px 0 / 2px 10px no-repeat,
    linear-gradient(currentColor, currentColor) 0 28px / 10px 2px no-repeat,
    linear-gradient(currentColor, currentColor) 0 20px / 2px 10px no-repeat,
    linear-gradient(currentColor, currentColor) 18px 18px / 12px 12px no-repeat;
}

.ability-icon-power {
  border-radius: 50%;
}

.ability-icon-power::before {
  width: 19px;
  height: 19px;
  left: 10px;
  top: 13px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
}

.ability-icon-power::after {
  width: 2px;
  height: 15px;
  left: 20px;
  top: 8px;
  background: currentColor;
}

.ability-icon-cloud::before {
  left: 8px;
  top: 17px;
  width: 26px;
  height: 14px;
  border: 2px solid currentColor;
  border-radius: 14px;
}

.ability-icon-cloud::after {
  left: 14px;
  top: 10px;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-radius: 50%;
  background: rgba(5, 10, 15, .8);
}

.ability-icon-shield::before {
  left: 11px;
  top: 7px;
  width: 18px;
  height: 24px;
  border: 2px solid currentColor;
  clip-path: polygon(50% 0, 100% 18%, 100% 62%, 50% 100%, 0 62%, 0 18%);
}

.ability-icon-shield::after {
  left: 16px;
  top: 15px;
  width: 9px;
  height: 6px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(-45deg);
}

.scene-section {
  padding-top: 70px;
}

.scene-heading {
  display: grid;
  grid-template-columns: minmax(0, .7fr) minmax(360px, .42fr);
  gap: 64px;
  align-items: end;
  margin-bottom: 30px;
}

.scene-heading .section-kicker {
  grid-column: 1 / -1;
}

.scene-heading h2,
.scene-heading p {
  margin: 0;
}

.scene-heading h2 {
  font-size: clamp(34px, 4.2vw, 54px);
  line-height: 1.14;
  font-weight: 900;
}

.scene-heading p:last-child {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.8;
}

.scene-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  min-height: 360px;
  border: 1px solid rgba(255, 255, 255, .12);
  overflow: hidden;
  background: rgba(4, 9, 14, .7);
}

.scene-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 360px;
  padding: 28px;
  border-right: 1px solid rgba(255, 255, 255, .1);
  overflow: hidden;
}

.scene-card:last-child {
  border-right: 0;
}

.scene-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(5, 10, 15, .12), rgba(5, 10, 15, .88)),
    var(--body-image) center / cover no-repeat;
  opacity: .5;
  transform: scale(1.08);
}

.scene-green::before {
  filter: hue-rotate(54deg) saturate(1.15);
}

.scene-gold::before {
  filter: hue-rotate(140deg) saturate(1.05);
}

.scene-art,
.scene-card h3,
.scene-card p {
  position: relative;
  z-index: 1;
}

.scene-art {
  position: absolute;
  left: 28px;
  right: 28px;
  top: 32px;
  height: 150px;
  border: 1px solid rgba(49, 202, 255, .24);
  background: rgba(0, 0, 0, .28);
}

.scene-green .scene-art {
  border-color: rgba(167, 255, 61, .26);
}

.scene-gold .scene-art {
  border-color: rgba(255, 208, 109, .28);
}

.scene-art span {
  position: absolute;
  display: block;
  background: currentColor;
  color: var(--blue);
  opacity: .85;
}

.scene-green .scene-art span {
  color: var(--green);
}

.scene-gold .scene-art span {
  color: var(--gold);
}

.scene-art span:nth-child(1) {
  width: 72px;
  height: 4px;
  left: 24px;
  top: 38px;
}

.scene-art span:nth-child(2) {
  width: 110px;
  height: 78px;
  right: 22px;
  top: 32px;
  opacity: .18;
}

.scene-art span:nth-child(3) {
  width: 60px;
  height: 60px;
  left: 28px;
  bottom: 22px;
  border: 2px solid currentColor;
  background: transparent;
}

.scene-card h3 {
  margin: 0;
  font-size: 26px;
  line-height: 1.2;
}

.scene-card p {
  margin: 12px 0 0;
  color: rgba(245, 251, 255, .68);
  font-size: 14px;
  line-height: 1.7;
}

.workflow-section {
  padding-top: 74px;
}

.workflow-track {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: stretch;
  gap: 14px;
  margin-top: 46px;
}

.workflow-node {
  position: relative;
  min-height: 150px;
  padding: 26px 20px;
  text-align: center;
  border: 1px solid rgba(49, 202, 255, .24);
  background:
    linear-gradient(180deg, rgba(49, 202, 255, .09), rgba(255, 255, 255, .03)),
    rgba(8, 18, 27, .74);
}

.workflow-node span {
  display: block;
  color: var(--text);
  font-size: 24px;
  font-weight: 900;
}

.workflow-node i {
  position: absolute;
  top: 48%;
  right: -22px;
  z-index: 2;
  width: 30px;
  height: 1px;
  background: linear-gradient(90deg, var(--blue), var(--green));
}

.workflow-node i::after {
  content: "";
  position: absolute;
  right: 0;
  top: -4px;
  width: 8px;
  height: 8px;
  border-top: 1px solid var(--green);
  border-right: 1px solid var(--green);
  transform: rotate(45deg);
}

.download-section {
  padding-bottom: 54px;
}

.download-panel {
  display: grid;
  grid-template-columns: minmax(0, .72fr) minmax(520px, .9fr);
  gap: 44px;
  align-items: center;
  padding: 42px;
  border: 1px solid rgba(255, 255, 255, .12);
  background:
    linear-gradient(135deg, rgba(49, 202, 255, .1), rgba(167, 255, 61, .07)),
    var(--panel-strong);
}

.download-panel .section-title {
  margin-bottom: 0;
}

.download-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.download-detail {
  min-height: 342px;
  display: grid;
  grid-template-columns: minmax(0, .92fr) minmax(220px, .78fr);
  gap: 20px;
  padding: 26px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(7, 17, 26, .74);
}

.download-detail-cashier {
  border-color: rgba(49, 202, 255, .34);
}

.download-detail-vod {
  border-color: rgba(167, 255, 61, .34);
  background: linear-gradient(135deg, rgba(167, 255, 61, .08), rgba(7, 17, 26, .82));
}

.download-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.download-copy strong {
  display: block;
  margin-top: 18px;
  font-size: 28px;
  line-height: 1.2;
}

.download-copy small {
  display: block;
  margin-top: 10px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}

.download-bullets {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
}

.download-bullets li {
  position: relative;
  padding-left: 18px;
  color: rgba(245, 251, 255, .88);
  font-size: 14px;
}

.download-bullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--blue);
}

.download-detail-vod .download-bullets li::before {
  background: var(--green);
}

.download-button {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 26px;
  color: #081017;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  transition: transform .18s ease, filter .18s ease;
}

.download-button:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.download-button-cashier {
  background: linear-gradient(135deg, rgba(49, 202, 255, .95), rgba(0, 141, 255, .78));
}

.download-button-vod {
  background: linear-gradient(135deg, rgba(167, 255, 61, .9), rgba(125, 186, 34, .78));
}

.download-copy em {
  margin-top: 12px;
  color: rgba(245, 251, 255, .54);
  font-size: 12px;
  font-style: normal;
}

.download-monitor {
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-shell {
  width: 100%;
  max-width: 260px;
}

.monitor-screen {
  aspect-ratio: 1.12 / 1;
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(5, 11, 17, .84);
  box-shadow: inset 0 0 28px rgba(49, 202, 255, .08);
}

.monitor-screen-vod {
  box-shadow: inset 0 0 28px rgba(167, 255, 61, .08);
}

.monitor-sidebar {
  border-right: 1px solid rgba(255, 255, 255, .1);
  background:
    linear-gradient(rgba(255,255,255,.82), rgba(255,255,255,.82)) 8px 16px / 18px 3px no-repeat,
    linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)) 8px 34px / 16px 3px no-repeat,
    linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)) 8px 52px / 12px 3px no-repeat;
}

.monitor-grid {
  display: grid;
  gap: 8px;
}

.monitor-grid-cashier {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.monitor-grid-cashier span {
  min-height: 28px;
  border: 1px solid rgba(255, 255, 255, .1);
  background: rgba(49, 202, 255, .18);
}

.monitor-grid-cashier span:nth-child(4n),
.monitor-grid-cashier span:nth-child(5n) {
  background: rgba(167, 255, 61, .14);
}

.monitor-grid-vod {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.monitor-grid-vod span {
  min-height: 40px;
  border: 1px solid rgba(255, 255, 255, .1);
  background:
    linear-gradient(135deg, rgba(49, 202, 255, .2), rgba(167, 255, 61, .16)),
    rgba(255, 255, 255, .06);
}

.monitor-base {
  width: 56%;
  height: 18px;
  margin: 14px auto 0;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(49, 202, 255, .44), rgba(255, 255, 255, .12), rgba(49, 202, 255, .44));
}

.install-note {
  padding: 0 0 54px;
}

.install-inner {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 20px 24px;
  color: #102018;
  border: 1px solid rgba(167, 255, 61, .34);
  background: #efffe9;
}

.install-inner strong {
  flex: 0 0 auto;
}

.install-inner span {
  color: #3d4f43;
  font-size: 14px;
  line-height: 1.6;
}

.site-footer {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 44px;
  padding: 42px 0 26px;
  border-top: 1px solid rgba(255, 255, 255, .08);
}

.footer-brand img {
  width: 250px;
  height: auto;
}

.footer-brand p {
  margin: 18px 0 0;
  color: rgba(245, 251, 255, .62);
  font-size: 14px;
  line-height: 1.8;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.footer-column h3 {
  margin: 0 0 14px;
  color: rgba(245, 251, 255, .94);
  font-size: 15px;
}

.footer-column a {
  display: block;
  margin-bottom: 10px;
  color: rgba(245, 251, 255, .58);
  font-size: 13px;
  line-height: 1.6;
  text-decoration: none;
}

.footer-column .footer-text-link {
  pointer-events: none;
}

.footer-bottom {
  grid-column: 1 / -1;
  padding-top: 6px;
  color: rgba(245, 251, 255, .42);
  font-size: 12px;
  text-align: center;
}

@media (max-width: 1080px) {
  .site-nav {
    gap: 24px;
  }

  .hero-inner,
  .section-title,
  .scene-heading,
  .download-panel {
    grid-template-columns: 1fr;
  }

  .hero-inner {
    gap: 38px;
  }

  .business-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .scene-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .download-detail {
    grid-template-columns: 1fr;
  }

  .footer-columns,
  .site-footer {
    grid-template-columns: 1fr;
  }

  .workflow-track {
    grid-template-columns: 1fr;
  }

  .workflow-node {
    text-align: left;
  }

  .workflow-node i {
    display: none;
  }
}

@media (max-width: 760px) {
  .hero-inner,
  .section,
  .install-inner,
  .site-footer {
    width: min(100% - 32px, 560px);
  }

  .site-header {
    height: 72px;
    padding: 0 16px;
  }

  .brand-link {
    width: 218px;
  }

  .site-nav {
    display: none;
  }

  .hero-section {
    min-height: auto;
  }

  .hero-inner {
    grid-template-columns: 1fr;
    padding: 64px 0 54px;
  }

  .hero-copy h1 {
    font-size: clamp(54px, 18vw, 78px);
  }

  .hero-lead {
    font-size: 16px;
  }

  .hero-actions,
  .showcase-stage,
  .showcase-caption,
  .product-grid,
  .download-grid,
  .scene-strip {
    grid-template-columns: 1fr;
  }

  .business-grid,
  .download-bullets,
  .footer-columns {
    grid-template-columns: 1fr;
  }

  .terminal-vod {
    transform: none;
  }

  .product-card {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 64px 0;
  }

  .download-panel,
  .product-card {
    padding: 26px;
  }

  .install-inner,
  .site-footer {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
</style>
