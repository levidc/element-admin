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
        :page-obj="{ pageSize: pageSize, currentPage: pageNum }" :total="total" @renderPagination="getPageSearch">
        <el-table-column slot="policyList" :label="$ts('policies.policyName')" min-width="120px">
          <template slot-scope="scope">
            <el-table class="innerTable" :data="scope.row.policyList">
              <el-table-column prop="policyName" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column slot="expressions" min-width="230px" :label="$ts('bucketStrategyExpress.expression')">
          <template slot-scope="scope">
            <el-table class="innerTable" :data="scope.row.policyList">
              <el-table-column prop="expressions">
                <template slot-scope="scope">
                  <p v-for="(item, index) in scope.row.expressions" :key="index" class="rowExpress">
                    <span>
                      {{ item.strategyName }}
                    </span>
                    <span>
                      {{ item.expression }}
                    </span>
                    <span>
                      {{ item.num }}
                    </span>
                  </p>
                </template>
              </el-table-column>
            </el-table>
            <!-- <p v-for="(item, index) in scope.row.policyList[0] && scope.row.policyList[0].expressions" :key="index"
              class="rowExpress">
              <span>
                {{ item.strategyName }}
              </span>
              <span>
                {{ item.expression }}
              </span>
              <span>
                {{ item.num }}
              </span>
            </p> -->
          </template>
        </el-table-column>
        <el-table-column slot="action" min-width="100px" :label="$ts('page.action')">
          <template slot-scope="scope">
            <el-button @click="modifyForm(scope.row)">{{ $ts('page.modify') }}</el-button>
            <!-- <el-dropdown size="small" trigger="hover">
              <el-button type="primary" class="blue">
                {{ $ts('page.action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="modifyForm(scope.row)">修改表达式</el-dropdown-item>
                <el-dropdown-item @click.native="deleteConfig(scope.row)">删除表达式</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown> -->
          </template>
        </el-table-column>
      </DataTable>
    </div>
    <el-dialog :visible.sync="flag" width="650px"
      :title="isAdd ? $ts('bucketStrategyExpress.createTitle') : $ts('bucketStrategyExpress.modifyTitle')">
      <el-form ref="form" :model="form" label-width="100px" :rules="rules" style="margin: 0 5%;">
        <el-form-item prop="bucketName" :label="$ts('bucket.name')">
          <el-select v-model="form.bucketName">
            <el-option v-for="item in bucketList" :key="String(item.id)" :value="item.name">
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="policyExpressionIds">
          <span slot="label">
            {{ $ts('bucketStrategyExpress.strategyExpress') }}
            <el-popover width="250px" trigger="hover" placement="top-start"
              :content="$ts('bucketStrategyExpress.strategyExpressTip')">
              <svg slot="reference" class="icon icon-question" aria-hidden="true">
                <use xlink:href="#icon-question" />
              </svg>
            </el-popover>
          </span>
          <el-popover v-model="visiblePopover" popper-class="addExpress" placement="top" width="500px" @show="getList()"
            @hide="resetForm">
            <p>{{ $ts('bucketStrategyExpress.selectStrategyDictionary') }}</p>
            <el-button :disabled="selection.length === 0" style="margin-top: 20px;" type="primary" class="blue"
              @click="handleAdd">{{ $ts('page.add') }}</el-button>
            <el-table ref="tableRef" v-loading="popLoading" :data="listPolicyExpressions" style="margin:20px 0"
              @selection-change="handleSelection">
              <el-table-column type="selection" align="center" :selectable="handleSelect" />
              <el-table-column :label="$ts('policies.policyName')" width="300px" prop="policyName" />
              <el-table-column :label="$ts('bucketStrategyExpress.expression')" width="300px" prop="expressions">
                <template slot-scope="scope">
                  <p v-for="(item, index) in scope.row.expressions" :key="index" class="rowExpress">
                    <span>
                      {{ item.strategyName }}
                    </span>
                    <span>
                      {{ item.expression }}
                    </span>
                    <span>
                      {{ item.num }}
                    </span>
                  </p>
                </template>
              </el-table-column>
              <el-table-column :label="$ts('page.action')" width="200px">
                <!-- 触发禁用条件新增 同存储 -->
                <template slot-scope="scope">
                  <el-button @click="confirmSel(scope.row)">{{ $ts('page.select') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination :current-page="userPage" :page-sizes="[5, 10, 50, 100]" :page-size="userPageSize"
              :total="userTotal" class="right_page" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleUserSize" @current-change="handleUserPage" />
            <br>
            <div style="display:flex;justify-content:flex-end;margin-top:20px">
              <el-button size="mini" type="text" @click="visiblePopover = false">{{ $ts('page.confirm') }}</el-button>
            </div>
            <el-button slot="reference">{{ $ts('policies.config') }}</el-button>
          </el-popover>
          <br>
          <el-tag v-for="(item, index) in form.policyExpressionIds" :key="index" closable
            @close="form.policyExpressionIds.splice(index, 1)">
            {{ item.policyName }}
          </el-tag>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="blue" @click="flag = false">{{ $ts('page.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmCreate">{{ $ts('page.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { listUserBuckets } from '@/api/bucket'
import {
  // queryBucketExpression,
  listPolicyExpression,
  createOrUpdateBucketExpression,
  listBucketExpression
} from '@/api/strategyDictionary'

export default {
  name: 'LifecycleTaskList',
  data () {
    return {
      visiblePopover: false,
      listPolicyExpressions: [],
      bucketList: [],
      operator: [
        '=',
        '>=',
        '<=',
        '>',
        '<'
      ],
      flag: false,
      pageSize: 10,
      pageNum: 1,
      buckets: [],
      rules: {
        bucketName: {
          required: true,
          message: this.$ts('tempConfigFile.selectBucket')
        },
        policyExpressionIds: {
          required: true,
          message: this.$ts('bucketStrategyExpress.selectStrategyExpress')
        }
      },
      form: {
        bucketName: '',
        policyExpressionIds: []
      },
      loading: false,
      total: 0,
      tableData: [],
      popLoading: false,
      userPage: 1,
      userPageSize: 10,
      userTotal: 0,
      columns: [
        {
          title: this.$ts('bucket.name'),
          prop: 'bucketName',
          minWidth: '150px',
          fixed: true
        },
        {
          slot: 'policyList'
        },
        {
          slot: 'expressions'
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
        },
        {
          slot: 'action'
        }
      ],
      opt: 'add',
      selection: []
    }
  },
  computed: {
    isAdd () {
      return this.opt === 'add'
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    handleSelect (row) {
      return this.form.policyExpressionIds.every(x => x.id !== row.id)
    },
    handleAdd () {
      this.visiblePopover = false
      this.form.policyExpressionIds.push(...JSON.parse(JSON.stringify(this.selection)))
      this.$refs['form'].validateField(['policyExpressionIds'])
    },
    handleSelection (val) {
      this.selection = val
    },
    deleteIcon (index) {
      this.form.expressions.splice(index, 1)
    },
    confirmSel (row) {
      this.form.policyExpressionIds.push(row)
      this.visiblePopover = false
      this.$refs['form'].validateField(['policyExpressionIds'])
    },
    resetForm () {
      this.userPage = 1
      this.listStrategyDictionary = []
    },
    handleUserSize (size) {
      this.userPage = 1
      this.userPageSize = size
      this.getList()
    },
    handleUserPage (page) {
      this.userPage = page
      this.getList()
    },
    getList () {
      this.popLoading = true
      listPolicyExpression({
        pageNum: this.userPage,
        pageSize: this.userPageSize
      }).then(res => {
        this.listPolicyExpressions = res.data.list
        this.userTotal = res.data.totalCount
      }).finally(() => {
        this.popLoading = false
      })
    },
    confirmCreate () {
      const {
        policyExpressionIds,
        bucketName
      } = this.form
      const data = {
        bucketName,
        policyExpressionIds: policyExpressionIds.map(x => x.id)
      }
      this.$refs['form'].validate(valid => {
        if (valid) {
          createOrUpdateBucketExpression(data).then(() => {
            this.$msg({
              type: 'success',
              text: this.$ts('page.responseSuccess')
            })
          })
            .finally(() => {
              this.flag = false
              if (this.isAdd) {
                this.$refs['DataTable'].currentPage = 1
              }
              this.init()
            })
        }
      })
    },

    modifyForm (row) {
      this.opt = 'edit'
      this.form = {
        bucketName: row.bucketName,
        policyExpressionIds: JSON.parse(JSON.stringify(row.policyList))
      }
      this.flag = true
    },

    getBucketList () {
      return new Promise((resolve) => {
        listUserBuckets().then(res => {
          this.bucketList = res.data.list
        }).finally(() => {
          resolve(true)
        })
      })
    },
    async showCreate () {
      await this.getBucketList()
      this.opt = 'add'
      this.flag = true
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form = {
          bucketName: '',
          policyExpressionIds: []
        }
      })
    },
    refresh () {
      this.getTaskList()
    },
    init () {
      this.getTaskList()
    },
    getPageSearch (val) {
      this.pageNum = val.pageNumber
      this.pageSize = val.pageSize
      this.getTaskList()
    },
    getTaskList () {
      this.loading = true
      listBucketExpression().then(res => {
        this.tableData = res.data || []
        this.total = res.data.length || 0
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
  width: fit-content;
  text-align: center;
}

.el-table {
  .rowExpress {
    span {
      margin-right: 10px;
    }
  }
}

:deep(.innerTable) {
  .el-table__header-wrapper {
    display: none;

    &+.el-table__body-wrapper {
      table {
        tbody {
          tr td {
            &:first-of-type {
              // padding-left: 20%;
              box-sizing: border-box;
            }
          }

          .cell {
            padding: 0;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.addExpress.el-popover {
  .el-table {
    tbody td {
      .is-disabled {
        display: none;
      }
    }
  }
}
</style>
