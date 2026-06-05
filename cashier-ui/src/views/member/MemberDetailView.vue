<template>
  <div class="mdv">
    <div class="mdv-main">
      <section class="mdv-profile-section">
        <div class="mdv-profile-card">
          <aside class="mdv-member-summary">
            <div class="mdv-avatar-wrap">
              <el-avatar :size="54" :src="member.avatar" class="mdv-avatar">{{ member.name.charAt(0) }}</el-avatar>
            </div>
            <div class="mdv-name-row">
              <span class="mdv-name">{{ member.name }}</span>
              <span class="mdv-level-tag" :class="'lv-' + member.levelKey">{{ member.level }}</span>
            </div>
            <div class="mdv-consume-card">
              <button type="button" class="mdv-consume-left mdv-consume-trigger" @click="showConsumeRecords = true">
                <strong>{{ member.totalSpent }}</strong>
                <em>累计消耗金额</em>
              </button>
              <div class="mdv-consume-right">
                <strong>{{ member.lastVisitDate }}</strong>
                <em>上次到店</em>
              </div>
            </div>
          </aside>

            <div class="mdv-profile-info">
            <div class="mdv-section-head">
              <h2>基础资料</h2>
              <div class="mdv-section-actions">
                <button type="button" class="mdv-action-btn">
                  <svg class="mdv-action-icon mdv-action-icon-log" viewBox="0 0 20 22" fill="none" aria-hidden="true">
                    <path d="M19.7734 20.3415L17.3755 17.9763C18.9423 15.6307 18.2694 12.4869 15.8714 10.9543C13.4735 9.42164 10.2596 10.0799 8.69276 12.4255C7.12595 14.7711 7.79888 17.9149 10.1968 19.4475C11.043 19.9878 12.0323 20.2752 13.0442 20.2727C14.0636 20.2703 15.0604 19.9731 15.9066 19.418L18.307 21.7808C18.6058 22.0731 19.0929 22.0731 19.3917 21.7808L19.7759 21.4026C20.0747 21.1054 20.0747 20.6313 19.7759 20.3341L19.7734 20.3415ZM15.8463 16.4756C15.4848 17.2222 14.8319 17.7945 14.0335 18.0647C13.7146 18.1875 13.3756 18.2464 13.0341 18.2342C11.2865 18.2587 9.8528 16.8931 9.82769 15.1837C9.80258 13.4742 11.2012 12.0718 12.9487 12.0472C14.6963 12.0227 16.1301 13.3907 16.1527 15.0977C16.1602 15.5767 16.0522 16.0482 15.8413 16.478L15.8463 16.4756ZM6.25969 16.117L3.71865 16.117C3.27924 16.0998 2.93525 15.7363 2.95283 15.3065C2.9704 14.8988 3.30184 14.5746 3.71865 14.5574L6.21952 14.5574C6.28229 13.8402 6.46558 13.1377 6.75685 12.4795L3.72116 12.4795C3.28176 12.4623 2.93776 12.0988 2.95534 11.669C2.97291 11.2613 3.30435 10.9371 3.72116 10.9199L7.72104 10.9199C8.50193 9.97427 9.5314 9.25463 10.699 8.842L3.72116 8.842C3.28176 8.842 2.9227 8.49323 2.92521 8.06096C2.92521 7.63114 3.28176 7.28237 3.72116 7.28237L15.9116 7.28237C16.351 7.28237 16.7101 7.63114 16.7076 8.06341C16.7076 8.49323 16.351 8.842 15.9116 8.842L15.314 8.842C17.4709 9.61076 19.0929 11.3865 19.6303 13.5725L19.6303 2.36523C19.6328 1.06595 18.5581 0.00736831 17.2298 0L2.39792 0C1.06965 0.0098244 0 1.0635 0 2.36278L0 19.2363C0 20.5355 1.07216 21.5917 2.40043 21.599L11.0982 21.599C8.52955 20.8548 6.63884 18.7131 6.25969 16.117ZM3.71865 3.64487L15.9116 3.64487C16.351 3.66206 16.695 4.02557 16.6774 4.45539C16.6599 4.8631 16.3284 5.18731 15.9116 5.2045L3.71865 5.2045C3.27924 5.18731 2.93525 4.8238 2.95283 4.39398C2.9704 3.98627 3.30435 3.66206 3.71865 3.64487Z" fill="currentColor"/>
                  </svg>
                  日志
                </button>
                <button type="button" class="mdv-action-btn">
                  <svg class="mdv-action-icon mdv-action-icon-edit" viewBox="0 0 17.697265625 21" fill="none" aria-hidden="true">
                    <path d="M17.6217 5.86048L13.8402 5.86048C13.1217 5.86048 12.5545 5.29697 12.5545 4.58321L12.5545 0L1.28569 0C0.567222 0 0 0.713777 0 1.54026L0 19.4598C0 20.3239 0.567222 21.0001 1.32351 21.0001L16.3738 21.0001C17.0923 21.0001 17.6973 20.2863 17.6973 19.4598L17.6217 5.86048ZM8.81083 6.23616C10.1722 6.23616 11.2688 7.3256 11.2688 8.64047C11.2688 9.99289 10.1722 11.0823 8.81083 11.0823C7.4495 11.0823 6.39068 9.99289 6.39068 8.64047C6.39068 7.3256 7.4495 6.23616 8.81083 6.23616ZM13.4999 15.9661C13.4999 16.2666 13.2352 16.5296 12.9327 16.5296L4.68902 16.5296C4.38651 16.5296 4.1218 16.2666 4.1218 15.9661L4.1218 15.6655C4.1218 14.3882 4.1218 13.7496 4.38651 13.1861C4.6134 12.6601 4.95373 12.2469 5.40751 11.9839C5.9369 11.6834 6.54195 11.6834 7.63857 11.6834L10.0209 11.6834C11.1175 11.6834 11.7226 11.6834 12.252 11.9839C12.7058 12.2469 13.0461 12.6601 13.273 13.1861C13.5377 13.7496 13.5377 14.3882 13.5377 15.6655L13.5377 15.9661L13.4999 15.9661Z" fill="currentColor"/>
                  </svg>
                  编辑资料
                </button>
              </div>
            </div>
            <div class="mdv-info-grid">
              <div class="mdv-info-row store-line">
                <label>注册门店：</label><span>{{ member.storeName }}</span>
              </div>
              <div class="mdv-info-row three-col">
                <div><label>注册门店：</label><span>{{ member.registerStore }}</span></div>
                <div><label>会员生日：</label><span>{{ member.birthday || '-' }}</span></div>
                <div><label>会员卡号：</label><span>{{ member.cardNo || '-' }}</span></div>
              </div>
              <div class="mdv-info-row three-col">
                <div><label>消费折扣：</label><span class="mdv-percent orange">{{ member.registerPercent }}%</span></div>
                <div><label>兑换折扣：</label><span class="mdv-percent teal">{{ member.birthdayPercent }}%</span></div>
                <div><label>备注：</label><span class="mdv-empty">{{ member.remark || '--' }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mdv-assets-section">
        <div class="mdv-assets-grid">
          <!-- 预存款 -->
          <article class="mdv-asset-card card-balance">
            <div class="card-icon card-icon-image"><img src="/member-icons/deposit.svg" alt="" /></div>
            <div class="card-body">
              <h3>预存款（元）</h3>
              <p class="card-value">{{ assets.balance.toFixed(2) }}</p>
            </div>
            <button class="card-copy-btn" aria-label="查看预存款记录" @click="showPrepaidRecords = true">
              <svg class="card-copy-icon" viewBox="0 0 33 33" fill="none" aria-hidden="true"><path d="M16.5 12.375L10.3125 12.375C9.74209 12.375 9.28125 11.9142 9.28125 11.3438C9.28125 10.7733 9.74209 10.3125 10.3125 10.3125L16.5 10.3125C17.0704 10.3125 17.5312 10.7733 17.5312 11.3438C17.5312 11.9142 17.0704 12.375 16.5 12.375ZM22.6875 17.5312L10.3125 17.5312C9.74209 17.5312 9.28125 17.0704 9.28125 16.5C9.28125 15.9296 9.74209 15.4688 10.3125 15.4688L22.6875 15.4688C23.2579 15.4688 23.7188 15.9296 23.7188 16.5C23.7188 17.0704 23.2579 17.5312 22.6875 17.5312ZM22.6875 22.6875L10.3125 22.6875C9.74209 22.6875 9.28125 22.2267 9.28125 21.6562C9.28125 21.0858 9.74209 20.625 10.3125 20.625L22.6875 20.625C23.2579 20.625 23.7188 21.0858 23.7188 21.6562C23.7188 22.2267 23.2579 22.6875 22.6875 22.6875Z" fill="currentColor"/><path d="M25.0304 30.9375L7.96963 30.9375C4.71152 30.9375 2.0625 28.2885 2.0625 25.0304L2.0625 7.96963C2.0625 4.71152 4.71152 2.0625 7.96963 2.0625L25.0336 2.0625C28.2885 2.0625 30.9407 4.71152 30.9407 7.96963L30.9407 25.0304C30.9375 28.2885 28.2885 30.9375 25.0304 30.9375ZM7.96963 4.125C5.84912 4.125 4.125 5.84912 4.125 7.96963L4.125 25.0304C4.125 27.1509 5.84912 28.875 7.96963 28.875L25.0336 28.875C27.1541 28.875 28.8782 27.1509 28.8782 25.0304L28.8782 7.96963C28.8782 5.84912 27.1541 4.125 25.0336 4.125L7.96963 4.125Z" fill="currentColor"/></svg>
            </button>
          </article>

          <!-- 游戏币 -->
          <article class="mdv-asset-card card-coins">
            <div class="card-icon card-icon-image"><img src="/member-icons/coins.svg" alt="" /></div>
            <div class="card-body">
              <h3>游戏币</h3>
              <p class="card-value">{{ assets.coins.toFixed(2) }}</p>
              <p class="card-sub">(可用：{{ assets.coinsAvail }}；未生效：{{ assets.coinsPending }})</p>
              <p v-if="assets.coinsExpireHint" class="card-warn">{{ assets.coinsExpireHint }}</p>
            </div>
            <button class="card-copy-btn" aria-label="复制" @click="copyValue('游戏币 ' + assets.coins)">
              <svg class="card-copy-icon" viewBox="0 0 33 33" fill="none" aria-hidden="true"><path d="M16.5 12.375L10.3125 12.375C9.74209 12.375 9.28125 11.9142 9.28125 11.3438C9.28125 10.7733 9.74209 10.3125 10.3125 10.3125L16.5 10.3125C17.0704 10.3125 17.5312 10.7733 17.5312 11.3438C17.5312 11.9142 17.0704 12.375 16.5 12.375ZM22.6875 17.5312L10.3125 17.5312C9.74209 17.5312 9.28125 17.0704 9.28125 16.5C9.28125 15.9296 9.74209 15.4688 10.3125 15.4688L22.6875 15.4688C23.2579 15.4688 23.7188 15.9296 23.7188 16.5C23.7188 17.0704 23.2579 17.5312 22.6875 17.5312ZM22.6875 22.6875L10.3125 22.6875C9.74209 22.6875 9.28125 22.2267 9.28125 21.6562C9.28125 21.0858 9.74209 20.625 10.3125 20.625L22.6875 20.625C23.2579 20.625 23.7188 21.0858 23.7188 21.6562C23.7188 22.2267 23.2579 22.6875 22.6875 22.6875Z" fill="currentColor"/><path d="M25.0304 30.9375L7.96963 30.9375C4.71152 30.9375 2.0625 28.2885 2.0625 25.0304L2.0625 7.96963C2.0625 4.71152 4.71152 2.0625 7.96963 2.0625L25.0336 2.0625C28.2885 2.0625 30.9407 4.71152 30.9407 7.96963L30.9407 25.0304C30.9375 28.2885 28.2885 30.9375 25.0304 30.9375ZM7.96963 4.125C5.84912 4.125 4.125 5.84912 4.125 7.96963L4.125 25.0304C4.125 27.1509 5.84912 28.875 7.96963 28.875L25.0336 28.875C27.1541 28.875 28.8782 27.1509 28.8782 25.0304L28.8782 7.96963C28.8782 5.84912 27.1541 4.125 25.0336 4.125L7.96963 4.125Z" fill="currentColor"/></svg>
            </button>
          </article>

          <!-- 预存次数 -->
          <article class="mdv-asset-card card-times">
            <div class="card-icon card-icon-image"><img src="/member-icons/times.svg" alt="" /></div>
            <div class="card-body">
              <h3>预存次数（次）</h3>
              <p class="card-value">{{ assets.times }}</p>
              <p class="card-sub">(可用：{{ assets.timesAvail }}；未生效：{{ assets.timesPending }})</p>
            </div>
            <button class="card-copy-btn" aria-label="复制" @click="copyValue('预存次数 ' + assets.times)">
              <svg class="card-copy-icon" viewBox="0 0 33 33" fill="none" aria-hidden="true"><path d="M16.5 12.375L10.3125 12.375C9.74209 12.375 9.28125 11.9142 9.28125 11.3438C9.28125 10.7733 9.74209 10.3125 10.3125 10.3125L16.5 10.3125C17.0704 10.3125 17.5312 10.7733 17.5312 11.3438C17.5312 11.9142 17.0704 12.375 16.5 12.375ZM22.6875 17.5312L10.3125 17.5312C9.74209 17.5312 9.28125 17.0704 9.28125 16.5C9.28125 15.9296 9.74209 15.4688 10.3125 15.4688L22.6875 15.4688C23.2579 15.4688 23.7188 15.9296 23.7188 16.5C23.7188 17.0704 23.2579 17.5312 22.6875 17.5312ZM22.6875 22.6875L10.3125 22.6875C9.74209 22.6875 9.28125 22.2267 9.28125 21.6562C9.28125 21.0858 9.74209 20.625 10.3125 20.625L22.6875 20.625C23.2579 20.625 23.7188 21.0858 23.7188 21.6562C23.7188 22.2267 23.2579 22.6875 22.6875 22.6875Z" fill="currentColor"/><path d="M25.0304 30.9375L7.96963 30.9375C4.71152 30.9375 2.0625 28.2885 2.0625 25.0304L2.0625 7.96963C2.0625 4.71152 4.71152 2.0625 7.96963 2.0625L25.0336 2.0625C28.2885 2.0625 30.9407 4.71152 30.9407 7.96963L30.9407 25.0304C30.9375 28.2885 28.2885 30.9375 25.0304 30.9375ZM7.96963 4.125C5.84912 4.125 4.125 5.84912 4.125 7.96963L4.125 25.0304C4.125 27.1509 5.84912 28.875 7.96963 28.875L25.0336 28.875C27.1541 28.875 28.8782 27.1509 28.8782 25.0304L28.8782 7.96963C28.8782 5.84912 27.1541 4.125 25.0336 4.125L7.96963 4.125Z" fill="currentColor"/></svg>
            </button>
          </article>

          <!-- 套票 -->
          <article class="mdv-asset-card card-ticket">
            <div class="card-icon card-icon-image"><img src="/member-icons/ticket.svg" alt="" /></div>
            <div class="card-body">
              <h3>套票（张）</h3>
              <p class="card-value">{{ assets.tickets }}</p>
              <p class="card-sub">(可用：{{ assets.ticketsAvail }}；未生效：{{ assets.ticketsPending }})</p>
            </div>
            <button class="card-copy-btn" aria-label="复制" @click="copyValue('套票 ' + assets.tickets)">
              <svg class="card-copy-icon" viewBox="0 0 33 33" fill="none" aria-hidden="true"><path d="M16.5 12.375L10.3125 12.375C9.74209 12.375 9.28125 11.9142 9.28125 11.3438C9.28125 10.7733 9.74209 10.3125 10.3125 10.3125L16.5 10.3125C17.0704 10.3125 17.5312 10.7733 17.5312 11.3438C17.5312 11.9142 17.0704 12.375 16.5 12.375ZM22.6875 17.5312L10.3125 17.5312C9.74209 17.5312 9.28125 17.0704 9.28125 16.5C9.28125 15.9296 9.74209 15.4688 10.3125 15.4688L22.6875 15.4688C23.2579 15.4688 23.7188 15.9296 23.7188 16.5C23.7188 17.0704 23.2579 17.5312 22.6875 17.5312ZM22.6875 22.6875L10.3125 22.6875C9.74209 22.6875 9.28125 22.2267 9.28125 21.6562C9.28125 21.0858 9.74209 20.625 10.3125 20.625L22.6875 20.625C23.2579 20.625 23.7188 21.0858 23.7188 21.6562C23.7188 22.2267 23.2579 22.6875 22.6875 22.6875Z" fill="currentColor"/><path d="M25.0304 30.9375L7.96963 30.9375C4.71152 30.9375 2.0625 28.2885 2.0625 25.0304L2.0625 7.96963C2.0625 4.71152 4.71152 2.0625 7.96963 2.0625L25.0336 2.0625C28.2885 2.0625 30.9407 4.71152 30.9407 7.96963L30.9407 25.0304C30.9375 28.2885 28.2885 30.9375 25.0304 30.9375ZM7.96963 4.125C5.84912 4.125 4.125 5.84912 4.125 7.96963L4.125 25.0304C4.125 27.1509 5.84912 28.875 7.96963 28.875L25.0336 28.875C27.1541 28.875 28.8782 27.1509 28.8782 25.0304L28.8782 7.96963C28.8782 5.84912 27.1541 4.125 25.0336 4.125L7.96963 4.125Z" fill="currentColor"/></svg>
            </button>
          </article>

          <!-- 优惠券 -->
          <article class="mdv-asset-card card-coupon">
            <div class="card-icon card-icon-image"><img src="/member-icons/coupon.svg" alt="" /></div>
            <div class="card-body">
              <h3>优惠券（张）</h3>
              <p class="card-value">{{ assets.coupons }}</p>
            </div>
            <button class="card-copy-btn" aria-label="复制" @click="copyValue('优惠券 ' + assets.coupons)">
              <svg class="card-copy-icon" viewBox="0 0 33 33" fill="none" aria-hidden="true"><path d="M16.5 12.375L10.3125 12.375C9.74209 12.375 9.28125 11.9142 9.28125 11.3438C9.28125 10.7733 9.74209 10.3125 10.3125 10.3125L16.5 10.3125C17.0704 10.3125 17.5312 10.7733 17.5312 11.3438C17.5312 11.9142 17.0704 12.375 16.5 12.375ZM22.6875 17.5312L10.3125 17.5312C9.74209 17.5312 9.28125 17.0704 9.28125 16.5C9.28125 15.9296 9.74209 15.4688 10.3125 15.4688L22.6875 15.4688C23.2579 15.4688 23.7188 15.9296 23.7188 16.5C23.7188 17.0704 23.2579 17.5312 22.6875 17.5312ZM22.6875 22.6875L10.3125 22.6875C9.74209 22.6875 9.28125 22.2267 9.28125 21.6562C9.28125 21.0858 9.74209 20.625 10.3125 20.625L22.6875 20.625C23.2579 20.625 23.7188 21.0858 23.7188 21.6562C23.7188 22.2267 23.2579 22.6875 22.6875 22.6875Z" fill="currentColor"/><path d="M25.0304 30.9375L7.96963 30.9375C4.71152 30.9375 2.0625 28.2885 2.0625 25.0304L2.0625 7.96963C2.0625 4.71152 4.71152 2.0625 7.96963 2.0625L25.0336 2.0625C28.2885 2.0625 30.9407 4.71152 30.9407 7.96963L30.9407 25.0304C30.9375 28.2885 28.2885 30.9375 25.0304 30.9375ZM7.96963 4.125C5.84912 4.125 4.125 5.84912 4.125 7.96963L4.125 25.0304C4.125 27.1509 5.84912 28.875 7.96963 28.875L25.0336 28.875C27.1541 28.875 28.8782 27.1509 28.8782 25.0304L28.8782 7.96963C28.8782 5.84912 27.1541 4.125 25.0336 4.125L7.96963 4.125Z" fill="currentColor"/></svg>
            </button>
          </article>
        </div>
      </section>
    </div>

    <aside class="mdv-sidebar">
      <section class="mdv-side-card mdv-function-card">
        <h2 class="mdv-sidebar-title">功能区</h2>
        <nav class="mdv-fn-grid">
          <button v-for="fn in funcButtons" :key="fn.label" class="mdv-fn-btn" :class="fn.cls" @click="handleFunc(fn.action)">
            <span class="mdv-fn-icon-wrap" aria-hidden="true">
              <img class="mdv-fn-icon-image" :src="fn.icon" alt="" />
            </span>
            <span>{{ fn.label }}</span>
          </button>
        </nav>
      </section>

      <section class="mdv-side-card mdv-wechat-section">
        <h3>绑定微信</h3>
        <div class="mdv-qr-box">
          <svg viewBox="0 0 100 100" class="mdv-qr-svg">
            <rect x="6" y="6" width="28" height="28" rx="4" fill="#111"/>
            <rect x="10" y="10" width="20" height="20" rx="2" fill="#fff"/>
            <rect x="66" y="6" width="28" height="28" rx="4" fill="#111"/>
            <rect x="70" y="10" width="20" height="20" rx="2" fill="#fff"/>
            <rect x="6" y="66" width="28" height="28" rx="4" fill="#111"/>
            <rect x="10" y="70" width="20" height="20" rx="2" fill="#fff"/>
            <rect x="44" y="14" width="12" height="12" rx="1" fill="#111"/>
            <rect x="60" y="42" width="10" height="10" rx="1" fill="#111"/>
            <rect x="74" y="58" width="8" height="8" rx="1" fill="#111"/>
            <rect x="40" y="60" width="16" height="16" rx="2" fill="#111"/>
            <rect x="62" y="76" width="10" height="10" rx="1" fill="#111"/>
          </svg>
        </div>
        <p class="mdv-wechat-hint">请打开微信扫描屏幕上方二维码</p>
      </section>

      <div class="mdv-sb-actions">
        <button class="sb-switch-btn" @click="showMemberSelect = true">
          <img class="sb-action-icon" src="/member-action-icons/switch-member.svg" alt="" />
          切换会员
        </button>
        <button class="sb-add-btn" @click="showNewMember = true">
          <img class="sb-action-icon" src="/member-action-icons/add-member.svg" alt="" />
          新增会员
        </button>
      </div>

      <!-- 退出会员 -->
      <button class="mdv-exit-btn" @click="$router.back()">
        退出会员
      </button>
    </aside>

    <MemberSelectModal
      :visible="showMemberSelect"
      :history-list="memberHistory"
      @close="showMemberSelect = false"
      @select="handleMemberSelected"
    />

    <NewMemberModal
      :visible="showNewMember"
      @close="showNewMember = false"
      @submit="handleNewMemberSubmit"
    />

    <MemberDeductionModal
      :visible="showDeductionModal"
      :devices="deductionDevices"
      :member="member"
      @close="showDeductionModal = false"
      @confirm="handleDeductionConfirm"
    />

    <DeductionSuccessModal
      :visible="showDeductionSuccess"
      :count="lastDeductionCount"
      @close="showDeductionSuccess = false"
    />

    <ConsumeRecordsModal
      :visible="showConsumeRecords"
      :member-name="member.name"
      :records="consumeRecords"
      :total-amount="2234.1"
      @close="showConsumeRecords = false"
    />

    <PrepaidRecordsModal
      :visible="showPrepaidRecords"
      :member-name="member.name"
      :coin-summary="{ total: 2704, available: 2704, pending: 0 }"
      :records="prepaidRecords"
      @close="showPrepaidRecords = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MemberSelectModal from '../../components/MemberSelectModal.vue'
import NewMemberModal from '../../components/NewMemberModal.vue'
import MemberDeductionModal from '../../components/MemberDeductionModal.vue'
import DeductionSuccessModal from '../../components/DeductionSuccessModal.vue'
import ConsumeRecordsModal from '../../components/ConsumeRecordsModal.vue'
import PrepaidRecordsModal from '../../components/PrepaidRecordsModal.vue'

const router = useRouter()

// ===== 会员基础数据 =====
const member = ref({
  id: 1,
  name: '会员名',
  avatar: '',
  level: '钻石',
  levelKey: 'diamond',
  totalSpent: '¥2434.1',
  lastVisitDate: '2024/12/12',
  storeName: '北京头号空间店',
  registerStore: '2024-11-01 10:32',
  birthday: '1993-12-12',
  cardNo: '122232342',
  registerPercent: 95,
  birthdayPercent: 99,
  remark: ''
})

// ===== 资产数据 =====
const assets = ref({
  balance: 3.00,
  coins: 2703.00,
  coinsAvail: 2703,
  coinsPending: 0,
  coinsExpireHint: '2024/12/13有1.00游戏币过期',
  times: 4,
  timesAvail: 4,
  timesPending: 0,
  tickets: 0,
  ticketsAvail: 0,
  ticketsPending: 0,
  points: 1234.1,
  coupons: 2
})

const showMemberSelect = ref(false)
const showNewMember = ref(false)
const showDeductionModal = ref(false)
const showDeductionSuccess = ref(false)
const showConsumeRecords = ref(false)
const showPrepaidRecords = ref(false)
const lastDeductionCount = ref(1)

const histAvatar = (bg1, bg2) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="h" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="40" height="40" rx="20" fill="url(#h)"/><circle cx="20" cy="15" r="7" fill="rgba(255,255,255,0.9)"/><ellipse cx="20" cy="33" rx="12" ry="10" fill="rgba(255,255,255,0.85)"/></svg>`
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

const memberHistory = ref([
  { id: 101, name: '会员名', phone: '17600110765', avatar: histAvatar('#74b9ff', '#0984e3') },
  { id: 102, name: '会员名', phone: '17600110765', avatar: histAvatar('#fd79a8', '#e84393') },
  { id: 103, name: '会员名', phone: '17600110765', avatar: histAvatar('#55efc4', '#00b894') },
  { id: 104, name: '会员名', phone: '17600110765', avatar: histAvatar('#ffeaa7', '#fdcb6e') }
])

const prepaidRecords = ref([
  {
    id: 'pr-01',
    tab: 'prepaid',
    type: '收银台充值',
    reason: '收银台充值',
    store: '北京头号空间',
    changeAmount: '+¥300.00',
    afterAmount: '¥550.00',
    note: '充值套餐: 1元=1预存款+1幻币(永久)+1次(1天)',
    operator: '小范',
    changedAt: '2024-12-16 13:49',
    dateKey: '2024-11-17'
  },
  {
    id: 'pr-02',
    tab: 'prepaid',
    type: '收银台充值',
    reason: '收银台充值',
    store: '北京头号空间',
    changeAmount: '+¥500.00',
    afterAmount: '¥1050.00',
    note: '有套餐时展示套餐名称和具体权益',
    operator: '小范',
    changedAt: '2024-12-15 12:20',
    dateKey: '2024-11-17'
  },
  {
    id: 'pr-03',
    tab: 'prepaid',
    type: '收银台充值',
    reason: '收银台充值',
    store: '北京头号空间',
    changeAmount: '+¥200.00',
    afterAmount: '¥1250.00',
    note: '',
    operator: '玩家自助',
    changedAt: '2024-12-13 16:28',
    dateKey: '2024-11-17'
  },
  {
    id: 'pr-04',
    tab: 'prepaid',
    type: '收银台充值',
    reason: '收银台充值',
    store: '北京头号空间',
    changeAmount: '+¥100.00',
    afterAmount: '¥1350.00',
    note: '',
    operator: '小范',
    changedAt: '2024-12-11 10:12',
    dateKey: '2024-11-17'
  },
  {
    id: 'coin-01',
    tab: 'coins',
    type: '收银台充值',
    store: '北京头号空间',
    createdAt: '2024-12-01 12:21:31',
    statusLabel: '生效中',
    effectiveDate: '2024-12-17',
    expireDate: '永济有效',
    changeQty: '400',
    remainQty: '500',
    usedQty: '0',
    note: '充值套餐：充300送100（纯游戏币）',
    changedAt: '2024-12-01 12:21:31',
    dateKey: '2024-11-17'
  },
  {
    id: 'coin-02',
    tab: 'coins',
    type: '单次消费',
    store: '北京头号空间',
    createdAt: '2024-12-01 12:21:31',
    statusLabel: '生效中',
    effectiveDate: '2024-12-17',
    expireDate: '永济有效',
    changeQty: '-100',
    remainQty: '100',
    usedQty: '0',
    note: '单次消费',
    changedAt: '2024-12-01 12:21:31',
    dateKey: '2024-11-17'
  },
  {
    id: 'coin-03',
    tab: 'coins',
    type: '收银台充值',
    store: '北京头号空间',
    createdAt: '2024-12-01 12:21:31',
    statusLabel: '生效中',
    effectiveDate: '2024-12-17',
    expireDate: '永济有效',
    changeQty: '200',
    remainQty: '200',
    usedQty: '0',
    note: '充值套餐：充300送100（纯游戏币）',
    changedAt: '2024-12-01 12:21:31',
    dateKey: '2024-11-17'
  },
  {
    id: 'ticket-01',
    tab: 'tickets',
    type: '购买套票',
    reason: '购买套票',
    store: '北京头号空间',
    changeAmount: '-¥50.00',
    afterAmount: '¥200.00',
    note: '',
    operator: '小范',
    changedAt: '2024-12-16 13:49',
    dateKey: '2024-11-17'
  },
  {
    id: 'game-01',
    tab: 'games',
    type: '单次消费',
    reason: '单次消费',
    store: '北京头号空间',
    gameName: '+¥300.00',
    changeAmount: '-¥50.00',
    afterAmount: '¥150.00',
    note: '',
    operator: '会员自助',
    changedAt: '2024-12-16 13:49',
    dateKey: '2024-11-17'
  },
  {
    id: 'times-01',
    tab: 'times',
    type: '购买次票',
    reason: '购买次票',
    store: '北京头号空间',
    changeAmount: '-1次',
    afterAmount: '4次',
    note: '',
    operator: '小范',
    changedAt: '2024-12-16 13:49',
    dateKey: '2024-11-17'
  }
])

const consumeRecords = ref([
  { id: 'co-01', time: '2024-12-17 12:24', product: '充300送100（纯游戏币）', amount: '300', status: '完成' },
  { id: 'co-02', time: '2024-12-17 12:24', product: '充300送100（纯游戏币）', amount: '300', status: '完成' },
  { id: 'co-03', time: '2024-12-17 12:24', product: '充300送100（纯游戏币）', amount: '300', status: '完成' },
  { id: 'co-04', time: '2024-12-17 12:24', product: '充300送100（纯游戏币）', amount: '300', status: '完成' },
  { id: 'co-05', time: '2024-12-16 10:12', product: '储值500送80', amount: '500', status: '完成' },
  { id: 'co-06', time: '2024-12-12 18:40', product: '储值1000送200', amount: '1000', status: '完成' },
  { id: 'co-07', time: '2024-12-06 15:18', product: '首充体验储值', amount: '99', status: '完成' },
  { id: 'co-08', time: '2024-12-02 11:06', product: '储值300送100（纯游戏币）', amount: '300', status: '完成' }
])

const deductionDevices = ref([
  { id: 'dev-01', name: 'VR体验设备A', price: 9.9 },
  { id: 'dev-02', name: 'VR体验设备B', price: 15.0 },
  { id: 'dev-03', name: 'VR游戏机', price: 20.0 }
])

// ===== 功能区按钮 =====
const funcButtons = ref([
  { label: '会员扣费', cls: 'fn-rent', action: 'deduct', icon: '/member-action-icons/deduct.png' },
  { label: '兑换礼品', cls: 'fn-gift', action: 'gift', icon: '/member-action-icons/gift.png' },
  { label: '赠送活动', cls: 'fn-event', action: 'event', icon: '/member-action-icons/event.png' },
  { label: '修改储值', cls: 'fn-recharge', action: 'recharge', icon: '/member-action-icons/recharge.png' }
])

const persistSaleMemberSession = () => {
  const saleMemberPayload = {
    id: member.value.id,
    name: member.value.name,
    phone: '17600110765',
    avatar: member.value.avatar || '',
    level: member.value.level,
    gender: '男',
    birthday: member.value.birthday,
    balance: assets.value.balance,
    coins: assets.value.coins,
    tickets: assets.value.tickets,
    times: assets.value.times,
    cardNo: member.value.cardNo || '',
    expireHint: assets.value.coinsExpireHint || ''
  }
  sessionStorage.setItem('sale:selected-member', JSON.stringify(saleMemberPayload))
}

const handleFunc = (action) => {
  if (action === 'deduct') {
    showDeductionModal.value = true
    return
  }
  if (action === 'gift') {
    persistSaleMemberSession()
    router.push({ path: '/sale', query: { tab: 'product', member: '1' } })
    return
  }
  ElMessage.info(`功能开发中：${action}`)
}

const handleMemberSelected = (selectedMember) => {
  showMemberSelect.value = false
  const idx = memberHistory.value.findIndex((m) => m.id === selectedMember?.id)
  if (idx > -1) memberHistory.value.splice(idx, 1)
  if (selectedMember?.id) {
    memberHistory.value.unshift({
      id: selectedMember.id,
      name: selectedMember.name,
      phone: selectedMember.phone,
      avatar: selectedMember.avatar
    })
  }
  if (selectedMember?.id) {
    router.push(`/member/${selectedMember.id}`)
  }
}

const handleNewMemberSubmit = (data) => {
  showNewMember.value = false
  if (data?.name) {
    ElMessage.success(`已新增会员：${data.name}`)
  }
}

const handleDeductionConfirm = (payload) => {
  showDeductionModal.value = false
  if (!payload?.device) return
  lastDeductionCount.value = payload.count || 1
  showDeductionSuccess.value = true
}

// ===== 工具方法 =====
const copyValue = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => ElMessage.success(`已复制：${text}`))
  }
}
</script>

<style scoped>
/* ============================================
   统一字体规范 (Type Scale)
   H1 标题: 16px  |  区块标题 / 侧边栏标题
   H2 标题: 14px  |  卡片标题 / 微信标题
   Value:  22px  |  资产数值大字
   Body:   13px  |  正文 / 信息行 / 标签
   Small:  11px  |  辅助文字 / 等级标签 / 过期提示
   Btn:    12px  |  标准按钮
   BtnLg:  15px  |  侧边双按钮 / 退出按钮
   ============================================ */

.mdv {
  --fs-h1: 16px;
  --fs-h2: 14px;
  --fs-value: 22px;
  --fs-body: 13px;
  --fs-small: 11px;
  --fs-btn: 12px;
  --fs-btn-lg: 15px;

  display: grid;
  grid-template-columns: minmax(0, 1fr) 336px;
  gap: 16px;
  min-height: 100%;
  padding: 16px 12px 20px 14px;
  background: #eef8ff;
}

/* ========== 主区域 ========== */
.mdv-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 14px 80px;
  border-radius: 14px;
  background: #fff;
}

.mdv-profile-section,
.mdv-asset-card,
.mdv-side-card {
  border-radius: 12px;
  background: #f3fbff;
}

/* ----- 会员头部区 ----- */
.mdv-profile-section {
  padding: 14px 12px;
}

.mdv-profile-card {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
}

.mdv-member-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 10px 12px;
}

.mdv-avatar-wrap :deep(.el-avatar) {
  width: 64px !important;
  height: 64px !important;
  border: 2.5px solid #fff;
  box-shadow: 0 1px 5px rgba(22, 119, 255, 0.12);
  font-size: 24px !important;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #9bd6ff 0%, #2a8fff 100%);
}

.mdv-name-row {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
}

.mdv-name {
  font-size: var(--fs-body);
  font-weight: 600;
  color: #1f2430;
}

.mdv-level-tag {
  min-width: 36px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: #45b8ff;
  line-height: 1;
}

.lv-gold { background: #f5b23b; }
.lv-silver { background: #a5b3c6; }

/* 累计消耗卡片 */
.mdv-consume-card {
  width: 184px;
  height: 52px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 16px;
  overflow: hidden;
  border-radius: 8px;
  background: linear-gradient(135deg, #0f93f3 0%, #0e6edc 100%);
}

.mdv-consume-left,
.mdv-consume-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
}

.mdv-consume-trigger {
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease;
}

.mdv-consume-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
}

.mdv-consume-trigger:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.7);
  outline-offset: -2px;
}

.mdv-consume-left strong,
.mdv-consume-right strong {
  font-size: var(--fs-body);
  line-height: 1.2;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.mdv-consume-left em,
.mdv-consume-right em {
  font-style: normal;
  font-size: 10px;
  line-height: 1.3;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
}

/* ----- 基础资料区 ----- */
.mdv-profile-info {
  min-width: 0;
  padding: 8px 0 0 40px;
}

.mdv-section-head {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mdv-section-head h2 {
  margin: 0;
  font-size: var(--fs-h1);
  line-height: 1;
  font-weight: 800;
  color: #05080d;
}

.mdv-section-actions {
  display: flex;
  gap: 8px;
}

.mdv-action-btn {
  height: 26px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 0;
  border-radius: 6px;
  background: #47a8f6;
  color: #fff;
  font-size: var(--fs-btn);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.mdv-action-btn:hover {
  background: #2b8dd8;
}

.mdv-action-btn svg {
  flex-shrink: 0;
}

.mdv-action-icon {
  width: 14px;
  height: 14px;
}

.mdv-action-icon-log {
  width: 13px;
  height: 14px;
}

.mdv-action-icon-edit {
  width: 12px;
  height: 14px;
}

/* 资料信息行 */
.mdv-info-grid {
  margin-top: 8px;
}

.mdv-info-row {
  display: grid;
  align-items: center;
  min-height: 60px;
  padding: 6px 0;
  border-bottom: 1px solid #eef1f5;
  color: #6e737a;
  font-size: var(--fs-body);
}

.mdv-info-row.store-line {
  display: flex;
  min-height: 56px;
  padding: 6px 0;
}

.mdv-info-row.three-col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.mdv-info-row label {
  display: inline-block;
  color: #11151c;
  font-weight: 700;
}

.mdv-info-row span {
  color: #777;
  font-weight: 500;
}

.mdv-info-row.three-col > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mdv-info-row:last-child {
  border-bottom: 0;
}

.mdv-percent.orange {
  color: #ff7a16;
}

.mdv-percent.teal,
.mdv-empty {
  color: #4fb0b8;
}

/* ========== 资产卡片网格 ========== */
.mdv-assets-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.mdv-asset-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 32px 14px 16px;
}

.card-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #48aefa;
  color: #fff;
}

.card-icon svg {
  width: 22px;
  height: 22px;
}

.card-icon.card-icon-image {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  padding: 0;
  overflow: hidden;
  background: transparent;
  border-radius: 12px;
}

.card-icon.card-icon-image img {
  width: 44px;
  height: 44px;
  display: block;
  object-fit: cover;
  border-radius: 12px;
}

.card-body {
  min-width: 0;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 4px;
}

.card-body h3 {
  margin: 0 0 3px;
  color: #85898d;
  font-size: var(--fs-h2);
  line-height: 1;
  font-weight: 700;
}

.card-value {
  margin: 0;
  color: #05080d;
  font-size: var(--fs-value);
  line-height: 1.15;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.card-sub,
.card-warn {
  margin: 2px 0 0;
  font-size: var(--fs-small);
  line-height: 1.2;
  color: #85898d;
  font-weight: 500;
}

.card-warn {
  color: #e03131;
}

.card-copy-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #9aa8bb;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 1;
}

.card-copy-btn:hover {
  background: rgba(71, 145, 240, 0.08);
  color: #4791f0;
}

.card-copy-icon {
  width: 15px;
  height: 15px;
}

.card-coins .card-icon { background: #ff8b2f; }
.card-times .card-icon { background: #df56f5; }
.card-ticket .card-icon { background: #7b7bef; }
.card-points .card-icon,
.card-coupon .card-icon { background: #ff686d; }

/* ========== 右侧栏 ========== */
.mdv-sidebar {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mdv-side-card {
  background: #fff;
  border-radius: 12px;
}

/* 功能区 */
.mdv-function-card {
  padding: 18px 18px 14px;
}

.mdv-sidebar-title {
  margin: 0 0 12px;
  color: #05080d;
  font-size: var(--fs-h1);
  line-height: 1;
  font-weight: 800;
}

.mdv-fn-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.mdv-fn-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 6px 10px;
  border: 0;
  border-radius: 10px;
  color: #6f7378;
  font-size: var(--fs-small);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.mdv-fn-icon-wrap {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
}

.mdv-fn-icon-image {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
}

.fn-rent { color: #3c84f6; background: #edf7ff; }
.fn-gift { color: #ff6542; background: #fff4ed; }
.fn-event { color: #e8a62a; background: #fffbef; }
.fn-recharge { color: #a33af6; background: #f7f2ff; }

/* 微信绑定区 */
.mdv-wechat-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
}

.mdv-wechat-section h3 {
  margin: 0 0 24px;
  color: #5f5f5f;
  font-size: var(--fs-h2);
  line-height: 1;
  font-weight: 800;
}

.mdv-qr-box {
  width: 160px;
  height: 160px;
  display: grid;
  place-items: center;
}

.mdv-qr-svg {
  width: 160px;
  height: 160px;
  shape-rendering: crispEdges;
}

.mdv-wechat-hint {
  margin: 20px 0 0;
  color: #8a8a8a;
  font-size: var(--fs-small);
  font-weight: 600;
}

/* 侧边操作按钮 */
.mdv-sb-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 10px;
}

.sb-switch-btn,
.sb-add-btn {
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #fff;
  color: #10131a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.sb-switch-btn:hover,
.sb-add-btn:hover {
  background: #f0f4ff;
  border-color: #dbe7f3;
}

.sb-action-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

/* 退出会员 */
.mdv-exit-btn {
  height: 48px;
  margin: 0 10px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(90deg, #08a9f1 0%, #075bff 100%);
  color: #fff;
  font-size: var(--fs-btn-lg);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.mdv-exit-btn:hover {
  opacity: 0.9;
}

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .mdv {
    grid-template-columns: 1fr;
  }

  .mdv-sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .mdv-profile-card {
    grid-template-columns: 180px minmax(0, 1fr);
  }
}
</style>
