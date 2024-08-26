<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 menu">
        <el-form
          ref="form"
          :model="form"
          label-width="90px"
          label-position="left"
          class="search"
        >
          <el-form-item
            label="存储桶"
            prop="bucketId"
          >
            <el-select
              v-model="form.bucketId"
              filterable
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="(bk,i) in buckets"
                :key="(bk.id).toString()+i "
                :label="bk.name"
                :value="bk.id.toString()"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="创建日期"
            prop="createTime"
          >
            <el-date-picker
              v-model="form.createTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              fomat="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            />
            <!-- <el-date-picker
              v-model="form.createTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              fomat="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
            /> -->
          </el-form-item>
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-select
              v-model="form.status"
              filterable
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in statusEnum"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="任务类型"
            prop="taskType"
          >
            <el-select
              v-model="form.taskType"
              filterable
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in taskType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div style="width: 150px;">
          <el-button
            class="right ml_10"
            @click="onReset"
          >重置</el-button>
          <el-button
            class="right golden"
            type="primary"
            @click="init"
          >查询</el-button>
        </div>
      </div>
      <DataTable
        :columns="columns"
        pagination
        :table-data="tableData"
        :loading="loading"
        :page-obj="{pageSize:10,currentPage:1}"
        :total="total"
        @renderPagination="getPageSearch"
      >
        <template slot="taskDetail">
          <el-table-column
            label="运行结果"
            prop="result"
            width="250px"
            fixed="right"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.type==='Lifecycle'">
                <p>过滤对象数: <span>{{ scope.row.taskDetail&&scope.row.taskDetail.filterObjectCount ||0 }}</span></p>
                <p>当前版本过期数: <span>{{ scope.row.taskDetail&&scope.row.taskDetail.expirationCount ||0 }}</span></p>
                <p>非当前版本过期数: <span>{{ scope.row.taskDetail&&scope.row.taskDetail.nonCurrentVersionExpirationCount ||0 }}</span></p>
                <p>分段过期数: <span>{{ scope.row.taskDetail&&scope.row.taskDetail.abortIncompleteMultipartUploadCount ||0 }}</span></p>
                <p>过期删除标记数: <span>{{ scope.row.taskDetail&&scope.row.taskDetail.deleteMarkerCount ||0 }}</span></p>
              </div>
              <div v-else>
                <p>物理删除对象数: <span>{{ scope.row.taskDetail&&scope.row.taskDetail.deleteCount ||0 }}</span></p>
                <p>物理删除失败对象数: <span>{{ scope.row.taskDetail&&scope.row.taskDetail.errorCount||0 }}</span></p>
              </div>
            </template>
          </el-table-column>
        </template>
      </DataTable>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import { getTaskList, getTaskDetail } from '@/api/lifecycle'
import { listUserBuckets } from '@/api/bucket'
export default {
  name: 'LifecycleTaskList',
  data() {
    return {
      statusEnum: [
        { label: '未开始', value: 'STATUS_INIT' },
        { label: '执行中', value: 'STATUS_RUNNING' },
        { label: '挂起', value: 'STATUS_SUSPEND' },
        { label: '成功', value: 'STATUS_SUCCEED' },
        { label: '失败', value: 'STATUS_FAILED' }
      ],
      taskType: [
        { label: '物理删除', value: 'HardDelete' },
        { label: '生命周期删除', value: 'Lifecycle' }
      ],
      buckets: [],
      form: {
        createTime: '',
        bucketId: '',
        status: '',
        taskType: ''
      },
      loading: false,
      searchVal: '',
      total: 0,
      tableData: [],
      columns: [
        {
          title: '桶名称',
          prop: 'bucketName',
          minWidth: '150px',
          fixed: true
        },
        {
          title: '类型',
          prop: 'type',
          width: '150px',
          formatter: (_, __, val) => {
            return this.taskType.find(x => x.value == val)?.label || ''
          }
        },
        {
          title: '创建日期',
          prop: 'createDate',
          width: '200px'
        },
        {
          title: '执行时间',
          prop: 'startTime',
          minWidth: '250px',
          formatter: (row, _, val) => {
            const startTime = row.startTime === 'null' || !row.startTime ? '未开始' : moment(row.startTime).format('YYYY-MM-DD HH:mm:ss')
            const endTime = row.endTime === 'null' || !row.endTime ? '未结束' : moment(row.endTime).format('YYYY-MM-DD HH:mm:ss')
            if (startTime === '未开始') return startTime
            else return startTime + '~' + endTime
          }
        },
        {
          title: '状态',
          prop: 'status',
          width: '200px',
          formatter: (_, __, val) => {
            return this.statusEnum.find(x => x.value == val)?.label || ''
          }
        },
        {
          slot: 'taskDetail'
        }
        // {
        //   slot: 'action'
        // }
      ]
    }
  },
  mounted() {
    this.form.createTime = [moment().subtract(7, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    this.listUserBuckets()
    this.init()
  },
  methods: {
    init() {
      this.getTaskList({
        pageNumber: 1,
        pageSize: 10
      })
    },
    getPageSearch(val) {
      this.getTaskList({
        pageNumber: val.pageNumber,
        pageSize: val.pageSize
      })
    },
    getTaskList(params) {
      this.loading = true
      const data = {
        bucketId: this.form.bucketId || undefined,
        type: this.form.taskType || undefined,
        status: this.form.status || undefined,
        startTime: this.form.createTime?.[0] || undefined,
        endTime: this.form.createTime?.[1] || undefined
      }
      getTaskList(params, data).then(res => {
        this.tableData = res.data.list
        this.total = res.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    listUserBuckets() {
      listUserBuckets().then((res) => {
        this.buckets = res.data.list
      })
    },
    onReset() {
      this.$refs['form'].resetFields()
      this.form.createTime = [moment().subtract(7, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
      this.init()
    },
    getTaskDetail(row) {
      getTaskDetail().then(res => {
        console.log(res, '123')
      })
    }
  }
}
</script>
<style lang="scss" scoped>
:deep(.menu) {
  display: flex;
  justify-content: space-between;
  .el-form {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    width: 0;
    .el-form-item {
      label.el-form-item__label {
        text-align: center;
        padding-right: 20px;
        width: 80px !important;
        margin-left: 5px;
        & + .el-form-item__content {
          margin-right: 10px;
        }
      }
    }
  }
  .right {
    position: relative;
    top: 9px;
    right: 20px;
  }
}
</style>

