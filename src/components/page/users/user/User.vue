<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mb_15">
        <el-button v-access="'admin:CreateUser'" size="small" type="primary" class="golden"
          @click="type = 'add'; isCreate = true">
          {{ $ts("page.create") }}
        </el-button>
        <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
          <i class="el-icon-refresh right" @click="refreshList()" />
        </el-tooltip>
        <el-input v-model="searchVal" class="search_style right" :placeholder="$ts('group.searchUsername')" width="14"
          clearable />
      </el-row>

      <UserTable ref="usertable" :search-val="searchVal" @handleSelection="handleSelection" />
    </div>
    <el-dialog class="addUser" :title="isAdd ? $ts('user.createUser') : $ts('user.modifyUser')" :visible.sync="isCreate"
      width="650px" @open="dialogOpen('tableFocus')">
      <el-form ref="createForm" :model="createForm" :rules="rules" size="mini" label-width="100px" style="padding:0 5%">
        <el-form-item :label="$ts('user.userType')" required>
          <el-radio-group v-model="createForm.userType">
            <el-radio :label="1">{{ $ts('user.commonUser') }}</el-radio>
            <el-radio :label="2">{{ $ts('user.jobNumberUser') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="`${$ts('user.username')}(AK)`" prop="name">
          <el-input ref="tableFocus" v-model="createForm.name" clearable :readonly="!isAdd"
            :placeholder="$ts('user.userNameReg')" auto-complete="new-password" />
        </el-form-item>
        <el-form-item v-if="isAdd && createForm.userType == 1" :label="$ts('user.pwd')" prop="pwd">
          <el-input v-model="createForm.pwd" type="password" clearable auto-complete="new-password"
            :placeholder="$ts('user.pwsReg')" />
        </el-form-item>
        <el-tabs v-model="activeName" @tab-click="handleScroll">
          <el-tab-pane :label="$ts('group.policies')" name="policies">
            <el-form-item :label="$ts('group.selectPolicy')" class="policyLabel">
              <el-input v-model="policyName" :placeholder="$ts('group.searchPolicyName')" clearable />
            </el-form-item>
            <el-table ref="policyTable" border class="policyData" :data="policyData" max-height="400"
              :row-key="(row) => row.name" :default-sort="{ order: 'ascending', prop: 'name' }"
              @selection-change="handlePolicyChange">
              <el-table-column type="selection" reserve-selection align="center" width="100px"
                :selectable="checkBasePolicy" />
              <el-table-column prop="name" :label="$ts('group.policyName')" sortable />
            </el-table>
          </el-tab-pane>
          <el-tab-pane :label="$ts('group.userGroup')" name="groups">
            <el-form-item :label="$ts('group.selectGroup')" class="policyLabel">
              <el-input v-model="groupName" :placeholder="$ts('group.groupNameSearch')" clearable />
            </el-form-item>
            <el-table ref="groupTable" border :data="groupData" class="groupData" max-height="400"
              :row-key="(row) => row.groupName" :default-sort="{ order: 'ascending', prop: 'groupName' }"
              @selection-change="handleGroupChange">
              <el-table-column type="selection" width="100px" reserve-selection align="center" />
              <el-table-column prop="groupName" :label="$ts('group.groupName')" sortable />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="isCreate = false">{{ $ts('page.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="createUser">{{ $ts('page.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script type="text/javascript">
// import { listAccessCredentials } from '@/api/accessCredential'
import { getPolicy } from '@/api/policy'
import { listGroups } from '@/api/group'
import { createUser, addGroupToUser, updateUser } from '@/api/user'
import { checkPasswordReg } from '@/utils/pass'
import UserTable from '@/components/page/users/user/UserTable'
export default {
  name: 'Users',
  components: {
    UserTable
  },
  data () {
    const checkNameReg = (rule, data, callback) => {
      const reg = /^[0-9a-z_-]{3,63}$/
      if (!reg.test(data)) {
        return callback(this.$ts('user.userNameReg'))
      }
      return callback()
    }
    return {
      type: 'add',
      sizeSelect: [
        { label: 'MB', value: 'MB' },
        { label: 'GB', value: 'GB' },
        { label: 'TB', value: 'TB' }
      ],
      searchVal: '',
      activeName: '',
      isCreate: false,
      createForm: {
        name: '',
        pwd: '',
        bucketLogic: '',
        objectCount: '',
        bucketLogicType: 'MB',
        userType: 1
      },
      policyName: '',
      policyData: [],
      clonePolicyData: [],
      groupName: '',
      groupData: [],
      cloneGroupData: [],
      // accessName: '',
      accessData: [],
      cloneAccessData: [],
      selectedAccess: [],
      selectedPolicy: [],
      selectedGroup: [],
      multipleSelection: [],
      rules: {
        name: [
          {
            required: true,
            message: this.$ts('user.usernamnRequired'),
            trigger: ['blur', 'change']
          },
          { validator: checkNameReg, trigger: ['blur', 'change'] }
        ],
        pwd: [
          {
            required: true,
            message: this.$ts('user.pwdRequired'),
            trigger: ['blur', 'change']
          },
          { validator: checkPasswordReg, trigger: ['blur', 'change'] }
        ],
      }
    }
  },
  computed: {
    checkSelection () {
      return this.multipleSelection && this.multipleSelection.length > 0
    },
    oneSelection () {
      return this.multipleSelection && this.multipleSelection.length == 1
    },
    userNameStr () {
      return this.multipleSelection
        .reduce((pre, cur) => {
          return pre + cur.userName + ', '
        }, '')
        .replace(/, $/, '')
    },
    isAdd () {
      return this.type === 'add'
    }
  },
  watch: {
    isCreate (val) {
      if (val) {
        this.listPolicies()
      }
    },
    policyName (val) {
      this.policyData = [...this.clonePolicyData]
      if (!val) return
      this.policyData = this.policyData.filter(item => {
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
    // accessName (val) {
    //   this.accessData = [...this.cloneAccessData]
    //   if (!val) return
    //   this.accessData = this.accessData.filter(item => {
    //     return item.key.toLowerCase().indexOf(val.toLowerCase()) !== -1
    //   })
    // },
    activeName (val, old) {
      if (val == '0') return
      if (old !== '0' && val === 'policies') {
        this.listPolicies()
      } else if (val === 'groups') {
        this.listGroup()
      }
    },
  },
  mounted () { },
  methods: {
    checkBasePolicy (val) {
      return val.name !== 'BasePolicy'
      // this.$refs.policyTable.toggleRowSelection(val.name !== 'BasePolicy', true);
    },
    refreshList () {
      this.$refs['usertable'].listUser()
    },
    modUser () {
      this.type = ''
      this.isCreate = true
    },
    createUser () {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          const groups = this.selectedGroup.map(item => {
            return {
              groupName: item.groupName,
              policyList: item.policies,
              userList: item.userList
            }
          })
          const policies = this.selectedPolicy.map(item => item.name)
          // const accessCredentials = this.selectedAccess.map(item => {
          //   return {
          //     key: item.key,
          //     ownerUser: item.ownerUser,
          //     secret: item.secret
          //   }
          // })
          if (!this.isAdd) {
            updateUser({
              // accessCredentials,
              groups,
              policies,
              userName: this.createForm.name
            }).then(res => {
              this.$msg({
                type: 'success',
                text: this.$ts('page.responseSuccess')
              })
              this.isCreate = false
              this.refreshList()
            })
          } else {
            const reqParam = {
              groups,
              policies,
              userName: this.createForm.name.trim(),
              password: this.createForm.pwd,
              userType: this.createForm.userType
            }
            this.createForm.userType === '2' && delete reqParam.password
            createUser(reqParam).then(res => {
              this.$msg({
                type: 'success',
                text: this.$ts('page.responseSuccess')
              })
              this.isCreate = false
              this.refreshList()
            })
          }
        }
      })
    },
    covertByte (num, range) {
      switch (range) {
        case 'MB':
          return num * 1024 ** 2
        case 'GB':
          return num * 1024 ** 3
        case 'TB':
          return num * 1024 ** 4
      }
    },
    handleSelection (val) {
      this.multipleSelection = val
    },
    clearForm () {
      this.createForm.name = ''
      this.createForm.pwd = ''
      this.createForm.userType = 1
      this.policyName = ''
      this.groupName = ''
      this.$refs['createForm'].resetFields()
      this.$refs.policyTable.clearSelection()
      this.$refs.groupTable.clearSelection()
    },
    listPolicies () {
      getPolicy()
        .then(res => {
          this.policyData = res.data
          this.policyData.forEach((item) => {
            if (item.name == 'BasePolicy') {
              this.$refs.policyTable.toggleRowSelection(item, true)
            }
          })
          this.clonePolicyData = [...this.policyData]

          // api list可能变化、获取新的从而匹配所选是否依旧存在 刷新显示当前有效复选框
          if (!this.isAdd) {
            const policies = this.multipleSelection[0].policies.map(item => {
              return {
                name: item
              }
            })
            policies.forEach(item => {
              this.$refs['policyTable'].toggleRowSelection(item)
            })
          }
          if (this.selectedPolicy && this.selectedPolicy.length) {
            const temp = this.filterTarget(
              this.policyData,
              this.selectedPolicy,
              'name'
            )
            this.$refs.policyTable.clearSelection()
            temp.forEach(item => {
              this.$refs.policyTable.toggleRowSelection(item)
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    listGroup () {
      listGroups()
        .then(res => {
          this.groupData = res.data
          this.cloneGroupData = [...this.groupData]
          // console.log(res.data, 'listgroup')
          // groupName
          // 修改数据回显、表格显示已管理group、后续切换不进入此菜单、状态也就是selectedGroup改变的时候
          if (!this.isAdd) {
            const groups = this.multipleSelection[0].groups.map(item => {
              return {
                groupName: item
              }
            })
            if (this.type === 'addToGroup') {
              this.groupData = this.filterDiff(
                this.groupData,
                groups,
                'groupName'
              )
              this.cloneGroupData = [...this.groupData]
            }
            groups.forEach(item => {
              this.$refs['groupTable'].toggleRowSelection(item)
            })
          }
          // console.log(this.selectedGroup, 'selectedGroup')
          if (this.selectedGroup && this.selectedGroup.length) {
            const temp = this.filterTarget(
              this.groupData,
              this.selectedGroup,
              'groupName'
            )
            this.$refs.groupTable.clearSelection()
            temp.forEach(item => {
              this.$refs.groupTable.toggleRowSelection(item)
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // listAccess () {
    //   listAccessCredentials().then(res => {
    //     this.accessData = res.data
    //     this.cloneAccessData = [...this.accessData]
    //     // listAccess  修改的data只有对应的值，需要对应上listAccess的key

    //     if (!this.isAdd) {
    //       const access = this.multipleSelection[0].accessCredentials.map(
    //         item => {
    //           return {
    //             key: item
    //           }
    //         }
    //       )
    //       access.forEach(item => {
    //         this.$refs['accessTable'].toggleRowSelection(item)
    //       })
    //     }
    //     if (this.selectedAccess && this.selectedAccess.length) {
    //       const temp = this.filterTarget(
    //         this.accessData,
    //         this.selectedAccess,
    //         'key'
    //       )
    //       this.$refs.accessTable.clearSelection()
    //       temp.forEach(item => {
    //         this.$refs.accessTable.toggleRowSelection(item)
    //       })
    //     }
    //   })
    // },
    handleScroll () {
      if (this.activeName === 'policies') {
        this.$refs['groupTable'].$el.children[2].scrollTop = 0
      } else {
        this.$refs['policyTable'].$el.children[2].scrollTop = 0
      }
    },
    // 创建、修改表单重置
    dialogOpen (e) {
      this.$nextTick(() => {
        if (this.isAdd) this.$refs[e].$el.querySelector('input').focus()
        this.$refs['policyTable'].$el.children[2].scrollTop = 0
        this.$refs['groupTable'].$el.children[2].scrollTop = 0
        this.clearForm()
        this.activeName = 'policies'
        if (!this.isAdd) {
          this.createForm.name = this.multipleSelection[0].userName
        }
      })
    },
    handlePolicyChange (val) {
      this.selectedPolicy = val
    },
    handleGroupChange (val) {
      this.selectedGroup = val
    },
    handleAccessChange (val) {
      this.selectedAccess = val
    }
  }
}
</script>
<style lang="scss" scoped>
.policyLabel {
  margin-top: 18px;
}

.el-form-item {
  margin-bottom: 18px;
}

.flexMenu {
  span {
    line-height: 40px;
    width: 200px;
  }
}
</style>
