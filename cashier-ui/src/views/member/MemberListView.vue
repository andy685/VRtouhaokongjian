<template>
  <div class="member-view">
    <!-- 会员选择面板 -->
    <section class="member-hero">
      <h2 class="member-hero-title">&lt; 选择会员 &gt;</h2>

      <div class="member-hero-btns">
        <button class="member-hero-btn" type="button" @click="showMemberSelect = true">
          <span class="member-btn-text">选择会员</span>
          <span class="member-btn-icon">
            <img class="member-btn-icon-img" src="/member-page-icons/search.svg" alt="" />
          </span>
        </button>
        <button class="member-hero-btn member-hero-btn--add" type="button" @click="showNewMember = true">
          <span class="member-btn-text">新增会员</span>
          <span class="member-btn-icon">
            <img class="member-btn-icon-img" src="/member-page-icons/add.svg" alt="" />
          </span>
        </button>
      </div>

      <div class="member-qr-bar">
        <em>会员 3 秒扫码注册</em>
        <button class="member-qr-btn" type="button" @click="handleOpenRegisterCode">
          注册码 &rarr;
        </button>
      </div>
    </section>

    <!-- 搜索栏 -->
    <div class="member-toolbar">
      <label class="member-search-box">
        <el-icon><Search /></el-icon>
        <input v-model="search" type="search" placeholder="搜索会员姓名 / 手机号" />
      </label>
      <span class="member-count">共 {{ filteredMembers.length }} 位会员</span>
    </div>

    <!-- 会员列表 -->
    <div class="member-table-wrap">
      <table class="member-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>手机号</th>
            <th>等级</th>
            <th>余额</th>
            <th>剩余次数</th>
            <th>最近消费</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filteredMembers"
            :key="row.id"
            class="member-row"
            @click="$router.push(`/member/${row.id}`)"
          >
            <td class="member-name-col">
              <span class="member-avatar">{{ row.name.charAt(0) }}</span>
              <strong>{{ row.name }}</strong>
            </td>
            <td>{{ row.phone }}</td>
            <td>
              <span class="member-level-tag" :class="'member-level-tag--' + row.level">{{ row.level }}</span>
            </td>
            <td class="member-balance-col">
              <span class="currency-symbol">¥</span>{{ row.balance }}
            </td>
            <td>{{ row.times }}</td>
            <td>{{ row.lastVisit }}</td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="filteredMembers.length === 0" class="member-empty">
        暂无匹配的会员
      </div>
    </div>

    <!-- 分页 -->
    <div class="member-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="10"
        :total="members.length"
        layout="prev, pager, next"
      />
    </div>

    <!-- 选择会员弹窗 -->
    <MemberSelectModal
      :visible="showMemberSelect"
      @close="showMemberSelect = false"
    />

    <!-- 新增会员弹窗 -->
    <NewMemberModal
      :visible="showNewMember"
      @close="showNewMember = false"
      @submit="handleNewMemberSubmit"
    />

    <!-- 注册码弹窗 -->
    <RegisterCodeModal
      :visible="showRegisterCode"
      @close="showRegisterCode = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import MemberSelectModal from '../../components/MemberSelectModal.vue'
import NewMemberModal from '../../components/NewMemberModal.vue'
import RegisterCodeModal from '../../components/RegisterCodeModal.vue'

const search = ref('')
const currentPage = ref(1)
const showMemberSelect = ref(false)
const showNewMember = ref(false)
const showRegisterCode = ref(false)

const members = ref([
  { id: 1, name: '李明', phone: '138****1234', level: '黄金', balance: 500, times: 5, lastVisit: '2024-01-15' },
  { id: 2, name: '王芳', phone: '139****5678', level: '钻石', balance: 1200, times: 12, lastVisit: '2024-01-14' },
  { id: 3, name: '张伟', phone: '137****9012', level: '白银', balance: 200, times: 2, lastVisit: '2024-01-10' },
  { id: 4, name: '刘洋', phone: '136****3456', level: '黄金', balance: 800, times: 8, lastVisit: '2024-01-12' },
])

const filteredMembers = computed(() => {
  if (!search.value) return members.value
  return members.value.filter(m => m.name.includes(search.value) || m.phone.includes(search.value))
})

const handleOpenRegisterCode = () => {
  showRegisterCode.value = true
}

const handleNewMemberSubmit = (data) => {
  const pkg = data.package
  members.value.unshift({
    id: Date.now(),
    name: data.name,
    phone: data.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    level: '普通会员',
    balance: pkg && !pkg.name.includes('套票') && !pkg.name.includes('次套票') ? pkg.price : 0,
    times: pkg && pkg.name.includes('次套票') ? parseInt(pkg.name) || 0 : 0,
    lastVisit: '-'
  })
}
</script>

<style scoped>
.member-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 28px 28px;
  overflow: hidden;
}

/* ===== 会员选择面板 ===== */
.member-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 34px 28px 28px;
  flex-shrink: 0;
}

.member-hero-title {
  margin: 0;
  font-size: 19px;
  font-weight: 900;
  color: #3a8dff;
  letter-spacing: 2px;
}

.member-hero-btns {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 520px;
}

.member-hero-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 56px;
  padding: 0 24px;
  border-radius: 10px;
  border: 0;
  background: linear-gradient(135deg, #3a9bff 0%, #2b7de6 50%, #2065cc 100%);
  color: #fff;
  cursor: pointer;
  box-shadow:
    0 10px 24px rgba(43, 125, 230, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.member-hero-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 14px 30px rgba(43, 125, 230, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.26);
}

.member-hero-btn--add {
  background: linear-gradient(135deg, #4aadff 0%, #3894f0 50%, #277ae0 100%);
}

.member-btn-text {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1px;
}

.member-btn-icon {
  display: inline-flex;
  align-items: center;
  opacity: 0.88;
}

.member-btn-icon-img {
  width: 22px;
  height: 22px;
  display: flex;
  object-fit: contain;
}

/* 底部扫码栏 */
.member-qr-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  max-width: 520px;
  padding: 11px 20px;
  border-radius: 10px;
  background: #fff;
  box-shadow:
    0 4px 14px rgba(16, 47, 84, 0.08),
    inset 0 0 0 1px rgba(17, 145, 255, 0.08);
}

.member-qr-bar em {
  margin: 0;
  font-style: normal;
  font-size: 14px;
  font-weight: 700;
  color: #555d6e;
}

.member-qr-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border-radius: 8px;
  border: 0;
  background: linear-gradient(135deg, #3a9bff 0%, #2b7de6 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.member-qr-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(43, 125, 230, 0.3);
}

/* ===== 搜索栏 ===== */
.member-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0 16px;
  flex-shrink: 0;
}

.member-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 320px;
  height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  background: #f1f6fc;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.member-search-box:focus-within {
  border-color: #3a9bff;
  box-shadow: 0 0 0 3px rgba(58, 155, 255, 0.12);
  background: #fff;
}

.member-search-box .el-icon {
  color: #8e9bb0;
  font-size: 16px;
}

.member-search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #171b24;
}

.member-search-box input::placeholder {
  color: #a0aab9;
}

.member-count {
  font-size: 13px;
  font-weight: 600;
  color: #8e9bb0;
}

/* ===== 表格 ===== */
.member-table-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(16, 47, 84, 0.06);
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.member-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 14px 18px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7c93;
  text-align: left;
  background: #f8fafd;
  border-bottom: 1px solid #eef3f8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.member-row:hover {
  background: #f5f9ff;
}

.member-row td {
  padding: 14px 18px;
  font-size: 14px;
  color: #2a3344;
  border-bottom: 1px solid #f3f6fb;
  white-space: nowrap;
}

/* 姓名列 */
.member-name-col {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-avatar {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a9bff 0%, #2065cc 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

.member-name-col strong {
  font-weight: 700;
  color: #171b24;
}

/* 等级标签 */
.member-level-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.member-level-tag--钻石 {
  background: #fff7ed;
  color: #ea580c;
}

.member-level-tag--黄金 {
  background: #fefce8;
  color: #b3860b;
}

.member-level-tag--白银 {
  background: #f1f5f9;
  color: #476088;
}

/* 余额 */
.member-balance-col {
  color: #e03a3a;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.member-balance-col .currency-symbol {
  font-size: 12px;
  margin-right: 1px;
}

/* 空状态 */
.member-empty {
  padding: 60px 0;
  text-align: center;
  color: #8e9bb0;
  font-size: 14px;
}

/* 分页 */
.member-pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0 0;
  flex-shrink: 0;
}
</style>
