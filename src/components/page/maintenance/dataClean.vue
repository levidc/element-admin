<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mb_15">
        <el-button
          size="small"
          type="primary"
          class="golden"
          @click="manualExecution()"
        >
          {{ $ts('manualExecution') }}
        </el-button>
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh right"
            @click="searchVal='';getDataTaskList()"
          />
        </el-tooltip>
        <el-input
          v-model="searchVal"
          class="search_style right"
          placeholder="任务过滤"
          width="14"
          clearable
        />
      </el-row>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        :default-sort="{prop: 'createTime', order: 'descending'}"
      >
        <el-table-column
          prop="userName"
          label="用户名称"
          sortable="custom"
        />
        <el-table-column
          prop="status"
          label="状态"
          sortable="custom"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.status==0">未开始</span>
            <span v-if="scope.row.status==1"> 已开始</span>
            <span v-if="scope.row.status==2">结束</span>
            <span v-if="scope.row.status==3">手动停止</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="runType"
          label="操作类型"
          sortable="custom"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.runType==0">自动</span>
            <span v-if="scope.row.runType==1">手动</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="resourceList"
          label="资源类型"
          sortable="custom"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.resourceList=='null'? '全部资源':scope.row.resourceList }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="开始时间"
          sortable="custom"
        >
          <template slot-scope="scope">
            {{ scope.row.createTime ? timeTrans(scope.row.createTime) : '/' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="endTime"
          label="结束时间"
          sortable="custom"
        >
          <template slot-scope="scope">
            {{ scope.row.endTime ? timeTrans(scope.row.endTime) : '/' }}
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
  </div>
</template>
<script type="text/javascript">
import { addManualObjectCleanUp, getTaskList } from '@/api/maintenance'
export default {
  data() {
    return {
      searchVal: '',
      tableData: [],
      loading: false,
      copytableData: [],
      order: 'descending',
      prop: 'createTime',
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  watch: {
    searchVal(val) {
      this.tableData = [...this.copytableData]
      if (!val) return
      this.tableData = this.tableData.filter(item => {
        return item.userName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
    }
  },
  mounted() {
    this.getDataTaskList()
  },
  methods: {
    manualExecution() {
      addManualObjectCleanUp().then((res) => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
        this.getDataTaskList()
      })
    },
    getDataTaskList() {
      this.loading = true
      getTaskList().then((res) => {
        this.tableData = res.data
        this.tableData.sort(this.sortMethod(this.prop, this.order))
        this.tableData.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
        this.copytableData = [...this.tableData]
      }).finally(() => {
        this.loading = false
      })
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>
