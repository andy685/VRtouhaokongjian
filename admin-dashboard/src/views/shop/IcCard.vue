<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>IC卡管理</h1>
      <n-space>
        <n-button type="primary" size="small" @click="showBindModal = true">
          <template #icon><n-icon :component="AddOutline" /></template>
          绑定IC卡
        </n-button>
      </n-space>
    </div>

    <n-alert type="info" :bordered="false" style="margin-bottom:16px;">
      IC卡用于收银员身份认证和交接班确认。IC卡在收银系统端通过写卡器烧录后，在此处绑定员工账户。
    </n-alert>

    <n-data-table :columns="columns" :data="cardData" :bordered="false" striped size="small" :pagination="{ pageSize: 10 }" />

    <!-- 绑定IC卡弹窗 -->
    <n-modal v-model:show="showBindModal" preset="card" title="绑定IC卡" style="width:460px;" :bordered="false">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="100">
        <n-form-item label="卡号" path="cardNo">
          <n-input v-model:value="form.cardNo" placeholder="收银端烧录后显示的卡号" />
        </n-form-item>
        <n-form-item label="员工" path="employee">
          <n-select v-model:value="form.employee" :options="employeeOpts" placeholder="选择员工" filterable />
        </n-form-item>
        <n-form-item label="备注" path="notes">
          <n-input v-model:value="form.notes" placeholder="选填" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBindModal=false">取消</n-button>
          <n-button type="primary" @click="handleBind">确认绑定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 解绑确认 -->
    <n-modal v-model:show="showUnbindModal" preset="card" title="解绑IC卡" style="width:400px;" :bordered="false" :closable="false">
      <p style="font-size:14px;color:#333;">确定解绑卡号 <strong>{{ unbindTarget?.cardNo }}</strong>（{{ unbindTarget?.employee }}）？</p>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showUnbindModal=false">取消</n-button>
          <n-button type="error" @click="confirmUnbind">确认解绑</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, h } from 'vue'
import { NDataTable, NButton, NIcon, NSpace, NModal, NForm, NFormItem, NInput, NSelect, NAlert, NTag, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

interface IcCard { id:number; cardNo:string; employee:string; role:string; status:'bound'|'unbound'; bindTime:string; notes:string }
const cardData = ref<IcCard[]>([
  { id:1, cardNo:'IC-0001', employee:'张三', role:'收银员', status:'bound', bindTime:'2026-04-15', notes:'' },
  { id:2, cardNo:'IC-0002', employee:'李四', role:'收银员', status:'bound', bindTime:'2026-04-15', notes:'' },
  { id:3, cardNo:'IC-0003', employee:'王五', role:'店长', status:'bound', bindTime:'2026-04-20', notes:'备用卡' },
])

const columns: DataTableColumns<IcCard> = [
  { title:'卡号', key:'cardNo', width:120 },
  { title:'员工', key:'employee', minWidth:100 },
  { title:'角色', key:'role', width:80 },
  { title:'状态', key:'status', width:80, align:'center' as const,
    render:(r:IcCard) => h(NTag, { size:'small', type:r.status==='bound'?'success':'default' }, { default:()=>r.status==='bound'?'已绑定':'未绑定' }) },
  { title:'绑定时间', key:'bindTime', width:100 },
  { title:'备注', key:'notes', minWidth:120 },
  { title:'操作', key:'actions', width:80, align:'center' as const,
    render:(r:IcCard) => h(NButton, { size:'tiny', text:true, type:'error', onClick:()=>{ unbindTarget.value=r; showUnbindModal.value=true } }, { default:()=>'解绑' }) },
]

const employeeOpts = [
  { label:'张三（收银员）', value:'张三' }, { label:'李四（收银员）', value:'李四' },
  { label:'王五（店长）', value:'王五' }, { label:'赵六（收银员）', value:'赵六' },
]

const showBindModal = ref(false)
const showUnbindModal = ref(false)
const unbindTarget = ref<IcCard | null>(null)
const formRef = ref<FormInst | null>(null)
const form = ref({ cardNo:'', employee:'', notes:'' })
const rules: FormRules = {
  cardNo: { required:true, message:'请输入卡号', trigger:'blur' },
  employee: { required:true, message:'请选择员工', trigger:'change' },
}

function handleBind() {
  formRef.value?.validate(e => {
    if (e) return
    cardData.value.unshift({ id:Date.now(), cardNo:form.value.cardNo, employee:form.value.employee, role:'收银员', status:'bound', bindTime:new Date().toISOString().slice(0,10), notes:form.value.notes })
    showBindModal.value = false; form.value = { cardNo:'', employee:'', notes:'' }
    window.$message?.success('IC卡绑定成功')
  })
}

function confirmUnbind() {
  if (unbindTarget.value) {
    const idx = cardData.value.findIndex(c => c.id === unbindTarget.value!.id)
    if (idx !== -1) cardData.value.splice(idx, 1)
    window.$message?.warning('IC卡已解绑')
  }
  showUnbindModal.value = false; unbindTarget.value = null
}
</script>
<style scoped>
.page-container { padding:24px; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.page-header h1 { font-size:20px; font-weight:600; color:#333; margin:0; }
</style>