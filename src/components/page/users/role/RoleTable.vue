<template>
  <div>
    <el-table
      ref="multipleTable"
      stripe
      border
      :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="sortFunction"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column
        :label="$ts('role.name')"
        sortable="custom"
        prop="name"
      >
        <template slot-scope="scope">
          <a :title="$ts('view.role.detail')" class="blue" @click="viewDetail(scope.row.roleId)">{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        :label="$ts('role.des')"
      />
      <el-table-column
        :label="$ts('action')"
        width="140"
      >
        <template slot-scope="scope">
          <el-dropdown size="small">
            <el-button type="primary">
              {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
            </el-button>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="doModifyRole(scope.row);">{{ $ts('role.update') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <div
      v-show="total"
      class="page_block"
    >
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

  </div>
</template>

<script>
export default {
  props: ['searchVal'],
  data () {
    return {
      tableData: [],
      cloneData: [],
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      order: '',
      prop: '',
      col: [{ col: 'name', turnedFuciton: 'normal' }]
    }
  },
  watch: {
    searchVal (val) {
      this.tableData = [...this.cloneData]
      if (!val) return
      this.tableData = this.tableData.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    }
  },
  mounted: function () {
    this.listRole()
  },
  methods: {
    viewDetail: function (id) {
      this.$router.push({ name: 'RoleDetail', params: { id: id }})
    },
    doModifyRole: function (row) {
      // 子组件中触发父组件方法ee并传值cc12345
      this.$emit('doModifyRole', row)
    },
    listRole: function (flag) {
      if (flag) {
        this.currentPage = 1
        console.log('currentPage 为1')
      }
      var temp = this
      this.$http({
        method: 'get',
        url: 'listRole',
        params: {
          accountId: this.$store.state.user.accountId,
          version: this.$store.state.dosVersion
        }
      })
        .then(function (response) {
          response = response.data.data
          temp.tableData = response
          temp.cloneData = [...temp.tableData]
          temp.total = temp.tableData.length
          // temp.tableData=temp.filterSearch(temp.tableData,temp.searchVal,temp.col);
          if (
            temp.total &&
            Math.ceil(temp.total / temp.pageSize) < temp.currentPage
          ) {
            temp.currentPage = Math.ceil(temp.total / temp.pageSize)
          }
          console.log(temp.currentPage)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    handleSizeChange (val) {
      this.pageSize = val
      /* this.listRole();*/
    },
    handleCurrentChange (val) {
      this.currentPage = val
      /* this.listRole();*/
    },
    toggleSelection (rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
      this.$emit('boxClick', val.length)
    },
    sortFunction (val) {
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
}
</style>
