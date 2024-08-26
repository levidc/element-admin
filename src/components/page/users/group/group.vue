<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mb_15">
        <el-button
          v-access="'admin:AddGroup'"
          size="small"
          type="primary"
          class="golden"
          @click="visibleFlag = true"
        >创建</el-button>
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh right"
            @click="searchVal = ''; listGroup()"
          />
        </el-tooltip>
        <el-input
          v-model="searchVal"
          class="search_style right"
          placeholder="用户组名过滤"
          width="14"
          clearable
        />
      </el-row>
      <el-table
        v-loading="loading"
        :data="tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
        border
        width="100%"
        @sort-change="sortFunction"
      >
        <el-table-column
          prop="groupName"
          label="组名"
          sortable="custom"
        >
          <template slot-scope="scope">
            <el-tooltip placement="top" :content="$ts('view.group.detail')">
              <a
                v-access:disable="'admin:GetGroup'"
                class="blue"
                @click="$router.push({ name: 'GroupDetail', params: { name: scope.row.groupName } })"
              >
                {{ scope.row.groupName }}
              </a>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          sortable="custom"
          prop="createDate"
          :formatter="formatterDate"
        />
        <el-table-column
          label="创建人"
          prop="createUser"
          sortable="custom"
        />
        <el-table-column
          label="状态"
          prop="status"
          sortable="custom"
        >
          <template slot-scope="scope">
            <span
              v-if="scope.row.status == 1"
              class="status_green"
            >启用</span>
            <span
              v-else-if="scope.row.status == 0"
              class="status_red"
            > 未启用 </span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template slot-scope="scope">
            <i
              v-access="'admin:DeleteGroup'"
              class="fa fa-trash-o"
              @click="selectGroup = scope.row; deleteFlag = true"
            />
          </template>
        </el-table-column>

      </el-table>
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      class="addGroup"
      title="创建用户组"
      :visible.sync="visibleFlag"
      width="650px"
      @close="resetForm"
      @open="dialogOpen('groupIpt')"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        :rules="rules"
      >
        <el-form-item
          label="用户组名"
          prop="groupName"
          class="elinput"
        >
          <el-input
            ref="groupIpt"
            v-model="form.groupName"
            placeholder="填写组名"
            clearable
          />
        </el-form-item>
        <el-tabs
          v-model="activeName"
          style="margin-top:30px"
          @tab-click="handleScroll"
        >
          <el-tab-pane
            label="用户"
            name="users"
          >
            <el-form-item
              label="选择用户"
              prop="assignUsers"
              class="policyLabel"
            >
              <el-input
                v-model="form.assignUsers"
                placeholder="用户名过滤"
                clearable
              />
            </el-form-item>
            <el-table
              ref="userTable"
              border
              :data="usersData"
              class="policyData"
              :default-sort="{prop:'userName',order:'ascending'}"
              :row-key="(row) => row.userName"
              max-height="400"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                width="100px"
                type="selection"
                align="center"
                reserve-selection
              />
              <el-table-column
                label="用户名"
                prop="userName"
                sortable
              />
            </el-table>
          </el-tab-pane>
          <el-tab-pane
            label="策略"
            name="policies"
          >
            <el-form-item
              label="选择策略"
              prop="assignPolicy"
              class="policyLabel"
            >
              <el-input
                v-model="form.assignPolicy"
                placeholder="策略名过滤"
                clearable
              />
            </el-form-item>

            <el-table
              ref="policyTable"
              border
              :data="policyData"
              class="policyData"
              :default-sort="{prop:'name',order:'ascending'}"
              :row-key="(row) => row.name"
              max-height="400"
              @selection-change="handleSelectionChanges"
            >
              <el-table-column
                width="100px"
                type="selection"
                align="center"
                reserve-selection
              />
              <el-table-column
                label="策略名"
                prop="name"
                sortable
              />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="visibleFlag = false">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="createGroup">{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="删除用户组"
      :visible.sync="deleteFlag"
      width="650px"
    >
      <p>删除当前用户组:
        <span style="color: #ff8746;">
          {{ selectGroup.groupName }}
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
import { getPolicy } from '@/api/policy'
import { listUsers } from '@/api/user'
import { listGroups, addGroup, deleteGroup } from '@/api/group'
export default {
  name: 'Group',
  components: {},
  data() {
    const checkNameReg = (rule, data, callback) => {
      const reg = /^[0-9a-zA-Z]{8,40}$/
      if (!reg.test(data)) {
        return callback('用户组名只能输入英文及数字，长度限制为8-40位')
      } else {
        return callback()
      }
    }

    return {
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      selectGroup: '',
      selectedUser: [],
      selectedPolicy: [],
      visibleFlag: false,
      deleteFlag: false,
      searchVal: '',
      activeName: '',
      prop: '',
      order: '',
      form: {
        groupName: '',
        assignUsers: '',
        assignPolicy: ''
      },
      tableData: [],
      cloneData: [],
      usersData: [],
      cloneUserData: [],
      policyData: [],
      clonePolicyData: [],
      rules: {
        groupName: {
          validator: checkNameReg,
          trigger: ['blur', 'change']
        }
      }
    }
  },
  computed: {},
  watch: {
    visibleFlag(val) {
      if (val) {
        this.listUsers()
      }
    },
    activeName(val, old) {
      if (val == '0') return
      if (old !== '0' && val === 'users') {
        this.listUsers()
      } else if (val === 'policies') {
        this.listPolicies()
      }
    },
    searchVal(val) {
      this.tableData = [...this.cloneData]
      this.total = this.tableData.length
      this.currentPage = 1
      if (!val) return
      this.tableData = this.tableData.filter(item => {
        return item.groupName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
      this.total = this.tableData.length
    },
    'form.assignUsers'(val) {
      this.usersData = [...this.cloneUserData]
      if (!val) return
      this.usersData = this.usersData.filter(item => {
        return item.userName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    },
    'form.assignPolicy'(val) {
      this.policyData = [...this.clonePolicyData]
      if (!val) return
      this.policyData = this.policyData.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    }
  },
  mounted() {
    this.listGroup()
  },
  methods: {
    formatterDate(row, column) {
      const timestamp = row[column.property]
      const time = new Date(timestamp)
      let month = time.getMonth() + 1
      let day = time.getDate()
      let hour = time.getHours()
      let minute = time.getMinutes()
      let second = time.getSeconds()
      if (month < 10) {
        month = '0' + month
      }
      if (day < 10) {
        day = '0' + day
      }
      if (hour < 10) {
        hour = '0' + hour
      }
      if (minute < 10) {
        minute = '0' + minute
      }
      if (second < 10) {
        second = '0' + second
      }
      return (
        time.getFullYear() +
        '/' +
        month +
        '/' +
        day +
        ' ' +
        hour +
        ':' +
        minute +
        ':' +
        second
      )
    },
    handleScroll() {
      if (this.activeName === 'policies') {
        this.$refs['userTable'].$el.children[2].scrollTop = 0
      } else {
        this.$refs['policyTable'].$el.children[2].scrollTop = 0
      }
    },
    dialogOpen(e) {
      this.$nextTick(() => {
        this.$refs[e].$el.querySelector('input').focus()
        this.$refs['userTable'].$el.children[2].scrollTop = 0
        this.$refs['policyTable'].$el.children[2].scrollTop = 0
        this.activeName = 'users'
      })
    },
    resetForm() {
      this.$refs['form'].resetFields()
    },
    clearSelection() {
      this.$refs['userTable'].clearSelection()
    },
    createGroup() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const userList = this.selectedUser.map(item => item.userName)
          const policies = this.selectedPolicy.map(item => item.name)
          addGroup({
            groupName: this.form.groupName,
            userList,
            policies
          })
            .then(res => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.visibleFlag = false
              this.listGroup()
            })
            .catch(err => {
              console.error(err)
            })
        }
      })
    },
    deleteGroup() {
      if (this.selectGroup.userList && this.selectGroup.userList.length) {
        this.deleteFlag = false
        this.$confirm(
          `<p>当前用户组已分配如下用户<b style="color:#ff8746">${this.selectGroup.userList}</b>，需要移除组下<b style="color:#ff8746">所有用户</b>才能删除</p>`,
          {
            confirmButtonText: '去移除用户',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }
        ).then(res => {
          this.$router.push({
            name: 'GroupDetail',
            params: { name: this.selectGroup.groupName }
          })
        })
      } else {
        deleteGroup(this.selectGroup.groupName)
          .then(res => {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.listGroup()
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.deleteFlag = false
            this.selectGroup = ''
          })
      }
    },
    listGroup() {
      this.loading = true
      listGroups()
        .then(res => {
          this.tableData = res.data
          this.tableData.sort(this.sortMethod(this.prop, this.order))
          this.cloneData = [...this.tableData]
          this.total = this.tableData.length
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    listUsers() {
      listUsers()
        .then(res => {
          this.usersData = res.data
          this.cloneUserData = [...this.usersData]
          if (this.selectedUser && this.selectedUser.length) {
            const temp = this.filterTarget(
              this.usersData,
              this.selectedUser,
              'userName'
            )
            this.$refs.userTable.clearSelection()
            temp.forEach(item => {
              this.$refs.userTable.toggleRowSelection(item)
            })
          }
        })
        .catch(error => {
          console.error(error)
        })
      // this.usersData = [
      //   { name: 'user1', id: 1 },
      //   { name: 'user2', id: 2 }
      // ]
      // this.cloneUserData = [...this.usersData]
    },
    listPolicies() {
      getPolicy()
        .then(res => {
          this.policyData = res.data
          this.clonePolicyData = [...this.policyData]
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
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleSizeChange(val) {
      console.log(val)
      this.pageSize = val
    },
    handleSelectionChange(val) {
      this.selectedUser = val
    },
    handleSelectionChanges(val) {
      this.selectedPolicy = val
    },
    // 删除用户组
    handleDelete(index, row) {
      this.tableData.splice(index, 1)
      console.log(index, row)
    },
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      this.tableData.sort(this.sortMethod(val.prop, val.order))
    }
  }
}
</script>
<style lang="scss" scoped>
.elinput {
  height: 28px !important;
  margin-left: 15px !important;
  width: 580px !important;
}

.policyLabel {
  padding-top: 15px !important;
  padding-bottom: 15px !important;
  box-sizing: border-box;
  margin-bottom: 0 !important;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-tabs {
  padding: 0 15px;
}

.el-input__inner {
  height: 28px !important;
}
</style>
