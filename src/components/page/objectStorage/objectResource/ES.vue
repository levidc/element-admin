<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 clearfix">
        <el-button
          v-access="'admin:AddStorageResourceController'"
          class="golden"
          type="primary"
          @click="showCreate('object')"
        >创建</el-button>
        <div class="right">
          <el-tooltip
            content="刷新"
            placement="top"
            effect="dark"
          >
            <i
              class="el-icon-refresh"
              @click="init(true)"
            />
          </el-tooltip>
        </div>
        <div class="right clearfix">
          <el-input
            v-model="filterText"
            class="search_style search_btn right with_search mr_10"
            placeholder="资源名称过滤"
            clearable
          />
        </div>
      </div>

      <TableData
        ref="tab"
        :loading="loading"
        :row-key="rendeKey"
        :table-data="tableData"
        :columns="tableColumns"
        :page-obj="{ ...pageObj }"
        :sort-function="sortFunction"
      >
        <el-table-column
          slot="url"
          label="地址"
          prop="url"
          sortable="custom"
          min-width="200px"
        >
          <template slot-scope="scope">
            <el-tooltip
              :content="scope.row.url"
              placement="top"
            >
              <span>{{ scope.row.url }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          slot="action"
          :label="$ts('action')"
          fixed="right"
          width="200px"
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
                <el-dropdown-item
                  v-access="'admin:UpdateStorageResourceController'"
                  @click.native="updateForm(scope.row, true)"
                >修改资源</el-dropdown-item>
                <el-dropdown-item
                  v-access="'admin:DeleteResourceController'"
                  @click.native="handleDel('object', scope)"
                >删除资源</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </TableData>
    </div>
    <el-dialog
      :visible.sync="modelFormFlag"
      width="40%"
      :title="isAdd ? '创建资源' : '修改资源'"
      @open="dialogOpen('tableFocus')"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="160px"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              prop="storageName"
              label="资源名称"
            >
              <el-input
                ref="tableFocus"
                v-model.trim="form.storageName"
                placeholder="请输入2-64位中英文、数字、'_'或'-'"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              prop="url"
              label="地址"
            >
              <el-input
                v-model.trim="form.url"
                placeholder="请输入2-64位字符"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              prop="userName"
              label="用户名"
            >
              <el-input
                v-model.trim="form.userName"
                placeholder="请输入2-64位字符"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              prop="password"
              label="密码"
            >
              <el-input
                v-model.trim="form.password"
                type="password"
                placeholder="请输入2-64位字符"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="24">
            <el-form-item prop="bucketName" label="存储桶名">
              <el-popover placement="top" width="350" trigger="hover" style="position:absolute;">
                <p style="line-height:1.6;">名称只能由小写字母、数字、点 (.) 和连字符 (-) 组成。</p>
                <p style="line-height:1.6;">名称需以数字字母开头结尾</p>
                <p style="line-height:1.6;">名称不能包含两个相邻的句点(.)</p>
                <p style="line-height:1.6;">不能以'xn--'开头和以-s3alias结尾</p>
                <p style="line-height:1.6;">存储桶名称不能与 IP 地址相似</p>
                <p style="line-height:1.6;">名称长度为3-63位字符</p>
                <i slot="reference" class="fa fa-question-circle" style="margin-left: -20px !important;" />
              </el-popover>
              <el-input v-model.trim="form.bucketName" placeholder="请输入合法的存储桶名" :disabled="!isAdd" clearable />
            </el-form-item>
          </el-col>
          <el-col :span=24>
            <el-form-item label=" ">
              <span class="advanceConfig" @click="enableAdvancedConfig = !enableAdvancedConfig">
                高级设置
              </span>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row v-if="enableAdvancedConfig">
          <el-col :span="12">
            <el-form-item
              prop="s3SdkVersion"
              label="s3 SDK版本"
            >
              <el-select
                v-model="form.extendInfo.s3SdkVersion"
                :disabled="!isAdd"
              >
                <el-option
                  v-for="item in s3SdkVersion"
                  :key="item"
                  :value="item"
                  :label="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              props="s3SignatureVersion"
              label="s3 签名版本"
            >
              <el-select
                v-model="form.extendInfo.s3SignatureVersion"
                :disabled="!isAdd"
              >
                <el-option
                  v-for="item in s3SignatureVersion"
                  :key="item"
                  :value="item"
                  :label="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="golden"
          type="primary"
          @click="confirmCreate"
        >{{ $ts('button.confirm') }}</el-button>
        <el-button @click="modelFormFlag = false">{{ $ts('button.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="renderDel ? '删除存储资源' : '删除存储设备'"
      :visible.sync="deleteFlag"
      width="650px"
    >
      <p>{{ renderDel ? `删除如下存储资源:${selectRow.storageName}` : `删除如下存储设备: ${selectRow.deviceName}` }}
      </p>
      <div slot="footer">
        <el-button
          type="primary"
          class="golden"
          @click="deleteForm"
        >{{ $ts('delete') }}</el-button>
        <el-button @click="deleteFlag = false">{{ $ts('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import {
  addObjectStorageResource,
  updateObjectStorageResource,
  removeObjectStorageResource,
  deleteStorageDevice,
  listStorageResource
} from '@/api/storage'
import { validBucketName, validateMaxInt } from '@/utils/validate'
export default {
  data() {
    return {
      refreshId: [],
      sortConfig: {},
      filterText: '',
      showDescDevice: '',
      opType: 'add',
      optDType: 'add',
      rules: {
        storageName: [
          {
            required: true, message: '资源名称必填', trigger: ['blur', 'change']
          },
          {
            message: "请输入2-64位中英文、数字、'_'或'-'", pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5\-]{2,64}$/
          }
        ],
        url: [
          {
            required: true, trigger: ['blur', 'change'],
            validator: (_, val, cb) => {
              const reg = /^(http:\/\/)?((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))(:(([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])))?$/
              // console.log(val, 'val')
              if (!val) {
                return cb('请输入资源地址')
              } else if (!reg.test(val)) {
                return cb('请输入合法资源地址')
              } else {
                // 判断是否补充前缀
                if (val.indexOf('http://') === -1) {
                  this.form.url = 'http://' + val
                }
                return cb()
              }
            }
          },
          {
            min: 2, max: 64, message: '请输入2-64位字符'
          }
        ],
        bucketName: [
          {
            required: true, message: '存储桶名必填', trigger: ['blur', 'change']
          },
          {
            validator: validBucketName, trigger: ['blur', 'change']
          }
        ],
        userName: [
          // {
          //   required: true, message: '用户名称必填', trigger: ['blur', 'change']
          // },
          {
            min: 2, max: 64, message: '请输入2-64位字符'
          }
        ],
        password: [
          // {
          //   required: true, message: '用户密码必填', trigger: ['blur', 'change']
          // },
          {
            min: 2, max: 64, message: '请输入2-64位字符'
          }
        ],
        sign: [
          {
            required: true, message: '标签名必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 256, message: '请输入2-256字符'
          }

        ],
        objectCount: { required: true, message: '存储数量上限必填，请输入正整数' },
        objectSize: [
          { required: true, message: '存储数量上限必填，请输入正整数' },
          { validator: (rule, data, cb) => validateMaxInt('8000000000', '不超过8,000,000,000GB', rule, data, cb), trigger: ['change', 'blur'] }
        ],
        deviceId: { required: true, message: '请选择存储设备' },
        storageType: { required: true, message: '请选择存储类型' },
        nasAdvancedConfig: { required: true },
        mountDir: { required: true, message: '请设置共享目录' }
      },
      enableAdvancedConfig: false,
      s3SdkVersion: [
        'V1', 'V2'
      ],
      s3SignatureVersion: ['VERSION2', 'VERSION4'],
      form: {
        storageName: '',
        url: '',
        userName: '',
        password: '',
        isDefault: false,
        sign: '',
        bucketName: '',
        next: false,
        defaultV: false,
        objectCount: '',
        objectSize: '',
        deviceId: '',
        nasAdvancedConfig: false,
        storageType: 'S3', // 初始S3
        extendInfo: {
          s3SdkVersion: '',
          s3SignatureVersion: ''
          // maxObjectSize: '',
          // dirMaxFile: '',
          // dirMaxDepth: '',
          // dirMaxSubDir: ''
        },
        mountDir: ''
      },
      copyForm: {},
      selectRow: {},
      modelFormFlag: false,
      deleteFlag: false,
      loading: false,
      pageObj: {
        currentPage: 1,
        pageSize: 10
      },
      tableData: [],
      storageType: [
        { label: 'NAS', value: 'NAS' },
        { label: 'DBS', value: 'DBS' },
        { label: 'REMOTE_DISK', value: 'REMOTE_DISK' },
        { label: '本地磁盘', value: 'LOCAL_DISK' },
        { label: 'DOS', value: 'DOS' }
      ],
      tableColumns: [
        { prop: 'storageName', title: '资源名称', show: true, sortable: 'custom', fixed: 'left', minWidth: '200px' },
        { slot: 'url', show: true },
        // {
        //   prop: 'bucketName', title: '存储桶名', show: true, sortable: 'custom', minWidth: '110px'
        // },
        {
          prop: 'storageStatus', title: '存储状态', show: true, formatter: (row, _, val) => {
            const value = this.storageTypeEnu[val]
            return val === 'CONNECTING' ? <span class='green'>{value}</span> : <span class='red'>{value}</span>
          }, sortable: 'custom', minWidth: '200px'
        },
        { sortable: 'custom', prop: 'userName', title: '用户名', show: true, minWidth: '200px' },
        { slot: 'action', title: this.$ts('action'), show: true }
      ],
      prop: '',
      order: '',
      storageTypeEnu: {
        'STATUS_NULL': '未检测',
        'CONNECTING': '连接正常',
        'INVALID_KEY': '账号错误',
        'INVALID_SECRET': '密码错误',
        'UNCONNECTION': '地址错误',
        'NO_SUCH_BUCKET': '桶不存在',
        'UNKNOWN_ERROR': '未知错误',
        'OFFLINE_RESOURCE': '资源下线',
        'REMOUNT': '重新挂载中',
        'CONNECT_TIME_OUT': '连接超时',
        'NO_SUCH_DATABASE': '数据库表不存在'
      },
      copyData: [],
      timer: null
    }
  },
  computed: {
    isAdd() {
      return this.opType === 'add'
    },
    renderDel() {
      return this.opType === 'del'
    },
    ...mapState(['api'])
  },
  watch: {
    modelFormFlag(val) {
      if (val) {
        clearTimeout(this.timer)
      } else {
        this.init(true)
      }
    },
    'form.storageType': function(val) {
      if (val === 'S3') {
        this.form.nasAdvancedConfig = false
        this.$refs['form'].clearValidate()
      }
    },
    deleteFlag(val) {
      if (!val) {
        this.opType = 'add'
        this.optDType = 'add'
        this.init(true)
      }
    },
    filterText(val) {
      this.tableData = JSON.parse(JSON.stringify(this.copyData))
      if (!val) {
        this.init(true)
        return
      }
      clearTimeout(this.timer)
      this.$refs['tab'].currentPage = 1
      this.tableData = this.tableData.filter(item => item.storageName.toLowerCase().indexOf(val.toLowerCase()) > -1)
    }
  },
  mounted() {
    this.init(true)
  },
  destroyed() {
    clearTimeout(this.timer)
  },
  methods: {
    transByteToGB(data) {
      // ByteToGB、
      const res = (Number(data) / 1024 ** 3).toFixed(2)
      return res == 0 ? 0 : res
    },
    rendeKey(row) {
      return row.resourceId
    },
    handleDel(type, { row }) {
      if (type === 'object') {
        this.opType = 'del'
      }
      // console.log(row, 'row')
      this.selectRow = row
      this.deleteFlag = true
    },
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      this.tableData.sort(this.sortMethod(val.prop, val.order))
    },
    init(flag) {
      if (flag) {
        this.loading = true
      }
      clearTimeout(this.timer)
      listStorageResource({
        deviceId: '66666666666666666'
      }).then((res) => {
        this.tableData = (res.data || []).filter(item => {
          return item.storageType === 'ES'
        })
        this.tableData.sort(this.sortMethod(this.prop, this.order))
        this.copyData = JSON.parse(JSON.stringify(this.tableData))
      }).finally(() => {
        this.loading = false
        this.timer = setTimeout(() => {
          this.init(false)
        }, 4000)
      })
    },
    updateForm(row, flag = false) {
      this.opType = 'update'
      Object.assign(this.form, { ...row, defaultV: row.default, mountDir: row.bucketName })
      this.copyForm = JSON.parse(JSON.stringify(this.form))
      if (flag) {
        this.modelFormFlag = true
      }
    },
    dialogOpen(e) {
      const ipt = e
      this.$nextTick(function() {
        this.$refs[ipt].$el.querySelector('input').focus()
      })
    },
    showCreate(cName, id = '') {
      if (cName === 'object') {
        this.opType = 'add'
        this.modelFormFlag = true
        this.form.deviceId = id
        this.$set(this, 'form', {
          storageName: '',
          nasAdvancedConfig: false,
          url: '',
          userName: '',
          password: '',
          isDefault: true,
          sign: '',
          bucketName: '',
          next: false,
          defaultV: false,
          objectCount: '',
          objectSize: '',
          deviceId: '',
          storageType: 'S3',
          mountDir: '',
          extendInfo: {
            s3SdkVersion: '',
            s3SignatureVersion: ''
          }
        })
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      }
    },
    deleteForm() {
      if (this.renderDel) {
        const { resourceId, deviceId } = this.selectRow
        removeObjectStorageResource({
          resourceId,
          deviceId
        })
          .then(res => {
            if (res.msg === 'success') {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }
          })
          .catch((err) => {
            console.log(err)
          })
          .finally(() => {
            this.deleteFlag = false
            this.init()
          })
      } else {
        deleteStorageDevice({
          deviceId: this.selectRow.deviceId
        }).then((res) => {
          if (res.msg === 'success') {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
          }
        }).finally(() => {
          this.deleteFlag = false
        })
      }
    },
    confirmCreate() {
      this.$refs['form'].validate((valid) => {
        const {
          userName,
          password,
          storageName,
          url
        } = this.form
        const data = {
          storageName,
          userName,
          password,
          storageType: 'ES',
          url,
          deviceId: '66666666666666666',
          bucketName: ''
        }
        if (valid) {
          if (this.isAdd) {
            // if (storageType === 'NAS') {
            //   data.bucketName = mountDir
            // } else {
            //   // s3 useName、password
            //   Object.assign(data, { userName, password })
            //   const extendInfoParams = Object.keys(extendInfo).reduce((pre, cur) => {
            //     if (!pre[cur]) {
            //       if (extendInfo[cur]) {
            //         pre[cur] = extendInfo[cur]
            //       }
            //     }
            //     return pre
            //   }, {})
            //   data.extendInfo = extendInfoParams
            // }
            addObjectStorageResource(data)
              .then((res) => {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                this.modelFormFlag = false
              })
              .catch((err) => {
                console.log(err)
              })
              .finally(() => {
                this.init(true)
              })
          } else if (this.opType === 'update') {
            // 过滤 extendInfo、param、
            const reqParams = Object.keys(this.form).reduce((cur, pre) => {
              const newVal = this.form[pre]
              const oldVal = this.copyForm[pre]
              // console.log(newVal, 'newold', oldVal)
              if (typeof newVal !== 'object' && typeof oldVal !== 'object') {
                if (newVal !== oldVal) {
                  if (pre == 'defaultV') {
                    pre = 'default'
                  }
                  cur[pre] = newVal
                }
              }
              return cur
            }, {})
            delete reqParams.nasAdvancedConfig
            reqParams.resourceId = this.form.resourceId
            reqParams.deviceId = '66666666666666666'
            if (Object.keys(reqParams).length == 2) {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.modelFormFlag = false
              this.init()
              return
            }
            updateObjectStorageResource(reqParams)
              .then((res) => {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                this.modelFormFlag = false
              })
              .catch((err) => {
                console.log(err)
              })
              .finally(() => {
                this.init()
              })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  th {
    &:nth-of-type(1) {
      .cell {
        display: none;
        // .el-checkbox__inner {
        //   position: relative;
        // }
      }
    }
  }

  .el-select {
    width: 100%;
  }

  .el-descriptions__body {
    background: transparent;
  }

  .extendInfo {
    .el-col-12 {
      label.el-form-item__label {
        width: 175px !important;
        margin-left: -6px !important;

        & + .el-form-item__content {
          margin-left: 15px !important;
        }
      }

      margin-bottom: 20px;

      .el-input {
        width: calc((100% - 160px) / 1.5);
      }
    }
  }
}

::v-deep .el-table {
  .el-table__body-wrapper {
    overflow-x: auto !important;

    .el-table__body {
      table-layout: fixed !important;
      width: 100% !important;
    }
  }

  .el-table__expanded-cell {
    .el-table__cell {
      padding: 3px 10px 3px 0;
    }
  }

  .el-table__row.hide-dropdown {
    .el-table__expand-column {
      pointer-events: none;

      .el-table__expand-icon {
        display: none;
      }
    }
  }

  .cell {
    white-space: nowrap;
  }
}

::v-deep.el-form {
  .el-switch {
    .el-switch__label {
      line-height: 18px;
    }
  }

  label.el-form-item__label {
    margin-left: 10px !important;
  }
}

::v-deep .el-form label.el-form-item__label {
  width: 160px !important;
  margin-left: 0px !important;
  padding-right: 20px !important;
}

.advanceConfig {
  color: #ff8746;
  cursor: pointer;
}
</style>
