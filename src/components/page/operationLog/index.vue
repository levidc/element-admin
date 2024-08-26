<template>
  <div>
    <div class="page_content_wrap">
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        class="searchForm"
      >
        <el-row :gutter="20">
          <el-col :span="4">
            <el-form-item
              class="noLabel"
              prop="userName"
            >
              <el-input
                v-model="form.userName"
                placeholder="操作人查询"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item
              class="noLabel"
              prop="target"
            >
              <el-input
                v-model="form.target"
                placeholder="操作对象"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item
              class="noLabel"
              prop="operationType"
            >
              <el-select
                v-model="form.operationType"
                placeholder="操作类型"
                clearable
              >
                <el-option
                  v-for="item in operationType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- col4: 100% select -->
          <el-col :span="3">
            <el-form-item
              class="noLabel"
              prop="operationTargetType"
            >
              <el-select
                v-model="form.operationTargetType"
                placeholder="操作目标类型"
                clearable
              >
                <el-option
                  v-for="item in operationTargetType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="4">
            <el-form-item class="noLabel" prop="createStartTime">
              <el-date-picker v-model="form.createStartTime" type="datetime" placeholder="任务开始时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item class="noLabel" prop="createEndTime">
              <el-date-picker v-model="form.createEndTime" type="datetime" placeholder="任务完成时间">
              </el-date-picker>
            </el-form-item>
          </el-col> -->
          <div class="search">
            <el-button
              class="mr_10"
              @click="reset"
            >重置</el-button>
            <el-button
              class="golden mr_10"
              type="primary"
              @click="searchParams"
            >查询</el-button>
            <el-tooltip
              content="刷新"
              placement="top"
              effect="dark"
            >
              <i
                class="el-icon-refresh"
                @click="handleRefresh"
              />
            </el-tooltip>
          </div>
        </el-row>
      </el-form>
      <TableData
        ref="tab"
        :table-data="tableData"
        :columns="columns"
        :selection="false"
        :loading="loading"
        :sort-function="sortFunction"
        :page-obj="{ currentPage: 1, pageSize: 10 }"
        :default-sort="{ prop: 'operationTime', order: 'descending' }"
        :total="total"
        pagination
        @renderPagination="renderPagination"
      >
        <el-table-column
          slot="taskProgress"
          label="任务进度"
          prop="taskProgress"
          sortable="custom"
        >
          <template slot-scope="scope">
            <span v-if="!scope.row.taskProgress">/</span>
            <el-progress
              v-else
              :percentage="scope.row.taskProgress"
              text-color="#ff8746"
            />
          </template>
        </el-table-column>
      </TableData>
    </div>
  </div>
</template>
<script>
import { queryOperationLogs } from '@/api/storage'
import moment from 'moment'
export default {
  data() {
    return {
      operationTargetType: [
        { value: 'TASK', label: '归档任务' },
        { value: 'RESOURCE', label: '存储资源' },
        { value: 'MOVE_BACK_TASK', label: '回迁任务' }
      ],
      operationType: [
        { value: 'CREATE_TASK', label: '创建任务' },
        { value: 'CLONE_TASK', label: '克隆任务' },
        { value: 'RETRY_TASK', label: '重试任务' },
        { value: 'ABORT_TASK', label: '中止任务' },
        { value: 'DELETE_TASK', label: '删除任务' },
        { value: 'CREATE_RESOURCE', label: '创建资源' },
        { value: 'UPDATE_RESOURCE', label: '更新资源' },
        { value: 'DELETE_RESOURCE', label: '删除资源' }
      ],
      total: 0,
      timer: null,
      rules: {
        sourceDetail: { required: true, message: '请设置源资源路径' },
        targetResourceId: { required: true, message: '请设置目标资源' },
        taskName: { required: true, message: '请输入任务名称' },
        sourceResourceId: { required: true, message: '请设置源资源' }
      },
      form: {
        userName: '',
        target: '',
        createStartTime: '',
        createEndTime: '',
        operationType: '',
        operationTargetType: ''
      },
      sort: {
        prop: 'operationTime',
        order: 'descending'
      },
      loading: false,
      tableData: [],
      columns: [
        // operationId
        // operationResult
        // operationTargetType
        // operationTime
        // operationType
        // target
        // userName
        {
          prop: 'operationTime',
          title: '操作时间',
          minWidth: '100',
          show: true,
          sortable: 'custom',
          formatter: (_, __, val) => {
            return moment(val).format('YYYY/MM/DD HH:mm:ss')
          }
        },
        {
          prop: 'userName',
          title: '操作人',
          minWidth: '100',
          show: true
        },
        // {
        //   prop: 'operationType',
        //   title: '操作类型',
        //   show: true,
        //   sortable: 'custom',
        //   formatter: (__, _, val) => {
        //     switch (val) {
        //       case 'CREATE_TASK':
        //         return '创建任务'
        //       case 'DELETE_TASK':
        //         return '删除任务'
        //       case 'ABORT_TASK':
        //         return '终止任务'
        //       default:
        //         return '/'
        //     }
        //   }
        // },
        {
          prop: 'target',
          title: '操作对象',
          show: true,
          align: 'center',
          minWidth: '150px'
        },
        {
          prop: 'operationTypeName',
          title: '操作类型',
          show: true
        },
        {
          prop: 'operationTargetTypeName',
          title: '操作目标类型',
          show: true
        },
        {
          prop: 'operationResult',
          title: '操作结果',
          show: false
        }
      ]
    }
  },
  computed: {
    watchForm() {
      return JSON.parse(JSON.stringify(this.form))
    }
  },
  watch: {
    watchForm: {
      handler(val) {
        clearTimeout(this.timer)
      }
    }
  },
  mounted() {
    this.handleSearchParams(false, true)
  },
  destroyed() {
    clearTimeout(this.timer)
  },
  methods: {
    renderPagination(val) {
      this.handleSearchParams(val, true)
    },
    sortFunction(val) {
      const { prop, order } = val
      Object.assign(
        this.sort, { prop, order }
      )
      this.handleSearchParams(false, true)
    },
    renderTargetResouce() {
      const flag = this.taskForm.resourceList.filter(item => {
        return this.taskForm.targetResourceId === item.value
      })
      this.taskForm.targetDetail = flag && flag[0].bucketName
    },
    reset() {
      this.$refs['form'].resetFields()
      const { pageSize } = this.$refs['tab']
      this.$refs['tab'].currentPage = 1
      this.init({ params: { pageSize, pageNumber: 1 }}, true)
    },
    handleSearchParams(customPage, loading = false) {
      const { pageSize, currentPage } = this.$refs['tab']
      const { userName, target, operationType,
        operationTargetType } = this.form
      const data = {
        userName,
        target,
        operationType: operationType || null,
        operationTargetType: operationTargetType || null,
        order: this.sort.order === 'descending' ? 'DESC' : 'ASC',
        orderColumn: 'createTime'
      }
      this.init({
        params: {
          ...customPage || {
            pageSize, pageNumber: currentPage
          }
        },
        data
      }, loading)
    },
    searchParams() {
      const { pageSize } = this.$refs['tab']
      this.$refs['tab'].currentPage = 1
      this.handleSearchParams(
        { pageSize, pageNumber: 1 }, true
      )
    },
    handleRefresh() {
      this.handleSearchParams(false, true)
    },
    init(data = {}, flag = false) {
      if (flag) {
        this.loading = true
      }
      // 清除旧标签
      const table = document.getElementsByTagName('tbody')[0]
      // order：ASC 或 DESC， orderColumn: 字段名
      queryOperationLogs(data).then((res) => {
        this.tableData = res.data.list || []
        this.total = res.data.total
      }).finally(() => {
        this.loading = false
        clearTimeout(this.timer)
        const dataTimeArr = []
        const temp = {}
        // __vue__, row
        // 遍历数组、列出时间、根据时间降序出的数据、按首次出现的index列出、
        // 如[0,3,5] 则在table数组0,4,7位置添加tr 构建组合的数据 匹配cell的RowIndex、添加
        // console.log(arr, 'arr')
        const arr = document.getElementsByClassName('customDate')
        const len = arr.length
        for (let i = len - 1; i >= 0; i--) {
          table.removeChild(arr[i])
        }
        this.tableData.forEach((item, index) => {
          const time = moment(item.operationTime).format('YYYY-MM-DD')
          if (!temp[time]) {
            const tr = document.createElement('tr')
            dataTimeArr.push(time)
            tr.className = 'customDate'
            tr.innerHTML = `<td><span>${time}</span></td><td></td><td></td><td></td><td></td><td></td>`
            const length = dataTimeArr.length ? dataTimeArr.length - 1 : 0
            table.insertBefore(
              tr, table.children[index + length]
            )
            temp[time] = true
          }
        })
        this.timer = setTimeout(() => {
          this.handleSearchParams(false)
        }, 5000)
      })
    }
  }
}

</script>
<style lang="scss" scoped>
::v-deep .searchForm {
  .search {
    .el-button {
      position: relative;
      top: 10px;
    }

    .el-icon-refresh {
      position: relative;
      top: 15px;
    }

    float: right;
  }

  .noLabel .el-form-item__content {
    margin-left: 0 !important;
  }

  .el-select {
    width: 100%;
  }
}

::v-deep .el-table {
  tbody {
    padding-top: 30px !important;
  }

  .customDate {
    margin-top: 10px;
    td {
      color: #fff;
      padding: 10px;

      span {
        width: 100px;
        text-align: center;
        display: inline-block;
        border-radius: 10px;
        background: transparent
          linear-gradient(135deg, #d54927, #e36132 50%, #f58240) 0 0 no-repeat
          padding-box;
      }
    }
  }
}
</style>
