<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <div class="title-row">
          <h1>{{ pageTitle }}</h1>
          <n-tag size="small" type="warning" :bordered="false">演示数据</n-tag>
        </div>
        <p class="header-desc">{{ pageDescription }}</p>
      </div>
      <n-space>
        <n-button type="primary" size="small" @click="openPrimaryAction">{{ primaryActionLabel }}</n-button>
      </n-space>
    </div>

    <n-alert type="info" :bordered="false" class="relation-prerequisite">
      分账比例入口：代理商分润比例在“代理商管理”，CP 手续费比例在“游戏供应商管理”。本页只维护拉卡拉分账主体、接收方和关系；拉卡拉通道最低比例仅在多入账主体模式下开通分账商户时使用。
    </n-alert>

    <template v-if="managementScope === 'merchant'">
      <n-alert type="info" :bordered="false" class="relation-prerequisite">
        收款码可以按商户/门店区分；这里按“资金先进入唯一平台分账主体，再分给接收方”的模式管理。若交易资金直接进入门店自己的拉卡拉商户，则该门店需要单独走分账商户开通。
      </n-alert>
      <div class="readiness">
      <button
        v-for="(step, index) in readinessSteps"
        :key="step.tab"
        class="readiness-step"
        :class="{ active: activeTab === step.tab }"
        type="button"
        @click="activeTab = step.tab"
      >
        <span class="step-index">{{ index + 1 }}</span>
        <span>
          <strong>{{ step.title }}</strong>
          <small>{{ step.summary }}</small>
        </span>
        <n-tag size="small" :type="step.type" :bordered="false">{{ step.status }}</n-tag>
      </button>
      </div>

      <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="receivers" tab="分账接收方">
        <div class="table-toolbar">
          <n-space>
            <n-input v-model:value="receiverKeyword" size="small" clearable placeholder="搜索主体或接收方编号" />
            <n-select
              v-model:value="receiverTypeFilter"
              size="small"
              clearable
              placeholder="全部主体"
              :options="receiverTypeOptions"
              style="width: 140px"
            />
          </n-space>
          <span class="data-source">来源：平台商家/代理商/CP资料 + 拉卡拉接收方详情</span>
        </div>
        <n-data-table
          size="small"
          :single-line="false"
          :columns="receiverColumns"
          :data="filteredReceivers"
          :pagination="{ pageSize: 8 }"
          :scroll-x="1260"
        />
      </n-tab-pane>

      <n-tab-pane name="relations" tab="分账关系">
        <div class="table-toolbar">
          <n-space>
            <n-input v-model:value="relationKeyword" size="small" clearable placeholder="搜索分账主体或接收方" />
            <n-select
              v-model:value="relationStatusFilter"
              size="small"
              clearable
              placeholder="全部状态"
              :options="relationStatusOptions"
              style="width: 140px"
            />
          </n-space>
          <span class="data-source">来源：平台结算关系 + 拉卡拉关系申请列表</span>
        </div>
        <n-data-table
          size="small"
          :single-line="false"
          :columns="relationColumns"
          :data="filteredRelations"
          :pagination="{ pageSize: 8 }"
          :scroll-x="1320"
        />
      </n-tab-pane>

      </n-tabs>
    </template>

    <template v-else>
      <div class="single-platform-card platform-application-card">
        <div class="single-platform-card__head">
          <div>
            <strong>平台分账主体状态</strong>
            <span>查看唯一平台主体的开通状态、平台 ID 和审核回执</span>
          </div>
          <n-space align="center">
            <n-button
              v-if="platformApplication.status === 'approved'"
              size="tiny"
              secondary
              type="primary"
              @click="openPlatformChange"
            >
              主体信息变更
            </n-button>
            <n-button size="tiny" secondary type="success" @click="simulatePlatformApproval">模拟审核通过</n-button>
            <n-button size="tiny" quaternary @click="resetPlatformApplicationTest">重置测试</n-button>
            <n-tag :type="applicationTagType(platformApplication.status)" :bordered="false">
              {{ platformApplicationStatusLabel[platformApplication.status] }}
            </n-tag>
          </n-space>
        </div>
        <n-descriptions :column="3" bordered size="small" class="platform-application-detail">
          <n-descriptions-item label="平台名称">{{ platformApplication.platformName }}</n-descriptions-item>
          <n-descriptions-item label="机构代码">{{ platformApplication.orgCode }}</n-descriptions-item>
          <n-descriptions-item label="申请单号">{{ platformApplication.applicationNo || '尚未提交' }}</n-descriptions-item>
          <n-descriptions-item label="平台 ID">{{ platformApplication.platformId || '审核通过后返回' }}</n-descriptions-item>
          <n-descriptions-item label="受理编号">{{ platformApplication.applyId || '提交后返回' }}</n-descriptions-item>
          <n-descriptions-item label="更新时间">{{ platformApplication.updatedAt }}</n-descriptions-item>
          <n-descriptions-item label="最近变更单号">{{ platformChangeApplication.applicationNo || '暂无变更' }}</n-descriptions-item>
          <n-descriptions-item label="变更状态">
            {{ platformChangeStatusLabel[platformChangeApplication.status] }}
          </n-descriptions-item>
          <n-descriptions-item label="变更更新时间">{{ platformChangeApplication.updatedAt || '暂无' }}</n-descriptions-item>
          <n-descriptions-item label="审核结果" :span="3">
            {{ platformApplication.auditRemark }}
          </n-descriptions-item>
          <n-descriptions-item label="变更审核结果" :span="3">
            {{ platformChangeApplication.auditRemark || '暂无变更申请' }}
          </n-descriptions-item>
        </n-descriptions>
        <div class="application-flow">
          <div class="application-flow__step done"><strong>1</strong><span>创建主体资料</span></div>
          <div class="application-flow__line"></div>
          <div class="application-flow__step" :class="{ done: platformApplication.status !== 'draft' }"><strong>2</strong><span>提交申请</span></div>
          <div class="application-flow__line"></div>
          <div class="application-flow__step" :class="{ done: platformApplication.status === 'approved' }"><strong>3</strong><span>接收审核结果</span></div>
        </div>
      </div>
      <n-alert type="info" :bordered="false">
        平台主体审核通过后返回 platformId。接收方和关系绑定已移至“接收方与分账关系”。
      </n-alert>
    </template>

    <n-modal
      v-model:show="showApplicationModal"
      preset="card"
      title="开通分账商户"
      class="business-modal"
      :bordered="false"
    >
      <n-alert type="info" :bordered="false" class="modal-alert">
        为平台下属收银商户开通分账能力。字段已按官方“商户分账业务开通申请”整理。
      </n-alert>
      <n-form label-placement="top">
        <div class="form-section">
          <div class="section-heading">
            <h3>系统自动生成</h3>
            <span>公共参数及接口业务流水，无需人工填写</span>
          </div>
          <n-descriptions :column="4" bordered size="small" class="system-fields">
            <n-descriptions-item label="reqData.version">1.0</n-descriptions-item>
            <n-descriptions-item label="orderNo">{{ requestOrderNo }}</n-descriptions-item>
            <n-descriptions-item label="reqId">{{ requestOrderNo }}</n-descriptions-item>
            <n-descriptions-item label="reqTime">{{ requestTime }}</n-descriptions-item>
          </n-descriptions>
        </div>

        <div class="form-section">
          <h3>商户与分账参数</h3>
          <div class="form-grid">
            <n-form-item label="机构代码（orgCode）" required>
              <n-input v-model:value="applicationForm.orgCode" maxlength="32" placeholder="拉卡拉分配的机构代码" />
            </n-form-item>
            <n-form-item label="收银商户" required>
              <n-select
                v-model:value="applicationForm.cashierMerchantNo"
                :options="cashierMerchantOptions"
                placeholder="选择已配置的收银商户"
                @update:value="fillCashierMerchant"
              />
            </n-form-item>
            <n-form-item label="内部商户号（merInnerNo）">
              <n-input v-model:value="applicationForm.merInnerNo" readonly placeholder="与银联商户号至少传一个" />
            </n-form-item>
            <n-form-item label="银联商户号（merCupNo）">
              <n-input v-model:value="applicationForm.merCupNo" readonly placeholder="与内部商户号至少传一个" />
            </n-form-item>
            <n-form-item label="联系手机号（contactMobile）" required>
              <n-input v-model:value="applicationForm.contactMobile" maxlength="32" placeholder="请输入手机号" />
            </n-form-item>
            <n-form-item label="拉卡拉通道最低比例 %（splitLowestRatio）">
              <n-input-number
                v-model:value="applicationForm.splitLowestRatio"
                :min="0"
                :max="100"
                :precision="2"
                placeholder="例如 70.00"
                style="width: 100%"
              />
              <span class="field-hint">这是收银商户开通分账能力时提交给拉卡拉的通道约束，不是代理商/CP的业务分润比例。</span>
            </n-form-item>
            <n-form-item label="分账范围（splitRange）">
              <n-select v-model:value="applicationForm.splitRange" :options="splitRangeOptions" />
            </n-form-item>
            <n-form-item label="分账依据（sepFundSource）">
              <n-select v-model:value="applicationForm.sepFundSource" :options="fundSourceOptions" />
            </n-form-item>
            <n-form-item label="分账发起方式（splitLaunchMode）">
              <n-select v-model:value="applicationForm.splitLaunchMode" :options="launchModeOptions" />
            </n-form-item>
            <n-form-item
              v-if="applicationForm.splitLaunchMode !== 'MANUAL'"
              label="分账规则来源（splitRuleSource）"
              required
            >
              <n-select v-model:value="applicationForm.splitRuleSource" :options="ruleSourceOptions" />
            </n-form-item>
            <n-form-item label="提款类型（settleType）">
              <n-select v-model:value="applicationForm.settleType" :options="settleTypeOptions" />
            </n-form-item>
            <n-form-item label="退货承担账户（returnAcctModel）">
              <n-select v-model:value="applicationForm.returnAcctModel" clearable :options="returnAccountOptions" />
            </n-form-item>
            <n-form-item label="审核回调地址（retUrl）" required class="grid-wide">
              <n-input v-model:value="applicationForm.retUrl" maxlength="128" placeholder="https://.../lakala/split/open/callback" />
            </n-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-heading">
            <h3>结算委托凭证</h3>
            <span>上传委托书，或填写已签署的电子合同编号</span>
          </div>
          <n-select
            v-model:value="applicationForm.credentialMode"
            :options="credentialModeOptions"
            class="credential-select"
          />
          <template v-if="applicationForm.credentialMode === 'upload'">
            <n-upload
              v-model:file-list="applicationFiles"
              :max="1"
              :default-upload="false"
              accept=".pdf"
              @update:file-list="handleApplicationEntrustFiles"
            >
              <n-upload-dragger>
                <div class="upload-title">上传《结算委托授权书》PDF *</div>
                <div class="upload-hint">上传后由附件接口回填 splitEntrustFileName 和 splitEntrustFilePath</div>
              </n-upload-dragger>
            </n-upload>
            <div class="form-grid upload-result">
              <n-form-item label="文件名称（splitEntrustFileName）" required>
                <n-input v-model:value="applicationForm.splitEntrustFileName" readonly />
              </n-form-item>
              <n-form-item label="文件路径（splitEntrustFilePath）" required>
                <n-input v-model:value="applicationForm.splitEntrustFilePath" readonly placeholder="上传成功后自动回填" />
              </n-form-item>
            </div>
          </template>
          <n-form-item v-else label="电子合同编号（eleContractNo）" required class="electronic-contract">
            <n-input v-model:value="applicationForm.eleContractNo" maxlength="32" placeholder="电子签约成功返回的 ec_no" />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showApplicationModal = false">取消</n-button>
          <n-button type="primary" @click="submitApplication">提交申请</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showMerchantChangeModal"
      preset="card"
      title="商户分账信息变更申请"
      class="business-modal"
      :bordered="false"
    >
      <n-alert type="info" :bordered="false" class="modal-alert">
        仅针对已开通分账业务的收银商户提交变更；商户号由原记录带入，不重复配置。
      </n-alert>
      <n-form label-placement="top">
        <div class="form-section">
          <div class="section-heading">
            <h3>系统自动生成</h3>
            <span>对应 modifyLedgerMer 的公共流水</span>
          </div>
          <n-descriptions :column="4" bordered size="small" class="system-fields">
            <n-descriptions-item label="reqData.version">1.0</n-descriptions-item>
            <n-descriptions-item label="orderNo">{{ requestOrderNo }}</n-descriptions-item>
            <n-descriptions-item label="reqId">{{ requestOrderNo }}</n-descriptions-item>
            <n-descriptions-item label="reqTime">{{ requestTime }}</n-descriptions-item>
          </n-descriptions>
        </div>

        <div class="form-section">
          <h3>商户与基础变更</h3>
          <div class="form-grid">
            <n-form-item label="机构代码（orgCode）" required>
              <n-input v-model:value="merchantChangeForm.orgCode" maxlength="32" />
            </n-form-item>
            <n-form-item label="收银商户">
              <n-input v-model:value="merchantChangeForm.merchantName" readonly />
            </n-form-item>
            <n-form-item label="内部商户号（merInnerNo）">
              <n-input v-model:value="merchantChangeForm.merInnerNo" readonly />
            </n-form-item>
            <n-form-item label="银联商户号（merCupNo）">
              <n-input v-model:value="merchantChangeForm.merCupNo" readonly />
            </n-form-item>
            <n-form-item label="联系手机号（contactMobile）">
              <n-input v-model:value="merchantChangeForm.contactMobile" maxlength="32" placeholder="不改可留空" />
            </n-form-item>
            <n-form-item label="拉卡拉通道最低比例 %（splitLowestRatio）">
              <n-input-number
                v-model:value="merchantChangeForm.splitLowestRatio"
                :min="0"
                :max="100"
                :precision="2"
                clearable
                placeholder="变更比例时需上传委托书"
              />
              <span class="field-hint">只在需要变更拉卡拉通道约束时填写；代理商/CP分润比例仍以业务资料中的规则为准。</span>
            </n-form-item>
            <n-form-item label="分账范围（splitRange）">
              <n-select v-model:value="merchantChangeForm.splitRange" clearable :options="splitRangeOptions" />
            </n-form-item>
            <n-form-item label="分账依据（sepFundSource）">
              <n-select v-model:value="merchantChangeForm.sepFundSource" clearable :options="fundSourceOptions" />
            </n-form-item>
            <n-form-item label="发起方式（splitLaunchMode）">
              <n-select v-model:value="merchantChangeForm.splitLaunchMode" clearable :options="launchModeOptions" />
            </n-form-item>
            <n-form-item
              v-if="merchantChangeForm.splitLaunchMode && merchantChangeForm.splitLaunchMode !== 'MANUAL'"
              label="规则来源（splitRuleSource）"
              required
            >
              <n-select v-model:value="merchantChangeForm.splitRuleSource" :options="ruleSourceOptions" />
            </n-form-item>
            <n-form-item label="退货承担账户（returnAcctModel）">
              <n-select v-model:value="merchantChangeForm.returnAcctModel" clearable :options="returnAccountOptions" />
            </n-form-item>
            <n-form-item label="电子合同编号（eleContractNo）">
              <n-input v-model:value="merchantChangeForm.eleContractNo" maxlength="32" placeholder="已签署电子合同可填" />
            </n-form-item>
            <n-form-item label="审核回调地址（retUrl）" required class="grid-wide">
              <n-input v-model:value="merchantChangeForm.retUrl" maxlength="128" />
            </n-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-heading">
            <h3>委托书与附加资料</h3>
            <span>变更最低分账比例时，委托书文件名和路径必填</span>
          </div>
          <n-upload
            v-model:file-list="merchantChangeFiles"
            :max="1"
            :default-upload="false"
            accept=".pdf"
            @update:file-list="handleMerchantChangeEntrustFiles"
          >
            <n-upload-dragger>
              <div class="upload-title">上传新的《结算委托授权书》PDF</div>
              <div class="upload-hint">上传后回填 splitEntrustFileName 和 splitEntrustFilePath</div>
            </n-upload-dragger>
          </n-upload>
          <div class="form-grid upload-result">
            <n-form-item label="文件名称（splitEntrustFileName）">
              <n-input v-model:value="merchantChangeForm.splitEntrustFileName" readonly />
            </n-form-item>
            <n-form-item label="文件路径（splitEntrustFilePath）">
              <n-input v-model:value="merchantChangeForm.splitEntrustFilePath" readonly />
            </n-form-item>
          </div>
          <div class="form-grid upload-result">
            <n-form-item label="附加资料类型（attachments.attachType）">
              <n-select v-model:value="merchantChangeForm.attachType" clearable :options="attachmentTypeOptions" />
            </n-form-item>
            <n-form-item label="附加资料名称（attachments.attachName）">
              <n-input v-model:value="merchantChangeForm.attachName" maxlength="32" />
            </n-form-item>
            <n-form-item label="附加资料路径（attachments.attachStorePath）" class="grid-wide">
              <n-input v-model:value="merchantChangeForm.attachStorePath" maxlength="128" />
            </n-form-item>
          </div>
        </div>

        <div class="form-section">
          <h3>计费规则（feeRule）</h3>
          <div class="form-grid">
            <n-form-item label="到账模式（arrivalMode）">
              <n-select v-model:value="merchantChangeForm.arrivalMode" clearable :options="arrivalModeOptions" />
            </n-form-item>
            <n-form-item label="计费范围（feeRange）">
              <n-select v-model:value="merchantChangeForm.feeRange" clearable :options="feeRangeOptions" />
            </n-form-item>
            <n-form-item label="计费模式（feeMode）">
              <n-select v-model:value="merchantChangeForm.feeMode" clearable :options="feeModeOptions" />
            </n-form-item>
            <n-form-item v-if="merchantChangeForm.feeMode === 'AMOUNT'" label="固定金额（amount）" required>
              <n-input-number v-model:value="merchantChangeForm.amount" :min="0" :precision="2" clearable />
            </n-form-item>
            <n-form-item v-if="merchantChangeForm.feeMode === 'RATIO'" label="固定比例 %（ratio）" required>
              <n-input-number v-model:value="merchantChangeForm.ratio" :min="0" :max="100" :precision="2" clearable />
            </n-form-item>
            <n-form-item label="手续费上限（feeUpper）">
              <n-input-number v-model:value="merchantChangeForm.feeUpper" :min="0" :precision="2" clearable />
            </n-form-item>
            <n-form-item label="手续费下限（feeLower）">
              <n-input-number v-model:value="merchantChangeForm.feeLower" :min="0" :precision="2" clearable />
            </n-form-item>
          </div>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showMerchantChangeModal = false">取消</n-button>
          <n-button type="primary" @click="submitMerchantChange">提交变更申请</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showReceiverModal"
      preset="card"
      title="新建分账接收方"
      class="business-modal"
      :bordered="false"
    >
      <n-alert type="info" :bordered="false" class="modal-alert">
        先选择平台主体。已有资料会自动带入；这里只补充拉卡拉专用信息，不重复维护分润配置。
      </n-alert>
      <n-form label-placement="top">
        <div class="form-grid">
          <n-form-item label="主体类型" required>
            <n-select
              v-model:value="receiverForm.ownerType"
              :options="receiverTypeOptions"
              placeholder="选择主体类型"
              @update:value="changeReceiverType"
            />
          </n-form-item>
          <n-form-item label="平台主体" required>
            <n-select
              v-model:value="receiverForm.ownerId"
              :options="availableOwnerOptions"
              placeholder="选择平台已有主体"
              :disabled="!receiverForm.ownerType"
              @update:value="fillReceiverOwner"
            />
          </n-form-item>
        </div>

        <div v-if="selectedPlatformOwner" class="source-summary">
          <div class="source-summary__head">
            <div>
              <strong>{{ selectedPlatformOwner.label }}</strong>
              <span>资料来源：{{ receiverTypeLabel[selectedPlatformOwner.type] }}管理 / 结算账户</span>
            </div>
            <n-tag
              size="small"
              :type="selectedExistingReceiver?.status === 'active' ? 'success' : selectedExistingReceiver ? 'info' : 'default'"
              :bordered="false"
            >
              {{ selectedExistingReceiver ? `拉卡拉：${receiverStatusLabel[selectedExistingReceiver.status]}` : '拉卡拉：未创建' }}
            </n-tag>
          </div>
          <n-descriptions :column="3" bordered size="small">
            <n-descriptions-item label="联系人">{{ selectedPlatformOwner.contactMobile }}</n-descriptions-item>
            <n-descriptions-item label="业务规则">{{ selectedPlatformOwner.businessRule }}</n-descriptions-item>
            <n-descriptions-item label="结算账户">
              {{ selectedPlatformOwner.acctNo ? `尾号 ${selectedPlatformOwner.acctNo.slice(-4)}` : '未维护' }}
            </n-descriptions-item>
          </n-descriptions>
          <n-alert v-if="selectedExistingReceiver" type="success" :bordered="false" class="sync-result">
            已同步接收方编号 {{ selectedExistingReceiver.receiverNo }}，无需重复创建。
          </n-alert>
        </div>

        <div class="form-section">
          <div class="section-heading">
            <h3>拉卡拉申请信息</h3>
            <span>version、orderNo、reqId、reqTime 由系统自动生成</span>
          </div>
          <div class="form-grid">
          <n-form-item label="机构代码（orgCode）" required>
            <n-input v-model:value="receiverForm.orgCode" maxlength="32" placeholder="接收方所属机构代码" />
          </n-form-item>
          <n-form-item label="接收方名称（receiverName）" required>
            <n-input v-model:value="receiverForm.receiverName" maxlength="64" readonly />
          </n-form-item>
          <n-form-item label="联系手机号（contactMobile）" required>
            <n-input v-model:value="receiverForm.contactMobile" maxlength="16" readonly placeholder="请先在主体资料中维护" />
          </n-form-item>
          <n-form-item label="账户类型（acctTypeCode）" required>
            <n-select v-model:value="receiverForm.acctTypeCode" :options="accountTypeOptions" disabled />
          </n-form-item>
          <n-form-item label="收款账户名称（acctName）" required>
            <n-input v-model:value="receiverForm.acctName" maxlength="32" readonly placeholder="请先在结算账户中维护" />
          </n-form-item>
          <n-form-item label="收款账户卡号（acctNo）" required>
            <n-input v-model:value="receiverForm.acctNo" maxlength="32" readonly placeholder="请先在结算账户中维护" />
          </n-form-item>
          <n-form-item label="账户证件类型（acctCertificateType）" required>
            <n-select v-model:value="receiverForm.acctCertificateType" :options="certificateTypeOptions" disabled />
          </n-form-item>
          <n-form-item label="账户证件号（acctCertificateNo）" required>
            <n-input v-model:value="receiverForm.acctCertificateNo" maxlength="32" readonly placeholder="请先在主体资料中维护" />
          </n-form-item>
          <n-form-item label="开户行号（acctOpenBankCode）" required>
            <n-input v-model:value="receiverForm.acctOpenBankCode" maxlength="32" placeholder="按卡 BIN 查询结果填写" />
          </n-form-item>
          <n-form-item label="开户行名称（acctOpenBankName）" required>
            <n-input v-model:value="receiverForm.acctOpenBankName" maxlength="64" />
          </n-form-item>
          <n-form-item label="清算行行号（acctClearBankCode）" required>
            <n-input v-model:value="receiverForm.acctClearBankCode" maxlength="32" placeholder="按卡 BIN 查询结果填写" />
          </n-form-item>
          <n-form-item label="提款类型（settleType）">
            <n-select v-model:value="receiverForm.settleType" :options="settleTypeOptions" />
          </n-form-item>
          </div>
        </div>

        <div v-if="receiverForm.acctTypeCode === '57'" class="form-section conditional-section">
          <div class="section-heading">
            <h3>对公账户必填资料</h3>
            <span>官方文档标注为对公账户条件必传</span>
          </div>
          <div class="form-grid">
            <n-form-item label="营业执照号码（licenseNo）" required>
              <n-input v-model:value="receiverForm.licenseNo" maxlength="32" />
            </n-form-item>
            <n-form-item label="营业执照名称（licenseName）" required>
              <n-input v-model:value="receiverForm.licenseName" maxlength="128" />
            </n-form-item>
            <n-form-item label="法人姓名（legalPersonName）" required>
              <n-input v-model:value="receiverForm.legalPersonName" maxlength="32" />
            </n-form-item>
            <n-form-item label="法人证件类型（legalPersonCertificateType）" required>
              <n-select v-model:value="receiverForm.legalPersonCertificateType" :options="certificateTypeOptions" />
            </n-form-item>
            <n-form-item label="法人证件号（legalPersonCertificateNo）" required>
              <n-input v-model:value="receiverForm.legalPersonCertificateNo" maxlength="32" />
            </n-form-item>
          </div>
        </div>

        <div class="form-section compact">
          <div class="section-heading">
            <h3>附加资料（attachList）</h3>
            <span>接口为可选；特殊项目按拉卡拉审核要求补充</span>
          </div>
          <n-upload
            v-model:file-list="receiverFiles"
            multiple
            :default-upload="false"
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <n-button>选择资料</n-button>
          </n-upload>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showReceiverModal = false">取消</n-button>
          <n-button type="primary" :disabled="!!selectedExistingReceiver" @click="submitReceiver">
            {{ selectedExistingReceiver ? '已创建，无需重复申请' : '提交创建申请' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showRelationModal"
      preset="card"
      title="绑定分账关系"
      class="business-modal"
      :bordered="false"
    >
      <n-alert type="info" :bordered="false" class="modal-alert">
        字段已按官方“分账关系绑定申请”整理；合作协议附件和回调地址为必填。
      </n-alert>
      <n-form label-placement="top">
        <div class="form-grid">
          <n-form-item label="机构代码（orgCode）" required>
            <n-input v-model:value="relationForm.orgCode" maxlength="32" placeholder="接收方所属机构代码" />
          </n-form-item>
          <n-form-item label="分账主体">
            <n-input :value="platformApplication.platformName" readonly />
          </n-form-item>
          <n-form-item label="平台 ID">
            <n-input :value="platformApplication.platformId || '平台主体审核通过后返回'" readonly />
          </n-form-item>
          <n-form-item label="已生效接收方" required>
            <n-select
              v-model:value="relationForm.receiverId"
              :options="activeReceiverOptions"
              placeholder="选择接收方"
            />
          </n-form-item>
          <n-form-item label="接收方编号（receiverNo）" required>
            <n-input :value="selectedRelationReceiver?.receiverNo || ''" readonly />
          </n-form-item>
          <n-form-item label="结算场景" required>
            <n-select v-model:value="relationForm.scene" :options="sceneOptions" placeholder="选择业务场景" />
          </n-form-item>
          <n-form-item label="审核回调地址（retUrl）" required class="grid-wide">
            <n-input v-model:value="relationForm.retUrl" maxlength="128" placeholder="https://.../lakala/split/relation/callback" />
          </n-form-item>
        </div>
        <div class="form-section compact">
          <div class="section-heading">
            <h3>合作协议附件</h3>
            <span>上传后回填 entrustFileName、entrustFilePath</span>
          </div>
          <n-upload
            v-model:file-list="relationFiles"
            :max="1"
            :default-upload="false"
            accept=".jpg,.jpeg,.png,.pdf"
            @update:file-list="handleRelationFiles"
          >
            <n-button>上传合作协议 *</n-button>
          </n-upload>
          <div class="form-grid upload-result">
            <n-form-item label="附件名称（entrustFileName）" required>
              <n-input v-model:value="relationForm.entrustFileName" readonly />
            </n-form-item>
            <n-form-item label="附件路径（entrustFilePath）" required>
              <n-input v-model:value="relationForm.entrustFilePath" readonly placeholder="上传成功后自动回填" />
            </n-form-item>
          </div>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showRelationModal = false">取消</n-button>
          <n-button type="primary" @click="submitRelation">提交绑定申请</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showPlatformApplicationModal"
      preset="card"
      :title="platformApplication.status === 'draft' ? '提交平台主体申请' : '拉卡拉申请报文'"
      class="business-modal"
      :bordered="false"
    >
      <n-alert type="info" :bordered="false" class="modal-alert">
        {{
          platformApplication.status === 'draft'
            ? '填写并提交平台主体开通申请。'
            : '这里展示当时提交给拉卡拉的申请字段、流水和附件，不再重复维护当前主体状态。'
        }}
      </n-alert>
      <n-form label-placement="top">
        <n-descriptions :column="3" bordered size="small" class="system-fields">
          <n-descriptions-item label="接口">applyLedgerPlatform</n-descriptions-item>
          <n-descriptions-item label="version">1.0</n-descriptions-item>
          <n-descriptions-item label="申请流水">
            {{ platformApplication.applicationNo || requestOrderNo || '尚未提交' }}
          </n-descriptions-item>
          <n-descriptions-item label="受理编号">{{ platformApplication.applyId || '提交后返回' }}</n-descriptions-item>
          <n-descriptions-item label="审核状态">{{ platformApplicationStatusLabel[platformApplication.status] }}</n-descriptions-item>
          <n-descriptions-item label="回调地址">{{ platformApplicationForm.retUrl }}</n-descriptions-item>
        </n-descriptions>
        <div class="form-section compact">
          <div class="section-heading">
            <h3>reqData 字段</h3>
            <span>申请提交时进入拉卡拉报文的主体字段</span>
          </div>
        </div>
        <div class="form-grid platform-relation-fields">
          <n-form-item label="机构代码" required>
            <n-input v-model:value="platformApplicationForm.orgCode" maxlength="32" :readonly="platformApplication.status !== 'draft'" />
          </n-form-item>
          <n-form-item label="平台名称" required>
            <n-input v-model:value="platformApplicationForm.platformName" maxlength="64" readonly />
          </n-form-item>
          <n-form-item label="统一社会信用代码" required>
            <n-input v-model:value="platformApplicationForm.licenseNo" maxlength="32" readonly />
          </n-form-item>
          <n-form-item label="法人姓名" required>
            <n-input v-model:value="platformApplicationForm.legalPersonName" maxlength="32" readonly />
          </n-form-item>
          <n-form-item label="联系人" required>
            <n-input v-model:value="platformApplicationForm.contactName" maxlength="32" :readonly="platformApplication.status !== 'draft'" />
          </n-form-item>
          <n-form-item label="联系手机号" required>
            <n-input v-model:value="platformApplicationForm.contactMobile" maxlength="16" :readonly="platformApplication.status !== 'draft'" />
          </n-form-item>
          <n-form-item label="业务回调地址" required class="grid-wide" v-if="platformApplication.status === 'draft'">
            <n-input v-model:value="platformApplicationForm.retUrl" maxlength="128" :readonly="platformApplication.status !== 'draft'" />
          </n-form-item>
        </div>
        <div class="form-section compact">
          <div class="section-heading">
            <h3>平台签约资料</h3>
            <span>营业执照、法人证件及平台合作协议</span>
          </div>
          <n-upload
            v-model:file-list="platformApplicationFiles"
            multiple
            :default-upload="false"
            accept=".jpg,.jpeg,.png,.pdf"
            :disabled="platformApplication.status !== 'draft'"
          >
            <n-button :disabled="platformApplication.status !== 'draft'">选择申请资料 *</n-button>
          </n-upload>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showPlatformApplicationModal = false">
            {{ platformApplication.status === 'draft' ? '取消' : '关闭' }}
          </n-button>
          <n-button v-if="platformApplication.status === 'draft'" type="primary" @click="submitPlatformApplication">
            提交平台申请
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showPlatformChangeModal"
      preset="card"
      title="平台分账主体信息变更"
      class="business-modal"
      :bordered="false"
    >
      <n-alert type="info" :bordered="false" class="modal-alert">
        只变更唯一平台主体资料；平台 ID 保持不变，变更审核不影响已开通主体的使用状态。
      </n-alert>
      <n-form label-placement="top">
        <n-descriptions :column="3" bordered size="small" class="system-fields">
          <n-descriptions-item label="version">1.0</n-descriptions-item>
          <n-descriptions-item label="变更流水">{{ requestOrderNo }}</n-descriptions-item>
          <n-descriptions-item label="platformId">{{ platformApplication.platformId }}</n-descriptions-item>
        </n-descriptions>
        <div class="form-grid platform-relation-fields">
          <n-form-item label="机构代码" required>
            <n-input v-model:value="platformChangeForm.orgCode" maxlength="32" readonly />
          </n-form-item>
          <n-form-item label="平台名称" required>
            <n-input v-model:value="platformChangeForm.platformName" maxlength="64" />
          </n-form-item>
          <n-form-item label="统一社会信用代码" required>
            <n-input v-model:value="platformChangeForm.licenseNo" maxlength="32" />
          </n-form-item>
          <n-form-item label="法人姓名" required>
            <n-input v-model:value="platformChangeForm.legalPersonName" maxlength="32" />
          </n-form-item>
          <n-form-item label="联系人" required>
            <n-input v-model:value="platformChangeForm.contactName" maxlength="32" />
          </n-form-item>
          <n-form-item label="联系手机号" required>
            <n-input v-model:value="platformChangeForm.contactMobile" maxlength="16" />
          </n-form-item>
          <n-form-item label="变更回调地址" required class="grid-wide">
            <n-input v-model:value="platformChangeForm.retUrl" maxlength="128" />
          </n-form-item>
          <n-form-item label="变更原因" required class="grid-wide">
            <n-input
              v-model:value="platformChangeForm.changeReason"
              type="textarea"
              maxlength="128"
              placeholder="例如联系人变更、主体证照信息更新"
            />
          </n-form-item>
        </div>
        <div class="form-section compact">
          <div class="section-heading">
            <h3>变更证明资料</h3>
            <span>上传变更后的营业执照、法人证件或平台补充协议</span>
          </div>
          <n-upload
            v-model:file-list="platformChangeFiles"
            multiple
            :default-upload="false"
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <n-button>选择变更资料 *</n-button>
          </n-upload>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showPlatformChangeModal = false">取消</n-button>
          <n-button type="primary" @click="submitPlatformChange">提交变更申请</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showPlatformRelationModal"
      preset="card"
      title="绑定平台分账关系"
      class="business-modal"
      :bordered="false"
    >
      <n-alert type="info" :bordered="false" class="modal-alert">
        平台关系使用 platformId、ledgerNo 和 ledgerNoType，不与普通商户关系表单共用。
      </n-alert>
      <n-form label-placement="top">
        <n-descriptions :column="2" bordered size="small" class="system-fields">
          <n-descriptions-item label="version">1.0</n-descriptions-item>
          <n-descriptions-item label="outReqNo">{{ requestOrderNo }}</n-descriptions-item>
        </n-descriptions>
        <div class="form-grid platform-relation-fields">
          <n-form-item label="机构代码（orgCode）" required>
            <n-input v-model:value="platformRelationForm.orgCode" maxlength="32" />
          </n-form-item>
          <n-form-item label="分账平台 ID（platformId）" required>
            <n-input v-model:value="platformRelationForm.platformId" maxlength="32" />
          </n-form-item>
          <n-form-item label="绑定方类型（ledgerNoType）" required>
            <n-select v-model:value="platformRelationForm.ledgerNoType" :options="ledgerNoTypeOptions" />
          </n-form-item>
          <n-form-item label="绑定方账号（ledgerNo）" required>
            <n-input
              v-model:value="platformRelationForm.ledgerNo"
              maxlength="32"
              :placeholder="platformRelationForm.ledgerNoType === 'MER' ? '填写分账商户号' : '填写分账接收方账号'"
            />
          </n-form-item>
          <n-form-item label="审核回调地址（retUrl）" required class="grid-wide">
            <n-input v-model:value="platformRelationForm.retUrl" maxlength="128" />
          </n-form-item>
        </div>
        <div class="form-section compact">
          <div class="section-heading">
            <h3>合作协议集合（entrustFileList）</h3>
            <span>平台绑定接口必传，可上传多份协议</span>
          </div>
          <n-upload
            v-model:file-list="platformRelationFiles"
            multiple
            :default-upload="false"
            accept=".jpg,.jpeg,.png,.pdf"
            @update:file-list="handlePlatformRelationFiles"
          >
            <n-button>上传合作协议 *</n-button>
          </n-upload>
          <div class="form-grid upload-result">
            <n-form-item label="协议文件（entrustFileName）" required>
              <n-input :value="platformRelationForm.entrustFileNames.join('、')" readonly />
            </n-form-item>
            <n-form-item label="附件路径（entrustFilePath）" required>
              <n-input :value="platformRelationForm.entrustFilePaths.join('、')" readonly />
            </n-form-item>
          </div>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showPlatformRelationModal = false">取消</n-button>
          <n-button type="primary" @click="submitPlatformRelation">提交平台绑定申请</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showUnbindModal"
      preset="card"
      title="申请解绑分账关系"
      class="business-modal"
      :bordered="false"
    >
      <n-alert type="warning" :bordered="false" class="modal-alert">
        解绑不是即时删除。拉卡拉要求提交解除说明附件、备注和回调地址，审核通过后关系才失效。
      </n-alert>
      <n-form v-if="unbindTarget" label-placement="top">
        <n-descriptions :column="2" bordered size="small" class="system-fields">
          <n-descriptions-item label="分账主体">{{ unbindTarget.merchantName }}</n-descriptions-item>
          <n-descriptions-item label="接收方">{{ unbindTarget.receiverName }}</n-descriptions-item>
          <n-descriptions-item label="平台ID">{{ unbindTarget.merchantNo }}</n-descriptions-item>
          <n-descriptions-item label="receiverNo">{{ unbindTarget.receiverNo }}</n-descriptions-item>
        </n-descriptions>
        <div class="form-grid unbind-fields">
          <n-form-item label="机构代码（orgCode）" required>
            <n-input v-model:value="unbindForm.orgCode" maxlength="32" />
          </n-form-item>
          <n-form-item label="审核回调地址（retUrl）" required>
            <n-input v-model:value="unbindForm.retUrl" maxlength="128" />
          </n-form-item>
          <n-form-item label="备注说明（remark）" required class="grid-wide">
            <n-input
              v-model:value="unbindForm.remark"
              type="textarea"
              maxlength="128"
              show-count
              placeholder="说明解绑原因"
            />
          </n-form-item>
        </div>
        <n-upload
          v-model:file-list="unbindFiles"
          :max="1"
          :default-upload="false"
          accept=".jpg,.jpeg,.png,.pdf"
          @update:file-list="handleUnbindFiles"
        >
          <n-button>上传解除分账说明 *</n-button>
        </n-upload>
        <div class="form-grid upload-result">
          <n-form-item label="附件名称（entrustFileName）" required>
            <n-input v-model:value="unbindForm.entrustFileName" readonly />
          </n-form-item>
          <n-form-item label="附件路径（entrustFilePath）" required>
            <n-input v-model:value="unbindForm.entrustFilePath" readonly placeholder="上传成功后自动回填" />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showUnbindModal = false">取消</n-button>
          <n-button type="error" @click="submitUnbind">提交解绑申请</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="detailTitle"
      class="detail-modal"
      :bordered="false"
    >
      <n-descriptions v-if="detailRows.length" :column="2" bordered size="small">
        <n-descriptions-item v-for="item in detailRows" :key="item.label" :label="item.label">
          {{ item.value }}
        </n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <div class="modal-footer">
          <n-button type="primary" @click="showDetailModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showSupplementModal"
      preset="card"
      title="补充申请资料"
      class="detail-modal"
      :bordered="false"
    >
      <n-alert v-if="supplementTarget" type="warning" :bordered="false" class="modal-alert">
        审核意见：{{ supplementTarget.auditRemark }}
      </n-alert>
      <n-upload
        v-model:file-list="supplementFiles"
        multiple
        :default-upload="false"
        accept=".jpg,.jpeg,.png,.pdf"
      >
        <n-upload-dragger>
          <div class="upload-title">上传补充资料</div>
          <div class="upload-hint">资料会关联到原申请单，不会创建重复申请</div>
        </n-upload-dragger>
      </n-upload>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showSupplementModal = false">取消</n-button>
          <n-button type="primary" @click="submitSupplement">提交补件</n-button>
        </div>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  NAlert,
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  NTag,
  NUpload,
  NUploadDragger,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns, SelectOption, UploadFileInfo } from 'naive-ui'

type ApplicationStatus = 'draft' | 'reviewing' | 'supplement' | 'approved' | 'rejected'
type ReceiverType = 'merchant' | 'agent' | 'cp'
type ReceiverStatus = 'reviewing' | 'supplement' | 'active' | 'rejected'
type RelationStatus = 'reviewing' | 'active' | 'unbinding' | 'rejected'
type ManagementScope = 'platform' | 'merchant'
type LedgerNoType = 'MER' | 'RECEIVER'
type PlatformApplicationStatus = 'draft' | 'reviewing' | 'supplement' | 'approved' | 'rejected'
type PlatformChangeStatus = 'none' | 'reviewing' | 'supplement' | 'approved' | 'rejected'

interface ApplicationRecord {
  id: number
  merchantName: string
  merchantNo: string
  applicationNo: string
  status: ApplicationStatus
  materialProgress: string
  auditRemark: string
  updatedAt: string
}

interface ReceiverRecord {
  id: number
  ownerType: ReceiverType
  ownerName: string
  receiverNo: string
  accountName: string
  bankName: string
  status: ReceiverStatus
  auditRemark: string
  updatedAt: string
}

interface RelationRecord {
  id: number
  merchantName: string
  merchantNo: string
  receiverName: string
  receiverNo: string
  scene: string
  splitMode: string
  applicationNo: string
  status: RelationStatus
  updatedAt: string
}

interface PlatformOwner {
  label: string
  value: number
  type: ReceiverType
  contactMobile: string
  businessRule: string
  acctTypeCode: '57' | '58'
  acctNo: string
  acctName: string
  acctCertificateType: string
  acctCertificateNo: string
  acctOpenBankName: string
  licenseNo?: string
  legalPersonName?: string
  legalPersonCertificateNo?: string
}

interface PlatformRelationRecord {
  id: number
  platformId: string
  ledgerNoType: LedgerNoType
  ledgerNo: string
  ledgerName: string
  applicationNo: string
  status: RelationStatus
  updatedAt: string
}

interface PlatformApplicationRecord {
  platformName: string
  orgCode: string
  applicationNo: string
  applyId: string
  platformId: string
  status: PlatformApplicationStatus
  auditRemark: string
  updatedAt: string
}

interface PlatformChangeApplicationRecord {
  applicationNo: string
  applyId: string
  status: PlatformChangeStatus
  auditRemark: string
  updatedAt: string
}

const message = useMessage()
const route = useRoute()
const managementScope = computed<ManagementScope>(() =>
  route.meta.lakalaScope === 'merchant' ? 'merchant' : 'platform'
)
const activeTab = ref('receivers')
const applicationKeyword = ref('')
const applicationStatusFilter = ref<ApplicationStatus | null>(null)
const receiverKeyword = ref('')
const receiverTypeFilter = ref<ReceiverType | null>(null)
const relationKeyword = ref('')
const relationStatusFilter = ref<RelationStatus | null>(null)

const showApplicationModal = ref(false)
const showReceiverModal = ref(false)
const showRelationModal = ref(false)
const showUnbindModal = ref(false)
const showDetailModal = ref(false)
const showSupplementModal = ref(false)
const showPlatformApplicationModal = ref(false)
const showPlatformRelationModal = ref(false)
const showPlatformChangeModal = ref(false)
const showMerchantChangeModal = ref(false)
const detailTitle = ref('')
const detailRows = ref<Array<{ label: string; value: string }>>([])
const supplementTarget = ref<ApplicationRecord | null>(null)
const unbindTarget = ref<RelationRecord | null>(null)
const merchantChangeTarget = ref<ApplicationRecord | null>(null)
const applicationFiles = ref<UploadFileInfo[]>([])
const receiverFiles = ref<UploadFileInfo[]>([])
const relationFiles = ref<UploadFileInfo[]>([])
const unbindFiles = ref<UploadFileInfo[]>([])
const supplementFiles = ref<UploadFileInfo[]>([])
const merchantChangeFiles = ref<UploadFileInfo[]>([])
const requestOrderNo = ref('')
const requestTime = ref('')

const applicationStatusLabel: Record<ApplicationStatus, string> = {
  draft: '待提交',
  reviewing: '审核中',
  supplement: '待补件',
  approved: '已开通',
  rejected: '已驳回',
}

const receiverTypeLabel: Record<ReceiverType, string> = {
  merchant: '商家',
  agent: '代理商',
  cp: 'CP',
}

const receiverStatusLabel: Record<ReceiverStatus, string> = {
  reviewing: '审核中',
  supplement: '待补件',
  active: '已生效',
  rejected: '已驳回',
}

const relationStatusLabel: Record<RelationStatus, string> = {
  reviewing: '审核中',
  active: '已绑定',
  unbinding: '解绑中',
  rejected: '已驳回',
}
const platformApplicationStatusLabel: Record<PlatformApplicationStatus, string> = {
  draft: '待提交',
  reviewing: '审核中',
  supplement: '待补件',
  approved: '已开通',
  rejected: '已驳回',
}
const platformChangeStatusLabel: Record<PlatformChangeStatus, string> = {
  none: '无变更申请',
  reviewing: '审核中',
  supplement: '待补件',
  approved: '已通过',
  rejected: '已驳回',
}

const applicationStatusOptions: SelectOption[] = Object.entries(applicationStatusLabel).map(([value, label]) => ({ value, label }))
const receiverTypeOptions: SelectOption[] = Object.entries(receiverTypeLabel).map(([value, label]) => ({ value, label }))
const relationStatusOptions: SelectOption[] = Object.entries(relationStatusLabel).map(([value, label]) => ({ value, label }))
const accountTypeOptions: SelectOption[] = [
  { label: '对公账户（57）', value: '57' },
  { label: '对私账户（58）', value: '58' },
]
const certificateTypeOptions: SelectOption[] = [
  { label: '身份证（17）', value: '17' },
  { label: '护照（18）', value: '18' },
  { label: '港澳居民来往内地通行证（19）', value: '19' },
  { label: '台湾居民来往内地通行证（20）', value: '20' },
]
const splitRangeOptions: SelectOption[] = [
  { label: '标记交易分账（MARK，默认）', value: 'MARK' },
  { label: '全部交易分账（ALL）', value: 'ALL' },
]
const fundSourceOptions: SelectOption[] = [
  { label: '交易分账（TR）', value: 'TR' },
  { label: '余额分账（BA）', value: 'BA' },
]
const launchModeOptions: SelectOption[] = [
  { label: '手动分账（MANUAL）', value: 'MANUAL' },
  { label: '自动规则分账（AUTO）', value: 'AUTO' },
  { label: '指定规则分账（POINTRULE）', value: 'POINTRULE' },
]
const ruleSourceOptions: SelectOption[] = [
  { label: '商户分账规则（MER）', value: 'MER' },
  { label: '平台分账规则（PLATFORM）', value: 'PLATFORM' },
]
const settleTypeOptions: SelectOption[] = [
  { label: '主动提款（01）', value: '01' },
  { label: '交易自动结算（03）', value: '03' },
]
const returnAccountOptions: SelectOption[] = [
  { label: '收款账户（01）', value: '01' },
  { label: '分账账户（02）', value: '02' },
  { label: '收款账户 + 分账账户（03）', value: '03' },
]
const credentialModeOptions: SelectOption[] = [
  { label: '上传《结算委托授权书》', value: 'upload' },
  { label: '已完成拉卡拉电子签约', value: 'electronic' },
]
const sceneOptions: SelectOption[] = [
  { label: '商家结算', value: '商家结算' },
  { label: '代理商分润', value: '代理商分润' },
  { label: 'CP 结算', value: 'CP 结算' },
]
const ledgerNoTypeOptions: SelectOption[] = [
  { label: '分账商户（MER）', value: 'MER' },
  { label: '分账接收方（RECEIVER）', value: 'RECEIVER' },
]
const arrivalModeOptions: SelectOption[] = [
  { label: '全额分账（ALL）', value: 'ALL' },
  { label: '净额分账（NET）', value: 'NET' },
]
const feeRangeOptions: SelectOption[] = [
  { label: '全部分账明细（ALL）', value: 'ALL' },
  { label: '分入接收方明细（RECEIVER）', value: 'RECEIVER' },
]
const feeModeOptions: SelectOption[] = [
  { label: '固定金额（AMOUNT）', value: 'AMOUNT' },
  { label: '固定比例（RATIO）', value: 'RATIO' },
]
const attachmentTypeOptions: SelectOption[] = [
  { label: '合作协议（SPLIT_COOPERATION_FILE）', value: 'SPLIT_COOPERATION_FILE' },
  { label: '租赁协议（RENTAL_AGREEMENT）', value: 'RENTAL_AGREEMENT' },
  { label: '其他（OTHERS）', value: 'OTHERS' },
]

const cashierMerchants = [
  { label: '未来空间收银 / 822100000000103', value: '822100000000103', innerNo: '4002021033000000103', name: '未来空间收银' },
  { label: '幻影星空收银 / 822100000000108', value: '822100000000108', innerNo: '4002021033000000108', name: '幻影星空收银' },
  { label: '华东展厅收银 / 822100000000116', value: '822100000000116', innerNo: '4002021033000000116', name: '华东展厅收银' },
]
const cashierMerchantOptions: SelectOption[] = cashierMerchants.map(({ label, value }) => ({ label, value }))

const platformOwners: Record<ReceiverType, PlatformOwner[]> = {
  merchant: [
    { label: '未来空间', value: 101, type: 'merchant', contactMobile: '13900001001', businessRule: '月结 / 手续费 0.5%', acctTypeCode: '57', acctNo: '6214830000001001', acctName: '上海未来空间娱乐有限公司', acctCertificateType: '17', acctCertificateNo: '91310000MA1K00001X', acctOpenBankName: '招商银行上海分行', licenseNo: '91310000MA1K00001X', legalPersonName: '陈未来', legalPersonCertificateNo: '310101198801010011' },
    { label: '幻影星空', value: 102, type: 'merchant', contactMobile: '13900001002', businessRule: '月结 / 手续费 0.5%', acctTypeCode: '57', acctNo: '6214830000001002', acctName: '上海幻影星空科技有限公司', acctCertificateType: '17', acctCertificateNo: '91310000MA1K00002X', acctOpenBankName: '浦发银行上海分行', licenseNo: '91310000MA1K00002X', legalPersonName: '周星空', legalPersonCertificateNo: '310101198802020022' },
    { label: '华东展厅', value: 103, type: 'merchant', contactMobile: '13900001003', businessRule: '月结 / 手续费 0.5%', acctTypeCode: '57', acctNo: '6214830000001003', acctName: '华东展厅娱乐有限公司', acctCertificateType: '17', acctCertificateNo: '91310000MA1K00003X', acctOpenBankName: '中国银行上海分行', licenseNo: '91310000MA1K00003X', legalPersonName: '吴华东', legalPersonCertificateNo: '310101198803030033' },
  ],
  agent: [
    { label: '深圳未来科技', value: 1, type: 'agent', contactMobile: '13800138001', businessRule: '分润 15% / 手续费 0.5%', acctTypeCode: '58', acctNo: '6222021234567890123', acctName: '张伟', acctCertificateType: '17', acctCertificateNo: '440301199001011234', acctOpenBankName: '中国工商银行深圳分行' },
    { label: '北京梦想空间', value: 2, type: 'agent', contactMobile: '13800138002', businessRule: '分润 12% / 手续费 0.5%', acctTypeCode: '58', acctNo: '6227001234567890123', acctName: '李娜', acctCertificateType: '17', acctCertificateNo: '110101199002022345', acctOpenBankName: '中国建设银行北京分行' },
    { label: '上海星际娱乐', value: 3, type: 'agent', contactMobile: '13800138003', businessRule: '分润 18% / 手续费 0.6%', acctTypeCode: '58', acctNo: '', acctName: '', acctCertificateType: '17', acctCertificateNo: '', acctOpenBankName: '' },
  ],
  cp: [
    { label: '极境互动科技', value: 301, type: 'cp', contactMobile: '13700003001', businessRule: '月结 / 手续费 0.5%', acctTypeCode: '57', acctNo: '6214830000003001', acctName: '深圳极境互动科技有限公司', acctCertificateType: '17', acctCertificateNo: '91440300MA5F00001X', acctOpenBankName: '平安银行深圳分行', licenseNo: '91440300MA5F00001X', legalPersonName: '林极境', legalPersonCertificateNo: '440301198901010011' },
    { label: '闪耀游戏工作室', value: 302, type: 'cp', contactMobile: '13700003002', businessRule: '月结 / 手续费 0.5%', acctTypeCode: '58', acctNo: '6222020000003002', acctName: '王闪耀', acctCertificateType: '17', acctCertificateNo: '440301199202020022', acctOpenBankName: '中国工商银行深圳分行' },
  ],
}

const applicationRecords = ref<ApplicationRecord[]>([
  {
    id: 1,
    merchantName: '未来空间收银',
    merchantNo: '822100000000103',
    applicationNo: 'FZT-OPEN-20260718001',
    status: 'approved',
    materialProgress: '6/6',
    auditRemark: '审核通过',
    updatedAt: '2026-07-28 18:10:00',
  },
  {
    id: 2,
    merchantName: '幻影星空收银',
    merchantNo: '822100000000108',
    applicationNo: 'FZT-OPEN-20260722003',
    status: 'supplement',
    materialProgress: '4/6',
    auditRemark: '缺结算委托授权书盖章页',
    updatedAt: '2026-07-30 15:21:00',
  },
  {
    id: 3,
    merchantName: '华东展厅收银',
    merchantNo: '822100000000116',
    applicationNo: 'FZT-OPEN-20260726003',
    status: 'reviewing',
    materialProgress: '6/6',
    auditRemark: '拉卡拉审核中',
    updatedAt: '2026-07-31 09:05:00',
  },
])

const receiverRecords = ref<ReceiverRecord[]>([
  {
    id: 1,
    ownerType: 'merchant',
    ownerName: '未来空间',
    receiverNo: 'LR-00003',
    accountName: '上海未来空间娱乐有限公司',
    bankName: '招商银行上海分行',
    status: 'active',
    auditRemark: '审核通过',
    updatedAt: '2026-07-28 18:20:00',
  },
  {
    id: 2,
    ownerType: 'agent',
    ownerName: '深圳未来科技',
    receiverNo: 'LR-AG-00011',
    accountName: '张伟',
    bankName: '中国工商银行深圳分行',
    status: 'active',
    auditRemark: '审核通过',
    updatedAt: '2026-07-29 11:30:00',
  },
  {
    id: 3,
    ownerType: 'cp',
    ownerName: '极境互动科技',
    receiverNo: '申请后生成',
    accountName: '深圳极境互动科技有限公司',
    bankName: '平安银行深圳分行',
    status: 'reviewing',
    auditRemark: '拉卡拉审核中',
    updatedAt: '2026-07-31 08:40:00',
  },
])

const relationRecords = ref<RelationRecord[]>([
  {
    id: 1,
    merchantName: '头号空间运营平台',
    merchantNo: 'PLAT-THKJ-0001',
    receiverName: '未来空间',
    receiverNo: 'LR-00003',
    scene: '商家结算',
    splitMode: '动态金额',
    applicationNo: 'FZT-BIND-20260728001',
    status: 'active',
    updatedAt: '2026-07-28 18:30:00',
  },
  {
    id: 2,
    merchantName: '头号空间运营平台',
    merchantNo: 'PLAT-THKJ-0001',
    receiverName: '深圳未来科技',
    receiverNo: 'LR-AG-00011',
    scene: '代理商分润',
    splitMode: '动态金额',
    applicationNo: 'FZT-BIND-20260729002',
    status: 'active',
    updatedAt: '2026-07-29 11:40:00',
  },
])

const platformRelationRecords = ref<PlatformRelationRecord[]>([
  {
    id: 1,
    platformId: 'PLAT-THKJ-0001',
    ledgerNoType: 'MER',
    ledgerNo: '822100000000103',
    ledgerName: '未来空间收银',
    applicationNo: 'FZT-PLAT-20260726001',
    status: 'active',
    updatedAt: '2026-07-26 16:20:00',
  },
  {
    id: 2,
    platformId: 'PLAT-THKJ-0001',
    ledgerNoType: 'RECEIVER',
    ledgerNo: 'LR-AG-00011',
    ledgerName: '深圳未来科技',
    applicationNo: 'FZT-PLAT-20260729002',
    status: 'reviewing',
    updatedAt: '2026-07-29 11:45:00',
  },
])

const platformApplication = reactive<PlatformApplicationRecord>({
  platformName: '头号空间运营平台',
  orgCode: '200669',
  applicationNo: '',
  applyId: '',
  platformId: '',
  status: 'draft',
  auditRemark: '平台资料已创建，等待提交申请',
  updatedAt: '2026-07-31 16:50:00',
})
const platformChangeApplication = reactive<PlatformChangeApplicationRecord>({
  applicationNo: '',
  applyId: '',
  status: 'none',
  auditRemark: '',
  updatedAt: '',
})
const platformApplicationStorageKey = 'lakalaPlatformApplicationDemo'
const platformChangeApplicationStorageKey = 'lakalaPlatformChangeApplicationDemo'

const applicationForm = reactive({
  cashierMerchantNo: null as string | null,
  merchantName: '',
  orgCode: '200669',
  merInnerNo: '',
  merCupNo: '',
  contactMobile: '',
  splitLowestRatio: 70 as number | null,
  splitRange: 'MARK',
  sepFundSource: 'BA',
  splitLaunchMode: 'MANUAL',
  splitRuleSource: null as string | null,
  settleType: '01',
  returnAcctModel: null as string | null,
  retUrl: 'https://api.touhaokongjian.com/lakala/split/open/callback',
  credentialMode: 'upload',
  splitEntrustFileName: '',
  splitEntrustFilePath: '',
  eleContractNo: '',
})

const merchantChangeForm = reactive({
  merchantName: '',
  orgCode: '200669',
  merInnerNo: '',
  merCupNo: '',
  contactMobile: '',
  splitLowestRatio: null as number | null,
  splitRange: null as string | null,
  sepFundSource: null as string | null,
  splitLaunchMode: null as string | null,
  splitRuleSource: null as string | null,
  returnAcctModel: null as string | null,
  retUrl: 'https://api.touhaokongjian.com/lakala/split/change/callback',
  eleContractNo: '',
  splitEntrustFileName: '',
  splitEntrustFilePath: '',
  attachType: null as string | null,
  attachName: '',
  attachStorePath: '',
  arrivalMode: null as string | null,
  feeRange: null as string | null,
  feeMode: null as string | null,
  amount: null as number | null,
  ratio: null as number | null,
  feeUpper: null as number | null,
  feeLower: null as number | null,
})

const receiverForm = reactive({
  ownerType: null as ReceiverType | null,
  ownerId: null as number | null,
  ownerName: '',
  orgCode: '200669',
  receiverName: '',
  contactMobile: '',
  acctNo: '',
  acctName: '',
  acctTypeCode: '57',
  acctCertificateType: '17',
  acctCertificateNo: '',
  acctOpenBankCode: '',
  acctOpenBankName: '',
  acctClearBankCode: '',
  licenseNo: '',
  licenseName: '',
  legalPersonName: '',
  legalPersonCertificateType: '17',
  legalPersonCertificateNo: '',
  settleType: '01',
})

const relationForm = reactive({
  orgCode: '200669',
  merchantNo: null as string | null,
  receiverId: null as number | null,
  scene: null as string | null,
  retUrl: 'https://api.touhaokongjian.com/lakala/split/relation/callback',
  entrustFileName: '',
  entrustFilePath: '',
})

const unbindForm = reactive({
  orgCode: '200669',
  retUrl: 'https://api.touhaokongjian.com/lakala/split/relation/callback',
  remark: '',
  entrustFileName: '',
  entrustFilePath: '',
})
const platformRelationFiles = ref<UploadFileInfo[]>([])
const platformApplicationFiles = ref<UploadFileInfo[]>([])
const platformChangeFiles = ref<UploadFileInfo[]>([])
const platformApplicationForm = reactive({
  orgCode: '200669',
  platformName: '头号空间运营平台',
  licenseNo: '91310000MA1THKJ01X',
  legalPersonName: '平台负责人',
  contactName: '平台运营',
  contactMobile: '13800000000',
  retUrl: 'https://api.touhaokongjian.com/lakala/split/platform/callback',
})
const platformChangeForm = reactive({
  orgCode: '200669',
  platformName: '头号空间运营平台',
  licenseNo: '91310000MA1THKJ01X',
  legalPersonName: '平台负责人',
  contactName: '平台运营',
  contactMobile: '13800000000',
  retUrl: 'https://api.touhaokongjian.com/lakala/split/platform-change/callback',
  changeReason: '',
})
const platformRelationForm = reactive({
  orgCode: '200669',
  platformId: 'PLAT-THKJ-0001',
  ledgerNoType: 'MER' as LedgerNoType,
  ledgerNo: '',
  retUrl: 'https://api.touhaokongjian.com/lakala/split/platform-relation/callback',
  entrustFileNames: [] as string[],
  entrustFilePaths: [] as string[],
})

const filteredApplications = computed(() => applicationRecords.value.filter((item) => {
  const keyword = applicationKeyword.value.trim().toLowerCase()
  const matchesKeyword = !keyword || item.merchantName.toLowerCase().includes(keyword) || item.merchantNo.includes(keyword)
  const matchesStatus = !applicationStatusFilter.value || item.status === applicationStatusFilter.value
  return matchesKeyword && matchesStatus
}))

const filteredReceivers = computed(() => receiverRecords.value.filter((item) => {
  const keyword = receiverKeyword.value.trim().toLowerCase()
  const matchesKeyword = !keyword || item.ownerName.toLowerCase().includes(keyword) || item.receiverNo.toLowerCase().includes(keyword)
  const matchesType = !receiverTypeFilter.value || item.ownerType === receiverTypeFilter.value
  return matchesKeyword && matchesType
}))

const filteredRelations = computed(() => relationRecords.value.filter((item) => {
  const keyword = relationKeyword.value.trim().toLowerCase()
  const matchesKeyword = !keyword || item.merchantName.toLowerCase().includes(keyword) || item.receiverName.toLowerCase().includes(keyword)
  const matchesStatus = !relationStatusFilter.value || item.status === relationStatusFilter.value
  return matchesKeyword && matchesStatus
}))

const availableOwnerOptions = computed<SelectOption[]>(() => {
  if (!receiverForm.ownerType) return []
  return platformOwners[receiverForm.ownerType].map(({ label, value }) => ({ label, value }))
})

const selectedPlatformOwner = computed(() => {
  if (!receiverForm.ownerType || !receiverForm.ownerId) return null
  return platformOwners[receiverForm.ownerType].find((item) => item.value === receiverForm.ownerId) || null
})

const selectedExistingReceiver = computed(() => {
  if (!selectedPlatformOwner.value) return null
  return receiverRecords.value.find((item) =>
    item.ownerType === selectedPlatformOwner.value?.type
    && item.ownerName === selectedPlatformOwner.value?.label
  ) || null
})

const approvedMerchantOptions = computed<SelectOption[]>(() =>
  applicationRecords.value
    .filter((item) => item.status === 'approved')
    .map((item) => ({ label: `${item.merchantName} / ${item.merchantNo}`, value: item.merchantNo }))
)

const activeReceiverOptions = computed<SelectOption[]>(() =>
  receiverRecords.value
    .filter((item) => item.status === 'active')
    .map((item) => ({ label: `${item.ownerName} / ${item.receiverNo}`, value: item.id }))
)

const selectedRelationReceiver = computed(() =>
  receiverRecords.value.find((item) => item.id === relationForm.receiverId)
)

const readinessSteps = computed(() => {
  const activeReceivers = receiverRecords.value.filter((item) => item.status === 'active').length
  const activeRelations = relationRecords.value.filter((item) => item.status === 'active').length
  return [
    {
      tab: 'receivers',
      title: '接收方审核',
      summary: `${activeReceivers} 个接收方已生效`,
      status: activeReceivers ? '进行中' : '待创建',
      type: activeReceivers ? 'info' as const : 'warning' as const,
    },
    {
      tab: 'relations',
      title: '关系绑定',
      summary: `${activeRelations} 条关系可用于分账`,
      status: activeRelations ? '可分账' : '待绑定',
      type: activeRelations ? 'success' as const : 'warning' as const,
    },
  ]
})

const pageDescription = computed(() =>
  managementScope.value === 'platform'
    ? '创建唯一平台分账主体，提交申请并接收审核结果'
    : '管理唯一平台分账主体下的接收方、关系绑定和回执'
)

const pageTitle = computed(() =>
  managementScope.value === 'platform' ? '分账主体开通' : '接收方与分账关系'
)

const primaryActionLabel = computed(() => {
  if (managementScope.value === 'platform') {
    return platformApplication.status === 'draft' ? '提交平台申请' : '查看申请报文'
  }
  if (activeTab.value === 'receivers') return '新建接收方'
  if (activeTab.value === 'relations') return '绑定关系'
  return '新建接收方'
})

function tagType(status: ApplicationStatus | ReceiverStatus | RelationStatus) {
  if (status === 'approved' || status === 'active') return 'success' as const
  if (status === 'rejected') return 'error' as const
  if (status === 'supplement' || status === 'unbinding') return 'warning' as const
  return 'info' as const
}

function applicationTagType(status: PlatformApplicationStatus) {
  if (status === 'approved') return 'success' as const
  if (status === 'rejected') return 'error' as const
  if (status === 'supplement') return 'warning' as const
  if (status === 'reviewing') return 'info' as const
  return 'default' as const
}

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function refreshRequestMeta() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  requestTime.value = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  requestOrderNo.value = `${requestTime.value}${String(date.getTime()).slice(-8)}`
}

function openPrimaryAction() {
  refreshRequestMeta()
  if (managementScope.value === 'platform') {
    showPlatformApplicationModal.value = true
    return
  }
  if (activeTab.value === 'receivers') {
    showReceiverModal.value = true
    return
  }
  if (activeTab.value === 'relations') {
    showRelationModal.value = true
    return
  }
  showReceiverModal.value = true
}

function submitPlatformApplication() {
  if (
    !platformApplicationForm.orgCode
    || !platformApplicationForm.platformName
    || !platformApplicationForm.licenseNo
    || !platformApplicationForm.legalPersonName
    || !platformApplicationForm.contactName
    || !platformApplicationForm.contactMobile
    || !platformApplicationForm.retUrl
    || !platformApplicationFiles.value.length
  ) {
    message.error('请填写完整的平台申请信息并上传签约资料')
    return
  }
  Object.assign(platformApplication, {
    platformName: platformApplicationForm.platformName,
    orgCode: platformApplicationForm.orgCode,
    applicationNo: requestOrderNo.value,
    applyId: `APPLY-${String(Date.now()).slice(-10)}`,
    status: 'reviewing',
    auditRemark: '申请已受理，等待拉卡拉审核回执',
    updatedAt: now(),
  })
  showPlatformApplicationModal.value = false
  message.success('平台分账主体申请已提交')
}

function openPlatformChange() {
  if (platformApplication.status !== 'approved' || !platformApplication.platformId) {
    message.error('平台主体审核通过后才能发起信息变更')
    return
  }
  refreshRequestMeta()
  Object.assign(platformChangeForm, {
    orgCode: platformApplication.orgCode,
    platformName: platformApplication.platformName,
    licenseNo: platformApplicationForm.licenseNo,
    legalPersonName: platformApplicationForm.legalPersonName,
    contactName: platformApplicationForm.contactName,
    contactMobile: platformApplicationForm.contactMobile,
    retUrl: 'https://api.touhaokongjian.com/lakala/split/platform-change/callback',
    changeReason: '',
  })
  platformChangeFiles.value = []
  showPlatformChangeModal.value = true
}

function submitPlatformChange() {
  if (
    !platformApplication.platformId
    || !platformChangeForm.orgCode
    || !platformChangeForm.platformName
    || !platformChangeForm.licenseNo
    || !platformChangeForm.legalPersonName
    || !platformChangeForm.contactName
    || !platformChangeForm.contactMobile
    || !platformChangeForm.retUrl
    || !platformChangeForm.changeReason
    || !platformChangeFiles.value.length
  ) {
    message.error('请填写完整的平台主体变更信息并上传证明资料')
    return
  }
  Object.assign(platformChangeApplication, {
    applicationNo: requestOrderNo.value,
    applyId: `CHANGE-${String(Date.now()).slice(-10)}`,
    status: 'reviewing',
    auditRemark: '平台主体信息变更申请已受理，等待拉卡拉审核回执',
    updatedAt: now(),
  })
  showPlatformChangeModal.value = false
  message.success('平台主体信息变更申请已提交')
}

function simulatePlatformApproval() {
  refreshRequestMeta()
  if (platformChangeApplication.status === 'reviewing') {
    Object.assign(platformApplication, {
      platformName: platformChangeForm.platformName,
      orgCode: platformChangeForm.orgCode,
      auditRemark: '平台主体已开通；最近一次信息变更审核通过',
      updatedAt: now(),
    })
    Object.assign(platformApplicationForm, {
      orgCode: platformChangeForm.orgCode,
      platformName: platformChangeForm.platformName,
      licenseNo: platformChangeForm.licenseNo,
      legalPersonName: platformChangeForm.legalPersonName,
      contactName: platformChangeForm.contactName,
      contactMobile: platformChangeForm.contactMobile,
    })
    Object.assign(platformChangeApplication, {
      status: 'approved',
      auditRemark: '模拟回调：主体信息变更审核通过',
      updatedAt: now(),
    })
    message.success('已模拟平台主体变更审核通过回调')
    return
  }
  Object.assign(platformApplication, {
    platformName: platformApplicationForm.platformName,
    orgCode: platformApplicationForm.orgCode,
    applicationNo: platformApplication.applicationNo || requestOrderNo.value,
    applyId: platformApplication.applyId || `APPLY-${String(Date.now()).slice(-10)}`,
    platformId: 'PLAT-THKJ-0001',
    status: 'approved',
    auditRemark: '模拟回调：审核通过，平台分账主体已开通',
    updatedAt: now(),
  })
  message.success('已模拟拉卡拉审核通过回调')
}

function resetPlatformApplicationTest() {
  Object.assign(platformApplication, {
    platformName: '头号空间运营平台',
    orgCode: '200669',
    applicationNo: '',
    applyId: '',
    platformId: '',
    status: 'draft',
    auditRemark: '平台资料已创建，等待提交申请',
    updatedAt: now(),
  })
  platformApplicationFiles.value = []
  platformChangeFiles.value = []
  Object.assign(platformApplicationForm, {
    orgCode: '200669',
    platformName: '头号空间运营平台',
    licenseNo: '91310000MA1THKJ01X',
    legalPersonName: '平台负责人',
    contactName: '平台运营',
    contactMobile: '13800000000',
    retUrl: 'https://api.touhaokongjian.com/lakala/split/platform/callback',
  })
  Object.assign(platformChangeApplication, {
    applicationNo: '',
    applyId: '',
    status: 'none',
    auditRemark: '',
    updatedAt: '',
  })
  message.info('平台主体测试状态已重置')
}

onMounted(() => {
  const saved = localStorage.getItem(platformApplicationStorageKey)
  if (saved) {
    try {
      Object.assign(platformApplication, JSON.parse(saved))
    } catch {
      localStorage.removeItem(platformApplicationStorageKey)
    }
  }
  const savedChange = localStorage.getItem(platformChangeApplicationStorageKey)
  if (savedChange) {
    try {
      Object.assign(platformChangeApplication, JSON.parse(savedChange))
    } catch {
      localStorage.removeItem(platformChangeApplicationStorageKey)
    }
  }
})

watch(
  platformApplication,
  (value) => localStorage.setItem(platformApplicationStorageKey, JSON.stringify(value)),
  { deep: true }
)

watch(
  platformChangeApplication,
  (value) => localStorage.setItem(platformChangeApplicationStorageKey, JSON.stringify(value)),
  { deep: true }
)

function handlePlatformRelationFiles(files: UploadFileInfo[]) {
  platformRelationForm.entrustFileNames = files.map((file) => file.name)
  platformRelationForm.entrustFilePaths = files.map((file) => uploadedPath(file, 'PLATFORM-BIND'))
}

function submitPlatformRelation() {
  if (
    !platformRelationForm.orgCode
    || !platformRelationForm.platformId
    || !platformRelationForm.ledgerNoType
    || !platformRelationForm.ledgerNo
    || !platformRelationForm.retUrl
    || !platformRelationForm.entrustFileNames.length
  ) {
    message.error('请填写平台、绑定方、回调地址并上传合作协议')
    return
  }
  platformRelationRecords.value.unshift({
    id: Date.now(),
    platformId: platformRelationForm.platformId,
    ledgerNoType: platformRelationForm.ledgerNoType,
    ledgerNo: platformRelationForm.ledgerNo,
    ledgerName: '申请后同步',
    applicationNo: requestOrderNo.value,
    status: 'reviewing',
    updatedAt: now(),
  })
  Object.assign(platformRelationForm, {
    ledgerNoType: 'MER',
    ledgerNo: '',
    entrustFileNames: [],
    entrustFilePaths: [],
  })
  platformRelationFiles.value = []
  showPlatformRelationModal.value = false
  message.success('平台分账关系绑定申请已提交')
}

function fillCashierMerchant(value: string) {
  const merchant = cashierMerchants.find((item) => item.value === value)
  applicationForm.merchantName = merchant?.name || ''
  applicationForm.merInnerNo = merchant?.innerNo || ''
  applicationForm.merCupNo = merchant?.value || ''
}

function fillReceiverOwner(value: number) {
  if (!receiverForm.ownerType) return
  const owner = platformOwners[receiverForm.ownerType].find((item) => item.value === value)
  receiverForm.ownerName = owner?.label || ''
  receiverForm.receiverName = owner?.label || ''
  receiverForm.contactMobile = owner?.contactMobile || ''
  receiverForm.acctTypeCode = owner?.acctTypeCode || '57'
  receiverForm.acctNo = owner?.acctNo || ''
  receiverForm.acctName = owner?.acctName || ''
  receiverForm.acctCertificateType = owner?.acctCertificateType || '17'
  receiverForm.acctCertificateNo = owner?.acctCertificateNo || ''
  receiverForm.acctOpenBankName = owner?.acctOpenBankName || ''
  receiverForm.licenseNo = owner?.licenseNo || ''
  receiverForm.licenseName = owner?.acctName || ''
  receiverForm.legalPersonName = owner?.legalPersonName || ''
  receiverForm.legalPersonCertificateNo = owner?.legalPersonCertificateNo || ''
}

function changeReceiverType() {
  resetReceiverSourceFields()
  receiverForm.ownerId = null
}

function resetReceiverSourceFields() {
  Object.assign(receiverForm, {
    ownerName: '',
    receiverName: '',
    contactMobile: '',
    acctNo: '',
    acctName: '',
    acctTypeCode: '57',
    acctCertificateType: '17',
    acctCertificateNo: '',
    acctOpenBankName: '',
    licenseNo: '',
    licenseName: '',
    legalPersonName: '',
    legalPersonCertificateType: '17',
    legalPersonCertificateNo: '',
  })
}

function uploadedPath(file: UploadFileInfo | undefined, prefix: string) {
  if (!file?.name) return ''
  return `G1/M00/SPLIT/${prefix}/${Date.now()}-${file.name}`
}

function handleApplicationEntrustFiles(files: UploadFileInfo[]) {
  const file = files[0]
  applicationForm.splitEntrustFileName = file?.name || ''
  applicationForm.splitEntrustFilePath = uploadedPath(file, 'OPEN')
}

function handleMerchantChangeEntrustFiles(files: UploadFileInfo[]) {
  const file = files[0]
  merchantChangeForm.splitEntrustFileName = file?.name || ''
  merchantChangeForm.splitEntrustFilePath = uploadedPath(file, 'CHANGE')
  if (!merchantChangeForm.attachName) {
    merchantChangeForm.attachName = file?.name || ''
  }
}

function handleRelationFiles(files: UploadFileInfo[]) {
  const file = files[0]
  relationForm.entrustFileName = file?.name || ''
  relationForm.entrustFilePath = uploadedPath(file, 'BIND')
}

function handleUnbindFiles(files: UploadFileInfo[]) {
  const file = files[0]
  unbindForm.entrustFileName = file?.name || ''
  unbindForm.entrustFilePath = uploadedPath(file, 'UNBIND')
}

function resetApplicationForm() {
  Object.assign(applicationForm, {
    cashierMerchantNo: null,
    merchantName: '',
    orgCode: '200669',
    merInnerNo: '',
    merCupNo: '',
    contactMobile: '',
    splitLowestRatio: 70,
    splitRange: 'MARK',
    sepFundSource: 'BA',
    splitLaunchMode: 'MANUAL',
    splitRuleSource: null,
    settleType: '01',
    returnAcctModel: null,
    retUrl: 'https://api.touhaokongjian.com/lakala/split/open/callback',
    credentialMode: 'upload',
    splitEntrustFileName: '',
    splitEntrustFilePath: '',
    eleContractNo: '',
  })
  applicationFiles.value = []
}

function resetMerchantChangeForm() {
  Object.assign(merchantChangeForm, {
    merchantName: '',
    orgCode: '200669',
    merInnerNo: '',
    merCupNo: '',
    contactMobile: '',
    splitLowestRatio: null,
    splitRange: null,
    sepFundSource: null,
    splitLaunchMode: null,
    splitRuleSource: null,
    returnAcctModel: null,
    retUrl: 'https://api.touhaokongjian.com/lakala/split/change/callback',
    eleContractNo: '',
    splitEntrustFileName: '',
    splitEntrustFilePath: '',
    attachType: null,
    attachName: '',
    attachStorePath: '',
    arrivalMode: null,
    feeRange: null,
    feeMode: null,
    amount: null,
    ratio: null,
    feeUpper: null,
    feeLower: null,
  })
  merchantChangeFiles.value = []
}

function resetReceiverForm() {
  Object.assign(receiverForm, {
    ownerType: null,
    ownerId: null,
    ownerName: '',
    orgCode: '200669',
    receiverName: '',
    contactMobile: '',
    acctNo: '',
    acctName: '',
    acctTypeCode: '57',
    acctCertificateType: '17',
    acctCertificateNo: '',
    acctOpenBankCode: '',
    acctOpenBankName: '',
    acctClearBankCode: '',
    licenseNo: '',
    licenseName: '',
    legalPersonName: '',
    legalPersonCertificateType: '17',
    legalPersonCertificateNo: '',
    settleType: '01',
  })
  receiverFiles.value = []
}

function submitApplication() {
  if (
    !applicationForm.orgCode
    || !applicationForm.cashierMerchantNo
    || (!applicationForm.merInnerNo && !applicationForm.merCupNo)
    || !applicationForm.contactMobile
    || !applicationForm.retUrl
  ) {
    message.error('请填写完整的商户、机构、手机号和回调地址')
    return
  }
  if (
    applicationForm.splitLaunchMode !== 'MANUAL'
    && !applicationForm.splitRuleSource
  ) {
    message.error('自动规则或指定规则分账必须选择分账规则来源')
    return
  }
  if (
    applicationForm.credentialMode === 'upload'
    && (!applicationForm.splitEntrustFileName || !applicationForm.splitEntrustFilePath)
  ) {
    message.error('请上传《结算委托授权书》')
    return
  }
  if (applicationForm.credentialMode === 'electronic' && !applicationForm.eleContractNo) {
    message.error('请填写电子合同编号')
    return
  }
  applicationRecords.value.unshift({
    id: Date.now(),
    merchantName: applicationForm.merchantName,
    merchantNo: applicationForm.cashierMerchantNo,
    applicationNo: requestOrderNo.value,
    status: 'reviewing',
    materialProgress: applicationForm.credentialMode === 'upload' ? '委托书已上传' : '电子合同',
    auditRemark: '已提交，等待拉卡拉审核',
    updatedAt: now(),
  })
  showApplicationModal.value = false
  resetApplicationForm()
  message.success('分账业务开通申请已提交')
}

function openMerchantChange(row: ApplicationRecord) {
  refreshRequestMeta()
  merchantChangeTarget.value = row
  const merchant = cashierMerchants.find((item) => item.value === row.merchantNo)
  resetMerchantChangeForm()
  Object.assign(merchantChangeForm, {
    merchantName: row.merchantName,
    orgCode: '200669',
    merInnerNo: merchant?.innerNo || '',
    merCupNo: row.merchantNo,
    contactMobile: '',
    splitLowestRatio: null,
    splitRange: null,
    sepFundSource: null,
    splitLaunchMode: null,
    splitRuleSource: null,
    retUrl: 'https://api.touhaokongjian.com/lakala/split/change/callback',
  })
  showMerchantChangeModal.value = true
}

function submitMerchantChange() {
  if (
    !merchantChangeTarget.value
    || !merchantChangeForm.orgCode
    || (!merchantChangeForm.merInnerNo && !merchantChangeForm.merCupNo)
    || !merchantChangeForm.retUrl
  ) {
    message.error('请确认机构代码、商户号和回调地址')
    return
  }
  if (
    merchantChangeForm.splitLaunchMode
    && merchantChangeForm.splitLaunchMode !== 'MANUAL'
    && !merchantChangeForm.splitRuleSource
  ) {
    message.error('自动规则或指定规则分账必须选择分账规则来源')
    return
  }
  if (
    merchantChangeForm.splitLowestRatio !== null
    && (!merchantChangeForm.splitEntrustFileName || !merchantChangeForm.splitEntrustFilePath)
  ) {
    message.error('变更最低分账比例时，请上传新的《结算委托授权书》')
    return
  }
  if (
    merchantChangeForm.attachType
    && (!merchantChangeForm.attachName || !merchantChangeForm.attachStorePath)
  ) {
    message.error('填写附加资料类型时，请同步填写附加资料名称和路径')
    return
  }
  if (
    (merchantChangeForm.arrivalMode || merchantChangeForm.feeRange || merchantChangeForm.feeMode)
    && (!merchantChangeForm.arrivalMode || !merchantChangeForm.feeRange || !merchantChangeForm.feeMode)
  ) {
    message.error('计费规则需同时填写到账模式、计费范围和计费模式')
    return
  }
  if (merchantChangeForm.feeMode === 'AMOUNT' && merchantChangeForm.amount === null) {
    message.error('固定金额计费模式需填写 amount')
    return
  }
  if (merchantChangeForm.feeMode === 'RATIO' && merchantChangeForm.ratio === null) {
    message.error('固定比例计费模式需填写 ratio')
    return
  }

  merchantChangeTarget.value.applicationNo = requestOrderNo.value
  merchantChangeTarget.value.status = 'reviewing'
  merchantChangeTarget.value.materialProgress = merchantChangeForm.splitEntrustFileName ? '变更委托书已上传' : '变更资料已提交'
  merchantChangeTarget.value.auditRemark = '分账信息变更申请已提交，等待拉卡拉审核'
  merchantChangeTarget.value.updatedAt = now()
  showMerchantChangeModal.value = false
  resetMerchantChangeForm()
  message.success('商户分账信息变更申请已提交')
}

function submitReceiver() {
  if (selectedExistingReceiver.value) {
    message.info('该主体已创建拉卡拉接收方，无需重复申请')
    return
  }
  if (
    !receiverForm.ownerType
    || !receiverForm.ownerId
    || !receiverForm.orgCode
    || !receiverForm.receiverName
    || !receiverForm.contactMobile
    || !receiverForm.acctNo
    || !receiverForm.acctName
    || !receiverForm.acctTypeCode
    || !receiverForm.acctCertificateType
    || !receiverForm.acctCertificateNo
    || !receiverForm.acctOpenBankCode
    || !receiverForm.acctOpenBankName
    || !receiverForm.acctClearBankCode
  ) {
    message.error('请填写完整的接收方、账户、证件和银行行号信息')
    return
  }
  if (
    receiverForm.acctTypeCode === '57'
    && (
      !receiverForm.licenseNo
      || !receiverForm.licenseName
      || !receiverForm.legalPersonName
      || !receiverForm.legalPersonCertificateType
      || !receiverForm.legalPersonCertificateNo
    )
  ) {
    message.error('对公账户必须填写营业执照和法人信息')
    return
  }
  receiverRecords.value.unshift({
    id: Date.now(),
    ownerType: receiverForm.ownerType,
    ownerName: receiverForm.ownerName,
    receiverNo: '申请后生成',
    accountName: receiverForm.acctName,
    bankName: receiverForm.acctOpenBankName,
    status: 'reviewing',
    auditRemark: '已提交，等待拉卡拉审核',
    updatedAt: now(),
  })
  showReceiverModal.value = false
  resetReceiverForm()
  message.success('接收方创建申请已提交')
}

function submitRelation() {
  const receiver = receiverRecords.value.find((item) => item.id === relationForm.receiverId)
  if (platformApplication.status !== 'approved' || !platformApplication.platformId) {
    message.error('请先完成唯一平台分账主体审核')
    return
  }
  if (!relationForm.orgCode || !receiver || !relationForm.scene || !relationForm.retUrl) {
    message.error('请填写机构代码、接收方、业务场景和回调地址')
    return
  }
  if (!relationForm.entrustFileName || !relationForm.entrustFilePath) {
    message.error('请上传合作协议附件')
    return
  }
  relationRecords.value.unshift({
    id: Date.now(),
    merchantName: platformApplication.platformName,
    merchantNo: platformApplication.platformId,
    receiverName: receiver.ownerName,
    receiverNo: receiver.receiverNo,
    scene: relationForm.scene,
    splitMode: '动态金额',
    applicationNo: requestOrderNo.value,
    status: 'reviewing',
    updatedAt: now(),
  })
  Object.assign(relationForm, {
    orgCode: '200669',
    receiverId: null,
    scene: null,
    retUrl: 'https://api.touhaokongjian.com/lakala/split/relation/callback',
    entrustFileName: '',
    entrustFilePath: '',
  })
  relationFiles.value = []
  showRelationModal.value = false
  message.success('分账关系绑定申请已提交')
}

function showApplicationDetail(row: ApplicationRecord) {
  detailTitle.value = '分账商户开通详情'
  detailRows.value = [
    { label: '收银商户', value: row.merchantName },
    { label: '商户号', value: row.merchantNo },
    { label: '申请单号', value: row.applicationNo },
    { label: '申请状态', value: applicationStatusLabel[row.status] },
    { label: '资料进度', value: row.materialProgress },
    { label: '审核意见', value: row.auditRemark },
    { label: '更新时间', value: row.updatedAt },
  ]
  showDetailModal.value = true
}

function queryMerchantSplitInfo(row: ApplicationRecord) {
  refreshRequestMeta()
  const merchant = cashierMerchants.find((item) => item.value === row.merchantNo)
  row.updatedAt = now()
  detailTitle.value = '商户分账信息查询结果'
  detailRows.value = [
    { label: '接口', value: 'queryLedgerMer' },
    { label: 'orderNo', value: requestOrderNo.value },
    { label: 'orgCode', value: '200669' },
    { label: 'merInnerNo', value: merchant?.innerNo || '未配置' },
    { label: 'merCupNo', value: row.merchantNo },
    { label: '开通状态', value: applicationStatusLabel[row.status] },
    { label: '最低分账比例', value: row.status === 'approved' ? '70%' : '待拉卡拉返回' },
    { label: '分账范围', value: row.status === 'approved' ? 'MARK' : '待拉卡拉返回' },
    { label: '分账依据', value: row.status === 'approved' ? 'BA' : '待拉卡拉返回' },
    { label: '分账发起方式', value: row.status === 'approved' ? 'MANUAL' : '待拉卡拉返回' },
    { label: '审核意见', value: row.auditRemark },
    { label: '查询时间', value: row.updatedAt },
  ]
  showDetailModal.value = true
  message.success('商户分账信息已查询')
}

function showReceiverDetail(row: ReceiverRecord) {
  detailTitle.value = '分账接收方详情'
  detailRows.value = [
    { label: '平台主体', value: row.ownerName },
    { label: '主体类型', value: receiverTypeLabel[row.ownerType] },
    { label: '接收方编号', value: row.receiverNo },
    { label: '账户名称', value: row.accountName },
    { label: '开户银行', value: row.bankName },
    { label: '状态', value: receiverStatusLabel[row.status] },
    { label: '审核意见', value: row.auditRemark },
    { label: '更新时间', value: row.updatedAt },
  ]
  showDetailModal.value = true
}

function showRelationDetail(row: RelationRecord) {
  detailTitle.value = '分账关系详情'
  detailRows.value = [
    { label: '分账主体', value: `${row.merchantName} / ${row.merchantNo}` },
    { label: '接收方', value: `${row.receiverName} / ${row.receiverNo}` },
    { label: '结算场景', value: row.scene },
    { label: '分账方式', value: row.splitMode },
    { label: '申请单号', value: row.applicationNo },
    { label: '状态', value: relationStatusLabel[row.status] },
    { label: '更新时间', value: row.updatedAt },
  ]
  showDetailModal.value = true
}

function openSupplement(row: ApplicationRecord) {
  supplementTarget.value = row
  supplementFiles.value = []
  showSupplementModal.value = true
}

function submitSupplement() {
  if (!supplementTarget.value || !supplementFiles.value.length) {
    message.error('请选择需要补充的资料')
    return
  }
  supplementTarget.value.status = 'reviewing'
  supplementTarget.value.materialProgress = '6/6'
  supplementTarget.value.auditRemark = '补件已提交，等待重新审核'
  supplementTarget.value.updatedAt = now()
  showSupplementModal.value = false
  message.success('补充资料已提交到原申请单')
}

function syncStatus(label: string, row: { updatedAt: string }) {
  row.updatedAt = now()
  message.success(`${label}状态已同步`)
}

function openUnbind(row: RelationRecord) {
  refreshRequestMeta()
  unbindTarget.value = row
  Object.assign(unbindForm, {
    orgCode: '200669',
    retUrl: 'https://api.touhaokongjian.com/lakala/split/relation/callback',
    remark: '',
    entrustFileName: '',
    entrustFilePath: '',
  })
  unbindFiles.value = []
  showUnbindModal.value = true
}

function submitUnbind() {
  if (
    !unbindTarget.value
    || !unbindForm.orgCode
    || !unbindForm.retUrl
    || !unbindForm.remark
    || !unbindForm.entrustFileName
    || !unbindForm.entrustFilePath
  ) {
    message.error('请填写机构代码、回调地址、备注并上传解除分账说明')
    return
  }
  unbindTarget.value.status = 'unbinding'
  unbindTarget.value.updatedAt = now()
  showUnbindModal.value = false
  message.success('解绑申请已提交')
}

const applicationColumns: DataTableColumns<ApplicationRecord> = [
  { title: '收银商户', key: 'merchantName', width: 160 },
  { title: '商户号', key: 'merchantNo', width: 170 },
  { title: '申请单号', key: 'applicationNo', width: 210 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(NTag, { size: 'small', type: tagType(row.status), bordered: false }, () => applicationStatusLabel[row.status]),
  },
  { title: '资料', key: 'materialProgress', width: 90 },
  { title: '审核意见', key: 'auditRemark', width: 260 },
  { title: '更新时间', key: 'updatedAt', width: 170 },
  {
    title: '操作',
    key: 'action',
    width: 260,
    fixed: 'right',
    render: (row) => h(NSpace, { size: 12 }, () => [
      h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => showApplicationDetail(row) }, () => '详情'),
      h(NButton, { size: 'tiny', text: true, onClick: () => queryMerchantSplitInfo(row) }, () => '查询分账信息'),
      row.status === 'approved'
        ? h(NButton, { size: 'tiny', text: true, type: 'warning', onClick: () => openMerchantChange(row) }, () => '变更')
        : null,
      row.status === 'supplement'
        ? h(NButton, { size: 'tiny', text: true, type: 'warning', onClick: () => openSupplement(row) }, () => '补资料')
        : null,
    ]),
  },
]

const receiverColumns: DataTableColumns<ReceiverRecord> = [
  {
    title: '主体类型',
    key: 'ownerType',
    width: 100,
    render: (row) => h(NTag, { size: 'small', bordered: false }, () => receiverTypeLabel[row.ownerType]),
  },
  { title: '平台主体', key: 'ownerName', width: 170 },
  { title: '接收方编号', key: 'receiverNo', width: 160 },
  { title: '账户名称', key: 'accountName', width: 230 },
  { title: '开户银行', key: 'bankName', width: 180 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(NTag, { size: 'small', type: tagType(row.status), bordered: false }, () => receiverStatusLabel[row.status]),
  },
  { title: '更新时间', key: 'updatedAt', width: 170 },
  {
    title: '操作',
    key: 'action',
    width: 160,
    fixed: 'right',
    render: (row) => h(NSpace, { size: 12 }, () => [
      h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => showReceiverDetail(row) }, () => '详情'),
      h(NButton, { size: 'tiny', text: true, onClick: () => syncStatus('接收方', row) }, () => '同步状态'),
    ]),
  },
]

const relationColumns: DataTableColumns<RelationRecord> = [
  { title: '分账主体', key: 'merchantName', width: 170 },
  { title: '接收方', key: 'receiverName', width: 170 },
  { title: '接收方编号', key: 'receiverNo', width: 150 },
  { title: '结算场景', key: 'scene', width: 130 },
  { title: '分账方式', key: 'splitMode', width: 110 },
  { title: '申请单号', key: 'applicationNo', width: 210 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(NTag, { size: 'small', type: tagType(row.status), bordered: false }, () => relationStatusLabel[row.status]),
  },
  { title: '更新时间', key: 'updatedAt', width: 170 },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
    render: (row) => h(NSpace, { size: 12 }, () => [
      h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => showRelationDetail(row) }, () => '详情'),
      row.status === 'active'
        ? h(NButton, { size: 'tiny', text: true, type: 'error', onClick: () => openUnbind(row) }, () => '申请解绑')
        : h(NButton, { size: 'tiny', text: true, onClick: () => syncStatus('绑定关系', row) }, () => '同步状态'),
    ]),
  },
]

const platformRelationColumns: DataTableColumns<PlatformRelationRecord> = [
  {
    title: '绑定方类型',
    key: 'ledgerNoType',
    width: 130,
    render: (row) => row.ledgerNoType === 'MER' ? '分账商户' : '分账接收方',
  },
  { title: '绑定方', key: 'ledgerName', width: 170 },
  { title: '绑定方账号', key: 'ledgerNo', width: 180 },
  { title: '申请单号', key: 'applicationNo', width: 210 },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: (row) => h(NTag, { size: 'small', type: tagType(row.status), bordered: false }, () => relationStatusLabel[row.status]),
  },
  { title: '更新时间', key: 'updatedAt', width: 170 },
]
</script>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-header h1 {
  margin: 0;
  color: #262626;
  font-size: 18px;
  font-weight: 600;
}

.header-desc {
  margin: 4px 0 0;
  color: #777;
  font-size: 13px;
}

.readiness {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
}

.workspace-subtitle {
  color: #888;
  font-size: 12px;
}

.platform-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.platform-overview > div {
  padding: 16px;
  border-top: 1px solid #eee;
  border-right: 1px solid #eee;
}

.platform-overview > div:last-child {
  border-right: 0;
}

.platform-overview span,
.platform-overview strong {
  display: block;
}

.platform-overview span {
  margin-bottom: 6px;
  color: #888;
  font-size: 12px;
}

.single-platform-card {
  overflow: hidden;
  margin-bottom: 18px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
}

.single-platform-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
}

.single-platform-card__head strong,
.single-platform-card__head span {
  display: block;
}

.platform-application-detail {
  border-top: 1px solid #eee;
}

.application-flow {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-top: 1px solid #eee;
}

.application-flow__step {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 13px;
  white-space: nowrap;
}

.application-flow__step strong {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: #eee;
  color: #777;
}

.application-flow__step.done {
  color: #333;
}

.application-flow__step.done strong {
  background: #3f51b5;
  color: #fff;
}

.application-flow__line {
  flex: 1;
  height: 1px;
  margin: 0 12px;
  background: #ddd;
}

.relation-prerequisite {
  margin-bottom: 14px;
}

.single-platform-card__head span {
  margin-top: 3px;
  color: #888;
  font-size: 12px;
}

.workspace-title {
  display: block;
  margin-bottom: 3px;
  font-size: 14px;
}

.platform-relation-fields {
  margin-top: 18px;
}

.readiness-step {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-height: 72px;
  padding: 12px 16px;
  border: 0;
  border-right: 1px solid #eee;
  background: transparent;
  color: #333;
  text-align: left;
  cursor: pointer;
  transition: background-color 180ms ease;
}

.readiness-step:last-child {
  border-right: 0;
}

.readiness-step:hover,
.readiness-step.active {
  background: #f6f8ff;
}

.step-index {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #eef2ff;
  color: #3f51b5;
  font-weight: 600;
}

.readiness-step strong,
.readiness-step small {
  display: block;
}

.readiness-step strong {
  margin-bottom: 3px;
  font-size: 14px;
}

.readiness-step small {
  color: #888;
  font-size: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.data-source {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.form-section {
  margin-bottom: 20px;
}

.form-section.compact {
  margin-bottom: 0;
}

.form-section h3,
.section-heading h3 {
  margin: 0 0 12px;
  color: #333;
  font-size: 15px;
}

.section-heading {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.section-heading span {
  color: #999;
  font-size: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
}

.grid-wide {
  grid-column: 1 / -1;
}

.system-fields {
  margin-bottom: 4px;
}

.source-summary {
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid #d9eadf;
  border-radius: 6px;
  background: #f7fbf8;
}

.source-summary__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.source-summary__head strong,
.source-summary__head span {
  display: block;
}

.source-summary__head span {
  margin-top: 3px;
  color: #777;
  font-size: 12px;
}

.sync-result {
  margin-top: 10px;
}

.credential-select {
  width: 320px;
  margin-bottom: 12px;
}

.upload-result {
  margin-top: 12px;
}

.electronic-contract {
  max-width: 520px;
  margin-top: 12px;
}

.conditional-section {
  padding: 16px 16px 0;
  border: 1px solid #e7eaf0;
  border-radius: 6px;
  background: #fafbfc;
}

.unbind-fields {
  margin-top: 18px;
}

.modal-alert {
  margin-bottom: 18px;
}

.upload-title {
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
}

.upload-hint {
  color: #999;
  font-size: 12px;
}

.field-hint {
  display: block;
  margin-top: 6px;
  color: #888;
  font-size: 12px;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:global(.business-modal) {
  width: min(860px, calc(100vw - 32px));
}

:global(.detail-modal) {
  width: min(680px, calc(100vw - 32px));
}

@media (max-width: 900px) {
  .page-header,
  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .readiness {
    grid-template-columns: 1fr;
  }

  .platform-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .readiness-step {
    border-right: 0;
    border-bottom: 1px solid #eee;
  }

  .readiness-step:last-child {
    border-bottom: 0;
  }

  .data-source {
    white-space: normal;
  }
}

@media (max-width: 640px) {
  .page-container {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .platform-overview {
    grid-template-columns: 1fr;
  }
}
</style>
