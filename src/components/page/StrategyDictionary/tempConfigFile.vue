<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 menu">
        <div>
          <el-button class="golden mr_10" type="primary" @click="showCreate">{{ $ts('page.create') }}</el-button>
        </div>
        <div style="display: flex">
          <el-form :model="searchForm" :rules="rules" ref="searchForm" label-width="120px" inline>
            <el-form-item prop="bucketId" :label="$ts('route.bucket')">
              <el-select v-model="searchForm.bucketId" filterable clearable
                :placeholder="$ts('tempConfigFile.selectBucket')">
                <el-option v-for="(bk, i) in buckets" :key="(bk.id).toString() + i" :label="bk.name" :value="bk.name" />
              </el-select>
            </el-form-item>
            <el-form-item prop="ruleName" :label="$ts('tempConfigFile.ruleName')">
              <el-input v-model="searchForm.ruleName" :placeholder="$ts('tempConfigFile.iptRuleName')" clearable />
            </el-form-item>
          </el-form>
          <div style="margin-left: 50px;">
            <div class="search-action">
              <el-button class="right ml_10 golden" type="primary" @click="doSearch">{{ $ts('page.search')
                }}</el-button>
              <el-button class="right" @click="onReset">{{ $ts('page.reset') }}</el-button>
            </div>
          </div>
        </div>
      </div>

      <DataTable ref="DataTable" :columns="columns" pagination :table-data="tableData" :loading="loading"
        :defaultSort="defaultSort" :page-obj="{ pageSize: pageSize, currentPage: pageNum }" :total="total"
        @renderPagination="getPageSearch" :sort-function="sortChange">
        <el-table-column slot="createTime" minWidth="150" :label="$ts('policies.createTime')" prop="createTime"
          sortable="custom">
          <template slot-scope="scope">
            {{ scope.row.createTime }}
          </template>
        </el-table-column>
        <el-table-column slot="action" min-width="100px" :label="$ts('page.action')">
          <template slot-scope="scope">
            <el-dropdown size="small" trigger="hover">
              <el-button type="primary" class="blue">
                {{ $ts('action') }}<i class=" el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="modifyForm(scope.row)">{{ $ts('tempConfigFile.modifyTempFile')
                  }}</el-dropdown-item>
                <el-dropdown-item @click.native="deleteConfig(scope.row)">{{ $ts('tempConfigFile.deleteTempFile')
                  }}</el-dropdown-item>
                <el-dropdown-item @click.native="downLoad(scope.row)">{{ $ts('tempConfigFile.downloadTempFile')
                  }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </DataTable>
    </div>
    <el-dialog :visible.sync="flag" width="700px"
      :title="isAdd ? $ts('tempConfigFile.createTempFile') : $ts('tempConfigFile.modifyTempFile')">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">
        <el-form-item prop="bucketName" :label="$ts('bucket.name')">
          <el-select style="width: 100%;" v-model="form.bucketName" filterable clearable
            :placeholder="$ts('tempConfigFile.selectBucket')" :disabled="!isAdd">
            <el-option v-for="(bk, i) in buckets" :key="(bk.id).toString() + i" :label="bk.name" :value="bk.name" />
          </el-select>
        </el-form-item>
        <el-form-item prop="name" :label="$ts('tempConfigFile.ruleName')">
          <el-input v-model="form.name" :placeholder="$ts('tempConfigFile.iptRuleName')" :disabled="!isAdd" />
        </el-form-item>
        <el-form-item :label="$ts('tempConfigFile.type')" prop="type">
          <el-select style="width: 100%;" v-model="form.type" :disabled="!isAdd">
            <el-option v-for="{ label, value } in configType" :key="value" :label="label" :value="value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="regularExpression" :label="$ts('tempConfigFile.regExp')">
          <el-input v-model="form.regularExpression" :placeholder="$ts('tempConfigFile.iptRegExp')" />
        </el-form-item>
        <el-form-item prop="rawList" :label="$ts('tempConfigFile.uploadFile')">
          <el-upload action="" :show-file-list="true" :auto-upload="false" :on-remove="handleRemove"
            :file-list="fileList" :on-change="handleChange">
            <el-button size="small" class="blue">{{ $ts('tempConfigFile.clickUpload') }}</el-button>
            <div slot="tip" class="el-upload__tip">{{ $ts('tempConfigFile.fileSizeLimit') }}</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="blue" @click="flag = false">{{ $ts('page.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmCreate">{{ $ts('page.confirm')
          }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { listUserBuckets } from '@/api/bucket'
import {
  downLoadGlacier,
  addGlacier,
  updateGlacier,
  deleteGlacier,
  getGlacier,
  listGlacier
} from '@/api/strategyDictionary'

export default {
  name: 'LifecycleTaskList',
  data () {
    return {
      defaultSort: {
        prop: 'createTime', order: 'descending'
      },
      loadingOption: {
        background: 'rgba(0, 0, 0, 0.5)'
      },
      searchForm: {
        bucketId: ''
      },
      fileList: [],
      configType: [
        {
          label: this.$ts('tempConfigFile.fileNotGlacier'),
          value: 1
        },
        {
          label: this.$ts('tempConfigFile.fileNotExist'),
          value: 0
        },
      ],
      sortProp: {
        prop: 'createTime',
        order: 'descending'
      },
      flag: false,
      pageSize: 10,
      pageNum: 1,
      buckets: [],
      rules: {
        bucketId: {
          required: true,
          message: this.$ts('tempConfigFile.selectBucket')
        },
        rawList: {
          validator: (_, val, cb) => {
            if (this.fileList.length == 0) {
              return cb(this.$ts('tempConfigFile.uploadFileRequired'))
            } else {
              return cb()
            }
          },
          trigger: ['change', 'blur']
        },
        bucketName: {
          required: true,
          message: this.$ts('policies.iptBucketName')
        },
        name: {
          required: true,
          message: this.$ts('tempConfigFile.iptRuleName')
        },
        regularExpression: {
          required: true,
          message: this.$ts('policies.iptUserReg')
        },
        type: { required: true, message: '' },
      },
      form: {
        bucketName: '',
        name: '',
        type: 1,
        regularExpression: '',
        data: '',
        policyName: '',
        expressions: [{
          strategyName: '',
          expression: ''
        }]
      },
      buckets: [],
      loading: false,
      popLoading: false,
      searchVal: '',
      total: 0,
      tableData: [],
      visiblePopover: false,
      columns: [
        {
          title: this.$ts('bucket.name'),
          prop: 'bucketName',
          minWidth: '150px',
          fixed: true
        },
        {
          title: this.$ts('tempConfigFile.ruleName'),
          prop: 'name',
          minWidth: '150px',
        },
        {
          title: this.$ts('tempConfigFile.type'),
          prop: 'type',
          formatter: (_, __, val) => {
            return val === 'NotExistFile' ? this.$ts('tempConfigFile.fileNotExist') : this.$ts('tempConfigFile.fileNotGlacier')
          },
          minWidth: '150px',
        },
        {
          title: this.$ts('tempConfigFile.regExp'),
          prop: 'regularExpression',
          minWidth: '150px',
        },
        {
          slot: 'expressions'
        },
        {
          slot: 'createTime'
        },
        {
          slot: 'action'
        }
      ],
      opt: 'add'
    }
  },
  watch: {
    flag (val) {
      if (!val) {
        this.fileList = []
      }
    }
  },
  computed: {
    isAdd () {
      return this.opt === 'add'
    }
  },
  async mounted () {
    await this.listUserBuckets()
    // this.init()
  },
  methods: {
    sortChange (val) {
      this.sortProp = {
        prop: val.prop,
        order: val.order
      }
      this.doSearch()
    },
    onReset () {
      this.searchForm.bucketId = ''
      this.searchForm.ruleName = ''
      this.tableData = []
      this.sortProp = {
        prop: 'createTime',
        order: 'descending'
      }
      this.pageNum = 1
      this.$refs['DataTable'].currentPage = 1
      this.$refs['DataTable'].$refs['dataTable'].sort('createTime', 'descending')
    },
    doSearch () {
      this.$refs['searchForm'].validate((valid) => {
        if (valid) {
          this.init()
        }
      })
    },
    listUserBuckets () {
      return listUserBuckets().then((res) => {
        this.buckets = res.data.list
      })
    },
    handleRemove () {
      this.fileList.pop()
      this.$refs['form'].validateField('rawList')
    },
    handleChange (change) {
      const isLt10M = change.raw.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        this.fileList.pop()
        return this.$msg({
          type: 'error',
          text: this.$ts('tempConfigFile.fileSizeLimit')
        })
      }
      this.fileList.pop()
      setTimeout(() => {
        this.fileList.push(change.raw)
        this.$refs['form'].validateField('rawList')
        this.form.fileName = change.raw.name
        const reader = new FileReader();
        reader.onload = (e) => {
          // 获取二进制数组
          const binaryData = new Uint8Array(e.target.result);
          this.form.data = Array.from(binaryData)
          // console.log(binaryData, '==== this.form.data')
        };
        reader.readAsArrayBuffer(change.raw);
      }, 50);
      // const reader = new FileReader();
      // reader.onload = () => {
      //   this.form.data = reader.result
      // }
      // reader.readAsArrayBuffer(change.raw);
    },
    deleteConfig (row) {
      const {
        bucketName,
        name
      } = row
      this.$confirm(this.$ts('tempConfigFile.deleteTempFileTip', { error: `<b style="color:#ff8746">${name}</b>` }), {
        confirmButtonText: this.$ts('page.confirm'),
        cancelButtonText: this.$ts('page.cancel'),
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        deleteGlacier({
          bucketName,
          name
        }).then(() => {
          this.$msg({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.$refs['DataTable'].currentPage = 1
        }).finally(() => {
          this.init()
        })
      })
    },
    downLoad (row) {
      const loading = this.$loading(this.loadingOption)
      downLoadGlacier({
        bucketName: row.bucketName,
        name: row.name
      }).then(res => {
        let fileName = res.headers['content-disposition'] && res.headers['content-disposition'].split(';')
        for (let i = 0, l = fileName.length; i < l; i++) {
          let temp = fileName[i].split('*=UTF-8')
          if (temp.length > 1 && temp[0] === 'filename') {
            fileName = temp[1]
            break
          }
        }
        fileName = decodeURIComponent(fileName.replace(/''/g, '')).substring(1)
        const blob = new Blob([res.data])
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }).finally(() => {
        loading.close()
      })
    },
    confirmCreate () {
      // const data = new Blob(this.fileList, { type: this.fileList[0].type })
      const {
        bucketName,
        name,
        type,
        regularExpression,
        data,
        fileName
      } = this.form
      const req = {
        bucketName,
        name,
        type,
        regularExpression,
        data,
        fileName
      }
      this.$refs['form'].validate(valid => {
        if (valid) {
          const loading = this.$loading(this.loadingOption)
          if (this.isAdd) {
            addGlacier(req).then(() => {
              this.$msg({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.searchForm.bucketId = bucketName
            })
              .finally(() => {
                this.flag = false
                this.$refs['DataTable'].currentPage = 1
                loading.close()
                this.init()
              })
          } else {
            updateGlacier(req)
              .then(() => {
                this.$msg({
                  type: 'success',
                  text: this.$ts('response.success')
                })
              })
              .finally(() => {
                loading.close()
                this.flag = false
                this.init()
              })
          }
        }
      })
    },
    async modifyForm (row) {
      this.opt = 'edit'
      const {
        bucketName,
        name,
        type,
        regularExpression,
        data,
      } = row
      this.form = {
        bucketName,
        name,
        type: type === 'NotRestoreFile' ? 1 : 0,
        regularExpression,
      }
      await this.listUserBuckets()
      const loading = this.$loading(this.loadingOption)
      getGlacier({
        bucketName,
        name
      }).then(res => {
        this.form.data = res.data.data
        this.form.fileName = res.data.fileName
        this.fileList.push({
          name: this.form.fileName
        })
      }).finally(() => {
        loading.close()
        this.flag = true
      })
    },
    async showCreate () {
      this.opt = 'add'
      this.flag = true
      await this.listUserBuckets()
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.fileList = []
        this.form = {
          fileName: '',
          bucketName: '',
          name: '',
          type: 1,
          regularExpression: '',
          data: '',
        }
      })
    },
    // 初始化、及创建
    init () {
      if (!this.searchForm.bucketId) return
      this.loading = true
      listGlacier({
        pageIndex: this.pageNum,
        pageSize: this.pageSize,
        bucketName: this.searchForm.bucketId,
        name: this.searchForm.ruleName,
        orderBy: this.sortProp.order === 'descending' ? 'bucket_id, create_time:false'
          : 'bucket_id, create_time:true'
        // toDo 排序支持
      }).then(res => {
        this.tableData = res.data.list || []
        this.total = res.data.totalCount
      }).catch((err) => {
        console.log(err, '123')
      })
        .finally(() => {
          this.loading = false
        })
    },
    getPageSearch (val) {
      this.pageNum = val.pageNumber
      this.pageSize = val.pageSize
      this.getTaskList({
        pageIndex: val.pageNumber,
        pageSize: val.pageSize,
        bucketName: this.searchForm.bucketId,
        name: this.searchForm.ruleName,
        orderBy: this.sortProp.order === 'descending' ? 'bucket_id, create_time:false'
          : 'bucket_id, create_time:true'
        // toDo sort
      })
    },
    getTaskList (params) {
      this.loading = true
      listGlacier(params).then(res => {
        this.tableData = res.data.list || []
        this.total = res.data.totalCount
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
:deep(.menu) {
  display: flex;
  justify-content: space-between;

  .right {
    position: relative;
    top: 9px;
    right: 20px;
  }
}

:deep(.el-form) {
  .addExpress {
    .byteInput .el-input__inner {
      padding-right: 48px;
    }

    .delBtn {
      cursor: pointer;
      color: #ff8746;
    }

    .el-col-8,
    .el-col-6 {
      .el-form-item {
        display: flex;
      }
    }

    .el-form-item__label {
      width: 0 !important;
      margin-left: 0;
      padding-right: 10px;
    }

    .el-form-item__content {
      margin-left: 0px !important;
    }
  }
}

.el-tag {
  color: #e39606 !important;
  background-color: #384348;
  border-color: transparent;
  height: 22px;
  line-height: 20px;
  border-radius: 20px;
  margin-left: 5px;
  width: 75px;
  text-align: center;
}

.el-table {
  .rowExpress {
    span {
      margin-right: 10px;
    }
  }
}
</style>
