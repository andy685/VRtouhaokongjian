export type ReceiverOwnerType = 'merchant' | 'agent' | 'cp'
export type ReceiverAccountKind = 'public' | 'private'
export type ReceiverProfileStatus = 'ready' | 'incomplete' | 'reviewing' | 'active'
export type ReceiverSettlementChangeStatus = 'none' | 'draft' | 'reviewing' | 'approved' | 'rejected' | 'supplement'

export interface ReceiverSettlementProfile {
  accountKind?: ReceiverAccountKind
  accountName?: string
  accountNo?: string
  bankName?: string
  certificateNo?: string
  contactMobile?: string
  licenseNo?: string
  licenseName?: string
  legalPersonName?: string
  legalPersonCertificateNo?: string
  attachmentsReady?: boolean
  profileConfirmed?: boolean
  receiverNo?: string
  receiverStatus?: ReceiverProfileStatus
  updatedAt?: string
}

export const receiverAccountKindOptions = [
  { label: '对公账户', value: 'public' },
  { label: '对私账户', value: 'private' },
]

export const bankNameOptions = [
  { label: '中国工商银行', value: 'ICBC' },
  { label: '中国建设银行', value: 'CCB' },
  { label: '中国农业银行', value: 'ABC' },
  { label: '中国银行', value: 'BOC' },
  { label: '交通银行', value: 'BOCOM' },
  { label: '招商银行', value: 'CMB' },
  { label: '中国邮政储蓄银行', value: 'PSBC' },
  { label: '兴业银行', value: 'CIB' },
  { label: '浦发银行', value: 'SPDB' },
  { label: '民生银行', value: 'CMBC' },
  { label: '平安银行', value: 'PAB' },
]

const bankNameMap: Record<string, string> = Object.fromEntries(bankNameOptions.map((item) => [item.value, item.label]))

export const bankCodePresets: Record<string, { openBankCode: string; clearBankCode: string }> = {
  招商银行: { openBankCode: '03080000', clearBankCode: '308290003012' },
  浦发银行: { openBankCode: '03100000', clearBankCode: '310290000013' },
  中国银行: { openBankCode: '01040000', clearBankCode: '104290003007' },
  中国工商银行: { openBankCode: '01020000', clearBankCode: '102584000013' },
  中国建设银行: { openBankCode: '01050000', clearBankCode: '105100000017' },
  中国农业银行: { openBankCode: '01030000', clearBankCode: '103100000026' },
  交通银行: { openBankCode: '03010000', clearBankCode: '301290000007' },
  平安银行: { openBankCode: '03070000', clearBankCode: '307584007998' },
}

export function getBankDisplayName(bankName: string) {
  return bankNameMap[bankName] || bankName || '-'
}

export function resolveBankCodes(bankName: string) {
  const displayName = getBankDisplayName(bankName)
  const matchedKey = Object.keys(bankCodePresets).find((key) => displayName.includes(key))
  return matchedKey ? bankCodePresets[matchedKey] : { openBankCode: '', clearBankCode: '' }
}

export function getReceiverRequiredMaterials(accountKind: ReceiverAccountKind = 'private') {
  return accountKind === 'public'
    ? ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照']
    : ['身份证正面', '身份证反面', '银行卡']
}

export function getReceiverAttachmentDisplayList(
  attachmentNames: string[] | undefined,
  accountKind: ReceiverAccountKind = 'private',
  ownerName = '主体',
  attachmentsReady = false,
) {
  if (attachmentNames?.length) return attachmentNames
  if (!attachmentsReady) return ['待补充']
  return getReceiverRequiredMaterials(accountKind).map((name) => {
    const ext = name === '营业执照' ? 'pdf' : 'jpg'
    return `${name}：${ownerName}-${name}.${ext}`
  })
}

export function getReceiverProfileStatus(profile: ReceiverSettlementProfile | null | undefined): ReceiverProfileStatus {
  if (!profile) return 'incomplete'
  if (profile.receiverStatus) return profile.receiverStatus
  const baseReady = Boolean(
    profile.accountName
    && profile.accountNo
    && profile.bankName
    && profile.certificateNo
    && profile.contactMobile
    && profile.attachmentsReady
    && profile.profileConfirmed
  )
  const publicReady = profile.accountKind !== 'public' || Boolean(
    profile.licenseNo
    && profile.licenseName
    && profile.legalPersonName
    && profile.legalPersonCertificateNo
  )
  return baseReady && publicReady ? 'ready' : 'incomplete'
}

export function isReceiverProfileLocked(profile: ReceiverSettlementProfile | null | undefined) {
  return profile?.receiverStatus === 'reviewing' || profile?.receiverStatus === 'active'
}

export function getReceiverProfileStatusLabel(status: ReceiverProfileStatus) {
  const map: Record<ReceiverProfileStatus, string> = {
    ready: '资料已完善',
    incomplete: '待补充资料',
    reviewing: '拉卡拉审核中',
    active: '已生效',
  }
  return map[status]
}

export function getReceiverProfileStatusTagType(status: ReceiverProfileStatus) {
  const map: Record<ReceiverProfileStatus, 'success' | 'warning' | 'info' | 'default'> = {
    ready: 'success',
    incomplete: 'warning',
    reviewing: 'info',
    active: 'success',
  }
  return map[status]
}

export function getReceiverSettlementChangeStatusLabel(status?: ReceiverSettlementChangeStatus | string) {
  const map: Record<ReceiverSettlementChangeStatus, string> = {
    none: '无变更',
    draft: '变更草稿',
    reviewing: '变更审核中',
    approved: '变更通过',
    rejected: '变更驳回',
    supplement: '变更待补件',
  }
  return map[(status || 'none') as ReceiverSettlementChangeStatus] || String(status || '无变更')
}

export function getReceiverSettlementChangeStatusTagType(status?: ReceiverSettlementChangeStatus | string) {
  if (status === 'approved') return 'success' as const
  if (status === 'rejected') return 'error' as const
  if (status === 'draft' || status === 'supplement') return 'warning' as const
  if (status === 'reviewing') return 'info' as const
  return 'default' as const
}

export function getReceiverSettlementChangeStorageKey(ownerType: ReceiverOwnerType, ownerName: string) {
  return `lakala.receiver.change.${ownerType}.${ownerName}`
}

export function formatAccountNo(accountNo: string) {
  if (!accountNo) return '-'
  return accountNo.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function maskAccountNo(accountNo: string) {
  if (!accountNo) return '-'
  return accountNo.length > 8 ? `${accountNo.slice(0, 4)} **** **** ${accountNo.slice(-4)}` : accountNo
}

export function maskCertificateNo(certificateNo: string) {
  if (!certificateNo) return '-'
  return certificateNo.replace(/(.{4}).+(.{4})/, '$1********$2')
}
