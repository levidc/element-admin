<template>
  <div>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      stripe
      border
      :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      tooltip-effect="dark"
      style="width: 100%"
      @sort-change="sortFunction"
    >
      <el-table-column
        prop="userName"
        :label="`${$ts('user.name')}(AK)`"
        sortable="custom"
      >
        <template slot-scope="scope">
          <el-tooltip placement="top" :content="$ts('user.table.detail')">
            <a
              v-access:disable="'admin:GetUser'"
              class="blue"
              @click="viewDetail(scope.row.userName)"
            >
              {{ scope.row.userName }}
            </a>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="userType"
        label="用户类型"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ Number(scope.row.userType)==1?'普通用户':Number(scope.row.userType)==2?'工号用户':Number(scope.row.userType)==0?'管理员':'' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        sortable="custom"
        prop="createTime"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        sortable="custom"
        prop="status"
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
        :label="$ts('action')"
        align="center"
      >
        <template slot-scope="scope">
          <i
            v-if="String($store.state.isEip)!=='true'&&scope.row.userName !== 'superAdmin' && $store.state.role==='superAdmin'"
            v-access="'admin:DeleteUser'"
            class="fa fa-trash-o"
            title="删除"
            @click="selectUser = scope.row; deleteFlag = true"
          />
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
    <el-dialog title="删除用户" :visible.sync="deleteFlag" width="650px">
      <p>删除如下用户(AK):
        {{ selectUser.userName }}
      </p>
      <div slot="footer">
        <el-button @click="deleteFlag = false">{{ $ts('cancel') }}</el-button>
        <el-button class="golden" @click="confirmDelete">{{ $ts('delete') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUsers, deleteUser } from '@/api/user'
export default {
  props: {
    searchVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectUser: '',
      deleteFlag: false,
      loading: false,
      tableData: [],
      cloneData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      order: '',
      prop: '',
      col: [{ col: 'userName', turnedFuciton: 'normal' }]
    }
  },

  watch: {
    searchVal(val) {
      this.tableData = [...this.cloneData]
      this.total = this.tableData.length
      this.currentPage = 1
      if (!val) return
      this.tableData = this.tableData.filter(item => {
        return item.userName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
      this.total = this.tableData.length
    }
  },
  created() {
  },
  mounted() {
    this.listUser()
  },
  methods: {
    deleteUser() {
      deleteUser(this.selectUser.userName)
        .then(res => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.listUser()
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.deleteFlag = false
          this.selectUser = ''
        })
    },
    confirmDelete() {
      if (this.selectUser.groups && this.selectUser.groups.length) {
        this.deleteFlag = false
        this.$confirm(
          `<p>该用户已关联如下用户组 <b style="color:#ff8746">${this.selectUser.groups}</b>,删除后将从以上组中<b style="color:#ff8746">移除该用户</b>，是否确定?</p>`,
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }
        ).then(res => {
          this.deleteUser()
        })
      } else {
        this.deleteUser()
      }
    },
    viewDetail(name) {
      this.$router.push({ name: 'UserDetail', params: { name }})
    },
    listUser() {
      this.loading = true
      this.currentPage = 1
      listUsers()
        .then(res => {
          this.tableData = res.data
          this.tableData.sort(this.sortMethod(this.prop, this.order))
          this.cloneData = [...this.tableData]
          this.total = this.tableData.length
        })
        .catch(error => {
          console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      /* this.listUser();*/
    },
    handleCurrentChange(val) {
      this.currentPage = val
      /* this.listUser();*/
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
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      this.tableData.sort(this.sortMethod(val.prop, val.order))
    }
  }
}
</script>

<style>
.roleTag {
  display: inline-block;
  margin-right: 15px;
  cursor: pointer;
}
</style>
