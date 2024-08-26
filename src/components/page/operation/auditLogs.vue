<template>
  <div>
    <div class="page_content_wrap">
      <el-form
        ref="form"
        :form="form"
        :rules="rules"
        label-width="80px"
        label-position="right"
        class="search"
      >
        <div class="search-group">
          <div class="search-content">
            <el-form-item
              label="操作人"
              prop="user"
            >
              <el-input
                v-model="form.user"
                placeholder="查询操作人"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="操作时间"
              prop="endTime"
            >
              <div style="min-width: 286px;">
                <el-date-picker
                  v-model="form.startTime"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  format="yyyy-MM-dd HH:mm"
                  placeholder="开始时间"
                />
                <span> ~ </span>
                <el-date-picker
                  v-model="form.endTime"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  format="yyyy-MM-dd HH:mm"
                  placeholder="结束时间"
                />
              </div>
            </el-form-item>
          </div>
          <div class="search-action">
            <el-button
              class="right ml_10"
              @click="onReset"
            >重置</el-button>
            <el-button
              class="right golden"
              type="primary"
              @click="getAuditLoDaTa(1)"
            >查询</el-button>
          </div>
        </div>
      </el-form>

      <div>

        <el-table
          v-loading="loading"
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column
            prop="createTime"
            label="操作时间"
          />
          <el-table-column
            prop="clientIp"
            label="操作IP"
          />
          <el-table-column
            prop="operateSource"
            label="操作来源"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.operateSource == 1">console控制台 </span>
              <span v-if="scope.row.operateSource == 2">Paas平台 </span>
              <span v-if="scope.row.operateSource == 3">老存储网关</span>
              <span v-if="scope.row.operateSource == 0">其他 </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="operateUser"
            label="操作人"
          />
          <el-table-column
            prop="operateFunction"
            label="操作功能"
          />
          <el-table-column
            prop="operateType"
            label="操作类型"
          />
          <el-table-column
            prop="operateResult"
            label="操作结果"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.operateResult == 1">成功 </span>
              <span v-if="scope.row.operateResult == 0">失败 </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="param"
            label="操作参数"
            width="130px"
          >
            <template slot-scope="scope">
              <el-popover
                width="800"
                trigger="hover"
                placement="top-start"
                :open-delay="200"
                popper-class="auditLog"
              >
                <json-viewer
                  :value="handleJSON(scope.row.param)"
                  preview-mode
                  :show-array-index="false"
                  theme="my-awesome-json-theme"
                />
                <i
                  slot="reference"
                  class="fa fa-question-circle"
                  style="margin-left:5px;font-size:16px;"
                />
              </el-popover>
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
  </div>
</template>
<script>
import { queryPage } from '@/api/auditLogs'
import moment from 'moment'
export default {
  name: 'AuditLogs',
  data() {
    const validEndTime = (rule, data, callback) => {
      if (this.form.startTime > this.form.endTime) {
        return callback(new Error('开始时间不能大于结束时间'))
      } else if (!this.form.startTime) {
        return callback(new Error('开始时间不能为空'))
      } else if (!this.form.endTime) {
        return callback(new Error('结束时间不能为空'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      rules: {
        startTime: { trigger: ['change', 'blur'], required: true },
        endTime: { trigger: ['change', 'blur'], required: false, validator: validEndTime }
      },
      tableData: [],
      form: {
        user: '',
        endTime: '',
        startTime: ''
      },
      currentPage: 1,
      total: 0,
      pageSize: 10
    }
  },
  mounted() {
    this.getTime()
    this.getAuditLoDaTa(1)
  },
  methods: {
    handleJSON(param) {
      const _this = this
      function convertJson(jsonString) {
        const json = JSON.parse(jsonString)
        let newJson = {}
        if (Array.isArray(json)) {
          const flag = json.every(x => typeof x === 'string')
          if (!flag) {
            newJson = json.map(item => {
              if (typeof item === 'object' && !Array.isArray(item)) {
                Object.keys(item).forEach(k => {
                  item[k] = convertJson(JSON.stringify(item[k]))
                })
              }
              return item
            })
          } else {
            // 数组重复fix
            newJson = [...new Set(json)]
          }
        } else if (typeof json === 'object') {
          for (const key in json) {
            if (typeof json[key] === 'object' && json[key] !== null) {
              newJson[key] = convertJson(JSON.stringify(json[key]))
            } else if (_this.isJSON(json[key])) {
              newJson[key] = convertJson((json[key]))
            } else {
              newJson[key] = json[key]
            }
          }
        } else {
          newJson = json
        }
        return newJson
      }
      return convertJson(param)
    },
    getTime() {
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
      const EndTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      const StartTime = `${startYear}-${startMonth}-${startDay} ${startHours}:${startMinutes}:${startMinutes}`
      this.form.endTime = EndTime
      this.form.startTime = StartTime
    },
    getAuditLoDaTa(val) {
      this.currentPage = val
      if (this.form.startTime > this.form.endTime || this.form.startTime == null || this.form.endTime == null) return
      this.loading = true
      const table = document.getElementsByTagName('tbody')[0]
      queryPage({ operateUser: this.form.user, startTime: this.form.startTime, endTime: this.form.endTime, pageNumber: this.currentPage, pageSize: this.pageSize }).then((res) => {
        this.tableData = res.data.list || res.data.records || []
        this.total = res.data.total || res.data.totalRecords || []
      }).finally(() => {
        this.loading = false
        const dataTimeArr = []
        const temp = {}
        const arr = document.getElementsByClassName('customDate')
        const len = arr.length
        for (let i = len - 1; i >= 0; i--) {
          // 倒序处理 异常删除dom问题
          table.removeChild(arr[i])
        }
        this.tableData.forEach((item, index) => {
          const time = moment(item.createTime).format('YYYY-MM-DD')
          if (!temp[time]) {
            const tr = document.createElement('tr')
            dataTimeArr.push(time)
            tr.className = 'customDate'
            tr.innerHTML = `<td><span>${time}</span></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`
            const length = dataTimeArr.length ? dataTimeArr.length - 1 : 0
            table.insertBefore(
              tr, table.children[index + length]
            )
            temp[time] = true
          }
        })
      })
    },
    onReset() {
      this.getTime()
      this.form = {
        user: '',
        startTime: this.form.startTime,
        endTime: this.form.endTime

      }

      this.getAuditLoDaTa(1)
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getAuditLoDaTa(1, this.pageSize)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getAuditLoDaTa(this.currentPage)
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

  .right {
    position: relative;
    top: 10px;
    right: 20px;
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
<style lang="scss">
.auditLog {
  .jv-container {
    .jv-code {
      max-height: 600px !important;
      overflow-y: auto;
    }
    a.jv-link {
      color: #8997a5;
      pointer-events: none;
    }
  }
}
</style>
