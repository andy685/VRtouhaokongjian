<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="member-profile">
              <div class="avatar">
                <el-avatar :size="80" :src="member.avatar">
                  {{ member.name.charAt(0) }}
                </el-avatar>
              </div>
              <div class="member-name">{{ member.name }}</div>
              <div class="member-level">
                <el-tag :type="member.level === '钻石' ? 'warning' : 'success'">{{ member.level }}会员</el-tag>
              </div>
              <div class="member-stats">
                <div class="stat-item">
                  <div class="stat-value"><span class="currency-symbol">¥</span>{{ member.balance }}</div>
                  <div class="stat-label">余额</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ member.times }}</div>
                  <div class="stat-label">剩余次数</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="16">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="预存记录" name="recharge">
                <el-table :data="rechargeRecords" style="width: 100%">
                  <el-table-column prop="date" label="日期" />
                  <el-table-column prop="amount" label="金额" />
                  <el-table-column prop="gift" label="赠送" />
                  <el-table-column prop="balance" label="余额" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="消费记录" name="consume">
                <el-table :data="consumeRecords" style="width: 100%">
                  <el-table-column prop="date" label="日期" />
                  <el-table-column prop="item" label="消费项目" />
                  <el-table-column prop="amount" label="金额" />
                  <el-table-column prop="clerk" label="收银员" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="套票记录" name="package">
                <el-table :data="packageRecords" style="width: 100%">
                  <el-table-column prop="name" label="套票名称" />
                  <el-table-column prop="times" label="剩余次数" />
                  <el-table-column prop="expireDate" label="过期日期" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="游戏记录" name="game">
                <el-table :data="gameRecords" style="width: 100%">
                  <el-table-column prop="date" label="日期" />
                  <el-table-column prop="game" label="游戏名称" />
                  <el-table-column prop="device" label="设备" />
                  <el-table-column prop="duration" label="时长" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
      
      <div class="quick-actions">
        <el-button type="primary" @click="$router.push('/sale/recharge-activity')">充值</el-button>
        <el-button type="warning" @click="$router.push('/member/deduct')">扣费</el-button>
        <el-button>编辑资料</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('recharge')

const member = ref({
  id: 1,
  name: '李明',
  avatar: '',
  level: '黄金',
  balance: 500,
  times: 5
})

const rechargeRecords = [
  { date: '2024-01-10', amount: 500, gift: 50, balance: 550 },
  { date: '2023-12-15', amount: 200, gift: 20, balance: 500 },
]

const consumeRecords = [
  { date: '2024-01-15', item: 'VR体验', amount: 68, clerk: '张三' },
  { date: '2024-01-12', item: '游戏币x10', amount: 10, clerk: '张三' },
]

const packageRecords = [
  { name: '月卡', times: 15, expireDate: '2024-02-15' },
]

const gameRecords = [
  { date: '2024-01-15', game: '节奏光剑', device: 'VR-01', duration: '45分钟' },
  { date: '2024-01-12', game: '半条命', device: 'VR-02', duration: '60分钟' },
]
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
}

.member-profile {
  text-align: center;
}

.member-name {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px;
}

.member-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ff6b6b;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.quick-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
