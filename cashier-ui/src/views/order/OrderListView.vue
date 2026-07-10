<template>
  <section class="order-record-page" aria-label="订单记录">
    <div class="ors-body">
      <section class="ors-filter-panel">
        <nav class="ors-tabs" aria-label="订单分类">
          <button
            v-for="tab in orderTabs"
            :key="tab.path"
            type="button"
            class="ors-tab"
            :class="{ active: tab.path === activeTab.path }"
            @click="switchTab(tab.path)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="ors-filter-grid">
          <label class="ors-field ors-field--date">
            <span>日期范围：</span>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </label>

          <label class="ors-field">
            <span>订单号：</span>
            <el-input v-model="filters.orderNo" placeholder="订单号" clearable />
          </label>

          <label class="ors-field">
            <span>会员：</span>
            <el-input v-model="filters.memberKeyword" placeholder="手机号/姓名/会员卡号" clearable />
          </label>

          <template v-if="activeConfig.filters.includes('device')">
            <label class="ors-field">
              <span>设备：</span>
              <el-input v-model="filters.device" placeholder="设备名称" clearable />
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('game')">
            <label class="ors-field">
              <span>游戏：</span>
              <el-input v-model="filters.game" placeholder="游戏名称" clearable />
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('source')">
            <label class="ors-field">
              <span>订单来源：</span>
              <el-select v-model="filters.source" placeholder="全部" clearable>
                <el-option v-for="item in sourceOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('status')">
            <label class="ors-field">
              <span>订单状态：</span>
              <el-select v-model="filters.status" placeholder="全部" clearable>
                <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('deductType')">
            <label class="ors-field">
              <span>扣费类型：</span>
              <el-select v-model="filters.deductType" placeholder="全部" clearable>
                <el-option v-for="item in deductTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('editType')">
            <label class="ors-field">
              <span>修改类型：</span>
              <el-select v-model="filters.editType" placeholder="全部" clearable>
                <el-option v-for="item in editTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('rechargeType')">
            <label class="ors-field">
              <span>类型：</span>
              <el-select v-model="filters.rechargeType" placeholder="全部" clearable>
                <el-option v-for="item in rechargeTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('exchangeType')">
            <label class="ors-field">
              <span>兑换类型：</span>
              <el-select v-model="filters.exchangeType" placeholder="全部" clearable>
                <el-option v-for="item in exchangeTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('exchangeStatus')">
            <label class="ors-field">
              <span>状态：</span>
              <el-select v-model="filters.exchangeStatus" placeholder="全部" clearable>
                <el-option v-for="item in exchangeStatusOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('activityName')">
            <label class="ors-field">
              <span>活动名称：</span>
              <el-select v-model="filters.activityName" placeholder="全部" clearable>
                <el-option v-for="item in activityNameOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </label>
          </template>

          <template v-if="activeConfig.filters.includes('operator')">
            <label class="ors-field">
              <span>操作人：</span>
              <el-input v-model="filters.operator" placeholder="操作人" clearable />
            </label>
          </template>

          <button type="button" class="ors-search-btn" @click="currentPage = 1">查询</button>
        </div>
      </section>

      <section class="ors-table-panel">
        <div class="ors-table-scroll">
          <div class="ors-table-inner">
            <!-- 动态表头 -->
            <div class="ors-table-head" :style="{ gridTemplateColumns: activeConfig.grid }">
              <span v-for="col in activeConfig.columns" :key="col.key" :class="{ 'ors-head-action': col.key === 'action' }">{{ col.label }}</span>
            </div>

            <div class="ors-table-body">
              <article v-for="row in pagedOrders" :key="row.id" class="ors-row" :style="{ gridTemplateColumns: activeConfig.grid }">
                <template v-for="col in activeConfig.columns" :key="col.key">
                  <!-- 订单号 -->
                  <div v-if="col.key === 'orderNo'" class="ors-cell ors-cell--order">
                    <span>{{ row.orderNo }}</span>
                    <button type="button" class="ors-copy-btn" aria-label="复制订单号" @click="copyOrderNo(row.orderNo)">
                      <el-icon><CopyDocument /></el-icon>
                    </button>
                  </div>
                  <!-- 金额 -->
                  <div v-else-if="col.type === 'money'" class="ors-cell ors-cell--money">¥{{ row[col.key]?.toFixed(2) }}</div>
                  <!-- 支付内容 -->
                  <div v-else-if="col.key === 'paymentContent'" class="ors-cell ors-cell--payment">{{ row.paymentContent }}</div>
                  <!-- 订单状态 -->
                  <div v-else-if="col.key === 'status'" class="ors-cell">
                    <span class="ors-status-tag" :class="`ors-status-tag--${row.statusTone}`">{{ row.status }}</span>
                  </div>
                  <!-- 会员+商家结算 -->
                  <div v-else-if="col.key === 'memberSettle'" class="ors-cell ors-cell--member" :title="row.member">
                    <span v-if="getMemberName(row.member) === '散客'" class="ors-member-tag">散客</span>
                    <template v-else>
                      <span v-if="getMemberName(row.member)" class="ors-member-name">{{ getMemberName(row.member) }}</span>
                      <span v-if="getMemberPhone(row.member)" class="ors-member-phone">{{ maskPhone(getMemberPhone(row.member)) }}</span>
                    </template>
                    <span class="ors-member-settle" :class="settleClass(row.settleStatus)">{{ row.settleStatus || '已结算' }}</span>
                  </div>
                  <!-- 会员(无结算) -->
                  <div v-else-if="col.key === 'member'" class="ors-cell ors-cell--member" :title="row.member">
                    <span v-if="getMemberName(row.member) === '散客'" class="ors-member-tag">散客</span>
                    <template v-else>
                      <span v-if="getMemberName(row.member)" class="ors-member-name">{{ getMemberName(row.member) }}</span>
                      <span v-if="getMemberPhone(row.member)" class="ors-member-phone">{{ maskPhone(getMemberPhone(row.member)) }}</span>
                    </template>
                  </div>
                  <!-- 扣费类型 -->
                  <div v-else-if="col.key === 'deductType'" class="ors-cell">
                    <span class="ors-deduct-tag" :class="`ors-deduct-tag--${row.deductType}`">{{ row.deductType }}</span>
                  </div>
                  <!-- 扣费金额 -->
                  <div v-else-if="col.key === 'deductAmount'" class="ors-cell">
                    {{ row.deductAmount != null ? `¥${row.deductAmount.toFixed(2)}` : '-' }}
                  </div>
                  <!-- 修改类型 -->
                  <div v-else-if="col.key === 'editType'" class="ors-cell">
                    <span class="ors-edit-type-tag" :class="`ors-edit-type-tag--${row.editType}`">{{ row.editType }}</span>
                  </div>
                  <!-- 修改金额 -->
                  <div v-else-if="col.key === 'editAmount'" class="ors-cell">
                    <span :class="row.editAmount >= 0 ? 'ors-edit-amount--plus' : 'ors-edit-amount--minus'">
                      {{ row.editAmount >= 0 ? '+' : '' }}¥{{ Math.abs(row.editAmount).toFixed(2) }}
                    </span>
                  </div>
                  <!-- 兑换类型 -->
                  <div v-else-if="col.key === 'exchangeType'" class="ors-cell">
                    <span class="ors-exchange-type-tag" :class="`ors-exchange-type-tag--${getExchangeTypeClass(row.exchangeType)}`">{{ row.exchangeType }}</span>
                  </div>
                  <!-- 消耗游戏币 -->
                  <div v-else-if="col.key === 'coinUsed'" class="ors-cell">{{ row.coinUsed ?? '-' }}</div>
                  <!-- 兑换前游戏币 -->
                  <div v-else-if="col.key === 'coinBefore'" class="ors-cell">{{ row.coinBefore ?? '-' }}</div>
                  <!-- 兑换后游戏币 -->
                  <div v-else-if="col.key === 'coinAfter'" class="ors-cell">{{ row.coinAfter ?? '-' }}</div>
                  <!-- 赠送类型 -->
                  <div v-else-if="col.key === 'giftType'" class="ors-cell">
                    <span class="ors-gift-type-tag" :class="`ors-gift-type-tag--${getGiftTypeClass(row.giftType)}`">{{ row.giftType }}</span>
                  </div>
                  <!-- 扣费次数 -->
                  <div v-else-if="col.key === 'deductCount'" class="ors-cell">{{ row.deductCount ?? '-' }}</div>
                  <!-- 扣费后余额 -->
                  <div v-else-if="col.key === 'balanceAfter'" class="ors-cell">{{ row.balanceAfter != null ? `¥${row.balanceAfter.toFixed(2)}` : '-' }}</div>
                  <!-- 扣费后次数 -->
                  <div v-else-if="col.key === 'countAfter'" class="ors-cell">{{ row.countAfter ?? '-' }}</div>
                  <!-- 操作人 -->
                  <div v-else-if="col.key === 'operator'" class="ors-cell">{{ row.operator }}</div>
                  <!-- 扣款原因 -->
                  <div v-else-if="col.key === 'deductReason'" class="ors-cell">{{ row.deductReason }}</div>
                  <!-- 操作 -->
                  <div v-else-if="col.key === 'action'" class="ors-cell ors-cell--action">
                    <button type="button" class="ors-detail-btn" @click="viewDetail(row)">详情</button>
                  </div>
                  <!-- 默认文本列 -->
                  <div v-else class="ors-cell">{{ row[col.key] }}</div>
                </template>
              </article>
            </div>
          </div>

          <div v-if="pagedOrders.length === 0" class="ors-empty">
            <span class="ors-empty-title">暂无订单记录</span>
            <span class="ors-empty-hint">调整筛选条件后再试试看</span>
          </div>
        </div>

        <div class="ors-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredOrders.length"
            layout="prev, pager, next"
          />
        </div>
      </section>
    </div>

    <!-- 订单详情弹窗 -->
    <div v-if="detailVisible" class="ors-detail-modal" @click.self="closeDetail">
      <div class="ors-detail-card">
        <header class="ors-detail-header">
          <strong>订单详情</strong>
          <button type="button" class="ors-detail-close" @click="closeDetail" aria-label="关闭">
            <el-icon><Close /></el-icon>
          </button>
        </header>

        <div class="ors-detail-body">
          <!-- 收银类订单详情 -->
          <template v-if="activeConfig.detailType === 'cashier'">
            <!-- 订单信息 -->
            <div class="ors-detail-panel">
              <div class="ors-detail-info">
                <div class="ors-info-item">
                  <span class="ors-info-label">订单号</span>
                  <span class="ors-info-value">{{ selectedOrder?.orderNo }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">所属店铺</span>
                  <span class="ors-info-value">VR头号空间体验店</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">会员</span>
                  <span class="ors-info-value">{{ selectedOrder?.member }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">订单状态</span>
                  <span class="ors-info-value">
                    <span class="ors-detail-status" :class="`ors-detail-status--${selectedOrder?.statusTone}`">{{ selectedOrder?.status }}</span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">商家结算</span>
                  <span class="ors-info-value">
                    <span class="ors-detail-status" :class="selectedOrder?.settleStatus === '未结算' ? 'ors-detail-status--unsettled' : 'ors-detail-status--settle'">{{ selectedOrder?.settleStatus || '已结算' }}</span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">应收金额</span>
                  <span class="ors-info-value">¥{{ selectedOrder?.totalAmount?.toFixed(2) }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">优惠金额</span>
                  <span class="ors-info-value">¥{{ selectedOrder?.discountAmount?.toFixed(2) }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">实收金额</span>
                  <span class="ors-info-value">¥{{ selectedOrder?.paidAmount?.toFixed(2) }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">支付方式</span>
                  <span class="ors-info-value ors-info-pay">{{ selectedOrder?.paymentContent?.replace(/\n/g, '；') }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">已退金额</span>
                  <span class="ors-info-value">{{ selectedOrder?.status === '已退款' ? `¥${(selectedOrder.refundAmount || 0).toFixed(2)}` : '--' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">来源</span>
                  <span class="ors-info-value">{{ selectedOrder?.source }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">交易时间</span>
                  <span class="ors-info-value">{{ selectedOrder?.tradeTime }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">退款原因</span>
                  <span class="ors-info-value">{{ selectedOrder?.refundReason || '--' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">订单备注</span>
                  <span class="ors-info-value">--</span>
                </div>
              </div>
            </div>

            <!-- 售卖详情 -->
            <div class="ors-detail-panel">
              <h4>售卖详情</h4>
              <div class="ors-sale-table">
                <div class="ors-sale-head">
                  <span>售卖名称</span>
                  <span>原单价</span>
                  <span>现单价</span>
                  <span>数量</span>
                  <span>小计</span>
                  <span>备注</span>
                  <span>已退数量</span>
                  <span>已退金额</span>
                </div>
                <div class="ors-sale-body">
                  <div class="ors-sale-row">
                    <span>{{ selectedOrder?.product || '未知商品' }}</span>
                    <span>¥{{ selectedOrder?.totalAmount?.toFixed(2) }}</span>
                    <span>¥{{ (selectedOrder?.totalAmount - selectedOrder?.discountAmount)?.toFixed(2) }}</span>
                    <span>1</span>
                    <span>¥{{ selectedOrder?.paidAmount?.toFixed(2) }}</span>
                    <span>--</span>
                    <span>{{ selectedOrder?.status === '已退款' ? '1' : '--' }}</span>
                    <span>{{ selectedOrder?.status === '已退款' ? `¥${(selectedOrder.refundAmount || 0).toFixed(2)}` : '--' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 优惠详情 -->
            <div v-if="selectedOrder?.discountAmount > 0" class="ors-detail-panel">
              <h4>优惠详情</h4>
              <div class="ors-promo-table">
                <div class="ors-promo-head">
                  <span>类型</span>
                  <span>名称</span>
                  <span>优惠金额</span>
                  <span>操作</span>
                </div>
                <div class="ors-promo-body">
                  <div v-for="(promo, idx) in (selectedOrder?.promotions || [])" :key="idx" class="ors-promo-row">
                    <span>{{ promo.type }}</span>
                    <span>{{ promo.name }}</span>
                    <span>¥{{ promo.amount.toFixed(2) }}</span>
                    <span>{{ promo.action }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 点播订单详情 -->
          <template v-else-if="activeConfig.detailType === 'vod'">
            <div class="ors-detail-panel">
              <div class="ors-detail-info">
                <div class="ors-info-item">
                  <span class="ors-info-label">订单号</span>
                  <span class="ors-info-value">{{ selectedOrder?.orderNo }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">设备</span>
                  <span class="ors-info-value">{{ selectedOrder?.device }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">游戏</span>
                  <span class="ors-info-value">{{ selectedOrder?.game }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">时长</span>
                  <span class="ors-info-value">{{ selectedOrder?.duration }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">金额</span>
                  <span class="ors-info-value">¥{{ selectedOrder?.paidAmount?.toFixed(2) }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">会员</span>
                  <span class="ors-info-value">{{ selectedOrder?.member }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">创建时间</span>
                  <span class="ors-info-value">{{ selectedOrder?.tradeTime }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">状态</span>
                  <span class="ors-info-value">
                    <span class="ors-detail-status" :class="`ors-detail-status--${selectedOrder?.statusTone}`">{{ selectedOrder?.status }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- 点播明细 -->
            <div class="ors-detail-panel">
              <h4>点播明细</h4>
              <div class="ors-vod-table">
                <div class="ors-vod-head">
                  <span>项目</span>
                  <span>内容</span>
                </div>
                <div class="ors-vod-body">
                  <div v-for="(item, idx) in (selectedOrder?.vodDetails || [])" :key="idx" class="ors-vod-row">
                    <span>{{ item.label }}</span>
                    <span>{{ item.content }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 活动赠送订单详情 -->
          <template v-else-if="activeConfig.detailType === 'gift'">
            <div class="ors-detail-panel">
              <div class="ors-detail-info">
                <div class="ors-info-item">
                  <span class="ors-info-label">订单号</span>
                  <span class="ors-info-value">{{ selectedOrder?.orderNo }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">所属店铺</span>
                  <span class="ors-info-value">{{ selectedOrder?.store || '利民街小展厅' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">会员</span>
                  <span class="ors-info-value">{{ getMemberName(selectedOrder?.member) || selectedOrder?.member }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">活动名称</span>
                  <span class="ors-info-value">{{ selectedOrder?.activityName }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">赠送类型</span>
                  <span class="ors-info-value">
                    <span class="ors-detail-status" :class="`ors-detail-status--${getGiftTypeClass(selectedOrder?.giftType)}`">{{ selectedOrder?.giftType }}</span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">赠送价值</span>
                  <span class="ors-info-value">{{ formatGiftValue(selectedOrder) }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">创建时间</span>
                  <span class="ors-info-value">{{ selectedOrder?.tradeTime }}</span>
                </div>
              </div>
            </div>

            <!-- 赠送明细 -->
            <div class="ors-detail-panel">
              <h4>赠送明细</h4>
              <div class="ors-gift-table">
                <div class="ors-gift-head">
                  <span>赠送内容</span>
                  <span>类型</span>
                  <span>价值</span>
                </div>
                <div class="ors-gift-body">
                  <div class="ors-gift-row">
                    <span>{{ formatGiftDetail(selectedOrder) }}</span>
                    <span>{{ selectedOrder?.giftType }}</span>
                    <span>{{ formatGiftValue(selectedOrder) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 修改储值订单详情 -->
          <template v-else-if="activeConfig.detailType === 'recharge'">
            <!-- 基本信息 -->
            <div class="ors-detail-panel">
              <div class="ors-detail-info">
                <div class="ors-info-item">
                  <span class="ors-info-label">订单号</span>
                  <span class="ors-info-value">{{ selectedOrder?.orderNo }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">所属店铺</span>
                  <span class="ors-info-value">{{ selectedOrder?.store || '利民街小展厅' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">会员</span>
                  <span class="ors-info-value">{{ getMemberName(selectedOrder?.member) || selectedOrder?.member }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">修改类型</span>
                  <span class="ors-info-value">
                    <span class="ors-detail-status" :class="selectedOrder?.editType === '增加' ? 'ors-detail-status--done' : 'ors-detail-status--refund'">{{ selectedOrder?.editType }}</span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">类型</span>
                  <span class="ors-info-value">
                    <span class="ors-type-tag">{{ selectedOrder?.type }}</span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">修改金额</span>
                  <span class="ors-info-value">
                    <span :class="selectedOrder?.editAmount >= 0 ? 'ors-edit-amount--plus' : 'ors-edit-amount--minus'">
                      {{ selectedOrder?.editAmount >= 0 ? '+' : '-' }}¥{{ Math.abs(selectedOrder?.editAmount || 0).toFixed(2) }}
                    </span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">修改前储值</span>
                  <span class="ors-info-value">{{ selectedOrder?.balanceBefore != null ? `¥${selectedOrder.balanceBefore.toFixed(2)}` : '-' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">修改后储值</span>
                  <span class="ors-info-value">{{ selectedOrder?.balanceAfter != null ? `¥${selectedOrder.balanceAfter.toFixed(2)}` : '-' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">操作人</span>
                  <span class="ors-info-value">{{ selectedOrder?.operator }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">创建时间</span>
                  <span class="ors-info-value">{{ selectedOrder?.tradeTime }}</span>
                </div>
              </div>
            </div>

            <!-- 项目明细 -->
            <div class="ors-detail-panel">
              <h4>项目明细</h4>
              <div class="ors-item-table">
                <div class="ors-item-head">
                  <span>项目名称</span>
                  <span>数量</span>
                  <span>单价</span>
                  <span>小计</span>
                </div>
                <div class="ors-item-body">
                  <div v-for="(item, idx) in (selectedOrder?.itemDetails || [])" :key="idx" class="ors-item-row">
                    <span>{{ item.name }}</span>
                    <span>{{ item.qty }}</span>
                    <span>¥{{ item.unitPrice?.toFixed(2) }}</span>
                    <span>¥{{ item.subtotal?.toFixed(2) }}</span>
                  </div>
                  <div v-if="!(selectedOrder?.itemDetails?.length)" class="ors-item-row">
                    <span>{{ selectedOrder?.detail || '--' }}</span>
                    <span>1</span>
                    <span>{{ selectedOrder?.editAmount != null ? `¥${Math.abs(selectedOrder.editAmount).toFixed(2)}` : '-' }}</span>
                    <span>{{ selectedOrder?.editAmount != null ? `¥${Math.abs(selectedOrder.editAmount).toFixed(2)}` : '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 游戏币兑换订单详情 -->
          <template v-else-if="activeConfig.detailType === 'exchange'">
            <div class="ors-detail-panel">
              <div class="ors-detail-info">
                <div class="ors-info-item">
                  <span class="ors-info-label">订单号</span>
                  <span class="ors-info-value">{{ selectedOrder?.orderNo }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">所属店铺</span>
                  <span class="ors-info-value">{{ selectedOrder?.store || '利民街小展厅' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">会员</span>
                  <span class="ors-info-value">{{ getMemberName(selectedOrder?.member) || selectedOrder?.member }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">兑换类型</span>
                  <span class="ors-info-value">
                    <span class="ors-detail-status ors-detail-status--done">{{ selectedOrder?.exchangeType }}</span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">兑换前游戏币</span>
                  <span class="ors-info-value">{{ selectedOrder?.coinBefore ?? '-' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">兑换后游戏币</span>
                  <span class="ors-info-value">{{ selectedOrder?.coinAfter ?? '-' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">状态</span>
                  <span class="ors-info-value">
                    <span class="ors-detail-status" :class="`ors-detail-status--${selectedOrder?.statusTone}`">{{ selectedOrder?.status }}</span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">创建时间</span>
                  <span class="ors-info-value">{{ selectedOrder?.tradeTime }}</span>
                </div>
              </div>
            </div>

            <!-- 兑换明细 -->
            <div class="ors-detail-panel">
              <h4>兑换明细</h4>
              <div class="ors-exchange-table">
                <div class="ors-exchange-head">
                  <span>兑换商品</span>
                  <span>兑换类型</span>
                  <span>消耗游戏币</span>
                </div>
                <div class="ors-exchange-body">
                  <div class="ors-exchange-row">
                    <span>{{ selectedOrder?.product || '--' }}</span>
                    <span>{{ selectedOrder?.exchangeType || '--' }}</span>
                    <span>{{ selectedOrder?.coinUsed ?? '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 手动扣费订单详情 -->
          <template v-else-if="activeConfig.detailType === 'manual'">
            <!-- 基本信息 -->
            <div class="ors-detail-panel">
              <div class="ors-detail-info">
                <div class="ors-info-item">
                  <span class="ors-info-label">订单号</span>
                  <span class="ors-info-value">{{ selectedOrder?.orderNo }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">所属店铺</span>
                  <span class="ors-info-value">{{ selectedOrder?.store || '利民街小展厅' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">会员</span>
                  <span class="ors-info-value">{{ getMemberName(selectedOrder?.member) || selectedOrder?.member }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">会员手机</span>
                  <span class="ors-info-value">{{ getMemberPhone(selectedOrder?.member) || selectedOrder?.memberPhone || '--' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">扣费类型</span>
                  <span class="ors-info-value">
                    <span class="ors-deduct-tag" :class="`ors-deduct-tag--${selectedOrder?.deductType}`">{{ selectedOrder?.deductType }}</span>
                  </span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">扣费金额</span>
                  <span class="ors-info-value">{{ selectedOrder?.deductAmount != null ? `¥${selectedOrder.deductAmount.toFixed(2)}` : '-' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">扣费前金额</span>
                  <span class="ors-info-value">{{ selectedOrder?.balanceBefore != null ? `¥${selectedOrder.balanceBefore.toFixed(2)}` : '-' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">扣费后余额</span>
                  <span class="ors-info-value">{{ selectedOrder?.balanceAfter != null ? `¥${selectedOrder.balanceAfter.toFixed(2)}` : '-' }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">操作人</span>
                  <span class="ors-info-value">{{ selectedOrder?.operator }}</span>
                </div>
                <div class="ors-info-item">
                  <span class="ors-info-label">创建时间</span>
                  <span class="ors-info-value">{{ selectedOrder?.tradeTime }}</span>
                </div>
              </div>
            </div>

            <!-- 扣费明细 -->
            <div class="ors-detail-panel">
              <h4>扣费明细</h4>
              <div class="ors-manual-table">
                <div class="ors-manual-head">
                  <span>设备</span>
                  <span>游戏</span>
                  <span>扣费金额</span>
                  <span>扣费原因</span>
                </div>
                <div class="ors-manual-body">
                  <div v-for="(item, idx) in (selectedOrder?.deductDetails || [])" :key="idx" class="ors-manual-row">
                    <span>{{ item.device }}</span>
                    <span>{{ item.game }}</span>
                    <span>{{ item.amount != null ? `¥${item.amount.toFixed(2)}` : '-' }}</span>
                    <span>{{ item.reason }}</span>
                  </div>
                  <div v-if="!(selectedOrder?.deductDetails?.length)" class="ors-manual-row">
                    <span>{{ selectedOrder?.device || '--' }}</span>
                    <span>{{ selectedOrder?.game || '--' }}</span>
                    <span>{{ selectedOrder?.deductAmount != null ? `¥${selectedOrder.deductAmount.toFixed(2)}` : '-' }}</span>
                    <span>{{ selectedOrder?.deductReason || '--' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <footer class="ors-detail-footer">
          <template v-if="activeConfig.showRefund && selectedOrder?.status === '完成'">
            <button v-if="selectedOrder?.settleStatus === '已结算'" type="button" class="ors-detail-refund-btn ors-detail-refund-btn--offline" @click="openRefund">线下退款</button>
            <button v-else type="button" class="ors-detail-refund-btn" @click="openRefund">申请退款</button>
          </template>
          <span v-else></span>
          <button type="button" class="ors-detail-close-btn" @click="closeDetail">关闭</button>
        </footer>
      </div>
    </div>

    <!-- 退款弹窗 -->
    <div v-if="refundVisible" class="ors-detail-modal" @click.self="closeRefund">
      <div class="ors-refund-card">
        <header class="ors-detail-header">
          <strong>{{ refundTitle }}</strong>
          <button type="button" class="ors-detail-close" @click="closeRefund" aria-label="关闭">
            <el-icon><Close /></el-icon>
          </button>
        </header>

        <div class="ors-refund-body">
          <!-- 顶部提示（含退款金额） -->
          <div class="ors-refund-alert" :class="refundAlertClass">
            <el-icon class="ors-refund-alert__icon"><InfoFilled /></el-icon>
            <span>{{ refundAlertText }}</span>
          </div>

          <!-- 订单信息区（4 字段网格） -->
          <div class="ors-refund-panel">
            <div class="ors-refund-info-grid">
              <div class="ors-refund-info-item">
                <span class="ors-refund-info-item__label">订单号</span>
                <span class="ors-refund-info-item__value">{{ refundOrder?.orderNo }}</span>
              </div>
              <div class="ors-refund-info-item">
                <span class="ors-refund-info-item__label">退款内容</span>
                <span class="ors-refund-info-item__value ors-refund-info-item__value--product">{{ refundOrder?.product }}</span>
              </div>
              <div class="ors-refund-info-item">
                <span class="ors-refund-info-item__label">退款金额</span>
                <span class="ors-refund-info-item__value ors-refund-info-item__value--amount">¥{{ refundTotal.toFixed(2) }}</span>
              </div>
              <div class="ors-refund-info-item">
                <span class="ors-refund-info-item__label">退款方式</span>
                <span class="ors-refund-info-item__value">{{ refundMethodText }}</span>
              </div>
            </div>
          </div>

          <!-- 退款路径（仅未结算时显示，展示渠道拆分） -->
          <div v-if="!isRefundSettled" class="ors-refund-panel">
            <div class="ors-refund-path-title">退款路径</div>
            <div class="ors-refund-path-table">
              <div class="ors-refund-path-thead">
                <span>支付方式</span>
                <span>支付渠道</span>
                <span>退款金额</span>
                <span>说明</span>
              </div>
              <div class="ors-refund-path-tbody">
                <div v-for="(ch, idx) in refundPathList" :key="idx" class="ors-refund-path-tr">
                  <span :style="{ color: ch.color }">{{ ch.method }}</span>
                  <span>{{ ch.channel }}</span>
                  <span :style="{ color: ch.method === '预存款' || ch.method === '会员卡余额' ? '#6366f1' : '#333' }">
                    ¥{{ ch.amount.toFixed(2) }}
                  </span>
                  <span>{{ ch.desc }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 退款原因 -->
          <div class="ors-refund-panel">
            <label class="ors-refund-label">
              退款原因 <span class="ors-refund-required">*</span>
            </label>
            <el-select v-model="refundReason" placeholder="请选择退款原因" class="ors-refund-select">
              <el-option v-for="item in refundReasonOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </div>

          <!-- 线下退款凭证：已结算必填 -->
          <div v-if="isRefundSettled" class="ors-refund-panel">
            <label class="ors-refund-label">
              线下退款凭证 <span class="ors-refund-required">*</span>
            </label>
            <el-upload
              ref="refundUploadRef"
              v-model:file-list="refundVoucherList"
              :auto-upload="false"
              :limit="3"
              accept=".jpg,.png,.jpeg"
              list-type="picture-card"
              :on-exceed="onVoucherExceed"
              :before-upload="beforeVoucherUpload"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <p class="ors-refund-upload__hint">请上传微信/支付宝转账截图或现金收据照片（必填，最多3张）</p>
          </div>

          <!-- 底部汇总区 -->
          <div class="ors-refund-panel ors-refund-summary">
            <div class="ors-refund-method">
              退款方式：{{ refundMethodText }}
            </div>
            <div class="ors-refund-total">
              本次退款总额：<strong>¥{{ refundTotal.toFixed(2) }}</strong>
            </div>
            <div v-if="refundChannelBreakdown.length" class="ors-refund-breakdown-detail">
              <span v-for="(ch, idx) in refundChannelBreakdown" :key="idx" class="ors-refund-breakdown-item">
                {{ ch }}
              </span>
            </div>
          </div>
        </div>

        <footer class="ors-detail-footer">
          <span></span>
          <div class="ors-refund-actions">
            <button type="button" class="ors-detail-close-btn" @click="closeRefund">取消</button>
            <button type="button" class="ors-detail-confirm-btn" :disabled="!canConfirmRefund" @click="confirmRefund">
              {{ refundOrder?.settleStatus === '已结算' ? '确认已线下退款' : '确认退款' }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CopyDocument, Close, InfoFilled, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const orderTabs = [
  { path: '/order', label: '收银订单' },
  { path: '/order/vod', label: '点播系统订单' },
  { path: '/order/manual', label: '手动扣费订单' },
  { path: '/order/recharge-edit', label: '修改储值订单' },
  { path: '/order/coin-exchange', label: '游戏币兑换订单' },
  { path: '/order/gift', label: '活动赠送订单' }
]

const orderDataMap = {
  '/order': [
    {
      id: 1,
      orderNo: 'CS20250111001',
      tradeTime: '2025-01-11 11:34',
      product: '机器名称',
      totalAmount: 80,
      discountAmount: 0,
      paidAmount: 80,
      paymentContent: '预存款:40.00元\n微信支付:40.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '已结算',
      member: '散客（未知）',
      source: '收银系统',
      promotions: []
    },
    {
      id: 2,
      orderNo: 'CS20250111002',
      tradeTime: '2025-01-11 11:34',
      product: '充1000送1000（一年有效）',
      totalAmount: 1000,
      discountAmount: 0,
      paidAmount: 1000,
      paymentContent: '线下微信:1000.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '已结算',
      member: '13945223451',
      source: '收银系统',
      promotions: []
    },
    {
      id: 3,
      orderNo: 'CS20250111003',
      tradeTime: '2025-01-11 11:20',
      product: 'VR体验 30分钟',
      totalAmount: 68,
      discountAmount: 8,
      paidAmount: 60,
      paymentContent: '会员券:8.00元\n支付宝:60.00元',
      status: '已退款',
      statusTone: 'refund',
      settleStatus: '已结算',
      member: '李明（13900001234）',
      source: '收银系统',
      refundAmount: 60,
      refundReason: '设备故障',
      promotions: [{ type: '会员券', name: '金卡95折券', amount: 8, action: '自动抵扣' }]
    },
    {
      id: 4,
      orderNo: 'CS20250111004',
      tradeTime: '2025-01-11 14:22',
      product: 'VR双人体验 60分钟',
      totalAmount: 158,
      discountAmount: 30,
      paidAmount: 128,
      paymentContent: '优惠券:30.00元\n微信支付:128.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '未结算',
      member: '王芳（13800005566）',
      source: '收银系统',
      promotions: [
        { type: '优惠券', name: '新客满100减30券', amount: 30, action: '手动核销' }
      ]
    },
    {
      id: 5,
      orderNo: 'CS20250111005',
      tradeTime: '2025-01-11 15:08',
      product: 'VR体验 30分钟 + 饮品1杯',
      totalAmount: 98,
      discountAmount: 18,
      paidAmount: 80,
      paymentContent: '优惠券:10.00元\n会员折扣:8.00元\n支付宝:80.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '未结算',
      member: '张三（13911112222）',
      source: '收银系统',
      promotions: [
        { type: '优惠券', name: '饮品抵扣券', amount: 10, action: '手动核销' },
        { type: '会员折扣', name: '银卡9折', amount: 8, action: '自动抵扣' }
      ]
    },
    {
      id: 6,
      orderNo: 'CS20250111006',
      tradeTime: '2025-01-11 16:45',
      product: '深海大冒险 45分钟',
      totalAmount: 88,
      discountAmount: 0,
      paidAmount: 88,
      paymentContent: '抖音团购:88.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '未结算',
      member: '散客（未知）',
      source: '抖音',
      promotions: []
    },
    {
      id: 7,
      orderNo: 'CS20250111007',
      tradeTime: '2025-01-11 17:30',
      product: '星际穿越 VR 双人',
      totalAmount: 128,
      discountAmount: 20,
      paidAmount: 108,
      paymentContent: '优惠券:20.00元\n微信支付:108.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '未结算',
      member: '陈小雨（13712341234）',
      source: '收银系统',
      promotions: [
        { type: '优惠券', name: '周末双人特惠减20', amount: 20, action: '手动核销' }
      ]
    },
    {
      id: 8,
      orderNo: 'CS20250111008',
      tradeTime: '2025-01-11 18:12',
      product: '充500送200（半年有效）',
      totalAmount: 500,
      discountAmount: 0,
      paidAmount: 500,
      paymentContent: '支付宝:500.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '已结算',
      member: '赵琪（13611112222）',
      source: '收银系统',
      promotions: []
    }
  ],
  '/order/vod': [
    {
      id: 9,
      orderNo: 'VOD202501110001',
      tradeTime: '2025-01-11 13:06',
      product: '星际穿越 VR 双人',
      device: '幻影飞碟',
      game: '过山车 VR',
      duration: '10分钟',
      totalAmount: 128,
      discountAmount: 20,
      paidAmount: 108,
      paymentContent: '预存款:40.00元\n微信支付:68.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '未结算',
      member: '张晓明（13900001234）',
      source: '点播系统',
      vodDetails: [
        { label: '过山车VR', content: '预存款 + 微信支付' },
        { label: '优惠', content: '金卡95折，游戏币抵扣260币' },
        { label: '实付', content: '微信支付 ¥10.00' }
      ]
    },
    {
      id: 10,
      orderNo: 'VOD202501110002',
      tradeTime: '2025-01-11 12:48',
      product: '深海大冒险 45分钟',
      device: '暗黑机甲22版',
      game: '深海探险',
      duration: '45分钟',
      totalAmount: 88,
      discountAmount: 0,
      paidAmount: 88,
      paymentContent: '抖音团购:88.00元',
      status: '完成',
      statusTone: 'done',
      settleStatus: '已结算',
      member: '散客（未知）',
      source: '抖音',
      vodDetails: [
        { label: '深海探险', content: '抖音团购' },
        { label: '实付', content: '抖音团购 ¥88.00' }
      ]
    },
    {
      id: 101,
      orderNo: 'VOD202501110003',
      tradeTime: '2025-01-11 14:22',
      product: '星际穿越 VR 双人',
      device: '幻影飞碟',
      game: '星际穿越',
      duration: '60分钟',
      totalAmount: 158,
      discountAmount: 30,
      paidAmount: 128,
      paymentContent: '优惠券:30.00元\n微信支付:128.00元',
      status: '进行中',
      statusTone: 'pending',
      settleStatus: '未结算',
      member: '王芳（13800005566）',
      source: '点播系统',
      vodDetails: [
        { label: '星际穿越', content: '优惠券 + 微信支付' },
        { label: '优惠', content: '新客满100减30券' },
        { label: '实付', content: '微信支付 ¥128.00' }
      ]
    }
  ],
  '/order/manual': [
    {
      id: 11,
      orderNo: 'MX202605070001',
      tradeTime: '2026-05-07 10:30',
      deductType: '储蓄',
      device: '过山车VR',
      game: '暗黑战场',
      deductAmount: 50,
      deductCount: '-',
      balanceBefore: 200,
      balanceAfter: 150,
      countAfter: '-',
      operator: 'admin',
      deductReason: 'VR设备暗黑战场扣费',
      member: '张小明（13912345678）',
      memberPhone: '13912345678',
      store: '利民街小展厅',
      status: '完成',
      statusTone: 'done',
      deductDetails: [
        { device: '过山车VR', game: '暗黑战场', amount: 20, reason: 'VR设备暗黑战场扣费' }
      ]
    },
    {
      id: 12,
      orderNo: 'MX202605070002',
      tradeTime: '2026-05-07 14:20',
      deductType: '次数',
      device: '暗黑机甲22版',
      game: '深海探险',
      deductAmount: null,
      deductCount: '1次',
      balanceBefore: null,
      balanceAfter: null,
      countAfter: '5',
      operator: 'admin',
      deductReason: '暗黑机甲扣费',
      member: '李华（13800001111）',
      memberPhone: '13800001111',
      store: '利民街小展厅',
      status: '完成',
      statusTone: 'done',
      deductDetails: [
        { device: '暗黑机甲22版', game: '深海探险', amount: null, reason: '暗黑机甲扣费' }
      ]
    },
    {
      id: 112,
      orderNo: 'MX202605070003',
      tradeTime: '2026-05-07 16:45',
      deductType: '游戏币',
      device: '幻影飞碟',
      game: '星际穿越',
      deductAmount: null,
      deductCount: '1次',
      balanceBefore: null,
      balanceAfter: null,
      countAfter: '4',
      operator: 'admin',
      deductReason: '幻影飞碟扣费',
      member: '王强（13700002222）',
      memberPhone: '13700002222',
      store: '科技路旗舰店',
      status: '完成',
      statusTone: 'done',
      deductDetails: [
        { device: '幻影飞碟', game: '星际穿越', amount: null, reason: '幻影飞碟扣费' }
      ]
    }
  ],
  '/order/recharge-edit': [
    {
      id: 13,
      orderNo: 'REC202605070001',
      tradeTime: '2026-05-07 10:30',
      editType: '增加',
      type: '充值活动',
      detail: '充200送50活动',
      editAmount: 200,
      balanceBefore: 30,
      balanceAfter: 230,
      operator: 'admin',
      member: '张小明（13912345678）',
      memberPhone: '13912345678',
      store: '利民街小展厅',
      status: '完成',
      statusTone: 'done',
      itemDetails: [
        { name: '充200送50活动', qty: 1, unitPrice: 200, subtotal: 200 }
      ]
    },
    {
      id: 113,
      orderNo: 'REC202605070002',
      tradeTime: '2026-05-07 14:20',
      editType: '增加',
      type: '充值活动',
      detail: '充200送50活动',
      editAmount: 200,
      balanceBefore: 30,
      balanceAfter: 230,
      operator: 'admin',
      member: '李华（13800001111）',
      memberPhone: '13800001111',
      store: '利民街小展厅',
      status: '完成',
      statusTone: 'done',
      itemDetails: [
        { name: '充200送50活动', qty: 1, unitPrice: 200, subtotal: 200 }
      ]
    },
    {
      id: 213,
      orderNo: 'REC202605070003',
      tradeTime: '2026-05-07 16:45',
      editType: '减少',
      type: '单次消费',
      detail: '购买亲子套票',
      editAmount: -200,
      balanceBefore: 430,
      balanceAfter: 230,
      operator: 'admin',
      member: '王强（13700002222）',
      memberPhone: '13700002222',
      store: '科技路旗舰店',
      status: '完成',
      statusTone: 'done',
      itemDetails: [
        { name: '购买亲子套票', qty: 1, unitPrice: 200, subtotal: 200 }
      ]
    },
    {
      id: 313,
      orderNo: 'REC202605070004',
      tradeTime: '2026-05-08 09:15',
      editType: '增加',
      type: '购买商品',
      detail: '退还商品金额',
      editAmount: 88,
      balanceBefore: 50,
      balanceAfter: 138,
      operator: 'admin',
      member: '赵琪（13611112222）',
      memberPhone: '13611112222',
      store: '科技路旗舰店',
      status: '完成',
      statusTone: 'done',
      itemDetails: [
        { name: '退还商品金额', qty: 1, unitPrice: 88, subtotal: 88 }
      ]
    },
    {
      id: 413,
      orderNo: 'REC202605070005',
      tradeTime: '2026-05-08 11:30',
      editType: '减少',
      type: '套票',
      detail: '购买双人体验套票',
      editAmount: -158,
      balanceBefore: 300,
      balanceAfter: 142,
      operator: 'admin',
      member: '陈小雨（13712341234）',
      memberPhone: '13712341234',
      store: '利民街小展厅',
      status: '完成',
      statusTone: 'done',
      itemDetails: [
        { name: '双人体验套票', qty: 1, unitPrice: 158, subtotal: 158 }
      ]
    },
    {
      id: 513,
      orderNo: 'REC202605070006',
      tradeTime: '2026-05-08 14:20',
      editType: '减少',
      type: '商品',
      detail: '购买VR眼镜配件',
      editAmount: -299,
      balanceBefore: 500,
      balanceAfter: 201,
      operator: 'admin',
      member: '周杰（13555556666）',
      memberPhone: '13555556666',
      store: '科技路旗舰店',
      status: '完成',
      statusTone: 'done',
      itemDetails: [
        { name: 'VR眼镜配件', qty: 1, unitPrice: 299, subtotal: 299 }
      ]
    }
  ],
  '/order/coin-exchange': [
    {
      id: 14,
      orderNo: 'DH20250111001',
      tradeTime: '2025-01-11 11:34',
      exchangeType: '单次消费兑换',
      product: 'VR游戏单次体验',
      coinUsed: 500,
      coinBefore: 600,
      coinAfter: 100,
      status: '兑换成功',
      statusTone: 'done',
      member: '散客（未知）',
      memberPhone: '13945223451',
      store: '利民街小展厅',
      operator: 'admin'
    },
    {
      id: 114,
      orderNo: 'DH20250111002',
      tradeTime: '2025-01-11 11:34',
      exchangeType: '套票兑换',
      product: '双人体验套票',
      coinUsed: 100,
      coinBefore: 200,
      coinAfter: 100,
      status: '处理中',
      statusTone: 'pending',
      member: '13945223451',
      memberPhone: '13945223451',
      store: '利民街小展厅',
      operator: 'admin'
    },
    {
      id: 214,
      orderNo: 'DH20250111003',
      tradeTime: '2025-01-11 11:34',
      exchangeType: '商品兑换',
      product: '精美周边钥匙扣',
      coinUsed: 1000,
      coinBefore: 100,
      coinAfter: 100,
      status: '兑换失败',
      statusTone: 'refund',
      member: '13945223451',
      memberPhone: '13945223451',
      store: '科技路旗舰店',
      operator: 'admin'
    }
  ],
  '/order/gift': [
    {
      id: 15,
      orderNo: 'ZS20260507001',
      tradeTime: '2026-05-07 10:30',
      activityName: '新用户注册有礼',
      giftType: '储值',
      giftContent: '50',
      giftValue: 50,
      status: '完成',
      statusTone: 'done',
      member: '张小明（13912345678）',
      memberPhone: '13912345678',
      store: '利民街小展厅'
    },
    {
      id: 115,
      orderNo: 'ZS20260507002',
      tradeTime: '2026-05-07 14:20',
      activityName: '五一劳动节活动',
      giftType: '次数',
      giftContent: '3',
      giftValue: 76,
      status: '完成',
      statusTone: 'done',
      member: '李华（13800001111）',
      memberPhone: '13800001111',
      store: '利民街小展厅'
    },
    {
      id: 215,
      orderNo: 'ZS20260507003',
      tradeTime: '2026-05-07 16:45',
      activityName: '会员生日特权',
      giftType: '游戏币',
      giftContent: '200',
      giftValue: 50,
      status: '完成',
      statusTone: 'done',
      member: '王强（13700002222）',
      memberPhone: '13700002222',
      store: '利民街小展厅'
    },
    {
      id: 315,
      orderNo: 'ZS20260507004',
      tradeTime: '2026-05-07 11:10',
      activityName: '周年庆大回馈',
      giftType: '优惠券',
      giftContent: '50',
      giftValue: 50,
      status: '完成',
      statusTone: 'done',
      member: '赵琪（13611112222）',
      memberPhone: '13611112222',
      store: '科技路旗舰店'
    },
    {
      id: 415,
      orderNo: 'ZS20260507005',
      tradeTime: '2026-05-07 09:15',
      activityName: '签到送积分',
      giftType: '积分',
      giftContent: '500',
      giftValue: 0,
      status: '完成',
      statusTone: 'done',
      member: '陈小雨（13712341234）',
      memberPhone: '13712341234',
      store: '利民街小展厅'
    },
    {
      id: 515,
      orderNo: 'ZS20260507006',
      tradeTime: '2026-05-07 15:30',
      activityName: '暑期畅玩卡',
      giftType: '时长',
      giftContent: '120',
      giftValue: 120,
      status: '完成',
      statusTone: 'done',
      member: '周杰（13555556666）',
      memberPhone: '13555556666',
      store: '科技路旗舰店'
    }
  ]
}

const sourceOptions = ['收银系统', '点播系统', '抖音']
const statusOptions = ['完成', '已退款', '待支付']
const deductTypeOptions = ['储蓄', '次数', '游戏币']
const editTypeOptions = ['增加', '减少']
const rechargeTypeOptions = ['充值活动', '单次消费', '购买商品', '商品']
const exchangeTypeOptions = ['单次消费兑换', '商品兑换']
const exchangeStatusOptions = ['兑换成功', '兑换失败', '处理中']
const activityNameOptions = ['新用户注册有礼', '五一劳动节活动', '会员生日特权', '周年庆大回馈']
const giftTypeOptions = ['储值', '次数', '游戏币', '优惠券', '积分', '时长']

const pageSize = 8
const currentPage = ref(1)
const filters = reactive({
  dateRange: [],
  orderNo: '',
  memberKeyword: '',
  source: '',
  status: '',
  device: '',
  game: '',
  deductType: '',
  editType: '',
  rechargeType: '',
  exchangeType: '',
  exchangeStatus: '',
  activityName: '',
  operator: ''
})

/* ---------- Tab 配置（列 / 筛选 / 详情类型） ---------- */
const tabConfigMap = {
  '/order': {
    columns: [
      { key: 'orderNo', label: '订单号' },
      { key: 'tradeTime', label: '交易时间' },
      { key: 'product', label: '商品' },
      { key: 'totalAmount', label: '应付总额', type: 'money' },
      { key: 'discountAmount', label: '优惠金额', type: 'money' },
      { key: 'paidAmount', label: '实收总额', type: 'money' },
      { key: 'paymentContent', label: '支付内容' },
      { key: 'status', label: '订单状态' },
      { key: 'memberSettle', label: '会员/商家结算' },
      { key: 'action', label: '操作' }
    ],
    grid: '1.4fr 1.2fr 1fr 0.7fr 0.7fr 0.7fr 1.2fr 0.8fr 1.1fr 0.55fr',
    filters: ['source', 'status'],
    detailType: 'cashier',
    showRefund: true
  },
  '/order/vod': {
    columns: [
      { key: 'orderNo', label: '订单号' },
      { key: 'tradeTime', label: '交易时间' },
      { key: 'device', label: '设备' },
      { key: 'game', label: '游戏' },
      { key: 'duration', label: '时长' },
      { key: 'paidAmount', label: '金额', type: 'money' },
      { key: 'paymentContent', label: '支付方式' },
      { key: 'status', label: '订单状态' },
      { key: 'memberSettle', label: '会员/商家结算' },
      { key: 'action', label: '操作' }
    ],
    grid: '1.4fr 1.2fr 0.9fr 0.9fr 0.65fr 0.7fr 1.1fr 0.8fr 1.1fr 0.55fr',
    filters: ['device', 'game'],
    detailType: 'vod',
    showRefund: true
  },
  '/order/manual': {
    columns: [
      { key: 'orderNo', label: '订单号' },
      { key: 'tradeTime', label: '交易时间' },
      { key: 'deductType', label: '扣费类型' },
      { key: 'device', label: '设备' },
      { key: 'game', label: '游戏' },
      { key: 'deductAmount', label: '扣费金额', type: 'money' },
      { key: 'deductCount', label: '扣费次数' },
      { key: 'balanceAfter', label: '扣费后余额' },
      { key: 'countAfter', label: '扣费后次数' },
      { key: 'operator', label: '操作人' },
      { key: 'deductReason', label: '扣款原因' },
      { key: 'member', label: '会员' },
      { key: 'action', label: '操作' }
    ],
    grid: '1.4fr 1.1fr 0.65fr 0.85fr 0.75fr 0.7fr 0.65fr 0.75fr 0.65fr 0.55fr 0.85fr 0.75fr 0.45fr',
    filters: ['deductType', 'operator'],
    detailType: 'manual',
    showRefund: false
  },
  '/order/recharge-edit': {
    columns: [
      { key: 'orderNo', label: '订单号' },
      { key: 'tradeTime', label: '交易时间' },
      { key: 'editType', label: '修改类型' },
      { key: 'type', label: '类型' },
      { key: 'detail', label: '详情' },
      { key: 'editAmount', label: '修改金额' },
      { key: 'balanceAfter', label: '修改后余额' },
      { key: 'operator', label: '操作人' },
      { key: 'member', label: '会员' },
      { key: 'action', label: '操作' }
    ],
    grid: '1.4fr 1.1fr 0.65fr 0.8fr 1fr 0.8fr 0.75fr 0.55fr 0.85fr 0.45fr',
    filters: ['editType', 'rechargeType', 'operator'],
    detailType: 'recharge',
    showRefund: false
  },
  '/order/coin-exchange': {
    columns: [
      { key: 'orderNo', label: '订单号' },
      { key: 'tradeTime', label: '交易时间' },
      { key: 'exchangeType', label: '兑换类型' },
      { key: 'product', label: '兑换商品' },
      { key: 'coinUsed', label: '消耗游戏币' },
      { key: 'coinBefore', label: '兑换前游戏币' },
      { key: 'coinAfter', label: '兑换后游戏币' },
      { key: 'status', label: '状态' },
      { key: 'member', label: '会员' },
      { key: 'action', label: '操作' }
    ],
    grid: '1.6fr 1.05fr 0.85fr 0.9fr 0.65fr 0.65fr 0.65fr 0.55fr 0.7fr 0.4fr',
    filters: ['exchangeType', 'exchangeStatus', 'operator'],
    detailType: 'exchange',
    showRefund: false
  },
  '/order/gift': {
    columns: [
      { key: 'orderNo', label: '订单号' },
      { key: 'tradeTime', label: '交易时间' },
      { key: 'activityName', label: '活动名称' },
      { key: 'giftType', label: '赠送类型' },
      { key: 'giftContent', label: '赠送内容' },
      { key: 'giftValue', label: '赠送价值', type: 'money' },
      { key: 'member', label: '会员' },
      { key: 'action', label: '操作' }
    ],
    grid: '1.6fr 1.05fr 1fr 0.7fr 0.7fr 0.7fr 0.7fr 0.4fr',
    filters: ['activityName'],
    detailType: 'gift',
    showRefund: false
  }
}

const activeTab = computed(() => orderTabs.find(tab => tab.path === route.path) ?? orderTabs[0])
const activeConfig = computed(() => tabConfigMap[activeTab.value.path] ?? tabConfigMap['/order'])
const activeOrders = computed(() => orderDataMap[activeTab.value.path] ?? [])

const filteredOrders = computed(() => {
  const keyword = filters.orderNo.trim().toLowerCase()
  const memberKeyword = filters.memberKeyword.trim().toLowerCase()
  const deviceKeyword = filters.device.trim().toLowerCase()
  const gameKeyword = filters.game.trim().toLowerCase()
  const operatorKeyword = filters.operator.trim().toLowerCase()

  return activeOrders.value.filter(order => {
    if (keyword && !order.orderNo.toLowerCase().includes(keyword)) return false
    if (memberKeyword && !order.member.toLowerCase().includes(memberKeyword)) return false
    if (filters.source && order.source !== filters.source) return false
    if (filters.status && order.status !== filters.status) return false
    if (deviceKeyword && !(order.device || '').toLowerCase().includes(deviceKeyword)) return false
    if (gameKeyword && !(order.game || '').toLowerCase().includes(gameKeyword)) return false
    if (filters.deductType && order.deductType !== filters.deductType) return false
    if (filters.editType && order.editType !== filters.editType) return false
    if (filters.rechargeType && order.type !== filters.rechargeType) return false
    if (filters.exchangeType && order.exchangeType !== filters.exchangeType) return false
    if (filters.exchangeStatus && order.status !== filters.exchangeStatus) return false
    if (filters.activityName && order.activityName !== filters.activityName) return false
    if (operatorKeyword && !(order.operator || '').toLowerCase().includes(operatorKeyword)) return false
    return true
  })
})

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

watch(
  () => route.path,
  () => {
    currentPage.value = 1
  }
)

const getMemberName = (member) => {
  const match = member.match(/^(.+?)（(.+?)）$/)
  if (match) return match[1]
  if (/^\d{11}$/.test(member)) return ''
  return member
}

const getMemberPhone = (member) => {
  const match = member.match(/^(.+?)（(.+?)）$/)
  if (match && /^\d{11}$/.test(match[2])) return match[2]
  if (/^\d{11}$/.test(member)) return member
  return ''
}

const maskPhone = (phone) => {
  if (!phone || phone.length < 7) return phone || ''
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

const getExchangeTypeClass = (type) => {
  if (type === '单次消费兑换') return 'single'
  // 套票暂不启用
  // if (type === '套票兑换') return 'package'
  if (type === '商品兑换') return 'goods'
  return 'single'
}

const getGiftTypeClass = (type) => {
  if (type === '储值') return 'balance'
  if (type === '次数') return 'count'
  if (type === '游戏币') return 'coin'
  if (type === '优惠券') return 'coupon'
  if (type === '积分') return 'points'
  if (type === '时长') return 'duration'
  return 'balance'
}

const formatGiftDetail = (order) => {
  if (!order) return '--'
  const type = order.giftType
  const content = order.giftContent
  if (type === '储值') return `赠送储值 ${content} 元`
  if (type === '次数') return `赠送次数 ${content} 次`
  if (type === '游戏币') return `赠送游戏币 ${content} 币`
  if (type === '优惠券') return `赠送优惠券 ${content} 元`
  if (type === '积分') return `赠送积分 ${content} 分`
  if (type === '时长') return `赠送时长 ${content} 分钟`
  return `赠送${type} ${content}`
}

const formatGiftValue = (order) => {
  if (!order) return '--'
  const type = order.giftType
  const value = order.giftValue
  if (type === '储值' || type === '优惠券') return `¥${value?.toFixed(2) ?? '0.00'}`
  if (type === '次数') return `${order.giftContent ?? '-'}次`
  if (type === '游戏币') return `${order.giftContent ?? '-'}币`
  if (type === '积分') return `${order.giftContent ?? '-'}分`
  if (type === '时长') return `${order.giftContent ?? '-'}分钟`
  return value != null ? `¥${value.toFixed(2)}` : '--'
}

const settleClass = (settleStatus) => {
  if (settleStatus === '未结算') return 'ors-member-settle--unsettled'
  if (settleStatus === '无需结算') return 'ors-member-settle--none'
  return 'ors-member-settle--settled'
}

const switchTab = (path) => {
  if (path === route.path) return
  router.push(path)
}

const copyOrderNo = async (orderNo) => {
  try {
    await navigator.clipboard.writeText(orderNo)
  } catch (error) {
    console.warn('复制订单号失败', error)
  }
}

const detailVisible = ref(false)
const selectedOrder = ref(null)

const viewDetail = (row) => {
  selectedOrder.value = row
  detailVisible.value = true
}

const closeDetail = () => {
  detailVisible.value = false
  selectedOrder.value = null
}

/* ---------- 退款弹窗 ---------- */
const refundVisible = ref(false)
const refundOrder = ref(null)
const refundQty = ref(0)
const refundReason = ref('')
const refundVoucherList = ref([])
const refundReasonOptions = ['客户不想要了', '游戏体验异常', '操作错误（买错项目）', '设备故障', '重复付款', '其他']

const isRefundSettled = computed(() => refundOrder.value?.settleStatus === '已结算')

const refundTitle = computed(() => isRefundSettled.value ? '线下退款' : '申请退款')

const refundAlertClass = computed(() =>
  isRefundSettled.value ? 'ors-refund-alert--warning' : 'ors-refund-alert--info'
)

const refundAlertText = computed(() => {
  if (isRefundSettled.value) {
    return '该订单已结算，款项已到商家账户。请商家线下退款给用户后，上传凭证并确认。'
  }
  return `原路退回，退款总金额 ¥${refundTotal.value.toFixed(2)} 元`
})

const refundUnitPrice = computed(() => {
  if (!refundOrder.value) return 0
  return refundOrder.value.totalAmount - refundOrder.value.discountAmount
})

const refundableQty = computed(() => {
  if (!refundOrder.value) return 0
  const purchased = refundOrder.value.purchasedQty || 1
  const refunded = refundOrder.value.refundedQty || 0
  return purchased - refunded
})

const refundTotal = computed(() => refundUnitPrice.value * refundQty.value)

const refundMethodText = computed(() => {
  if (isRefundSettled.value) return '线下退款'
  return '原路退款'
})

// 退款路径：未结算时展示支付方式/渠道/金额/说明拆分
const refundPathList = computed(() => {
  if (!refundOrder.value || refundTotal.value <= 0) return []
  const content = refundOrder.value.paymentContent || ''
  const lines = content.split('\n').filter(Boolean)
  const paths = []
  const ratio = refundTotal.value / refundOrder.value.paidAmount
  for (const line of lines) {
    const match = line.match(/^(.+?):([\d.]+)元/)
    if (match) {
      const method = match[1]
      const amount = parseFloat(match[2]) * ratio
      const isPrepaid = method.includes('预存款') || method.includes('余额')
      paths.push({
        method,
        channel: isPrepaid ? '内部账户' : method,
        amount,
        desc: isPrepaid ? `原路退回至${method}` : `${method}原路退回`,
        color: isPrepaid ? '#6366f1' : method.includes('微信') ? '#07c160' : method.includes('支付宝') ? '#1677ff' : '#333',
      })
    }
  }
  return paths
})

const refundChannelBreakdown = computed(() => {
  return refundPathList.value.map(p => `${p.method}：¥${p.amount.toFixed(2)}`)
})

const canConfirmRefund = computed(() => {
  if (refundQty.value <= 0) return false
  if (!refundReason.value) return false
  // 已结算订单必须上传凭证
  if (isRefundSettled.value && refundVoucherList.value.length === 0) return false
  return true
})

const openRefund = () => {
  refundOrder.value = selectedOrder.value
  // 整单退款：数量直接设为可退数
  const purchased = refundOrder.value?.purchasedQty || 1
  const refunded = refundOrder.value?.refundedQty || 0
  refundQty.value = purchased - refunded
  refundReason.value = ''
  refundVoucherList.value = []
  refundVisible.value = true
}

const closeRefund = () => {
  refundVisible.value = false
  refundOrder.value = null
  refundQty.value = 0
  refundReason.value = ''
  refundVoucherList.value = []
}

// 凭证上传校验
const beforeVoucherUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  const isValidSize = file.size / 1024 / 1024 <= 5
  if (!isValidType) {
    window.ElMessage?.warning?.('仅支持 JPG/PNG 格式')
  }
  if (!isValidSize) {
    window.ElMessage?.warning?.('文件大小不能超过 5MB')
  }
  return isValidType && isValidSize
}

const onVoucherExceed = () => {
  window.ElMessage?.warning?.('最多上传 3 张凭证图片')
}

const confirmRefund = () => {
  if (!canConfirmRefund.value) return
  if (refundOrder.value) {
    refundOrder.value.status = '已退款'
    refundOrder.value.statusTone = 'refund'
    refundOrder.value.refundAmount = refundTotal.value
    refundOrder.value.refundReason = refundReason.value
    refundOrder.value.refundedQty = (refundOrder.value.refundedQty || 0) + refundQty.value
    // 保存凭证信息
    if (isRefundSettled.value && refundVoucherList.value.length > 0) {
      refundOrder.value.refundVoucherList = refundVoucherList.value.map(f => ({
        name: f.name,
        url: f.url || f.response?.url || '',
      }))
    }
    // 未结算订单退款后，结算状态标记为无需结算
    if (refundOrder.value.settleStatus === '未结算') {
      refundOrder.value.settleStatus = '无需结算'
    }
  }
  closeRefund()
  closeDetail()
}
</script>

<style scoped>
/* ============================================
   统一字体规范 (Type Scale)
   H1: 18px  |  页面主标题
   H2: 15px  |  区块标题 / 表头
   Body: 14px  |  正文 / 表格内容 / 标签
   Small: 12px  |  辅助文字 / 副标题 / 状态标签
   ============================================ */

.order-record-page {
  --fs-page: 13px;
  --fs-body: 13px;
  --fs-small: 12px;

  min-height: calc(100vh - 86px);
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 14px 16px;
  background: #eaf7ff;
  overflow: hidden;
}

/* ========== 主体 ========== */
.ors-body {
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ors-filter-panel,
.ors-table-panel {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(30, 64, 175, 0.06);
  width: 100%;
}

/* ========== 筛选面板 ========== */
.ors-filter-panel {
  min-width: 0;
  padding: 12px 24px 20px;
  overflow: hidden;
}

.ors-tabs {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 28px;
  border-bottom: 1px solid #edf2f7;
  padding: 0 0 0;
  overflow-x: auto;
}

.ors-tab {
  position: relative;
  padding: 0 0 10px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #171b24;
  font-size: var(--fs-page);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease;
}

.ors-tab:hover {
  color: #1191ff;
}

.ors-tab.active {
  color: #1191ff;
  border-bottom-color: #1191ff;
}

.ors-filter-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px 20px;
  padding-top: 18px;
  align-items: end;
}

.ors-field {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.ors-field > span {
  flex-shrink: 0;
  color: #334155;
  font-size: var(--fs-small);
  font-weight: 500;
  white-space: nowrap;
}

.ors-field :deep(.el-input),
.ors-field :deep(.el-select),
.ors-field :deep(.el-date-editor) {
  width: 100%;
}

.ors-field :deep(.el-input__wrapper),
.ors-field :deep(.el-select__wrapper),
.ors-field :deep(.el-date-editor.el-input__wrapper) {
  min-height: 32px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  padding: 0 10px;
}

.ors-field :deep(.el-input__inner),
.ors-field :deep(.el-select__placeholder) {
  font-size: var(--fs-small);
  color: #475569;
}

.ors-field :deep(.el-date-editor .el-range-input) {
  font-size: var(--fs-small);
  color: #475569;
}

.ors-field :deep(.el-date-editor .el-range-separator) {
  font-size: var(--fs-small);
  color: #94a3b8;
}

.ors-field :deep(.el-input__wrapper:hover),
.ors-field :deep(.el-select__wrapper:hover),
.ors-field :deep(.el-date-editor.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #93c5fd inset;
}

.ors-field :deep(.is-focus),
.ors-field :deep(.el-input__wrapper.is-focus),
.ors-field :deep(.el-select__wrapper.is-focused),
.ors-field :deep(.el-date-editor.is-active) {
  box-shadow: 0 0 0 1px #3b82f6 inset !important;
}

.ors-search-btn {
  height: 32px;
  padding: 0 20px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.ors-search-btn:hover {
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

.ors-search-btn:active {
  transform: translateY(0);
}

/* ========== 表格 ========== */
.ors-table-panel {
  min-height: 0;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px 14px;
  overflow: hidden;
}

.ors-table-scroll {
  min-height: 0;
  min-width: 0;
  flex: 1;
  overflow: auto;
  padding: 0;
}

/* 表格滚动条：黑色半透明 */
.ors-table-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.ors-table-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.ors-table-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
.ors-table-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.ors-table-inner {
  min-width: 960px;
}

.ors-table-head,
.ors-row {
  display: grid;
  gap: 16px;
  align-items: stretch;
  padding: 0 16px;
}

.ors-table-head {
  min-height: 42px;
  border-radius: 10px;
  margin: 12px 0 2px;
  background: #f8fafc;
  color: #475569;
  font-size: var(--fs-page);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.ors-table-head > span {
  display: flex;
  align-items: center;
  background: #f8fafc;
}

.ors-head-member {
  /* 不再 sticky，随表格正常滚动 */
}

.ors-head-action {
  position: sticky;
  right: 0;
  width: 100%;
  background: #f8fafc;
  z-index: 2;
  transform: translateZ(0);
}

.ors-table-body {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
}

.ors-row {
  min-height: 48px;
  background: #fff;
  color: #334155;
  font-size: var(--fs-body);
  line-height: 1.45;
  transition: background 0.15s ease;
}

.ors-row:hover {
  background: #f8fafc;
}

.ors-row:hover .ors-cell {
  background: #f8fafc;
}

.ors-row:last-child .ors-cell {
  border-bottom: 0;
}

.ors-cell {
  min-width: 0;
  display: flex;
  align-items: center;
  line-height: 1.45;
  word-break: break-word;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}

.ors-cell--order {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

/* 操作列固定右侧 */
.ors-cell--action {
  position: sticky;
  right: 0;
  background: #fff;
  z-index: 1;
  padding-right: 16px;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.04);
  white-space: nowrap;
}

.ors-row:hover .ors-cell--action {
  background: #f8fafc;
}

.ors-cell--order > span {
  color: #1e293b;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.ors-copy-btn {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.ors-copy-btn:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.ors-cell--money {
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  font-weight: 600;
}

.ors-cell--payment {
  white-space: pre-line;
  color: #475569;
  font-size: var(--fs-small);
  line-height: 1.5;
}

/* ========== 会员/散客列 ========== */
.ors-cell--member {
  white-space: nowrap;
  overflow: hidden;
  gap: 4px;
  font-size: 12px;
}

.ors-member-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.ors-member-name {
  color: #334155;
  font-weight: 500;
  font-size: 12px;
}

.ors-member-phone {
  color: #94a3b8;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.ors-member-settle {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}

.ors-member-settle--settled {
  background: #ecfdf5;
  color: #059669;
}

.ors-member-settle--unsettled {
  background: #fff7ed;
  color: #ea580c;
}

.ors-member-settle--none {
  background: #f1f5f9;
  color: #94a3b8;
}

/* ========== 状态标签 ========== */
.ors-status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: var(--fs-small);
  font-weight: 700;
  line-height: 1;
}

.ors-status-tag--done {
  background: #ecfdf5;
  color: #059669;
}

.ors-status-tag--refund {
  background: #fef2f2;
  color: #dc2626;
}

.ors-status-tag--pending {
  background: #fffbeb;
  color: #d97706;
}

.ors-status-tag--unsettled {
  background: #eff6ff;
  color: #2563eb;
}

/* 扣费类型标签 */
.ors-deduct-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: var(--fs-small);
  font-weight: 600;
  line-height: 1;
}

.ors-deduct-tag--储蓄 {
  background: #ecfdf5;
  color: #059669;
}

.ors-deduct-tag--次数 {
  background: #eff6ff;
  color: #2563eb;
}

.ors-deduct-tag--游戏币 {
  background: #fffbeb;
  color: #d97706;
}

/* 修改类型标签 */
.ors-edit-type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: var(--fs-small);
  font-weight: 600;
  line-height: 1;
}

.ors-edit-type-tag--增加 {
  background: #ecfdf5;
  color: #059669;
}

.ors-edit-type-tag--减少 {
  background: #fef2f2;
  color: #dc2626;
}

/* 修改金额颜色 */
.ors-edit-amount--plus {
  color: #059669;
  font-weight: 600;
}

.ors-edit-amount--minus {
  color: #dc2626;
  font-weight: 600;
}

/* 类型标签（如充值活动） */
.ors-type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  background: #e0f2fe;
  color: #0284c7;
  font-size: var(--fs-small);
  font-weight: 600;
  line-height: 1;
}

/* 兑换类型标签 */
.ors-exchange-type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: var(--fs-small);
  font-weight: 600;
  line-height: 1;
}

.ors-exchange-type-tag--single {
  background: #ecfdf5;
  color: #059669;
}

.ors-exchange-type-tag--package {
  background: #fffbeb;
  color: #d97706;
}

.ors-exchange-type-tag--goods {
  background: #e0f2fe;
  color: #0284c7;
}

/* 赠送类型标签 */
.ors-gift-type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: var(--fs-small);
  font-weight: 600;
  line-height: 1;
}

.ors-gift-type-tag--balance {
  background: #ecfdf5;
  color: #059669;
}

.ors-gift-type-tag--count {
  background: #e0f2fe;
  color: #0284c7;
}

.ors-gift-type-tag--coin {
  background: #fffbeb;
  color: #d97706;
}

.ors-gift-type-tag--coupon {
  background: #fef2f2;
  color: #dc2626;
}

.ors-gift-type-tag--points {
  background: #f3e8ff;
  color: #9333ea;
}

.ors-gift-type-tag--duration {
  background: #dcfce7;
  color: #16a34a;
}

/* ========== 详情按钮 ========== */
.ors-detail-btn {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.ors-detail-btn:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

/* ========== 空状态 ========== */
.ors-empty {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
}

.ors-empty-title {
  font-size: var(--fs-page);
  font-weight: 700;
  color: #64748b;
}

.ors-empty-hint {
  font-size: var(--fs-small);
  font-weight: 500;
}

/* ========== 分页 ========== */
.ors-pagination {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.ors-pagination :deep(.el-pagination) {
  --el-pagination-button-bg-color: #fff;
}

.ors-pagination :deep(.btn-prev),
.ors-pagination :deep(.btn-next) {
  width: 34px;
  height: 32px;
  border-radius: 4px;
  background: #fff;
  color: #64748b;
  border: 1px solid #d7dfeb;
  font-size: 12px;
  transition: all 0.18s ease;
}

.ors-pagination :deep(.btn-prev:hover:not(:disabled)),
.ors-pagination :deep(.btn-next:hover:not(:disabled)) {
  color: #60a5fa;
  border-color: #60a5fa;
  background: #eff6ff;
}

.ors-pagination :deep(.el-pager li) {
  min-width: 34px;
  height: 32px;
  border-radius: 4px;
  background: #fff;
  color: #64748b;
  border: 1px solid #d7dfeb;
  font-size: 13px;
  font-weight: 600;
  margin: 0 4px;
  transition: all 0.18s ease;
}

.ors-pagination :deep(.el-pager li:hover:not(.is-active)) {
  color: #60a5fa;
  border-color: #60a5fa;
  background: #eff6ff;
}

.ors-pagination :deep(.el-pager li.is-active) {
  background: #60a5fa;
  color: #fff;
  border-color: #60a5fa;
}

.ors-pagination :deep(.btn-prev:disabled),
.ors-pagination :deep(.btn-next:disabled) {
  opacity: 0.45;
  background: #f8fafc;
}

/* ========== 订单详情弹窗 ========== */
.ors-detail-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.ors-detail-card {
  width: 720px;
  max-width: 92vw;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #D9EBFC;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  animation: slideUp 0.25s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ors-detail-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #F1F8FF;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  flex-shrink: 0;
}

.ors-detail-header strong {
  font-size: 16px;
  font-weight: 700;
  color: #1d2433;
}

.ors-detail-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ors-detail-close:hover {
  background: #f1f5f9;
}

.ors-detail-close .el-icon {
  font-size: 20px;
}

.ors-detail-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 白色卡片面板 */
.ors-detail-panel {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(21, 88, 150, 0.06);
}

.ors-detail-panel h4 {
  font-size: 14px;
  font-weight: 700;
  color: #1d2433;
  margin: 0 0 10px;
}

/* 订单信息网格 */
.ors-detail-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.ors-detail-info--compact {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.ors-info-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  min-height: 40px;
  border-bottom: 1px solid #f1f5f9;
}

.ors-detail-info--compact .ors-info-item {
  padding: 10px 12px;
}

.ors-info-label {
  flex-shrink: 0;
  width: auto;
  min-width: 56px;
  padding-right: 12px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.ors-info-value {
  flex: 1;
  min-width: 0;
  color: #1e293b;
  font-size: 13px;
  font-weight: 500;
  word-break: break-word;
}

.ors-info-pay {
  color: #16a34a;
}

/* 弹窗内状态标签 */
.ors-detail-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.ors-detail-status--done {
  background: #ecfdf5;
  color: #059669;
}

.ors-detail-status--refund {
  background: #fef2f2;
  color: #dc2626;
}

.ors-detail-status--pending {
  background: #fffbeb;
  color: #d97706;
}

.ors-detail-status--settle {
  background: #ecfdf5;
  color: #059669;
}

.ors-detail-status--unsettled {
  background: #eff6ff;
  color: #2563eb;
}

.ors-detail-status--balance {
  background: #ecfdf5;
  color: #059669;
}

.ors-detail-status--count {
  background: #e0f2fe;
  color: #0284c7;
}

.ors-detail-status--coin {
  background: #fffbeb;
  color: #d97706;
}

.ors-detail-status--coupon {
  background: #fef2f2;
  color: #dc2626;
}

.ors-detail-status--points {
  background: #f3e8ff;
  color: #9333ea;
}

.ors-detail-status--duration {
  background: #dcfce7;
  color: #16a34a;
}

/* 售卖详情 / 优惠详情 表格 */
.ors-sale-table,
.ors-promo-table {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.ors-sale-head,
.ors-sale-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 60px 1fr 80px 80px 1fr;
  gap: 8px;
  align-items: center;
  padding: 0 14px;
}

.ors-promo-head,
.ors-promo-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 0 14px;
}

.ors-sale-head,
.ors-promo-head {
  min-height: 34px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.ors-sale-row,
.ors-promo-row {
  min-height: 36px;
  color: #334155;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}

/* 点播明细表格 */
.ors-vod-table {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.ors-vod-head,
.ors-vod-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
  align-items: center;
  padding: 0 14px;
}

.ors-vod-head {
  min-height: 34px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.ors-vod-row {
  min-height: 36px;
  color: #334155;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}

/* 手动扣费明细表格 */
.ors-manual-table {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.ors-manual-head,
.ors-manual-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.5fr;
  gap: 8px;
  align-items: center;
  padding: 0 14px;
}

.ors-manual-head {
  min-height: 34px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.ors-manual-row {
  min-height: 36px;
  color: #334155;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}

.ors-manual-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 项目明细表格 */
.ors-item-table {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.ors-item-head,
.ors-item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 0 14px;
}

.ors-item-head {
  min-height: 34px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.ors-item-row {
  min-height: 36px;
  color: #334155;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}

.ors-item-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 兑换明细表格 */
.ors-exchange-table {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.ors-exchange-head,
.ors-exchange-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 0 14px;
}

.ors-exchange-head {
  min-height: 34px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.ors-exchange-row {
  min-height: 36px;
  color: #334155;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}

.ors-exchange-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 赠送明细表格 */
.ors-gift-table {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.ors-gift-head,
.ors-gift-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 0 14px;
}

.ors-gift-head {
  min-height: 34px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.ors-gift-row {
  min-height: 36px;
  color: #334155;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}

.ors-gift-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 底部操作按钮 */
.ors-detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  flex-shrink: 0;
  background: #F1F8FF;
}

.ors-detail-refund-btn {
  height: 36px;
  padding: 0 20px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #ff6b6b 0%, #ee5a5a 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(238, 90, 90, 0.25);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ors-detail-refund-btn--offline {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.ors-detail-refund-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.ors-detail-close-btn {
  height: 36px;
  padding: 0 24px;
  border: 1px solid #d5e3f0;
  border-radius: 8px;
  background: #fff;
  color: #4f5d73;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ors-detail-close-btn:hover {
  border-color: #b9d5f0;
  background: #f8fafc;
  color: #334155;
}

/* ========== 退款弹窗 ========== */
.ors-refund-card {
  width: 620px;
  max-width: 92vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #D9EBFC;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  animation: slideUp 0.25s ease;
  overflow: hidden;
}

.ors-refund-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 提示条 */
.ors-refund-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.ors-refund-alert__icon {
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 16px;
}

.ors-refund-alert--info {
  background: #e0f2fe;
  color: #0369a1;
}

.ors-refund-alert--warning {
  background: #fef3c7;
  color: #92400e;
}

/* 白色面板 */
.ors-refund-panel {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(21, 88, 150, 0.06);
}

/* ======== 退款弹窗样式 ======== */

/* 订单信息 4 字段网格 */
.ors-refund-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.ors-refund-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ors-refund-info-item__label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.ors-refund-info-item__value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
  word-break: break-all;
}

.ors-refund-info-item__value--product {
  color: #2563eb;
}

.ors-refund-info-item__value--amount {
  font-size: 18px;
  color: #dc2626;
  font-weight: 700;
}

/* 退款路径表格 */
.ors-refund-path-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.ors-refund-path-table {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.ors-refund-path-thead,
.ors-refund-path-tr {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1.5fr;
  gap: 8px;
  align-items: center;
  padding: 0 12px;
}

.ors-refund-path-thead {
  min-height: 34px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.ors-refund-path-tr {
  min-height: 40px;
  color: #334155;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}

.ors-refund-path-tr span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 退款原因 */
.ors-refund-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.ors-refund-required {
  color: #dc2626;
}

.ors-refund-select {
  width: 100%;
}

.ors-refund-select :deep(.el-select__wrapper) {
  min-height: 36px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}

.ors-refund-select :deep(.el-select__placeholder) {
  font-size: 13px;
}

/* 上传区域 */
.ors-refund-upload__hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: #94a3b8;
}

/* 退款汇总 */
.ors-refund-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ors-refund-method {
  font-size: 13px;
  color: #475569;
}

.ors-refund-total {
  font-size: 13px;
  color: #1e293b;
}

.ors-refund-total strong {
  font-size: 18px;
  font-weight: 700;
  color: #dc2626;
}

.ors-refund-breakdown-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 0 16px;
}

.ors-refund-breakdown-item {
  font-size: 12px;
  color: #64748b;
}

/* 底部按钮 */
.ors-refund-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ors-detail-confirm-btn {
  height: 36px;
  padding: 0 20px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  transition: all 0.15s ease;
}

.ors-detail-confirm-btn:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

.ors-detail-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ========== 响应式 ========== */
@media (max-width: 1440px) {
  .ors-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .order-record-page {
    min-height: auto;
    padding: 10px;
  }

  .ors-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 14px;
  }

  .ors-filter-panel {
    padding: 10px 12px 14px;
  }

  .ors-tabs {
    gap: 16px;
  }

  .ors-table-panel {
    padding: 0 12px 10px;
  }
}

@media (max-width: 760px) {
  .ors-filter-grid {
    grid-template-columns: 1fr;
  }

  .ors-tab {
    padding: 0 14px;
    font-size: 13px;
  }
}
</style>
