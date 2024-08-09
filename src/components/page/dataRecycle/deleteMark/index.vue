<template>
  <div>
    <div class="page_content_wrap">
      <el-form
        ref="form"
        :model="form"
        :form="form"
        :rules="rules"
        label-width="80px"
        label-position="right"
        class="search"
      >
        <div class="search-group">
          <div class="search-content">
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
                  :key="(bk.id).toString() + i"
                  :label="bk.name"
                  :value="bk.id.toString()"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="对象key"
              prop="prefix"
            >
              <el-input
                v-model="form.prefix"
                clearable
                placeholder="请输入"
              />
            </el-form-item>
            <el-form-item
              label="选择时间"
              prop="deleteEndTime"
            >
              <div style="min-width: 286px;">
                <el-date-picker
                  v-model="form.deleteStartTime"
                  :picker-options="disableStartDate"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  format="yyyy-MM-dd HH:mm"
                  placeholder="开始时间"
                />
                <span> ~ </span>
                <el-date-picker
                  v-model="form.deleteEndTime"
                  type="datetime"
                  :picker-options="disableEndDate"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  format="yyyy-MM-dd HH:mm"
                  placeholder="结束时间"
                />
              </div>

            </el-form-item>
            <!-- 优化代码 对俩个时间分别校验 -->
            <el-form-item
              label="留痕状态"
              prop="recordType"
            >
              <div class="recordTypeStyle">
                <el-select
                  v-model="form.recordType"
                  filterable
                  clearable
                  placeholder="请选择"
                  @change="changeRecordType"
                >
                  <el-option
                    v-for="item in recordList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </el-form-item>
            <!-- <el-form-item label="是否删除">
              <el-select v-model="form.deleteStatus">
                <el-option v-for="item in deleteStatus" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item> -->
          </div>
          <div class="search-action">
            <el-button
              class="right ml_10"
              @click="onReset"
            >重置</el-button>
            <el-button
              class="right golden"
              type="primary"
              @click="listDeletedObjects(1)"
            >查询</el-button>
          </div>
        </div>
      </el-form>
      <TableData
        :columns="columns"
        :loading="loading"
        :table-data="tableData"
        :page-obj="page"
        @go-page="onGoPage"
      >
        <el-table-column
          slot="size"
          label="文件大小"
          width="120px"
        >
          <template slot-scope="scope">
            <span>{{ byteConvert(scope.row.size) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          slot="versionId"
          label="版本号"
        >
          <template slot-scope="scope">
            <span>{{ (scope.row.versionId && scope.row.versionId != 'null')?scope.row.versionId:'' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          slot="deleteType"
          label="删除方式"
          width="120px"
        >
          <template slot-scope="scope">
            <span>{{ deleteTypes[scope.row.deleteType] || '未知' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          slot="recordType"
          label="删除状态"
          width="100px"
        >
          <template slot-scope="scope">
            <span>{{ recordTypes[scope.row.recordType] || '未知' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          slot="action"
          label="操作"
          width="80px"
        >
          <template slot-scope="scope">
            <a
              v-if="scope.row.recordType=='LogicDelete'"
              @click="onRestore(scope.row)"
            >恢复</a>
          </template>
        </el-table-column>
      </TableData>
    </div>
  </div>
</template>
<script>
import { listDeletedObjects } from '@/api/deleteMark'
import { listUserBuckets } from '@/api/bucket'
import { validateObjectKey } from '@/utils/validate'

export default {
  name: 'DeleteMark',
  data () {
    const validDeleteEndTime = (rule, data, callback) => {
      const deleteStartTime = new Date(this.form.deleteStartTime).getTime()
      const deleteEndTime = new Date(data).getTime()
      const twentyFourHours = 30 * 24 * 60 * 60 * 1000
      // 修改为30天
      if (!this.form.deleteStartTime) {
        return callback(new Error('开始时间不能为空'))
      } else if (!data) {
        return callback(new Error('结束时间不能为空'))
      } else if (deleteEndTime < deleteStartTime) {
        return callback(new Error('结束时间不能小于开始时间'))
      } else if (deleteEndTime - deleteStartTime > twentyFourHours) {
        return callback(new Error('时间间隔大于30天'))
      } else {
        callback()
      }
    }
    return {
      disableStartDate: {
        // disabledDate: time => {
        //   return time.getTime() > Date.now()
        // }
      },
      disableEndDate: {
        // disabledDate: time => {
        //   return time.getTime() > Date.now()
        // }
      },
      value1: '',
      tableData: [],
      rules: {
        bucketId: { trigger: ['change', 'blur'], required: true },
        deleteEndTime: { trigger: ['change', 'blur'], required: true, validator: validDeleteEndTime },
        prefix: {
          trigger: ['change', 'blur'],
          validator: validateObjectKey
        }
      },
      deleteStatus: [{ label: '是', value: 1 }, { label: '否', value: 0 }],
      form: {
        bucketId: '',
        deleteStartTime: '',
        deleteEndTime: '',
        recordType: '',
        prefix: ''
      },

      page: {
        currentPage: 0,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0
      },
      deleteTypes: {
        User: '用户删除',
        Lifecycle: '生命周期删除'
      },
      recordList: [
        { label: '逻辑删除', value: 0 },
        { label: '物理删除', value: 1 }
      ],
      recordTypes: {
        LogicDelete: '逻辑删除',
        RealDelete: '物理删除'
      },
      buckets: [],
      loading: false,

      columns: [
        { prop: 'objectKey', title: '对象key', show: true },
        { prop: 'bucketName', title: '存储桶名', show: true },
        { slot: 'size', title: '文件大小', show: true },
        { slot: 'versionId', title: '版本号', show: true },
        { slot: 'deleteType', title: '删除方式', show: true },
        { slot: 'recordType', title: '删除状态', show: true },
        { prop: 'createTime', title: '删除时间', show: true, width: '160px' },
        { slot: 'action', show: true }

      ]
    }
  },
  async mounted () {
    this.getTime()
    await this.listUserBuckets()
    this.form.bucketId = this.buckets[0]?.id.toString()
    this.listDeletedObjects(1)
  },
  methods: {
    getTime () {
      const date = new Date()
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      const tenMinutesAgo = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startYear = tenMinutesAgo.getFullYear()
      const startMonth = (tenMinutesAgo.getMonth() + 1).toString().padStart(2, '0')
      const startDay = tenMinutesAgo.getDate().toString().padStart(2, '0')
      const startHours = tenMinutesAgo.getHours().toString().padStart(2, '0')
      const startMinutes = tenMinutesAgo.getMinutes().toString().padStart(2, '0')
      const deleteEndTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      const deleteStartTime = `${startYear}-${startMonth}-${startDay} ${startHours}:${startMinutes}:${seconds}`
      this.form.deleteEndTime = deleteEndTime
      this.form.deleteStartTime = deleteStartTime
    },
    listDeletedObjects (page = void 0) {
      this.$refs['form'].validate((valid => {
        if (valid) {
          this.loading = true
          if (page) this.page.currentPage = page
          const param = {
            pageNum: this.page.currentPage,
            pageSize: this.page.pageSize
          }
          if (this.form.bucketId) param.bucketIds = [this.form.bucketId]
          if (this.form.prefix) param.prefix = this.form.prefix
          if (this.form.deleteStartTime) param.deleteStartTime = this.form.deleteStartTime
          if (this.form.deleteEndTime) param.deleteEndTime = this.form.deleteEndTime
          param.recordType = this.form.recordType.toString() ? this.form.recordType : null
          listDeletedObjects(param).then(res => {
            const { list, pageNum, ...page } = res.data
            this.tableData = list
            this.page = { ...this.page, ...page, currentPage: pageNum }
          }).finally(() => {
            this.loading = false
          })
        }
      }))
    },
    listUserBuckets () {
      return listUserBuckets().then((res) => {
        this.buckets = res.data.list
      })
    },
    changeRecordType (val) {
      this.form.recordType = val
    },
    onGoPage (page) {
      this.page = { ...this.page, ...page }
      this.listDeletedObjects()
    },
    onReset () {
      this.getTime()
      this.form = {
        bucketId: this.buckets[0]?.id.toString(),
        deleteStartTime: this.form.deleteStartTime,
        deleteEndTime: this.form.deleteEndTime,
        recordType: '',
        prefix: ''
      }
      this.listDeletedObjects(1)
    },
    onRestore (record, force = false) {
      // console.log(record)
      this.$confirm(force ? '对象已存在，确定要强制恢复该资源吗？' : '确定要恢复该资源吗？', '确认', {
        confirmButtonText: force ? '强制恢复' : '恢复',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const data = { deleteRecordId: record.id }
          if (force) data.force = true
          this.$store.state._gatewayS3.call({ path: '/', param: { restoreDeleted: '' }, data, method: 'POST', ignoreNotice: true }).then(res => {
            this.listDeletedObjects()
          }).catch(err => {
            console.log(err)

            if (err.code == 'RestoreConflict') {
              this.onRestore(record, true)
            } else {
              this.$ts({ type: 'error', text: err.message })
            }
          })
        })
    }
  }
}
</script>
<style lang="scss" scoped>
:deep(.el-form.search) {
  .search-group {
    display: flex;

    .search-content {
      display: flex;
      flex-wrap: wrap;
      flex-grow: 1;
      width: 0;

      .el-form-item {
        margin-left: 5px;
        margin-right: 30px;

        .el-input {
          width: 200px;
        }
      }
    }

    .search-action {
      width: 150px;
    }
  }

  label.el-form-item__label {
    width: inherit !important;
    margin-left: inherit !important;
    padding-right: inherit;
  }

  .el-date-editor--date {
    width: 126px !important;
  }

  .el-select {
    width: 100%;
  }
}

::v-deep .el-form-item {
  margin-right: 0px !important;
}
.right {
  position: relative;
  top: 9px;
  right: 20px;
}

a {
  color: #ff8746;
}
::v-deep .el-form.search .el-date-editor--date {
  width: 173px !important;
}
.el-form.search .search-group .search-content .el-form-item .el-input {
  width: 177px !important;
}
::v-deep .recordTypeStyle .el-input {
  width: 150px !important;
}
</style>
