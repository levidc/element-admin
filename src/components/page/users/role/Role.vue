<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mb_15">
        <el-button size="small" type="primary" @click="addRole">{{ $ts("CREATE") }}</el-button>
        <el-button size="small" type="danger" :disabled="delBtn" @click="listNames()">{{ $ts("DELETE") }}</el-button>
        <el-button class="right tab_search_btn" type="primary" @click="searchVal='';refresh()">{{ $ts("REFRESH") }}</el-button>
        <el-input
          v-model="searchVal"
          class="search_style right"
          :placeholder="$ts('role.name')"
          width="14"
          clearable
        />
      </el-row>
    </div>
    <RoleTable
      ref="roletable"
      :search-val="searchVal"
      @doModifyRole="modifyRole"
      @boxClick="boxClick"
    />

    <!-- 创建角色|更新角色 -->
    <el-dialog v-dialogDrag :title="isAdd ?$ts('role.model.create'):$ts('role.model.update')" :visible.sync="editDialog" width="900px" @open="dialogOpen('tableFocus')">
      <div>
        <div style="background-color:#f5f7fa;margin-top: 20px;position:relative;">
          <el-steps class="left steps_wrap" :active="active" finish-status="success" simple>
            <el-step :title="$ts('role.basic.info')" icon="el-icon-edit" />
            <el-step :title="$ts('role.right.assign')" icon="el-icon-edit" />
            <el-step :title="$ts('role.confirm.create')" icon="el-icon-upload" />
          </el-steps>
          <div class="step_btn">
            <!-- 下一步 -->
            <el-button v-if="active==0||active==1" class="pull_right" size="mini" @click="next('createForm')">{{ $ts('role.next.step') }}</el-button>
            <!-- 创建 -->
            <el-button v-if="active==2" class="pull_right" size="mini" @click="editRole()">{{ isAdd?$ts('CREATE'):$ts("MODIFY") }}</el-button>
            <!-- 上一步 -->
            <el-button :disabled="active==0" class="pull_right" size="mini" style="margin-right:5px;" @click="prev()">{{ $ts('role.pre.step') }}</el-button>
          </div>
          <div class="clear" />
        </div>
        <!-- 第一步 -->
        <div v-if="active===0" class="step_content">
          <el-form ref="createForm" :model="createForm" label-width="100px" style="padding:0 5%" :rules="createRule">
            <el-form-item :label="$ts('role.name')" prop="name">
              <el-input ref="tableFocus" v-model="createForm.name" auto-complete="off" clearable />
            </el-form-item>
            <el-form-item :label="$ts('role.des')" prop="desc">
              <el-input v-model="createForm.desc" type="textarea" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 权限添加 -->
        <div
          v-show="active===1"
          class="step_content step1"
        >
          <div>
            <div v-for="(api,k) in apis" :key="k">
              <p>{{ $ts(api.key) }}</p>
              <el-checkbox v-model="createApi[api.key].checkAll" class="pull_right" @change="(val)=>handleCheckAllChange(val,api.key,k)">
                {{ $ts('role.checkAll') }}
              </el-checkbox>
              <!-- 全选 -->
              <!-- api[key、val]=> 权限的名称、集合 -->
              <el-row class="check_inner">
                <el-checkbox-group
                  v-model="createApi[api.key].checkGroup"
                  @change="(value) => handleCheckedChange(value, api.key)"
                >
                  <el-checkbox
                    v-for="val in api.val"
                    :key="val.apiName"
                    :label="val.apiName"
                    style="margin:0 20px 5px 0"
                  >
                    {{ i18n === 'en-US' ? val.englishText : val.chineseText }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-row>

            </div>
          </div>
        </div>
        <div v-if="active===2" class="step_content">
          <p style="font-size: 16px">{{ $ts('role.basic.info') }}</p>
          <div style="margin:10px 30px">
            <el-row style="font-size:15px">{{ $ts('role.name') }} : {{ createForm.name }}</el-row>
            <el-row class="role_des">{{ $ts('role.des') }} : {{ createForm.desc }}</el-row>
          </div>

          <p style="font-size: 16px;">{{ $ts('role.right.assign') }}</p>
          <div style="margin:10px 30px">
            <div v-for="(check,i) in checkApis" :key="check.key">
              <p style="margin:20px 0 10px 0">{{ $ts(check.key) }}</p>
              <el-row style="margin-left:15px;">
                <el-col
                  v-for="val in check.list"
                  :key="val"
                  :span="8"
                  style="margin:0 0 5px 0;word-break:break-word;"
                >{{ valueTrans(val) }}</el-col>
              </el-row>
            </div>

          </div>
        </div>

      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false;resetForm('createForm')">{{ $ts('button.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 删除角色 -->
    <el-dialog v-dialogDrag :title="$ts('role.model.delete')" :visible.sync="isDelete" width="30%">
      <p>{{ $ts('role.delete.info') }}</p>
      <div>{{ names }}</div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="isDelete = false;doDelete()">{{ $ts('button.confirm') }}</el-button>
        <el-button @click="isDelete = false">{{ $ts('button.cancel') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script type="text/javascript">
import RoleTable from '@/components/page/users/role/RoleTable'

export default {
  name: 'Role',
  components: {
    RoleTable
  },
  data () {
    return {
      editDialog: false,
      operateType: 'create',
      searchVal: '',
      i18n: 'zh-CN',
      isDelete: false,
      delBtn: true,
      names: '',
      createApi: {},
      createForm: {
        name: '',
        desc: '',
        id: ''
      },
      active: 0,
      apis: [],
      checkApis: [],
      createRule: {
        name: [
          {
            required: true,
            message: this.$ts('role.rule.name.required'),
            trigger: 'blur'
          },
          { validator: this.nameValidate(2, 64), trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    isAdd () {
      return this.operateType === 'create'
    },
    // 权限集合的value转换
    valueTransArr () {
      const temp = []
      const obj = {}
      const len = this.apis.length
      for (let i = 0; i < len; i++) {
        temp.push(...this.apis[i].val)
      }
      for (const item of temp) {
        obj[item.apiName] = item.chineseText
      }
      return obj
    }
  },
  mounted () {
    this.listapis()
  },
  methods: {
    addRole () {
      this.editDialog = true
      this.operateType = 'create'
      this.resetForm('createForm')
    },
    valueTrans (val) {
      return this.valueTransArr[val]
    },
    dialogOpen (e) {
      this.$nextTick(function () {
        this.$refs[e].$el.querySelector('input').focus()
      })
    },
    modifyRole (row) {
      // 异步axios 执行
      this.resetForm('createForm').then(res => {
        this.operateType = 'modify'
        this.active = 0
        this.editDialog = true
        this.createForm.name = row.name
        this.createForm.desc = row.description
        this.createForm.id = row.roleId
        console.log(row, 'row')
        for (const key in this.createApi) {
          for (const v in row.permissions) {
            if (key === v) {
              // 添加对应的apiname 到checkgroup
              this.createApi[v].checkGroup.push(
                ...row.permissions[v].map(item => item.apiName)
              )
            }
          }
        }
        for (const key in this.createApi) {
          if (
            this.createApi[key].checkGroup.length == this.createApi[key].len
          ) {
            this.createApi[key].checkAll = true
          }
        }
        // console.log('listRoleEnd')
      })
    },
    handleCheckAllChange (flag, key, k) {
      // flag 全选、key 全选name、k: index
      if (!flag) {
        this.createApi[key].checkGroup = []
      } else {
        const arr = this.apis[k].val
        const len = arr.length
        for (let i = 0; i < len; i++) {
          this.createApi[key].checkGroup.push(arr[i].apiName)
        }
      }
    },
    // 勾选单独check的处理函数
    handleCheckedChange (value, key) {
      // 不区分新建、修改
      this.createApi[key].checkAll = value.length === this.createApi[key].len
    },

    // 删除禁用
    boxClick (len) {
      if (len > 0) {
        this.delBtn = false
      } else {
        this.delBtn = true
      }
    },
    resetForm (formName) {
      // 展示页 checkApis
      this.checkApis = []
      this.active = 0
      this.createForm = {
        name: '',
        desc: '',
        id: ''
      }
      if (this.$refs[formName]) this.$refs[formName].resetFields()
      return this.listapis()
    },
    refresh () {
      this.$refs.roletable.listRole(true)
      this.delBtn = true
    },
    // 上一步
    prev () {
      --this.active
      if (this.active < 0) {
        this.active = 0
      }
    },
    // 下一步
    next (formName) {
      if (this.active == 0) {
        this.$refs[formName].validate(valid => {
          if (valid) this.nextFun()
        })
      } else {
        this.nextFun()
      }
    },
    nextFun () {
      if (this.active++ > 3) {
        this.active = 0
      }
      if (this.active == 2) {
        this.checkApis = []
        for (const key in this.createApi) {
          // checkGroup只有value，通过value查找字段
          const temp = this.createApi[key].checkGroup
          if (temp && temp.length) {
            this.checkApis.push({
              key,
              list: temp
            })
          }
        }
        // 只有value，step3展示cn翻译字段
        // console.log(this.checkApis, 'createApi')
      }
    },
    listapis () {
      var temp = this
      temp.i18n = localStorage.getItem('lang')
      return this.$http({
        method: 'get',
        url: 'listApi',
        params: {
          accountId: this.$store.state.user.accountId,
          version: this.$store.state.dosVersion
        }
      })
        .then(response => {
          response = response.data.data
          this.apis = []
          this.createApi = {}
          for (const key in response) {
            this.apis.push({ key, val: response[key] })
            this.$set(this.createApi, `${key}`, {})
            this.$set(this.createApi[key], 'checkAll', false)
            this.$set(this.createApi[key], 'len', response[key].length)
            this.$set(this.createApi[key], 'checkGroup', [])
          }
        })
        .catch(error => {
          console.error(error)
        })
    },
    listNames () {
      const arr = []
      for (const i of this.$refs.roletable.multipleSelection) {
        arr.push(i.name)
      }
      this.names = arr.join(',')
      this.isDelete = true
    },
    doDelete () {
      const loading = this.$loading(this.loadingOption)
      const deleteIds = []
      for (const i of this.$refs.roletable.multipleSelection) {
        deleteIds.push(i.roleId)
      }
      var temp = this
      this.$http({
        method: 'delete',
        url: 'deleteRole',
        data: {
          roleIds: deleteIds.join(','),
          accountId: this.$store.state.user.accountId,
          version: this.$store.state.dosVersion
        }
      })
        .then(function (response) {
          if (response.data.error.code != 0) {
            temp.$ts({
              type: 'error',
              text: temp.$ts(response.data.error.name)
            })
          } else {
            temp.$ts({
              type: 'success',
              text: temp.$ts('response.success')
            })
          }

          loading.close()
          temp.$refs.roletable.listRole()
        })
        .catch(function (error) {
          loading.close()
          console.log(error)
        })
    },
    editRole () {
      const loading = this.$loading(this.loadingOption)
      const arr = []
      this.checkApis.forEach(item => {
        arr.push(...item.list)
      })
      if (this.operateType === 'create') {
        this.$http({
          method: 'post',
          url: 'createRole',
          data: {
            roleName: this.createForm.name,
            description: this.createForm.desc,
            apiNames: arr.join(','),
            accountId: this.$store.state.user.accountId,
            version: this.$store.state.dosVersion
          }
        })
          .then(response => {
            if (response.data.error.code != 0) {
              this.$ts({
                type: 'error',
                text: this.$ts(response.data.error.name)
              })
            } else {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }
            loading.close()
            this.resetForm('createForm')
          })
          .catch(function (error) {
            loading.close()
            console.log(error)
          })
      } else {
        this.$http({
          method: 'put',
          url: 'updateRole',
          data: {
            roleId: this.modifyForm.id,
            roleName: this.modifyForm.name,
            description: this.modifyForm.desc,
            apiNames: arr.join(','),
            accountId: this.$store.state.user.accountId,
            version: this.$store.state.dosVersion
          }
        })
          .then(response => {
            if (response.data.error.code != 0) {
              this.$ts({
                type: 'error',
                text: this.$ts(response.data.error.name)
              })
            } else {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }
            this.$refs.roletable.listRole()
            this.resetForm('modifyForm')
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(() => {
            loading.close()
          })
      }
    }
  }
}
</script>
<style type="text/css" scoped>
.btn_div {
  margin-bottom: 20px;
}

.pull_right {
  float: right;
}

.step_content {
  margin-top: 30px;
  margin-left: 30px;
}

.check_inner {
  margin: 12px;
}

.model_put {
  width: 400px;
}

.step_btn {
  position: absolute;
  top: 50%;
  margin-top: -17px;
  right: 5px;
}

.steps_wrap {
  padding: 13px 3%;
  width: 560px;
}

button .miniBtn {
  display: inline-block;
}

.role_des {
  margin-bottom: 10px;
  margin-top: 5px;
  word-break: break-all;
}
</style>
