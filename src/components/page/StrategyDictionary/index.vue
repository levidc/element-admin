<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 menu">
        <div>
          <el-button class="golden mr_10" type="primary" @click="showCreate">{{ $ts('page.create') }}</el-button>
        </div>
        <div>
          <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
            <i class="el-icon-refresh" @click="refresh()" />
          </el-tooltip>
        </div>
      </div>
      <DataTable ref="DataTable" :columns="columns" pagination :table-data="tableData" :loading="loading"
        :page-obj="{ pageSize: pageSize, currentPage: pageNum }" :total="total" @renderPagination="getPageSearch" />
    </div>
    <el-dialog :visible.sync="flag" width="750px" :title="$ts('strategyDictionary.create')">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">
        <el-form-item prop="strategyName" :label="$ts('strategyExpress.dictionaryName')">
          <el-input v-model="form.strategyName" :placeholder="$ts('strategyDictionary.iptStrategyDictionary')" />
        </el-form-item>
        <el-form-item prop="type" :label="$ts('tempConfigFile.type')">
          <el-radio-group v-model="form.type">
            <el-radio label="FILE_SIZE">{{ $ts('strategyExpress.fileSize') }}</el-radio>
            <el-radio label="FILE_TYPE">{{ $ts('strategyExpress.fileType') }}</el-radio>
            <el-radio label="PACKAGE_TEMPLATE">{{ $ts('strategyExpress.packageTemplate') }}</el-radio>
            <el-radio label="STORAGE_DURATION">{{ $ts('strategyExpress.storageDuration') }}</el-radio>
            <el-radio label="PREFIX">{{ $ts('strategyExpress.prefix') }}</el-radio>
          </el-radio-group>
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

import {
  listStrategyDictionary,
  createStrategyDictionary
} from '@/api/strategyDictionary'

export default {
  name: 'LifecycleTaskList',
  data () {
    return {
      enumType: {
        'FILE_SIZE': this.$ts('strategyExpress.fileSize'),
        'FILE_TYPE': this.$ts('strategyExpress.fileType'),
        'PACKAGE_TEMPLATE': this.$ts('strategyExpress.packageTemplate'),
        'STORAGE_DURATION': this.$ts('strategyExpress.storageDuration'),
        'PREFIX': this.$ts('strategyExpress.prefix')
      },
      flag: false,
      pageSize: 10,
      pageNum: 1,
      buckets: [],
      rules: {
        strategyName: {
          required: true,
          message: this.$ts('strategyDictionary.iptStrategyDictionary'),
          trigger: ['blur', 'change']
        },
        type: {
          required: true,
          trigger: ['blur', 'change']
        }
      },
      form: {
        strategyName: '',
        type: 'FILE_SIZE'
      },
      loading: false,
      searchVal: '',
      total: 0,
      tableData: [],
      columns: [
        {
          title: this.$ts('policies.policyName'),
          prop: 'strategyName',
          minWidth: '150px',
          fixed: true
        },
        {
          title: this.$ts('tempConfigFile.type'),
          prop: 'type',
          minWidth: '150px',
          formatter: (_, __, val) => {
            return this.enumType[val]
          }
        },
        {
          title: this.$ts('policies.createTime'),
          prop: 'createTime',
          minWidth: '150px'

        },
        {
          title: this.$ts('page.updateTime'),
          prop: 'updateTime',
          minWidth: '150px'
        }
        // {
        //   slot: 'action'
        // }
      ]
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    confirmCreate () {
      const {
        type,
        strategyName
      } = this.form

      this.$refs['form'].validate(valid => {
        if (valid) {
          createStrategyDictionary({
            strategyName,
            type
          }).then(() => {
            this.$msg({
              type: 'success',
              text: this.$ts('page.responseSuccess')
            })
          })
            .finally(() => {
              this.flag = false
              this.$refs['DataTable'].currentPage = 1
              this.init()
            })
        }
      })
    },
    showCreate () {
      this.flag = true
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
      })
    },
    refresh () {
      this.getTaskList({
        pageNum: this.pageNum,
        pageSize: this.pageSize
      })
    },
    init () {
      this.getTaskList({
        pageNum: 1,
        pageSize: this.pageSize
      })
    },
    getPageSearch (val) {
      this.pageNum = val.pageNumber
      this.pageSize = val.pageSize
      this.getTaskList({
        pageNum: val.pageNumber,
        pageSize: val.pageSize
      })
    },
    getTaskList (params) {
      this.loading = true
      listStrategyDictionary(params).then(res => {
        this.tableData = res.data.list
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
</style>
