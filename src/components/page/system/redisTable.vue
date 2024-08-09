<template>
  <div>
    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column :label="$ts('server.node.ip')" prop="ip" sortable>
        <template slot-scope="scope">
          <span class="blue">{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$ts('status')" prop="status" sortable>
        <template slot-scope="scope">
          <span v-if="scope.row.status == 'OK'" class="status_green">{{ $ts("status.ok") }}</span>
          <span v-else class="status_red">{{ $ts("disconnected") }}</span>
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
  </div>
</template>
<script>
import { checkRedisStatus } from '@/api/system'
export default {
  name: 'Redis',
  data() {
    return {
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      timer: '',
      loading: true
    }
  },
  mounted() {
    this.list()
  },
  destroyed() {
    clearTimeout(this.timer)
  },
  methods: {
    list() {
      clearTimeout(this.timer)
      checkRedisStatus().then(res => {
        if (res.error.code !== 0) {
          this.$ts({
            type: 'error',
            text: this.$ts(res.error.name)
          })
        } else {
          this.timer = setTimeout(this.list, 5000)
          this.tableData = res.data
          this.total = this.tableData.length
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>
