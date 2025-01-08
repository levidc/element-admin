<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 menu">
        <div>
          <el-button class="golden mr_10" type="primary" @click="showCreate">创建</el-button>
        </div>
        <div>
          <el-tooltip content="刷新" placement="top" effect="dark">
            <i class="el-icon-refresh" @click="refresh()" />
          </el-tooltip>
        </div>
      </div>
      <DataTable
        ref="DataTable"
        :columns="columns"
        pagination
        :table-data="tableData"
        :loading="loading"
        :page-obj="{ pageSize: pageSize, currentPage: pageNum }"
        :total="total"
        @renderPagination="getPageSearch"
      />
    </div>
    <el-dialog :visible.sync="flag" width="750px" title="创建策略字典">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">
        <el-form-item prop="strategyName" label="字典名称">
          <el-input v-model="form.strategyName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item prop="type" label="字典类型">
          <el-radio-group v-model="form.type">
            <el-radio label="FILE_SIZE">文件大小</el-radio>
            <el-radio label="FILE_TYPE">文件类型</el-radio>
            <el-radio label="PACKAGE_TEMPLATE">打包模板</el-radio>
            <el-radio label="STORAGE_DURATION">存入天数</el-radio>
            <el-radio label="PREFIX">文件/对象前缀</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="blue" @click="flag = false">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmCreate">{{ $ts('button.confirm')
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
  data() {
    return {
      enumType: {
        'FILE_SIZE': '文件大小',
        'FILE_TYPE': '文件类型',
        'PACKAGE_TEMPLATE': '打包模板',
        'STORAGE_DURATION': '存入天数',
        'PREFIX': '文件/对象前缀'
      },
      flag: false,
      pageSize: 10,
      pageNum: 1,
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
      rules: {
        strategyName: {
          required: true,
          message: '请输入字典名称',
          trigger: ['blur', 'change']
        },
        type: {
          required: true,
          message: '请输入字典名称',
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
          title: '策略名称',
          prop: 'strategyName',
          minWidth: '150px',
          fixed: true
        },
        {
          title: '类型',
          prop: 'type',
          minWidth: '150px',
          formatter: (_, __, val) => {
            return this.enumType[val]
          }
        },
        {
          title: '创建时间',
          prop: 'createTime',
          minWidth: '150px'

        },
        {
          title: '更新时间',
          prop: 'updateTime',
          minWidth: '150px'
        }
        // {
        //   slot: 'action'
        // }
      ]
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    confirmCreate() {
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
              text: this.$ts('response.success')
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
    showCreate() {
      this.flag = true
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
      })
    },
    refresh() {
      this.getTaskList({
        pageNum: this.pageNum,
        pageSize: this.pageSize
      })
    },
    init() {
      this.getTaskList({
        pageNum: 1,
        pageSize: this.pageSize
      })
    },
    getPageSearch(val) {
      this.pageNum = val.pageNumber
      this.pageSize = val.pageSize
      this.getTaskList({
        pageNum: val.pageNumber,
        pageSize: val.pageSize
      })
    },
    getTaskList(params) {
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
