<template>
  <div class="users">
    <el-container v-loading="loading" class="container">
      <el-header>
        <div v-show="!loading" class="topMenu">
          <div class="iconName">
            <svg class="svgicon icon" aria-hidden="true">
              <use xlink:href="#icon-user" />
            </svg>
            <div>
              {{ currentName }}
            </div>
          </div>
          <div class="rightMenu">
            <div>
              <span>{{ $ts('user.userStatus') }}
                <span v-if="enableUser" class="green">{{ $t('page.enable') }}</span>
                <span v-else class="red">{{ $ts('page.disable') }}</span>
              </span>
              <el-switch v-if="currentName !== 'superAdmin'" v-model="enableUser"
                v-access="'admin:EnableUser;admin:DisableUser'" @change="switchUserStatus" />
            </div>
            <div>
              <el-tooltip :content="$ts('user.delUser')" placement="top" effect="dark">
                <svg v-if="currentName !== 'superAdmin' && $store.state.user.role === 'superAdmin'"
                  v-access="'admin:DeleteUser'" class="icon backicon" aria-hidden="true" @click="deleteFlag = true">
                  <use xlink:href="#icon-trash" />
                </svg>
              </el-tooltip>
              <el-tooltip v-if="userType !== 2" :content="$ts('user.changePwd')" placement="top" effect="dark">
                <svg style="font-size: 20px;" v-access="'admin:UpdateUser'" class="icon backicon" aria-hidden="true"
                  @click="resetPassword">
                  <use xlink:href="#icon-password" />
                </svg>
              </el-tooltip>

              <el-tooltip :content="$ts('page.return')" placement="top" effect="dark">
                <svg class="icon backicon" aria-hidden="true" @click="$router.push({ name: 'Users' })">
                  <use xlink:href="#icon-fanhui" />
                </svg>
              </el-tooltip>
              <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
                <svg class="icon backicon" aria-hidden="true" @click="getUser">
                  <use xlink:href="#icon-refresh" />
                </svg>
              </el-tooltip>
            </div>
          </div>
        </div>
      </el-header>
      <el-container v-show="!loading">
        <el-aside width="200px">
          <el-tabs v-model="tabName" tab-position="left" class="tabs">
            <el-tab-pane :label="$ts('route.bucket')" name="Bucket" />
            <el-tab-pane :label="$ts('group.userGroup')" name="groups" />
            <el-tab-pane :label="$ts('group.policies')" name="Policy" />
          </el-tabs>
        </el-aside>
        <el-main>
          <div v-show="tabName === 'groups'">
            <div class="clearfix">
              <h3 class="left">{{ $ts('group.userGroup') }}</h3>
              <el-button v-access="'admin:AddGroupToUser;admin:RemoveGroupFromUser'" class="right golden"
                @click="searchUserGroup = ''; groupDialog = true">
                {{ $ts('group.configGroup') }}
              </el-button>
              <el-input v-model="searchUserGroup" class="right searchIpt" :placeholder="$ts('group.groupNameSearch')"
                clearable />
            </div>
            <el-table :data="userGroup" border>
              <el-table-column prop="groupName" :label="$ts('group.groupName')">
                <template slot-scope="scope">
                  <el-tooltip :content="$ts('route.GroupDetail')" placement="top">
                    <a v-access:disable="'admin:GetGroup'" class="blue"
                      @click="$router.push({ name: 'GroupDetail', params: { name: scope.row.groupName } })">
                      {{ scope.row.groupName }}
                    </a>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column :label="$ts('user.removeGroup')">
                <template slot-scope="scope">
                  <svg v-access="'admin:AddGroupToUser;admin:RemoveGroupFromUser'" class="icon icon-trash"
                    aria-hidden="true" @click="deleteGroup(scope.row)">
                    <use xlink:href="#icon-trash" />
                  </svg>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div v-show="tabName === 'Policy'">
            <div class="clearfix">
              <h3 class="left">{{ $ts('group.policies') }}</h3>
              <el-button v-access="'admin:SetUserOrGroupPolicy'" class="right golden" type="primary"
                @click="searchPolicy = ''; policyDialog = true">{{ $ts('group.setPolicies') }}</el-button>
              <el-input v-model="searchPolicy" class="right searchIpt" :placeholder="$ts('group.searchPolicyName')"
                clearable />
            </div>
            <el-table :data="userPolicy" border max-height="600">
              <el-table-column prop="name" :label="$ts('group.policyName')">
                <template slot-scope="scope">
                  <el-tooltip :content="$ts('policies.policyDetail')" placement="top">
                    <a class="blue" @click="getIntoPolicy(scope.row.name)">
                      {{ scope.row.name }}
                    </a>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column :label="$ts('group.removePolicy')">
                <template slot-scope="scope">
                  <svg v-if="scope.row.name !== 'BasePolicy'" v-access="'admin:SetUserOrGroupPolicy'"
                    class="icon icon-trash" aria-hidden="true" @click="deletePolicy(scope.row)">
                    <use xlink:href="#icon-trash" />
                  </svg>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-show="tabName === 'Bucket'">
            <div class="clearfix">
              <h3 class="left">{{ $ts('route.bucket') }}</h3>
            </div>
            <el-descriptions style="width: 50%;" :content-style="rowCenter" :label-style="rowCenter"
              direction="vertical" :column="2" border>
              <el-descriptions-item :label="$ts('bucket.objectCount')">
                <el-tag size="small">{{ quotaData.objectCount | precisionNum }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item :label="$ts('bucket.objectSize')">
                <el-tag size="small">{{ byteConvert(quotaData.objectSize) }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <div class="clearfix">
              <h3 class="left bucket_column">{{ $ts('bucket.name') }}</h3>
            </div>
            <el-table class="outerTable" :data="bucketData" style="width:100%;margin:30px 0 0 0"
              :default-expand-all="true" :row-class-name="getRowClass">
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-form inline label-position="left">
                    <el-table :data="scope.row.policyInfo.Statement" style="width:95%;margin-left:50px">
                      <el-table-column prop="Effect" label="Effect" width="100" />
                      <el-table-column prop="Principal" label="Principal" min-width="120">
                        <template slot-scope="inner">
                          <p v-for="(item, i) in renderPrincipal(inner.row.Principal)" :key="item + i">{{ item }} </p>
                        </template>
                      </el-table-column>
                      <el-table-column prop="Resource" label="Resource" min-width="200">
                        <template slot-scope="inner">
                          <p v-for="(item, i) in handleStrOrArr(inner, 'Resource')" :key="item + i">{{ item }} </p>
                        </template>
                      </el-table-column>

                      <el-table-column prop="Action" label="Action" min-width="120">
                        <template slot-scope="inner">
                          <div>
                            <span>{{ (inner.row.group && inner.row.group.name) }}</span>
                            <el-popover class="ml_10" placement="right" width="350" trigger="hover">
                              <p v-for="(item, i) in handleStrOrArr(inner, 'Action')" :key="item + i"
                                style="line-height:1.6;">
                                {{ item }}
                              </p>
                              <svg slot="reference" class="icon icon-question" aria-hidden="true">
                                <use xlink:href="#icon-question" />
                              </svg>
                            </el-popover>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="Condition" min-width="150">
                        <template slot="header">
                          <span style="margin-left:8px;">{{ $ts('policies.Condition') }}</span>
                        </template>
                        <template slot-scope="inner">
                          <el-table v-if="renderCondition(inner.row.Condition).length"
                            :data="renderCondition(inner.row.Condition)" class="innerTable">
                            <!-- <el-table-column label="项" prop="key">
                              <template slot-scope="data">
                                {{ conditionArr.find(x=>x.value===data.row.key).label }}
                              </template>
    </el-table-column>
    <el-table-column label="符号" prop="symbol">
      <template slot-scope="data">
                                {{ conditionSymbols.find(x=>x.value===data.row.symbol).label }}
                              </template>
    </el-table-column> -->
                            <el-table-column :label="$ts('policies.value')" prop="value">
                              <template slot-scope="data">
                                {{ conditionArr.find(x => x.value === data.row.key).label + ' / ' +
                                  conditionSymbols.find(x => x.value === data.row.symbol).label + ' / ' + data.row.value
                                }}
                              </template>
                            </el-table-column>
                          </el-table>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column prop="name" />
            </el-table>
            <el-pagination v-if="bucketData && bucketData.length" background
              layout="total,sizes, prev, pager, next, jumper" :page-sizes="[5, 10, 50, 100]"
              :page-size="bucketObj.pageSize" :total="bucketObj.totalCount" :current-page="bucketObj.pageNum"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </el-main>
      </el-container>
    </el-container>
    <el-dialog :visible.sync="groupDialog" :title="$ts('group.configGroup')" width="750px" style="padding:0 5%"
      @close="handleScroll('groupTable')">
      <div class="clearfix ipt">
        <el-input v-model="groupName" class="right" :placeholder="$ts('group.groupNameSearch')" clearable />
      </div>
      <el-table ref="groupTable" class="groupData" :data="groupData" border max-height="400"
        :row-key="(row) => row.groupName" @selection-change="handleGroupChange">
        <el-table-column type="selection" width="55" reserve-selection align="center" />
        <el-table-column prop="groupName" :label="$ts('group.groupName')" />
      </el-table>
      <div slot="footer">
        <el-button @click="cancelGroup">{{ $ts('page.reset') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmGroup">{{ $ts('page.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$ts('user.changePwd')" :visible.sync="passwordDialog" width="700px" @close="resetModForm">
      <el-form ref="modifyPassword" class="modifyPassword" :model="modifyPassword" label-width="150px"
        style="padding:0 5%" :rules="rules">
        <el-form-item :label="$ts('user.username')">
          {{ currentName }}
        </el-form-item>
        <el-form-item :label="$ts('user.firstPwd')" prop="pwd">
          <el-input ref="ipt" v-model="modifyPassword.pwd" type="password" :placeholder="$ts('user.pwdRequired')"
            clearable />
        </el-form-item>
        <el-form-item :label="$ts('user.secondPwd')" prop="confirmPwd">
          <el-input v-model="modifyPassword.confirmPwd" type="password" :placeholder="$ts('user.pwdAgain')" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="passwordDialog = false">{{ $ts('page.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmPassword">{{ $ts('save') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$ts('group.setPolicy')" :visible.sync="policyDialog" width="700px"
      @close="handleScroll('policyTable')">
      <div class="clearfix ipt">
        <el-input v-model="policyName" class="right" :placeholder="$ts('group.searchPolicyName')" clearable />
      </div>
      <el-table ref="policyTable" border class="policyData" :data="policyData" max-height="400"
        :row-key="(row) => row.name" @selection-change="handlePolicyChange">
        <el-table-column type="selection" width="55" reserve-selection align="center" :selectable="checkBasePolicy" />
        <el-table-column prop="name" :label="$ts('group.policyName')" />
      </el-table>
      <div slot="footer">
        <el-button @click="resetPolicy">{{ $ts('page.reset') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmPolicy(false)">{{ $ts('page.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$ts('user.delUser')" :visible.sync="deleteFlag" width="650px">
      <p>{{ $ts('user.delCurrentUser') }}
        {{ currentName }}
      </p>
      <div slot="footer">
        <el-button @click="deleteFlag = false">{{ $ts('page.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="deleteUser">{{ $ts('page.delete') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { formatViewStatement } from '@/utils/AwzUtils'
import { listAllPermissionGroup } from '@/api/policy'
import { listBucketPoliciesByUser } from '@/api/user'
import { removeAccessCredential } from '@/api/accessCredential'
import { getPolicy, setUserOrGroupPolicy } from '@/api/policy'
import { listGroups } from '@/api/group'
import { checkPasswordReg } from '@/utils/pass'
import {
  deleteUser,
  enableUser,
  disableUser,
  getUser,
  updateUser,
  addGroupToUser,
  RemoveGroupFromUser
} from '@/api/user'
export default {
  name: 'UserDetail',
  filters: {
    precisionNum (val) {
      if (!val) return '0'
      val = String(val)
      const reg = /\B(?=(\d{3})+(?!\d))/g
      return val.replace(reg, ',')
    }
  },
  data () {
    // const checkPasswordReg = (rule, data, callback) => {
    //   const reg = /[\u4e00-\u9fa5]/
    //   if (reg.test(data)) {
    //     return callback('密码不能包含中文')
    //   } else if (data.length < 11 || data.length > 40) { // 跟华泰系统匹配，密码长度最低要求11位
    //     return callback('密码长度限制为11-40位')
    //   }
    //   return callback()
    // }
    var validatePass = (rule, value, callback) => {
      const reg = /[\u4e00-\u9fa5]/
      if (value === '') {
        return callback(new Error(this.$ts('user.pwdRequired')))
      } else if (reg.test(value)) {
        return callback(this.$ts('user.pwdHasChinese'))
      } else {
        if (this.modifyPassword.confirmPwd !== '') {
          this.$refs.modifyPassword.validateField('confirmPwd')
        }
        callback()
      }
    }
    var validateConfirmPwd = (rule, value, callback) => {
      const reg = /[\u4e00-\u9fa5]/
      if (value === '' && this.modifyPassword.pwd !== '') {
        return callback(new Error(this.$ts('user.pwdAgain')))
      } else if (value !== this.modifyPassword.pwd) {
        return callback(new Error(this.$ts('user.confirmPwd')))
      } else if (reg.test(value)) {
        return callback(this.$ts('user.pwdHasChinese'))
      } else {
        callback()
      }
    }
    return {
      conditionSymbols: [
        { value: 'StringEquals', label: this.$ts('bucket.equal') },
        { value: 'IpAddress', label: this.$ts('bucket.allow') },
        { value: 'NotIpAddress', label: this.$ts('bucket.notAllow') }
      ],
      conditionArr: [
        { value: 's3:prefix', label: this.$ts('bucket.prefix') },
        { value: 's3:delimiter', label: this.$ts('bucket.delimiter') },
        { value: 'aws:SourceIp', label: this.$ts('bucket.SourceIp') }
      ],
      permissionGroup: [],
      bucketData: [],
      bucketObj: {
        pageSize: 10,
        pageNum: 1,
        totalCount: 0
      },
      loading: true,
      deleteAccess: false,
      searchPolicy: '',
      searchUserGroup: '',
      deleteFlag: false,
      userPolicy: [],
      cloneUserPolicy: [],
      policyName: '',
      policyDialog: false,
      policyData: [],
      selectedPolicy: [],
      clonePolicyData: [],
      userGroup: [],
      cloneUserGroup: [],
      groupName: '',
      groupDialog: false,
      groupData: [],
      selectedGroup: [],
      cloneGroupData: [],
      passwordDialog: false,
      tabName: 'Bucket',
      serviceData: [],
      selectedServiceAccounts: [],
      serviceDialog: false,
      serviceForm: {
        credentials: false,
        policy: false,
        accessKey: '',
        secretKey: ''
      },
      serviceCreateDone: false,
      enableUser: false,
      userType: 1,
      modifyPassword: {
        pwd: '',
        confirmPwd: ''
      },
      jsonString: '',
      rules: {
        pwd: [
          { validator: validatePass, trigger: ['change', 'blur'] },
          { validator: checkPasswordReg, trigger: ['change', 'blur'] }
        ],
        confirmPwd: [
          {
            validator: validateConfirmPwd,
            trigger: ['change', 'blur']
          }
        ]
      },
      quotaData: {
      },
      rowCenter: { 'text-align': 'center' }
    }
  },
  computed: {
    currentName () {
      return this.$route.params.name
    }
  },
  watch: {
    policyDialog (val) {
      if (val) {
        this.listPolicies()
      } else {
        this.getUser()
        this.$refs['policyTable'].clearSelection()
      }
    },
    groupDialog (val) {
      if (val) {
        this.getUser()
        this.listGroups()
      } else {
        this.getUser()
        this.cancelGroup()
      }
    },
    tabName (val) {
      if (val === 'Bucket') {
        localStorage.removeItem('Policy')
      } else if (val === 'groups') {
        localStorage.removeItem('Policy')
      } else if (val === 'serviceAccounts') {
        localStorage.removeItem('Policy')
      }
    },
    searchUserGroup (val) {
      this.userGroup = [...this.cloneUserGroup]
      if (!val) return
      this.userGroup = this.userGroup.filter(item => {
        return item.groupName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    searchPolicy (val) {
      this.userPolicy = [...this.cloneUserPolicy]
      if (!val) return
      this.userPolicy = this.userPolicy.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    groupName (val) {
      this.groupData = [...this.cloneGroupData]
      if (!val) return
      this.groupData = this.groupData.filter(item => {
        return item.groupName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    policyName (val) {
      this.policyData = [...this.clonePolicyData]
      if (!val) return
      this.policyData = this.policyData.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    serviceDialog (val) {
      if (!val) {
        this.serviceCreateDone = false
        this.serviceForm.credentials = false
        this.serviceForm.policy = false
      } else {
        this.clearJSON()
      }
    }
  },
  async mounted () {
    const res = await listAllPermissionGroup()
    this.permissionGroup = res.data
    this.getUser()
    if (localStorage.getItem('Policy')) {
      this.tabName = 'Policy'
    }
  },
  methods: {
    handleStrOrArr (inner, type) {
      const arr = inner.row[type]
      const typeArray = Array.isArray(arr)
      if (typeArray) {
        return arr
      } else if (typeof (arr) === 'string') {
        return arr.split(';')
      }
    },
    getIntoPolicy (val) {
      this.$router.push({ name: 'PolicyDetail', params: { name: val } })
    },
    checkBasePolicy (val) {
      return val.name !== 'BasePolicy'
    },
    deleteAccessCredential () {
      const accessKeyList = this.selectedServiceAccounts.map(item => {
        return item.name
      })
      removeAccessCredential({
        accessKeyList,
        username: this.currentName
      }).then(res => {
        if (res.code === '200') {
          this.$msg({
            type: 'success',
            text: this.$ts('page.responseSuccess')
          })
          this.deleteAccess = false
          this.getUser()
        }
      })
    },
    handleScroll (ref) {
      this.$refs[ref].$el.children[2].scrollTop = 0
    },
    resetModForm () {
      this.$nextTick(() => {
        this.$refs['modifyPassword'].resetFields()
      })
    },
    switchUserStatus (val) {
      if (val) {
        enableUser(this.currentName)
          .then(res => {
            this.$msg({
              type: 'success',
              text: this.$ts('page.responseSuccess')
            })
            this.getUser()
          })
          .catch(err => {
            console.error(err)
          })
      } else if (!val) {
        disableUser(this.currentName)
          .then(res => {
            this.$msg({
              type: 'success',
              text: this.$ts('page.responseSuccess')
            })
            this.getUser()
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    onJsonChange (value) {
      this.onJsonSave(value)
    },
    onJsonSave (value) {
      this.jsonString = value
      this.hasJsonFlag = true
    },
    onError (value) {
      this.hasJsonFlag = false
    },
    clearJSON () {
      this.jsonString = {}
    },
    eslintJson () {
      this.$refs['jsonEditor'].editor.format()
    },
    clearServiceValidate () {
      this.serviceForm.accessKey = ''
      this.serviceForm.secretKey = ''
      this.$refs['serviceForm'].resetFields()
    },
    downloadSecretAccount () {
      // {"console":[{"url":"undefined","access_key":"aptx789","secret_key":"policyTable123","api":"s3v4","path":"auto"}]}
      const json = {
        console: [
          {
            url: undefined,
            access_key: this.serviceForm.accessKey,
            secret_key: this.serviceForm.secretKey,
            api: 's3v4',
            path: 'auto'
          }
        ]
      }
      // JSON.stringify(data,(key,value)=>typeof value ==='undefined'?'':value)
      const Link = document.createElement('a')
      Link.download = 'credentials.json'
      Link.style.display = 'none'
      var blob = new Blob([JSON.stringify(json)])
      Link.href = URL.createObjectURL(blob)
      document.body.appendChild(Link)
      Link.click()
      document.body.removeChild(Link)
    },
    handlePolicyChange (val) {
      this.selectedPolicy = val
    },
    handleGroupChange (val) {
      this.selectedGroup = val
    },
    handleServiceAccountsChange (val) {
      this.selectedServiceAccounts = val
    },
    // 密码设置
    confirmPassword () {
      this.$refs['modifyPassword'].validate(valid => {
        if (valid) {
          updateUser({
            userName: this.currentName,
            password: this.modifyPassword.pwd
          })
            .then(res => {
              this.passwordDialog = false
              this.$msg({
                type: 'success',
                text: this.$ts('page.responseSuccess')
              })
            })
            .catch(err => {
              console.error(err)
            })
        }
      })
    },
    // 群组设置
    confirmGroup () {
      const removeGroup = this.userGroup
        .filter(item => {
          return this.selectedGroup.every(item2 => {
            return item.groupName !== item2.groupName
          })
        })
        .map(item => item.groupName)
      const addGroup = this.selectedGroup
        .filter(item => {
          return this.userGroup.every(item2 => {
            return item.groupName !== item2.groupName
          })
        })
        .map(item => item.groupName)

      if (removeGroup.length && addGroup.length) {
        Promise.all([
          addGroupToUser({
            userName: this.currentName,
            groups: addGroup
          }),
          RemoveGroupFromUser({
            userName: this.currentName,
            groups: removeGroup
          })
        ])
          .then(res => {
            const isTrue = res.filter(item => item.code !== '200')
            if (!isTrue.length) {
              this.$msg({
                type: 'success',
                text: this.$ts('page.responseSuccess')
              })
            } else {
              this.$msg({
                type: 'success',
                text: this.$ts(isTrue[0].msg)
              })
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.groupDialog = false
          })
      } else if (addGroup.length) {
        addGroupToUser({
          userName: this.currentName,
          groups: addGroup
        })
          .then(res => {
            this.$msg({
              type: 'success',
              text: this.$ts('page.responseSuccess')
            })
            this.groupDialog = false
          })
          .catch(err => {
            console.error(err)
          })
      } else if (removeGroup.length) {
        RemoveGroupFromUser({
          userName: this.currentName,
          groups: removeGroup
        })
          .then(res => {
            this.$msg({
              type: 'success',
              text: this.$ts('page.responseSuccess')
            })
            this.groupDialog = false
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        this.groupDialog = false
      }
      // console.log(addGroup, removeGroup, this.selectedGroup, 'selected')
    },
    deleteGroup (row) {
      RemoveGroupFromUser({
        userName: this.currentName,
        groups: [row.groupName]
      })
        .then(res => {
          this.$msg({
            type: 'success',
            text: this.$ts('page.responseSuccess')
          })
          this.getUser()
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 策略设置
    deletePolicy (row) {
      const policyNames = this.userPolicy
        .filter(item => item.name !== row.name)
        .map(item => item.name)
      this.confirmPolicy(policyNames)
    },
    confirmPolicy (flag) {
      let policyNames
      if (flag) {
        policyNames = flag
      } else {
        policyNames = this.selectedPolicy.map(item => item.name)
      }
      setUserOrGroupPolicy({
        name: this.currentName,
        policyNames,
        type: 'user'
      }).then(res => {
        this.$msg({
          type: 'success',
          text: this.$ts('page.responseSuccess')
        })
        if (flag) {
          this.getUser()
        }
        this.policyDialog = false
        // console.log(res, "设置用户策略");
      })
      // console.log(this.selectedPolicy, "seletced");
    },
    createServiceAccount () {
      // var json = this.$refs['jsonEditor']?.editor.getText()
      // var type = Object.prototype.toString.call(JSON.parse(json || '{}'))
      // if (!json || type==='[object Object]') {
      //   this.hasJsonFlag = true
      // } else {
      //   this.hasJsonFlag = false
      // }
      this.$refs['serviceForm'].validate(valid => {
        if (valid) {
          // if (!this.hasJsonFlag) {
          //   return this.$msg({
          //     type: 'error',
          //     text: 'json格式不正确'
          //   })
          // }
          if (!this.serviceForm.accessKey || !this.serviceForm.secretKey) {
            this.serviceForm.accessKey = Math.random()
              .toString(36)
              .substring(2, 12)
            this.serviceForm.secretKey = Math.random()
              .toString(36)
              .substring(2, 12)
          }
          // 用户添加凭证api
          // createAccessCredential({
          //   key: this.serviceForm.accessKey,
          //   secret: this.serviceForm.secretKey
          // }).then(res => {
          //   this.$msg({
          //     type: 'success',
          //     text: this.$ts('page.responseSuccess')
          //   })
          //   this.serviceCreateDone = true
          //   this.listAccounts()
          //   console.log(res, 'res')
          // })
        }
      })
    },
    resetPolicy () {
      this.$refs['policyTable'].clearSelection()
      this.$nextTick(() => {
        this.userPolicy.forEach(item => {
          this.$refs['policyTable'].toggleRowSelection(item)
        })
        // 视图刷新
        this.policyData.push('')
        this.policyData.pop()
      })
    },
    cancelGroup () {
      this.$refs['groupTable'].clearSelection()
    },
    listGroups () {
      this.$nextTick(() => {
        listGroups()
          .then(res => {
            // console.log(res.data, 'listgroup')
            this.groupData = res.data
            this.cloneGroupData = [...this.groupData]
            this.userGroup.forEach(item => {
              this.$refs['groupTable'].toggleRowSelection(item)
            })
          })
          .catch(err => {
            console.error(err)
          })
        // this.groupData = [
        //   { name: 'group11', id: 1 },
        //   { name: 'group22', id: 2 },
        //   { name: 'group33', id: 3 },
        // ]
      })
    },
    getUser () {
      this.loading = true
      getUser({
        userName: this.currentName
      }).then(res => {
        if (!res.data) {
          this.$router.push({ name: 'Users' })
          return this.$msg({
            type: 'error',
            text: this.$ts('user.userNotExist')
          })
        }
        res.data.groups = res.data.groups || []
        res.data.policies = res.data.policies || []
        res.data.accessCredentials = res.data.accessCredentials || []
        this.userGroup = res.data.groups.map(item => {
          return { groupName: item }
        })
        this.cloneUserGroup = [...this.userGroup]
        this.enableUser = res.data.status === 1
        this.userType = Number(res.data.userType || 1)
        this.userPolicy = res.data.policies.map(item => {
          return {
            name: item
          }
        })
        this.cloneUserPolicy = [...this.userPolicy]
        this.serviceData = res.data.accessCredentials.map(item => {
          return {
            name: item
          }
        })
        this.quotaData = res.data.quotaVo || {
          objectSize: '', objectCount: '0'
        }
        Object.assign(this.bucketObj, { pageNum: 1, pageSize: 10, totalCount: 0 })
        listBucketPoliciesByUser({
          pageNum: 1,
          pageSize: 10,
          userName: this.currentName
        }).then((res) => {
          const { totalCount } = res.data
          this.bucketData = res.data.list.map(item => {
            item.policyInfo.Statement.forEach(x => {
              formatViewStatement(x, this.permissionGroup)
            })
            return item
          })
          Object.assign(this.bucketObj, {
            totalCount
          })
        }).finally(() => {
          this.loading = false
        })
      })

      // this.quotaData = res.data.quotaVo ||
      // {
      //   objectSize: '', objectCount: '0'
      // }
    },
    renderCondition (condition) {
      if (!condition) return []
      const res = []
      Object.keys(condition).map(item => {
        Object.keys(condition[item]).map(x => {
          res.push({
            key: x,
            value: condition[item][x],
            symbol: item
          })
        })
      })
      return res
    },
    renderPrincipal (data) {
      const type = Object.prototype.toString.call(data)
      if (type.indexOf('Array') > -1) {
        return data
      } else {
        return data.split(',')
      }
    },
    getListBucketPolicies () {
      this.loading = true
      listBucketPoliciesByUser({
        pageNum: this.bucketObj.pageNum,
        pageSize: this.bucketObj.pageSize,
        userName: this.currentName
      }).then((res) => {
        const { totalCount } = res.data
        this.bucketData = res.data.list.map(item => {
          item.policyInfo.Statement.forEach(x => {
            formatViewStatement(x, this.permissionGroup)
          })
          return item
        })
        Object.assign(this.bucketObj, {
          totalCount
        })
      }).finally(() => {
        this.loading = false
      })
    },
    getRowClass (row, index) {
      if (row.row.policyInfo.Statement && row.row.policyInfo.Statement.length === 0) {
        return 'hide-icon'
      } else if (!Array.isArray(row.row.policyInfo.Statement)) {
        return 'hide-icon'
      }
    },
    handleSizeChange (val) {
      this.bucketObj.pageSize = val
      this.getListBucketPolicies()
    },
    handleCurrentChange (val) {
      this.bucketObj.pageNum = val
      this.getListBucketPolicies()
    },
    listPolicies () {
      this.$nextTick(() => {
        getPolicy().then(res => {
          this.policyData = res.data
          // 重复
          this.clonePolicyData = [...this.policyData]
          this.$refs['policyTable'].clearSelection()
          this.userPolicy.forEach(item => {
            this.$refs['policyTable'].toggleRowSelection(item)
          })
        })
      })
    },
    deleteUser () {
      if (this.userGroup && this.userGroup.length) {
        this.deleteFlag = false
        const group = this.userGroup.map(item => item.groupName)
        this.$confirm(
          `${this.$ts("user.delUserTip", { error: `<b style="color: #ff8746">${group}</b>`, error2: `<b style="color: #ff8746">${this.$ts('user.removeGroupUser')}</b>` })}`,
          {
            confirmButtonText: this.$ts('page.confirm'),
            cancelButtonText: this.$ts('page.cancel'),
            type: 'warning',
            dangerouslyUseHTMLString: true
          }
        ).then(res => {
          this.confirmDelete()
        })
      } else {
        this.confirmDelete()
      }
    },
    confirmDelete () {
      deleteUser(this.currentName)
        .then(res => {
          this.$msg({
            type: 'success',
            text: this.$ts('page.responseSuccess')
          })
          this.$router.push({ name: 'Users' })
        })
        .catch(err => {
          console.error(err)
        })
    },
    resetPassword () {
      this.passwordDialog = true
      this.$nextTick(() => {
        this.$refs['ipt'].$el.querySelector('input').focus()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-tag {
  color: #e39606;
  background-color: #384348;
  border-color: transparent;
}

.users {
  margin: 15px 20px;
  padding: 10px 0;

  .ipt {
    .left {
      line-height: 38px;
    }

    .el-input {
      width: 70%;
    }
  }

  ::v-deep .searchIpt {
    width: 20%;
    margin-right: 20px;
    margin-top: -2px;

    .el-input__inner {
      height: 30px;
    }

    .el-input__icon {
      line-height: 30px;
    }
  }
}

::v-deep .container {
  margin-top: 20px;
  box-shadow: 0 2px 12px 0 rgb(0, 0, 0, 0.2);

  .topMenu {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .iconName {
      width: 40%;
      display: flex;
      align-items: center;

      .svgicon {
        font-size: 50px;
        color: #d3d6d8;
      }

      div {
        text-align: left;
        margin-right: 40px;
        display: flex;
        flex-direction: column;
        margin-left: 10px;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .rightMenu {
      display: flex;
      justify-content: space-between;

      .el-switch {
        margin-left: 5px;
      }

      div {
        span {
          font-size: 14px;
          margin-left: 20px;
        }

        .el-switch {
          margin-top: -5px;
        }
      }

      i {
        font-size: 20px;
        cursor: pointer;
        margin-left: 30px;
        color: #ff8746;
      }
    }
  }

  .tabs {
    min-height: 600px;

    .el-tabs__item.is-active {
      box-shadow: unset;
      margin-bottom: 0;
      top: 0;
      color: #ff8746;
    }

    .el-tabs__active-bar {
      display: none;
    }

    .el-tabs__nav {
      width: 200px;
    }

    .el-tabs__item {
      text-align: left;
      line-height: 60px;
      height: 60px;
      margin-left: 5px;
      // border-bottom: 1px solid #ff8746;
      // background-color: #2b3d45;

      &:hover {
        color: #ff8746;
      }
    }
  }
}

.el-header {
  text-align: center;
  height: 80px !important;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.el-aside {
  background-color: #36464e;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  padding: 20px;

  h3 {
    font-weight: 100;
    font-size: 20px;
  }

  h4 {
    margin: 10px 0;
  }

  .clearfix {
    margin-bottom: 20px;
  }
}

::v-deep .serviceAccount {
  .el-dialog__header {
    padding: 20px 20px 10px;
    border: none;
  }

  .el-dialog__body {
    padding: 20px 40px;

    .el-form-item {
      margin: 10px 0;

      .el-form-item__label {
        margin-left: 0;
        text-align: left;
        width: 180px !important;
      }

      .el-form-item__content {
        margin-bottom: 20px;

        .el-form-item__error {
          left: 33%;
        }
      }

      .el-switch {
        margin-top: 10px;

        .el-switch__label {
          color: #e2e2e2;
        }

        .is-active {
          color: #081c42;
        }
      }

      .el-input {
        width: 65%;
      }
    }

    p,
    h3 {
      margin-bottom: 20px;
    }

    i.el-icon-document-copy {
      position: relative;
      top: -50px;
      right: -95%;
      font-size: 20px;
    }

    .bottomMenu {
      display: flex;
      justify-content: flex-end;
      margin-top: -30px;
      cursor: pointer;
      margin-right: 5px;

      i {
        top: unset;
        right: unset;
        border: 1px solid #ccc;
        padding: 5px;
        z-index: 99;
        font-size: 16px;
        margin-left: 10px;
      }
    }
  }
}

svg.backicon {
  margin: -3px 0 10px 20px;
}

:deep(.modifyPassword) {
  label.el-form-item__label {
    width: 180px !important;
    margin-left: -30px;
  }
}

::v-deep .el-descriptions {
  .el-descriptions-item__label {
    color: #ccc;
  }
}

::v-deep .el-table .hide-icon .cell .el-table__expand-icon {
  display: none;
}

.clearfix .bucket_column {
  position: relative;
  bottom: -60px;
  z-index: 999;
}

::v-deep .outerTable {
  .expanded {
    th {
      padding: 0 !important;
    }
  }

  .el-table__expanded-cell {
    th {
      padding: 0 !important;
    }
  }

  .innerTable {

    th,
    td {
      padding: 0 !important;
    }

    th {
      display: none;
    }
  }
}
</style>
