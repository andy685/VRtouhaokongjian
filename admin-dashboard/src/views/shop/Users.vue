<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>商家用户</h1>
      <n-space>
        <n-button type="primary" @click="openCreate">
          <template #icon><n-icon :component="AddOutline" /></template>
          创建
        </n-button>
        <n-button @click="handleExport">导出</n-button>
      </n-space>
    </div>

    <n-card class="filter-card" :bordered="false">
      <n-space align="center" wrap>
        <n-select v-model:value="filter.role" :options="roleFilterOptions" placeholder="角色" clearable size="small" style="width:120px" />
        <n-select v-model:value="filter.status" :options="statusFilterOptions" placeholder="状态" clearable size="small" style="width:120px" />
        <n-input v-model:value="filter.keyword" placeholder="账号/姓名/联系方式" clearable size="small" style="width:220px" />
        <n-button size="small" @click="resetFilter">重置</n-button>
      </n-space>
    </n-card>

    <n-data-table :columns="columns" :data="filteredUsers" :pagination="pagination" :bordered="false" striped size="medium" />

    <!-- 创建/编辑 -->
    <n-modal v-model:show="showUserModal" preset="card" :title="isEdit?'编辑管理员':'创建用户'" style="width:520px" :bordered="false">
      <n-form ref="userFormRef" :model="userForm" :rules="activeRules" label-placement="left" label-width="100">
        <n-form-item label="店铺" path="shops">
          <n-select v-model:value="userForm.shops" :options="shopOptions" multiple placeholder="请选择店铺" :disabled="isEdit" />
        </n-form-item>
        <n-form-item label="角色" path="role"><n-select v-model:value="userForm.role" :options="roleOptions" placeholder="请选择角色" :disabled="isEdit" /></n-form-item>
        <n-form-item v-if="!isEdit" label="登录账号" path="account"><n-input v-model:value="userForm.account" placeholder="请输入登录账号" /></n-form-item>
        <n-form-item v-if="!isEdit" label="登录密码" path="password"><n-input v-model:value="userForm.password" type="password" placeholder="请输入登录密码" /></n-form-item>
        <n-form-item v-if="!isEdit" label="确认密码" path="confirmPassword"><n-input v-model:value="userForm.confirmPassword" type="password" placeholder="请再次输入密码" /></n-form-item>
        <n-form-item label="姓名" path="name"><n-input v-model:value="userForm.name" placeholder="请输入姓名" /></n-form-item>
        <n-form-item label="联系方式" path="phone"><n-input v-model:value="userForm.phone" placeholder="请输入联系方式" /></n-form-item>
        <n-form-item v-if="isEdit" label="状态" path="status">
          <n-radio-group v-model:value="userForm.status"><n-space><n-radio :value="true">正常</n-radio><n-radio :value="false">禁用</n-radio></n-space></n-radio-group>
        </n-form-item>
        <n-form-item v-if="isEdit" label="修改密码">
          <n-switch v-model:value="userForm.changePassword" />
        </n-form-item>
        <n-form-item v-if="isEdit && userForm.changePassword" label="新密码" path="newPassword">
          <n-input v-model:value="userForm.newPassword" type="password" placeholder="请输入新密码" />
        </n-form-item>
        <n-form-item v-if="isEdit && userForm.changePassword" label="确认密码" path="newConfirmPassword">
          <n-input v-model:value="userForm.newConfirmPassword" type="password" placeholder="请再次输入新密码" />
        </n-form-item>
        <n-form-item v-if="!isEdit" label="描述" path="desc">
          <n-input v-model:value="userForm.desc" type="textarea" placeholder="请描述" :maxlength="50" show-count :rows="4" />
        </n-form-item>
      </n-form>
      <template #footer><n-space justify="center" style="width:100%"><n-button type="primary" style="width:120px" @click="saveUser">{{ isEdit?'保存':'创建' }}</n-button></n-space></template>
    </n-modal>

    <!-- 绑定微信 -->
    <n-modal v-model:show="showBindWxModal" preset="card" title="绑定微信" style="width:400px" :bordered="false">
      <div v-if="currentUser?.wxBound" style="text-align:center;padding:20px">
        <n-tag type="success">已绑定: {{ currentUser.wxName }}</n-tag>
        <div style="margin-top:16px"><n-button type="error" size="small" @click="unbindWx">解除绑定</n-button></div>
      </div>
      <div v-else style="text-align:center;padding:20px">
        <p style="color:#666;margin-bottom:16px">请使用微信扫描下方二维码完成绑定</p>
        <div style="display:inline-block;padding:12px;border:1px solid #eee;border-radius:8px">
          <n-qr-code :value="qrValue" :size="180" />
        </div>
        <p style="color:#999;font-size:13px;margin-top:12px">二维码有效期5分钟</p>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NIcon, NSpace, NModal, NForm, NFormItem, NInput, NSelect, NSwitch, NTag, NQrCode, useMessage, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui'
import { AddOutline, SearchOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'

const message = useMessage()

interface User { id:number; role:string; account:string; name:string; phone:string; email:string; status:boolean; createTime:string; wxBound:boolean; wxName?:string; shops:string[] }

const filter = ref({ role:null as string|null, status:null as boolean|null, keyword:'' })
const roleFilterOptions = [{label:'店长',value:'店长'},{label:'收银员',value:'收银员'}]
const statusFilterOptions = [{label:'正常',value:true},{label:'禁用',value:false}]
const shopOptions = [
  {label:'利民街小展厅',value:'利民街小展厅'},
  {label:'卓远萝岗区店',value:'卓远萝岗区店'},
  {label:'卓远萧山区店',value:'卓远萧山区店'},
  {label:'卓远亚运城店',value:'卓远亚运城店'},
  {label:'卓远文鼎路店',value:'卓远文鼎路店'},
]

function resetFilter(){ filter.value={role:null,status:null,keyword:''} }

const allUsers = ref<User[]>([
  {id:1,role:'收银员',account:'18998311111',name:'张三',phone:'18998311111',email:'zhangsan@vr.com',status:true,createTime:'2023-05-19 10:54',wxBound:false,shops:['利民街小展厅']},
  {id:2,role:'店长',account:'hehai',name:'he',phone:'189989898989',email:'hehai@vr.com',status:true,createTime:'2023-05-13 17:11',wxBound:true,wxName:'海哥',shops:['利民街小展厅','卓远亚运城店']},
  {id:3,role:'店长',account:'mxw72304',name:'马小文',phone:'18688872712',email:'mxw@vr.com',status:true,createTime:'2023-05-13 16:55',wxBound:false,shops:['卓远萝岗区店']},
  {id:4,role:'店长',account:'luming',name:'luming',phone:'18602015721',email:'lm@vr.com',status:true,createTime:'2023-05-13 16:52',wxBound:false,shops:['卓远萧山区店']},
  {id:5,role:'店长',account:'18027136456',name:'ming',phone:'18027136456',email:'ming@vr.com',status:true,createTime:'2023-05-13 16:46',wxBound:false,shops:['卓远亚运城店']},
  {id:6,role:'店长',account:'13326445852',name:'家欢',phone:'13326445852',email:'jh@vr.com',status:true,createTime:'2023-05-04 14:03',wxBound:false,shops:['利民街小展厅']},
  {id:7,role:'店长',account:'17818070060',name:'胡昕莹',phone:'17818070060',email:'hxy@vr.com',status:true,createTime:'2023-04-07 16:40',wxBound:false,shops:['卓远萝岗区店','卓远萧山区店']},
  {id:8,role:'店长',account:'19525527224',name:'廖苗',phone:'19525527224',email:'lmiao@vr.com',status:true,createTime:'2023-04-07 16:05',wxBound:false,shops:['卓远亚运城店']},
  {id:9,role:'店长',account:'15676577933',name:'陈梓衡',phone:'15676577933',email:'czh@vr.com',status:true,createTime:'2023-04-07 16:04',wxBound:false,shops:['卓远文鼎路店']},
  {id:10,role:'店长',account:'18620017002',name:'何霖',phone:'18620017002',email:'hl@vr.com',status:true,createTime:'2023-04-07 15:52',wxBound:false,shops:['利民街小展厅','卓远亚运城店','卓远萝岗区店']},
])

const filteredUsers = computed(()=>{
  return allUsers.value.filter(u=>{
    if(filter.value.role && u.role!==filter.value.role) return false
    if(filter.value.status!==null && u.status!==filter.value.status) return false
    if(filter.value.keyword){
      const k=filter.value.keyword
      return u.account.includes(k)||u.name.includes(k)||u.phone.includes(k)
    }
    return true
  })
})

const columns: DataTableColumns<User> = [
  { title:'角色', key:'role', width:100 },
  { title:'账号', key:'account', width:140 },
  { title:'姓名', key:'name', width:100 },
  { title:'联系方式', key:'phone', width:140 },
  { title:'邮箱', key:'email', width:180 },
  { title:'店铺', key:'shops', width:200,
    render(row){ return h('span',{},row.shops.join('、')) }
  },
  { title:'状态', key:'status', width:90, align:'center',
    render(row){ return h(NTag,{size:'small',type:row.status?'success':'error',bordered:true},()=>row.status?'正常':'禁用') }
  },
  { title:'创建时间', key:'createTime', width:160 },
  { title:'操作', key:'actions', width:200, fixed:'right', align:'center',
    render(row){
      return h(NSpace,{justify:'center',size:4},{
        default:()=>[
          h(NButton,{size:'tiny',text:true,type:'primary',onClick:()=>openEdit(row)},{default:()=>'编辑'}),
          h(NButton,{size:'tiny',text:true,type:'info',onClick:()=>openBindWx(row)},{default:()=>'绑定微信'}),
          h(NButton,{size:'tiny',text:true,type:'error',onClick:()=>handleDelete(row)},{default:()=>'删除'}),
        ]
      })
    }
  }
]

const pagination = { pageSize:10, showSizePicker:true, pageSizes:[10,20,50] }

// 创建/编辑
const showUserModal = ref(false)
const isEdit = ref(false)
const userFormRef = ref<FormInst|null>(null)
const userForm = ref({ role:'店长', shops:[] as string[], account:'', name:'', phone:'', email:'', password:'', confirmPassword:'', desc:'', status:true as boolean, changePassword:false, newPassword:'', newConfirmPassword:'' })
const roleOptions = [{label:'导购',value:'导购'},{label:'店长',value:'店长'},{label:'收银员',value:'收银员'}]

const userRules: FormRules = {
  role:{required:true,message:'请选择角色',trigger:'change'},
  account:{required:true,message:'请输入账号',trigger:'blur'},
  name:{required:true,message:'请输入姓名',trigger:'blur'},
  phone:{required:true,message:'请输入联系方式',trigger:'blur'},
  password:{required:true,message:'请输入密码',trigger:'blur'},
  confirmPassword:{required:true,message:'请确认密码',trigger:'blur'},
}

const editRules: FormRules = {
  role:{required:true,message:'请选择角色',trigger:'change'},
  name:{required:true,message:'请输入姓名',trigger:'blur'},
  phone:{required:true,message:'请输入联系方式',trigger:'blur'},
  newPassword:{required:true,message:'请输入新密码',trigger:'blur'},
  newConfirmPassword:{required:true,message:'请确认新密码',trigger:'blur'},
}

const activeRules = computed(() => isEdit.value ? editRules : userRules)

function openCreate(){
  isEdit.value=false
  userForm.value={role:'店长',shops:[],account:'',name:'',phone:'',email:'',password:'',confirmPassword:'',desc:'',status:true,changePassword:false,newPassword:'',newConfirmPassword:''}
  showUserModal.value=true
}

function openEdit(row:User){
  isEdit.value=true
  userForm.value={ role:row.role, shops:[...row.shops], account:row.account, name:row.name, phone:row.phone, email:row.email, password:'', confirmPassword:'', desc:(row as any).desc||'', status:row.status, changePassword:false, newPassword:'', newConfirmPassword:'' }
  showUserModal.value=true
}

function saveUser(){
  userFormRef.value?.validate((errors)=>{
    if(errors) return
    if(!isEdit.value && userForm.value.password!==userForm.value.confirmPassword){
      message.error('两次密码不一致')
      return
    }
    if(isEdit.value && userForm.value.changePassword && userForm.value.newPassword!==userForm.value.newConfirmPassword){
      message.error('两次新密码不一致')
      return
    }
    if(isEdit.value){
      const idx=allUsers.value.findIndex(u=>u.account===userForm.value.account)
      if(idx!==-1){
        allUsers.value[idx]={...allUsers.value[idx],...{role:userForm.value.role,shops:[...userForm.value.shops],name:userForm.value.name,phone:userForm.value.phone,email:userForm.value.email,desc:userForm.value.desc,status:userForm.value.status}}
      }
      message.success('用户已更新')
    }else{
      allUsers.value.unshift({
        id:Date.now(), role:userForm.value.role, shops:[...userForm.value.shops], account:userForm.value.account, name:userForm.value.name,
        phone:userForm.value.phone, email:userForm.value.email, status:userForm.value.status, createTime:new Date().toLocaleString(), wxBound:false, desc:userForm.value.desc
      })
      message.success('用户已创建')
    }
    showUserModal.value=false
  })
}

// 绑定微信
const showBindWxModal = ref(false)
const currentUser = ref<User|null>(null)
const qrValue = computed(()=>currentUser.value?`BIND_WX_${currentUser.value.id}_${Date.now()}`:'')

function openBindWx(row:User){
  currentUser.value=row
  showBindWxModal.value=true
}

function unbindWx(){
  if(currentUser.value){
    currentUser.value.wxBound=false
    currentUser.value.wxName=undefined
    message.success('已解除绑定')
  }
  showBindWxModal.value=false
}

// 删除
function handleDelete(row:User){
  const d = window.confirm(`确认删除用户「${row.name}（${row.account}）」吗？`)
  if(!d) return
  const idx=allUsers.value.findIndex(u=>u.id===row.id)
  if(idx!==-1) allUsers.value.splice(idx,1)
  message.success('用户已删除')
}

// 导出
function handleExport(){
  message.success('导出成功')
}
</script>

<style scoped>
.page-container { padding:24px; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.page-header h1 { font-size:20px; font-weight:600; color:#333; margin:0; }
.filter-card { margin-bottom:16px; border-radius:12px; }
</style>
