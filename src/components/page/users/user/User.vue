<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mb_15">
        <el-button
          v-access="'admin:CreateUser'"
          size="small"
          type="primary"
          class="golden"
          @click="type = 'add'; isCreate = true"
        >
          {{ $ts('CREATE') }}
        </el-button>
        <!-- <el-button v-access="'admin:UpdateUser'" size="small" type="primary" class="blue" :disabled="!oneSelection"
          @click="modUser">
          {{ $ts('modify') }}
        </el-button>
        <el-button v-access="'admin:AddGroupToUser'" type="primary" class="blue" :disabled="!oneSelection"
          @click="type = 'addToGroup'; addGroupDialog = true">
          {{ $ts('add.to.group') }}
        </el-button> -->
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh right"
            @click="refreshList()"
          />
        </el-tooltip>
        <el-input
          v-model="searchVal"
          class="search_style right"
          placeholder="用户名称过滤"
          width="14"
          clearable
        />
      </el-row>

      <UserTable
        ref="usertable"
        :search-val="searchVal"
        @handleSelection="handleSelection"
      />
    </div>
    <!-- 添加user -->
    <el-dialog
      class="addUser"
      :title="isAdd ? $ts('user.model.create') : $ts('user.model.modify')"
      :visible.sync="isCreate"
      width="650px"
      @open="dialogOpen('tableFocus')"
    >
      <el-form
        ref="createForm"
        :model="createForm"
        :rules="rules"
        size="mini"
        label-width="100px"
        style="padding:0 5%"
      >
        <el-form-item
          label="用户类型"
          required
        >
          <el-radio-group v-model="createForm.userType">
            <el-radio :label="1">普通用户</el-radio>
            <el-radio :label="2">工号用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="`${$ts('user.name')}(AK)`" prop="name">
          <el-input
            ref="tableFocus"
            v-model="createForm.name"
            clearable
            :readonly="!isAdd"
            placeholder="用户名只能输入小写英文、数字及中划线、下划线，长度限制为3-63位。"
            auto-complete="new-password"
          />
        </el-form-item>
        <el-form-item
          v-if="isAdd&&createForm.userType==1"
          :label="$ts('user.pwd')"
          prop="pwd"
        >
          <el-input
            v-model="createForm.pwd"
            type="password"
            clearable
            auto-complete="new-password"
            placeholder="密码建议包含英文大小写、数字及特殊字符中的3种及以上。"
          />
        </el-form-item>
        <el-tabs
          v-model="activeName"
          @tab-click="handleScroll"
        >
          <el-tab-pane
            label="策略"
            name="policies"
          >
            <el-form-item
              label="选择策略名"
              class="policyLabel"
            >
              <el-input
                v-model="policyName"
                placeholder="策略名过滤"
                clearable
              />
            </el-form-item>
            <el-table
              ref="policyTable"
              border
              class="policyData"
              :data="policyData"
              max-height="400"
              :row-key="(row) => row.name"
              :default-sort="{ order: 'ascending', prop: 'name' }"
              @selection-change="handlePolicyChange"
            >
              <el-table-column
                type="selection"
                reserve-selection
                align="center"
                width="100px"
                :selectable="checkBasePolicy"
              />
              <el-table-column
                prop="name"
                label="策略名"
                sortable
              />
            </el-table>
          </el-tab-pane>
          <el-tab-pane
            label="用户组"
            name="groups"
          >
            <el-form-item
              label="选择用户组"
              class="policyLabel"
            >
              <el-input
                v-model="groupName"
                placeholder="用户组名过滤"
                clearable
              />
            </el-form-item>
            <el-table
              ref="groupTable"
              border
              :data="groupData"
              class="groupData"
              max-height="400"
              :row-key="(row) => row.groupName"
              :default-sort="{ order: 'ascending', prop: 'groupName' }"
              @selection-change="handleGroupChange"
            >
              <el-table-column
                type="selection"
                width="100px"
                reserve-selection
                align="center"
              />
              <el-table-column
                prop="groupName"
                label="组名"
                sortable
              />
            </el-table>
          </el-tab-pane>
          <!-- <el-tab-pane label="访问凭证" name="access">
            <el-form-item label="选择凭证">
              <el-input v-model="accessName" placeholder="凭证名过滤" />
            </el-form-item>
            <el-table
              ref="accessTable"
              border
              :data="accessData"
              class="groupData"
              max-height="300"
              :row-key="(row)=>row.key"
              @selection-change="handleAccessChange"
            >
              <el-table-column
                type="selection"
                width="55"
                reserve-selection
                align="center"
              />
              <el-table-column prop="key" label="凭证key" />
            </el-table>
          </el-tab-pane> -->
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="isCreate = false">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="createUser">{{ $ts('button.confirm') }}</el-button>

      </div>
    </el-dialog>

    <!-- 添加进用户组 -->
    <el-dialog :title="$ts('add.to.group')" :visible.sync="addGroupDialog" width="750px">
      <div class="flexMenu">
        <span>所选用户</span>
        <el-input
          :value="userNameStr"
          readonly
        />
      </div>
      <div class="flexMenu">
        <span>分配用户组</span>
        <el-input
          v-model="groupName"
          placeholder="用户组名过滤"
        />
      </div>
      <el-table
        ref="groupTable"
        border
        :data="groupData"
        class="groupData"
        max-height="300"
        :row-key="(row) => row.groupName"
        @selection-change="handleGroupChange"
      >
        <el-table-column
          type="selection"
          width="55"
          reserve-selection
          align="center"
        />
        <el-table-column
          prop="groupName"
          label="组名"
        />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="addGroupDialog = false">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="addToGroup">{{ $ts('button.confirm') }}</el-button>
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
  data() {
    const checkNameReg = (rule, data, callback) => {
      const reg = /^[0-9a-z_-]{3,63}$/
      if (!reg.test(data)) {
        return callback('用户名只能输入小写英文、数字及中划线、下划线，长度限制为3-63位')
      }
      return callback()
    }
    // const checkPasswordReg = (rule, data, callback) => {
    //   const reg = /[\u4e00-\u9fa5]/
    //   if (reg.test(data)) {
    //     return callback('密码不能包含中文')
    //   } else if (data.length < 11 || data.length > 40) { // 跟华泰系统匹配，密码长度最低要求11位
    //     return callback('密码长度限制为11-40位')
    //   }
    //   return callback()
    // }
    const checkPositiveNumber = (rule, data, callback) => {
      data = isNaN(Number(data)) ? -1 : Number(data)
      if (data < 0) {
        return callback('请填入正整数')
      } else {
        return callback()
      }
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
      addGroupDialog: false,
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
            message: this.$ts('user.rule.user.name'),
            trigger: ['blur', 'change']
          },
          { validator: checkNameReg, trigger: ['blur', 'change'] }
        ],
        pwd: [
          {
            required: true,
            message: this.$ts('please.enter.pwd'),
            trigger: ['blur', 'change']
          },
          { validator: checkPasswordReg, trigger: ['blur', 'change'] }
          // { validator: this.nameValidate(2, 64), trigger: ['blur', 'change'] }
        ],
        bucketLogic: {
          validator: checkPositiveNumber,
          trigger: ['blur', 'change']
        },
        objectCount: {
          validator: checkPositiveNumber,
          trigger: ['blur', 'change']
        }
      }
    }
  },
  computed: {
    checkSelection() {
      return this.multipleSelection && this.multipleSelection.length > 0
    },
    oneSelection() {
      return this.multipleSelection && this.multipleSelection.length == 1
    },
    userNameStr() {
      return this.multipleSelection
        .reduce((pre, cur) => {
          return pre + cur.userName + ', '
        }, '')
        .replace(/, $/, '')
    },
    isAdd() {
      return this.type === 'add'
    }
  },
  watch: {
    isCreate(val) {
      if (val) {
        this.listPolicies()
      }
    },
    policyName(val) {
      this.policyData = [...this.clonePolicyData]
      if (!val) return
      this.policyData = this.policyData.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    groupName(val) {
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
    activeName(val, old) {
      if (val == '0') return
      if (old !== '0' && val === 'policies') {
        this.listPolicies()
      } else if (val === 'groups') {
        this.listGroup()
      }
    },
    addGroupDialog(val) {
      if (val) {
        this.listGroup()
      } else {
        this.groupName = ''
        this.$refs.groupTable.clearSelection()
      }
    }
  },
  mounted() { },
  methods: {
    checkBasePolicy(val) {
      return val.name !== 'BasePolicy'
      // this.$refs.policyTable.toggleRowSelection(val.name !== 'BasePolicy', true);
    },
    refreshList() {
      this.$refs['usertable'].listUser()
    },
    modUser() {
      this.type = ''
      this.isCreate = true
    },
    addToGroup() {
      const groups = this.selectedGroup.map(item => item.groupName)
      // 传递多个userName
      // const userName = this.multipleSelection.reduce((pre, cur) => {
      //   return pre + cur.userName
      // }, '')
      addGroupToUser({
        groups,
        userName: this.multipleSelection[0].userName
      })
        .then(res => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.addGroupDialog = false
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.$refs['usertable'].listUser()
        })
      // console.log(
      //   this.selectedGroup,
      //   '选择group',
      //   this.multipleSelection,
      //   '选择user'
      // )
    },
    createUser() {
      // 创建用户
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
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
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
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.isCreate = false
              this.refreshList()
            })
          }
        }
      })
    },
    covertByte(num, range) {
      switch (range) {
        case 'MB':
          return num * 1024 ** 2
        case 'GB':
          return num * 1024 ** 3
        case 'TB':
          return num * 1024 ** 4
      }
    },
    handleSelection(val) {
      this.multipleSelection = val
    },
    clearForm() {
      this.createForm.name = ''
      this.createForm.pwd = ''
      this.createForm.userType = 1
      this.policyName = ''
      this.groupName = ''
      this.$refs['createForm'].resetFields()
      this.$refs.policyTable.clearSelection()
      this.$refs.groupTable.clearSelection()
    },
    listPolicies() {
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
    listGroup() {
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
    handleScroll() {
      if (this.activeName === 'policies') {
        this.$refs['groupTable'].$el.children[2].scrollTop = 0
      } else {
        this.$refs['policyTable'].$el.children[2].scrollTop = 0
      }
    },
    // 创建、修改表单重置
    dialogOpen(e) {
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
    handlePolicyChange(val) {
      this.selectedPolicy = val
    },
    handleGroupChange(val) {
      this.selectedGroup = val
    },
    handleAccessChange(val) {
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
