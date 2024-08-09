<template>
  <div class="group">
    <el-container class="container">
      <el-header>
        <div class="topMenu">
          <div class="iconName">
            <svg
              class="svgicon icon"
              aria-hidden="true"
            >
              <use xlink:href="#icon-group" />
            </svg>
            <div>
              {{ currentName.length > 20 ? currentName.substr(0, 20) + '...' : currentName }}
            </div>
          </div>
          <div class="rightMenu">
            <div>
              <span>用户组状态:
                <span
                  v-if="enableGroup"
                  class="green"
                >启用</span>
                <span
                  v-else
                  class="red"
                >未启用</span>
              </span>
              <el-switch
                v-model="enableGroup"
                v-access="'admin:EnableGroup;admin:DisableGroup'"
                @change="switchGroupStatus"
              />
            </div>
            <el-tooltip
              content="删除用户"
              placement="top"
              effect="dark"
            >
              <i
                v-access="'admin:DeleteGroup'"
                class="fa fa-trash-o"
                title="删除用户组"
                @click="deleteFlag = true"
              />
            </el-tooltip>
            <el-tooltip
              content="返回用户组列表"
              placement="top"
              effect="dark"
            >
              <svg
                class="icon backicon"
                aria-hidden="true"
                @click="$router.push({ name: 'Group' })"
              >
                <use xlink:href="#icon-fanhui" />
              </svg>
            </el-tooltip>
            <el-tooltip
              content="刷新"
              placement="top"
              effect="dark"
            >
              <i
                class="fa fa-refresh"
                @click="groupDetail"
              />
            </el-tooltip>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-tabs
            v-model="tabName"
            tab-position="left"
            class="tabs"
          >
            <el-tab-pane
              label="用户"
              name="members"
            />
            <el-tab-pane
              label="策略"
              name="Policy"
            />
          </el-tabs>
        </el-aside>
        <el-main>
          <div v-show="tabName === 'members'">
            <div class="clearfix">
              <h3 class="left">用户</h3>
              <el-button
                v-access="'admin:AddUserToGroup;admin:RemoveUserFromGroup'"
                class="right golden"
                type="primary"
                @click="searchUser = ''; memberDialog = true"
              >配置组成员</el-button>
              <el-input
                v-model="searchUser"
                class="right search "
                placeholder="用户名搜索"
                clearable
              />
            </div>
            <el-table
              :data="memberData"
              border
              max-height="600"
            >
              <el-table-column
                prop="userName"
                label="名称"
              >
                <template slot-scope="scope">
                  <el-tooltip
                    content="用户详情"
                    placement="top"
                  >
                    <a
                      v-access:disable="'admin:GetUser'"
                      class="blue"
                      @click="queryUserDetail(scope.row)"
                    >
                      {{ scope.row.userName }}
                    </a>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column label="移除用户">
                <template slot-scope="scope">
                  <i
                    v-access="'admin:AddUserToGroup;admin:RemoveUserFromGroup'"
                    class="fa fa-trash-o"
                    title="删除"
                    @click="deleteUser(scope.row)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-show="tabName === 'Policy'">
            <div class="clearfix">
              <h3 class="left">策略</h3>
              <el-button
                v-access="'admin:SetUserOrGroupPolicy'"
                class="right golden"
                @click="searchPolicy = ''; policyDialog = true"
              >配置策略</el-button>
              <el-input
                v-model="searchPolicy"
                class="right search"
                placeholder="策略名搜索"
                clearable
              />
            </div>
            <el-table
              :data="userPolicy"
              border
              max-height="600"
            >
              <el-table-column
                prop="name"
                label="策略名"
              >
                <template slot-scope="scope">
                  <el-tooltip
                    content="策略详情"
                    placement="top"
                  >
                    <a
                      v-access:disable="'admin:GetPolicy'"
                      class="blue"
                      @click="$router.push({ name: 'PolicyDetail', params: { name: scope.row.name } })"
                    >
                      {{ scope.row.name }}
                    </a>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column label="移除策略">
                <template slot-scope="scope">
                  <i
                    v-if="scope.row.name !== 'BasePolicy'"
                    v-access="'admin:SetUserOrGroupPolicy'"
                    class="fa fa-trash-o"
                    title="删除"
                    @click="deletePolicy(scope.row)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-main>
      </el-container>
    </el-container>
    <el-dialog
      :visible.sync="memberDialog"
      title="设置组成员"
      width="750px"
      style="padding:0 5%"
      @close="handleScroll('memberTable')"
    >
      <div class="clearfix ipt">
        <span class="left">所选用户组</span>
        <el-input
          class="right"
          :value="currentName"
          readonly
        />
      </div>
      <div class="clearfix ipt">
        <span class="left">分配用户</span>
        <el-input
          v-model="userName"
          class="right"
          placeholder="用户名过滤"
          clearable
        />
      </div>

      <el-table
        ref="memberTable"
        class="editMemeberData policyData"
        :data="editMemeberData"
        border
        max-height="400"
        :row-key="(row) => row.userName"
        @selection-change="handleMemberChange"
      >
        <el-table-column
          type="selection"
          width="55"
          reserve-selection
          align="center"
        />
        <el-table-column
          prop="userName"
          label="用户名"
        />
      </el-table>
      <div slot="footer">
        <el-button @click="resetUser">{{ $ts('reset') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmGroup">{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="设置策略"
      :visible.sync="policyDialog"
      width="700px"
      @close="handleScroll('policyTable')"
    >
      <div class="flexMenu">
        <span>所选用户组</span>
        <el-input
          :value="currentName"
          readonly
        />
      </div>
      <div class="flexMenu">
        <span>当前策略</span>
        <el-tooltip
          v-if="currentPolicyName"
          placement="top"
          effect="dark"
          :content="currentPolicyName"
          popper-class="selectGroupPolicyTip"
        >
          <el-input
            :value="currentPolicyName"
            readonly
          />
        </el-tooltip>
        <el-input
          v-else
          readonly
        />
      </div>
      <div class="flexMenu">
        <span>分配策略</span>
        <el-input
          v-model="policyName"
          placeholder="策略名过滤"
        />
      </div>
      <el-table
        ref="policyTable"
        border
        class="policyData"
        :data="policyData"
        max-height="400"
        :row-key="(row) => row.name"
        @selection-change="handlePolicyChange"
      >
        <el-table-column
          type="selection"
          width="55"
          reserve-selection
          align="center"
          :selectable="checkBasePolicy"
        />
        <el-table-column
          prop="name"
          label="策略名"
        />
      </el-table>
      <div slot="footer">
        <el-button @click="resetPolicy">{{ $ts('reset') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmPolicy(false)">{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="删除用户组"
      :visible.sync="deleteFlag"
      width="650px"
    >
      <p>删除当前用户组:
        <span style="color: #ff8746;">
          {{ currentName }}
        </span>
      </p>
      <div slot="footer">
        <el-button @click="deleteFlag = false">{{ $ts('cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="deleteGroup">{{ $ts('delete') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { setUserOrGroupPolicy, getPolicy } from '@/api/policy'
import { listUsers } from '@/api/user'
import {
  enableGroup,
  disableGroup,
  getGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup
} from '@/api/group'
export default {
  name: 'GroupDetail',
  data () {
    return {
      tabName: 'members',
      searchPolicy: '',
      searchUser: '',
      userName: '',
      memberData: [],
      cloneMData: [],
      editMemeberData: [],
      cloneMemberData: [],
      userPolicy: [],
      clonePolicy: [],
      policyName: '',
      policyDialog: false,
      policyData: [],
      selectedPolicy: [],
      clonePolicyData: [],
      member: [],
      memberDialog: false,
      selectedMember: [],
      passwordDialog: false,
      serviceData: [],
      selectedServiceAccounts: [],
      serviceDialog: false,
      enableGroup: false,
      jsonString: '',
      rules: {},
      deleteFlag: false
    }
  },
  computed: {
    currentPolicyName () {
      return this.userPolicy
        .reduce((cur, pre) => {
          return cur + pre.name + ', '
        }, '')
        .replace(/, $/, '')
    },
    currentName () {
      return this.$route.params.name
    }
  },
  watch: {
    policyDialog (val) {
      if (val) {
        this.listPolicies()
      } else {
        this.policyName = ''
        this.$refs['policyTable'].clearSelection()
        this.groupDetail()
      }
    },
    memberDialog (val) {
      if (val) {
        this.listUsers()
        // api 获取新的用户所选group及其他信息
      } else {
        this.userName = ''
        this.$refs['memberTable'].clearSelection()
      }
    },
    userName (val) {
      this.editMemeberData = [...this.cloneMemberData]
      if (!val) return
      this.editMemeberData = this.editMemeberData.filter(item => {
        return item.userName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    searchPolicy (val) {
      this.userPolicy = [...this.clonePolicy]
      if (!val) return
      this.userPolicy = this.userPolicy.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    searchUser (val) {
      this.memberData = [...this.cloneMData]
      if (!val) return
      this.memberData = this.memberData.filter(item => {
        return item.userName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    policyName (val) {
      this.policyData = [...this.clonePolicyData]
      if (!val) return
      this.policyData = this.policyData.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    }
    // tabName (val) {
    //   if (val == 'serviceAccounts') {
    //     this.listServiceAccounts()
    //   }
    // }
  },
  mounted () {
    this.groupDetail()
  },
  methods: {
    checkBasePolicy (val) {
      return val.name !== 'BasePolicy'
    },
    handleScroll (ref) {
      this.$refs[ref].$el.children[2].scrollTop = 0
    },
    queryUserDetail (row) {
      this.$router.push({ name: 'UserDetail', params: { name: row.userName }})
    },
    copyCode (val) {
      navigator.clipboard.writeText(val)
      this.$ts({
        type: 'success',
        text: '复制成功'
      })
    },
    handlePolicyChange (val) {
      this.selectedPolicy = val
    },
    handleMemberChange (val) {
      this.selectedMember = val
    },
    // 群组设置
    confirmGroup () {
      const removeUser = this.memberData
        .filter(item => {
          return this.selectedMember.every(item2 => {
            return item.userName !== item2.userName
          })
        })
        .map(item => item.userName)
      const addUser = this.selectedMember
        .filter(item => {
          return this.memberData.every(item2 => {
            return item.userName !== item2.userName
          })
        })
        .map(item => item.userName)
      if (removeUser.length && addUser.length) {
        Promise.all([
          addUserToGroup({
            groupName: this.currentName,
            userList: addUser
          }),
          removeUserFromGroup({
            groupName: this.currentName,
            userList: removeUser
          })
        ])
          .then(res => {
            const isTrue = res.filter(item => item.code !== '200')
            if (!isTrue.length) {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            } else {
              this.$ts({
                type: 'success',
                text: this.$ts(isTrue[0].msg)
              })
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.memberDialog = false
            this.groupDetail()
          })
      } else if (addUser.length) {
        addUserToGroup({
          groupName: this.currentName,
          userList: addUser
        })
          .then(res => {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.memberDialog = false
            this.groupDetail()
          })
          .catch(err => {
            console.error(err)
          })
      } else if (removeUser.length) {
        removeUserFromGroup({
          groupName: this.currentName,
          userList: removeUser
        })
          .then(res => {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.memberDialog = false
            this.groupDetail()
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        this.memberDialog = false
      }
      console.log(removeUser, 'remove', addUser, 'add')
      // console.log(this.selectedMember, 'selected')
    },
    deleteUser (row) {
      removeUserFromGroup({
        groupName: this.currentName,
        userList: [row.userName]
      })
        .then(res => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.groupDetail()
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
        type: 'group'
      }).then(res => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
        if (flag) {
          this.groupDetail()
        }
        this.policyDialog = false
      })
      // console.log(this.selectedPolicy, "seletced");
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
    resetUser () {
      this.$refs['memberTable'].clearSelection()
      this.memberData.forEach(item => {
        this.$refs['memberTable'].toggleRowSelection(item)
      })
      this.editMemeberData.push('')
      this.editMemeberData.pop()
    },
    // listServiceAccounts () {
    //   this.serviceData = [
    //     { name: 's1', id: 1 },
    //     { name: 's2', id: 2 },
    //     { name: 's3', id: 3 },
    //     { name: 's4', id: 4 },
    //     { name: 's5', id: 5 }
    //   ]
    // },
    listUsers () {
      this.$nextTick(() => {
        listUsers()
          .then(res => {
            this.editMemeberData = res.data
            this.cloneMemberData = [...this.editMemeberData]
            this.memberData.forEach(item => {
              this.$refs['memberTable'].toggleRowSelection(item)
            })
            // this.editMemeberData.push('')
            // this.editMemeberData.pop()
          })
          .catch(error => {
            console.error(error)
          })
      })
    },
    switchGroupStatus (val) {
      if (val) {
        enableGroup(this.currentName).then(res => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
        })
      } else if (!val) {
        disableGroup(this.currentName).then(res => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
        })
      }
    },
    groupDetail () {
      getGroup({
        groupName: this.currentName
      }).then(res => {
        if (!res.data) {
          this.$router.push({ name: 'Group' })
          return this.$ts({
            type: 'error',
            text: '当前用户组不存在'
          })
        }
        res.data.userList = res.data.userList || []
        res.data.policies = res.data.policies || []
        this.memberData = res.data.userList.map(item => {
          return {
            userName: item
          }
        })
        this.cloneMData = [...this.memberData]
        this.userPolicy = res.data.policies.map(item => {
          return {
            name: item
          }
        })
        this.clonePolicy = [...this.userPolicy]
        this.enableGroup = res.data.status === 1
      })
    },
    listPolicies () {
      // console.log('listpolicies')
      this.$nextTick(() => {
        getPolicy().then(res => {
          this.policyData = res.data
          this.clonePolicyData = [...this.policyData]
          this.userPolicy.forEach(item => {
            this.$refs['policyTable'].toggleRowSelection(item)
          })
        })
      })
    },
    deleteGroup () {
      if (this.memberData && this.memberData.length) {
        const name = this.memberData.map(item => item.userName)
        this.deleteFlag = false
        this.$confirm(
          `<p>当前用户组已分配如下用户<b style="color:#ff8746">${name}</b>，需要移除组下<b style="color:#ff8746">所有用户</b>才能删除</p>`,
          {
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true,
            showCancelButton: false
          }
        )
      } else {
        deleteGroup(this.currentName).then(res => {
          this.$ts({
            type: 'success',
            message: this.$ts('response.success')
          })
          this.$router.push({ name: 'Group' })
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.group {
  margin: 15px 20px;
  padding: 10px 0;

  .breadEval {
    margin: -20px 0 0 -20px;
  }

  .ipt {
    .left {
      line-height: 38px;
    }

    .el-input {
      width: 70%;
    }
  }

  ::v-deep .search {
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
      width: 400px;
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

svg.backicon {
  margin: -3px 0 10px 20px;
}
</style>

<style lang="scss">
.selectGroupPolicyTip {
  width: 25%;
}
</style>
