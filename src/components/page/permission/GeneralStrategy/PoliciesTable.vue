<template>
  <div>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      tooltip-effect="dark"
      style="width: 100%"
      :default-sort="{prop: 'updateTime', order: 'descending'}"
      @selection-change="handleSelectionChange"
      @sort-change="sortFunction"
    >
      <el-table-column
        :label="$ts('qos.name')"
        sortable="custom"
        prop="name"
        min-width="150px"
      >
        <template slot-scope="scope">
          <el-tooltip placement="top" :content="$ts('view.policy.detail')">
            <a
              v-access:disable="'admin:GetPolicy'"
              class="blue"
              @click="viewDetail(scope.row)"
            >
              {{ scope.row.name }}
            </a>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        :label="$ts('directory.update.time')"
        sortable="custom"
        prop="updateTime"
        min-width="100px"
      >
        <template slot-scope="scope">
          {{ scope.row.updateTime ? formatDate(scope.row.updateTime) : '/' }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$ts('action')"
        width="140"
        align="center"
      >
        <template slot-scope="scope">
          <div style="width: 40px;margin: auto;text-align:left;">
            <el-tooltip
              content="关联用户"
              placement="top"
            >
              <i
                v-access="'admin:ListUsersByUserPolicy'"
                class="userStyle  el-icon-user-solid"
                @click="getUser(scope.row.name);userDetailFlag = true"
              />
            </el-tooltip>
            <el-tooltip
              content="删除策略"
              placement="top"
            >
              <i
                v-if="showMenu(scope.row)"
                v-access="'admin:DeletePolicy'"
                class="fa fa-trash-o"
                title="删除策略"
                @click="selectPolicy = scope.row.name; deleteFlag = true"
              />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="page_block">
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
      title="删除策略"
      :visible.sync="deleteFlag"
      width="650px"
    >
      <p>删除如下策略:
        <span style="color:#ff8746"> {{ selectPolicy }}</span>
      </p>
      <div slot="footer">
        <el-button @click="deleteFlag = false">{{ $ts('cancel') }}</el-button>
        <el-button class="golden" type="primary" @click="confirmDelete">{{ $ts('delete') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="用户详情"
      :visible.sync="userDetailFlag"
      width="680px"
      :before-close="handleClose"
      destroy-on-close
    >
      <div>
        <el-table
          v-loading="loadingUSer"
          :data="tableUserData"
          style="width: 100%"
          :default-sort="{prop: 'createTime', order: 'descending'}"
          @sort-change="SortChange"
        >
          <el-table-column
            prop="userName"
            label="用户名称"
            sortable="custom"
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
            sortable="custom"
          >
            <template slot-scope="scope">
              {{ scope.row.createTime }}
            </template>
          </el-table-column>

        </el-table>
        <div class="page_block">
          <el-pagination
            :current-page="currentUserPage"
            :page-sizes="[5, 10, 50, 100]"
            :page-size="pageUserSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="userTotal"
            @size-change="handleuUserSizeChange"
            @current-change="handleUserCurrentChange"
          />
        </div>
      </div>

    </el-dialog>
  </div>
</template>
<script>
import { getPolicy, deletePolicy, listUsersByUserPolicy } from '@/api/policy'
export default {
  props: {
    searchVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      applyUserSort: {
        order: 'descending',
        prop: 'createTime'
      },
      userDetailFlag: false,
      deleteFlag: false,
      selectPolicy: '',
      loading: false,
      loadingUSer: false,
      tableData: [],
      cloneData: [],
      tableUserData: [],
      multipleSelection: [],
      currentPage: 1,
      currentUserPage: 1,
      pageSize: 10,
      pageUserSize: 10,
      total: 0,
      userTotal: 0,
      policyName: '',
      order: 'descending',
      prop: 'updateTime',
      templatePolicy: [
        'FullPolicy',
        'BasePolicy',
        'AdminFull',
        'S3ReadOnlyWithOutListObject',
        'S3ReadOnlyWithListObject',
        'S3ReadWrite',
        'S3ReadWriteDelete',
        'S3Full',
        'S3Deny',
        'PaaSAdminPolicy'
        // 'AdminUserAndPolicy',
        // 'RestorePolicy'
      ]
    }
  },
  watch: {
    searchVal(val) {
      this.tableData = [...this.cloneData]
      this.total = this.tableData.length
      this.currentPage = 1
      if (!val) return
      this.tableData = this.tableData.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
      this.total = this.tableData.length
    },
    userDetailFlag(val) {
      if (!val) {
        this.applyUserSort = {
          prop: 'createTime',
          sort: 'descending'
        }
      }
    }
  },
  mounted: function() {
    this.listPolicies()
  },
  methods: {

    showMenu(row) {
      return !this.templatePolicy.includes(row.name)
    },
    confirmDelete() {
      this.$confirm(
        '删除后将会使已分配此策略的<b style="color:#ff8746">用户</b>和<b style="color:#ff8746">用户组</b>失效, 是否继续?',
        '',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      )
        .then(() => {
          deletePolicy({
            policyName: this.selectPolicy
          })
            .then(res => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.listPolicies()
              this.deleteFlag = false
            })
            .catch(err => {
              console.error(err)
            })
        })
        .catch(() => {
          this.deleteFlag = false
        })
    },
    viewDetail(row) {
      // console.log(row, 'row')
      // resource、action 处理单独和多个
      row.Statement.forEach(item => {
        if (typeof item.Resource === 'string') {
          item.Resource = [item.Resource]
        }
        if (typeof item.Action === 'string') {
          item.Action = [item.Action]
        }
      })
      sessionStorage.setItem('policyDetail', JSON.stringify(row))
      this.$router.push({
        name: 'PolicyDetail',
        params: { name: row.name }
      })
    },
    doModifyRole: function(row) {
      // 子组件中触发父组件方法ee并传值cc12345
      this.$emit('doModifyRole', row)
    },
    listPolicies() {
      this.loading = true
      getPolicy()
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
          this.currentPage = 1
          this.pageSize = 10
        })
    },
    getUser(value) {
      this.policyName = value
      this.loadingUSer = true
      // toDo addSort
      // console.log(this.applyUserSort)
      listUsersByUserPolicy({ policyName: this.policyName, pageNum: this.currentUserPage, pageSize: this.pageUserSize })
        .then((res) => {
          this.tableUserData = res.data.list
          this.userTotal = res.data.totalCount
        })
        .finally(() => {
          this.loadingUSer = false
        })
    },
    SortChange(val) {
      Object.assign(
        this.applyUserSort,
        {
          prop: val.prop,
          order: val.order
        })
      this.getUser(this.policyName)
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleuUserSizeChange(val) {
      this.pageUserSize = val
      this.getUser(this.policyName)
    },
    handleUserCurrentChange(val) {
      this.currentUserPage = val
      this.getUser(this.policyName)
    },
    handleClose(done) {
      done()
      this.currentUserPage = 1
      this.pageUserSize = 10
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange(val) {
      this.$emit('handleSelect', val)
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
.userStyle {
  font-size: 14px;
  margin-right: 10px;
  color: #ff8746;
  cursor: pointer;
}
::v-deep .el-pagination__jump {
  margin-left: -6px;
}
</style>
