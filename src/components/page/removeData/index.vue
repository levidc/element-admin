<template>
  <div>
    <div
      class="page_content_wrap"
      @keyup.enter="searchParams()"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        class="searchForm"
      >
        <div class="searchContent">
          <el-col :span="6">
            <el-form-item
              class="noLabel"
              prop="taskName"
            >
              <el-input
                v-model="form.taskName"
                placeholder="任务名称查询"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item
              class="noLabel"
              prop="userName"
            >
              <el-input
                v-model="form.userName"
                placeholder="创建人查询"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item
              class="noLabel"
              prop="createStartTime"
            >
              <el-date-picker
                v-model="form.createStartTime"
                type="datetime"
                placeholder="任务创建时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item
              class="noLabel"
              prop="createEndTime"
            >
              <el-date-picker
                v-model="form.createEndTime"
                type="datetime"
                placeholder="任务完成时间"
              />
            </el-form-item>
          </el-col>
        </div>
        <div class="search">
          <!-- <el-button class="golden mr_10" type="primary" @click="createTask">创建任务</el-button> -->
          <el-button
            class="mr_10"
            @click="reset"
          >重置</el-button>
          <el-button
            class="golden mr_10"
            type="primary"
            @click="searchParams"
          >查询</el-button>
          <SelectColumns
            :column-headers="columns"
            class="mr_10"
            @hideColumn="hideColumn"
          />
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
      </el-form>
      <TableData
        ref="tab"
        :table-data="tableData"
        :columns="columns"
        :selection="false"
        :loading="loading"
        :sort-function="sortFunction"
        :page-obj="{ currentPage: 1, pageSize: 10 }"
        :default-sort="{ prop: 'createTime', order: 'descending' }"
        :total="total"
        :max-height="tableHeight"
        pagination
        @renderPagination="renderPagination"
      >
        <el-table-column
          slot="taskName"
          prop="taskName"
          label="任务名称"
          sortable="custom"
          min-width="120px"
          fixed="left"
        >
          <template slot-scope="scope">
            <showToolTip :text="scope.row.taskName" />
          </template>
        </el-table-column>
        <el-table-column
          slot="sourceDetail"
          prop="sourceDetail"
          label="源资源路径"
          sortable="custom"
          min-width="150"
        >
          <template slot-scope="scope">
            <showToolTip :text="scope.row.sourceDetail" />
          </template>
        </el-table-column>
        <el-table-column
          slot="targetDetail"
          prop="targetDetail"
          label="目标资源路径"
          sortable="custom"
          min-width="150"
        >
          <template slot-scope="scope">
            <showToolTip :text="scope.row.targetDetail" />
          </template>
        </el-table-column>
        <el-table-column
          slot="taskProgress"
          label="任务进度"
          prop="taskProgress"
          sortable="custom"
          width="120px"
        >
          <template slot-scope="scope">
            <span v-if="!scope.row.taskProgress" />
            <el-progress
              v-else
              :percentage="showProgress(scope.row)"
              :color="showProgreeColor(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          slot="remark"
          label="备注"
          prop="remark"
          width="120px"
        >
          <template slot-scope="scope">
            <el-tooltip
              :content="scope.row.remark"
              placement="top"
            >
              <span class="showOverFlown">
                {{ scope.row.remark }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          slot="action"
          :label="$ts('action')"
          fixed="right"
          width="100px"
        >
          <template slot-scope="scope">
            <el-dropdown size="small">
              <el-button
                v-access="'admin:UpdateStorageResourceController' || 'admin:DeleteResourceController'"
                type="primary"
                class="blue"
              >
                {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <!-- 添加下拉菜单禁用、需外层容器添加类名 -->
                <!-- cursorDisabled -->
                <div :class="[judgeDisableBtn(scope.row) ? 'cursorDisabled' : null]">
                  <el-dropdown-item
                    :disabled="judgeDisableBtn(scope.row)"
                    @click.native="doRetryTask(scope.row)"
                  > 重试任务
                  </el-dropdown-item>
                </div>
                <div :class="[scope.row.status !== 'FAILURE' ? 'cursorDisabled' : null]">
                  <el-dropdown-item
                    :disabled="scope.row.status !== 'FAILURE'"
                    @click.native="doDelete(scope.row)"
                  >
                    删除任务
                  </el-dropdown-item>
                </div>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </TableData>
    </div>
    <el-dialog
      :visible.sync="taskFlag"
      width="40%"
      title="创建回迁任务"
    >
      <el-form
        ref="taskForm"
        :model="taskForm"
        :rules="rules"
        label-width="160px"
        class="taskForm"
      >
        <el-form-item
          label="任务名称"
          prop="taskName"
        >
          <el-input
            v-model="taskForm.taskName"
            placeholder="请输入任务名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="源资源名称"
          prop="sourceResourceId"
        >
          <el-select
            v-model="taskForm.sourceResourceId"
            clearable
          >
            <el-option
              v-for="item in taskForm.nasList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="源资源路径"
          prop="sourceDetail"
        >
          <span>taskForm.sourceDetail</span>
          <!-- <el-input v-model="taskForm.sourceDetail" placeholder="请设置源资源路径" clearable /> -->
        </el-form-item>
        <el-form-item
          label="目标资源名称"
          prop="targetResourceId"
        >
          <el-select
            v-model="taskForm.targetResourceId"
            @change="renderTargetResouce"
          >
            <el-option
              v-for="item in taskForm.resourceList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标资源路径">
          <span>{{ taskForm.targetDetail }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          class="golden"
          @click="confirmCreate"
        >{{ $ts('true') }}</el-button>
        <el-button @click="taskFlag = false">{{ $ts('wtstype.none') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { queryMoveBackTasks, createMoveBackTasks, listStorageResource, retryTaskMove, deleteMoveBackTask } from '@/api/storage'
import moment from 'moment'
export default {
  data () {
    return {
      tableHeight: 500,
      total: 0,
      timer: null,
      rules: {
        sourceDetail: { required: true, message: '请设置源资源路径' },
        targetResourceId: { required: true, message: '请设置目标资源' },
        taskName: { required: true, message: '请输入任务名称' },
        sourceResourceId: { required: true, message: '请设置源资源' }
      },
      taskForm: {
        nasList: [],
        resourceList: [],
        sourceDetail: '', // 源资源路径
        targetDetail: '', // 目标资源路径 bucketName
        targetResourceId: '', // 目标资源id s3
        sourceResourceId: '', // 源资源id
        taskName: '' // 任务名称
      },
      mapResourceName: {},
      taskFlag: false,
      form: {
        userName: '',
        createStartTime: '',
        createEndTime: '',
        taskName: ''
      },
      sort: {
        prop: 'createTime',
        order: 'descending'
      },
      loading: false,
      tableData: [],
      columns: [
        {
          slot: 'taskName',
          show: true,
          title: '任务名称'
        },
        {
          prop: 'createUserName',
          title: '创建人',
          minWidth: '150',
          show: true,
          sortable: 'custom'
        },
        {
          prop: 'archiveTaskName',
          title: '归档任务名称',
          minWidth: '150',
          show: true
          // sortable: 'custom'
        },
        {
          prop: 'sourceResourceId',
          title: '源资源名称',
          show: true,
          minWidth: '150',
          formatter: (__, _, val) => this.mapResourceName[val + '']
        },
        {
          slot: 'sourceDetail',
          show: true,
          title: '源资源路径'
        },
        {
          prop: 'targetResourceId',
          title: '目标资源名称',
          show: true,
          minWidth: '150',
          formatter: (__, _, val) => this.mapResourceName[val + '']
        },
        {
          slot: 'targetDetail',
          show: true,
          title: '目标资源路径'
        },
        {
          slot: 'taskProgress',
          show: true,
          title: '任务进度'
        },
        {
          prop: 'dataCount',
          title: '任务文件数量',
          show: true,
          sortable: 'custom',
          align: 'center',
          minWidth: '200px',
          formatter: row => {
            return row.taskType === 'ES' ? row.dataCount ? this.thousandthSeparator(row.dataCount) : '' : this.thousandthSeparator(row.dataCount) || 0
          }
        },
        {
          prop: 'dataSize',
          title: '任务文件大小',
          show: true,
          // sortable: 'custom',
          align: 'center',
          minWidth: '200px',
          formatter: row => {
            return row.taskType === 'ES' ? row.dataCount ? this.byteConvert(row.dataSize) : '' : this.byteConvert(row.dataSize)
          }
        },
        {
          prop: 'status',
          title: '任务状态',
          show: true,
          sortable: 'custom',
          minWidth: '150px',
          formatter: (row) => {
            return row.statusName
          }
          // formatter: (__, _, data) => {
          //   switch (data) {
          //     case 'CREATED':
          //       return '已创建'
          //     case 'ALLOCATED':
          //       return '已分配'
          //     case 'PROCESSING':
          //       return '执行中'
          //     case 'SUCCESSFUL':
          //       return '任务完成'
          //     case 'FAILURE':
          //       return '任务失败'
          //     case 'ABORT':
          //       return '任务终止'
          //     default:
          //       return ''
          //   }
          // }
        },
        {
          slot: 'remark',
          show: true,
          title: '备注'
        },
        {
          prop: 'createTime',
          title: '任务创建时间',
          show: true,
          formatter: (_row, _, data) => {
            return moment(data).format('YYYY/MM/DD HH:mm:ss')
          },
          minWidth: '150px',
          sortable: 'custom'
        },
        {
          prop: 'finishTime',
          title: '任务完成时间',
          show: true,
          formatter: (_row, _, data) => {
            return data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : ''
          },
          minWidth: '150px',
          sortable: 'custom'
        },
        {
          slot: 'action',
          show: true,
          title: '操作'
        }
      ]
    }
  },
  computed: {
    watchForm () {
      return JSON.stringify(this.form)
    }
  },
  watch: {
    watchForm: {
      handler (val) {
        clearTimeout(this.timer)
      }
    }
    // tableData (val) {
    //   $('.el-progress-bar__inner').hide(200).show(200)
    // }
  },
  created () {
    window.addEventListener('resize', this.getHeight)
  },
  mounted () {
    // this.init({ params: { pageNumber: 1, pageSize: 10 }}, true)
    this.$nextTick(() => {
      this.handleSearchParams(false, true)
      this.getHeight()
    })
  },
  destroyed () {
    clearTimeout(this.timer)
  },
  methods: {
    getHeight () {
      this.$nextTick(() => {
        const height = window.innerHeight - 400
        this.tableHeight = height > 200 ? height : 200
      })
    },
    hideColumn (columns) {
      this.columns = columns
      this.$nextTick(() => {
        this.$refs['tab'].$refs['dataTable'] && this.$refs['tab'].$refs['dataTable'].doLayout()
      })
    },
    doDelete (row) {
      const { id, taskName } = row
      this.$confirm(`删除如下任务：<b style="color:#ff8736">${taskName}</b>，请确认！`, '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true
      }).then(() => {
        deleteMoveBackTask({ taskId: id }).then(() => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
        }).finlly(() => {
          this.handleSearchParams(false, true)
        })
      })
    },
    judgeDisableBtn (row) {
      if (row.status !== 'FAILURE') {
        return true
      } else if (row.taskType === 'ES') {
        return row.remark === '索引恢复失败' || row.remark === '存在与恢复索引同名的索引'
      } else {
        return false
      }
    },
    // 回迁 索引恢复失败 || 源资源与恢复资源路径一致

    showProgreeColor (row) {
      switch (row.status) {
        case 'PROCESSING':
          return '#517beb'
        case 'FAILURE':
          return '#c23f3f'
        case 'ABORT':
          return '#c23f3f'
        case 'SUCCESSFUL':
          return '#FF8746'
      }
    },
    showProgress (row) {
      return parseInt(((row.taskProgress / row.dataCount) * 100))
    },
    handleSearchParams (customPage, loading = false) {
      const { pageSize, currentPage } = this.$refs['tab']
      const { userName, createStartTime, createEndTime, taskName } = this.form
      const data = {
        userName,
        createStartTime, createEndTime,
        order: this.sort.order === 'descending' ? 'DESC' : 'ASC',
        orderColumn: this.sort.prop,
        taskName
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
    renderPagination (val) {
      this.handleSearchParams(val, true)
    },
    sortFunction (val) {
      const { prop, order } = val
      Object.assign(
        this.sort, { prop, order }
      )
      this.handleSearchParams(false, true)
    },
    renderTargetResouce () {
      const flag = this.taskForm.resourceList.filter(item => {
        return this.taskForm.targetResourceId === item.value
      })
      this.taskForm.targetDetail = flag && flag[0].bucketName
    },
    async createTask () {
      const res = await listStorageResource({
        deviceId: '66666666666666666'
      })
      if (res) {
        Object.assign(this.taskForm,
          {
            resourceList: [],
            nasList: [],
            sourceDetail: '',
            targetDetail: '',
            targetResourceId: '',
            sourceResourceId: '',
            taskName: ''
          }
        )
        res.data.forEach(item => {
          if (item.storageType !== 'NAS') {
            this.taskForm.resourceList.push({
              label: item.storageName,
              value: item.resourceId,
              bucketName: item.bucketName
            })
          } else {
            this.taskForm.nasList.push({
              label: item.storageName,
              value: item.resourceId,
              bucketName: item.bucketName
            })
          }
        })
        this.taskFlag = true
      }
    },
    confirmCreate () {
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          const {
            sourceDetail,
            sourceResourceId,
            targetDetail,
            targetResourceId,
            taskName
          } = this.taskForm
          createMoveBackTasks({
            sourceDetail,
            sourceResourceId,
            targetDetail,
            targetResourceId,
            taskName
          }).then((res) => {
            this.$ts({
              type: 'success',
              text: '操作成功'
            })
            this.taskFlag = false
          })
        }
      })
    },
    reset () {
      this.$refs['form'].resetFields()
      // 重置分页数为1
      this.$refs['tab'].currentPage = 1
      this.$refs['tab'].$refs['dataTable'].sort('createTime', 'descending')
      // this.init(
      //   {
      //     params: { pageSize, pageNumber: 1 },
      //     data: {
      //       order: 'DESC',
      //       orderColumn: 'createTime'
      //     }
      //   }, true)
    },
    handleRefresh () {
      this.handleSearchParams(false, true)
    },
    searchParams () {
      const { pageSize } = this.$refs['tab']
      this.$refs['tab'].currentPage = 1
      this.handleSearchParams(
        { pageSize, pageNumber: 1 }, true
      )
    },
    init (data = {}, flag = false) {
      // this.loading = false
      // this.tableData = [
      // {
      //   "createTime": "2023-05-16T06:50:13.430Z",
      //   "createUserName": "string",
      //   "finishTime": "2023-05-16T06:50:13.430Z",
      //   "id": 0,
      //   "sourceDetail": "string",
      //   "sourceResourceId": 0,
      //   "status": "ABORT",
      //   "targetDetail": "string",
      //   "targetResourceId": 0,
      //   "taskProgress": 0,
      //   "updateTime": "2023-05-16T06:50:13.430Z"
      //  }
      // ]
      if (flag) {
        this.loading = true
      }
      const queryTask = queryMoveBackTasks(data)
      const resourceName = listStorageResource({
        deviceId: '66666666666666666'
      })
      Promise.allSettled([queryTask, resourceName]).then((all) => {
        const res = all[0].value
        if (res) {
          this.tableData = res.data.list || []
          this.total = res.data.total
        }
        const mapResourceName = all[1].value
        if (mapResourceName) {
          mapResourceName.data.forEach(item => {
            this.mapResourceName[item.resourceId + ''] = item.storageName
          })
        }
      })
        .finally(() => {
          this.loading = false
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.handleSearchParams(false)
          }, 5000)
        })
    },
    doRetryTask (row) {
      const taskId = row.id
      this.$confirm('是否重试当前已失败的任务', `任务名:${row.taskName}`, {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then((res) => {
        retryTaskMove({
          taskId
        }).then(() => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.moveBackFlag = false
        }).finally(() => {
          this.handleSearchParams(false, true)
        })
      })
    }
  }
}

</script>
<style lang="scss" scoped>
:v-deep .el-table {
  .el-table__body {
    height: 100%;
  }
}
::v-deep .searchForm {
  display: flex;
  justify-content: space-between;
  .searchContent {
    .el-form-item__content {
      margin-right: 20px;
    }
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    margin-right: 8%;
  }
  .search {
    .el-button {
      position: relative;
      top: 5px;
    }

    .el-icon-refresh {
      position: relative;
      top: 10px;
    }
    width: 240px;
  }

  .noLabel .el-form-item__content {
    margin-left: 0 !important;
  }

  .el-select {
    width: 100%;
  }

  .el-date-editor.el-input {
    width: 100%;
  }
}

::v-deep .taskForm {
  label.el-form-item__label {
    margin-left: 0;
  }

  .el-select {
    width: 100%;
  }
}
</style>
