<template>
  <div>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      border
      :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      tooltip-effect="dark"
      style="width: 100%"
      :default-sort="{prop: 'CreateDate', order: 'descending'}"
      @selection-change="handleSelectionChange"
      @sort-change="sortFunction"
    >
      <el-table-column
        label="名称"
        sortable="custom"
        prop="BucketName"
        min-width="120px"
        fixed
      >
        <template slot-scope="scope">
          <showToolTip
            :text="scope.row.BucketName"
            use-slot
          >
            <a
              slot="data"
              class="blue"
              @click="viewDetail(scope.row)"
            >{{ scope.row.BucketName }}</a>
          </showToolTip>
          <!-- <el-tooltip placement="top" content="存储桶详情">
          </el-tooltip> -->
        </template>
      </el-table-column>
      <!-- <el-table-column label="可见用户" prop="viewableUsers" min-width="100">
        <template slot-scope="scope">
          <div v-if="scope.row.viewableUsers && scope.row.viewableUsers.length" class="viewableUsers">
            <p v-for="item in scope.row.viewableUsers" :key="item">
              <el-tag>
                {{ item }}
              </el-tag>
            </p>
          </div>
        </template>
      </el-table-column> -->
      <el-table-column
        label="是否融合桶"
        sortable="custom"
        prop="Integrated"
        min-width="120px"
      >
        <template slot-scope="scope">
          {{ scope.row.Integrated == true?'融合桶':'非融合桶' }}
        </template>
      </el-table-column>
      <el-table-column
        label="对象总数(个)"
        sortable="custom"
        prop="UsedCount"
        min-width="125px"
      >
        <template slot-scope="scope">
          {{ scope.row.UsedCount }}
        </template>
      </el-table-column>
      <el-table-column
        label="对象总容量"
        sortable="custom"
        prop="UsedSize"
        min-width="120px"
      >
        <template slot-scope="scope">
          {{ byteConvert(scope.row.UsedSize) }}
        </template>
      </el-table-column>
      <el-table-column
        label="配置对象总数(个)"
        sortable="custom"
        prop="QuotaCount"
        min-width="160px"
      >
        <template slot-scope="scope">
          {{ scope.row.QuotaCount < 0 || scope.row.QuotaCount == 0 ?'无限制' : scope.row.QuotaCount }}
        </template>
      </el-table-column>
      <el-table-column
        label="配置对象总容量"
        sortable="custom"
        prop="QuotaSize"
        min-width="160px"
      >
        <template slot-scope="scope">
          {{ scope.row.QuotaSize < 0 || scope.row.QuotaSize == 0 ?'无限制' : byteConvert(scope.row.QuotaSize,symbols) }}
        </template>
      </el-table-column>
      <el-table-column label="是否文件系统" min-width="120px" prop="SupportFs">
        <template slot-scope="scope">
          {{ scope.row.SupportFs ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="CreateDate"
        label="创建时间"
        sortable
        width="150px"
      >
        <template slot-scope="scope">
          {{ scope.row.CreateDate ? timeTrans(scope.row.CreateDate) : '/' }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$ts('action')"
        width="140"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-dropdown v-access="'s3:DeleteBucket||admin:UpdateBucket'" size="small">
            <el-button type="primary" class="blue">
              {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
            </el-button>

            <el-dropdown-menu slot="dropdown">
              <!-- <el-dropdown-item v-if="showOwner" v-access="'admin:UpdateBucket'" @click.native="updateUser(scope.row)">修改桶拥有者</el-dropdown-item> -->
              <div :class="[scope.row.SupportFs ? 'cursorDisabled' : null]">
                <el-dropdown-item :disabled="scope.row.SupportFs" @click.native="transFormFS(scope.row)">转换文件系统</el-dropdown-item>
              </div>
              <el-dropdown-item v-access="'s3:DeleteBucket'" @click.native="deleteBucket(scope.row)">删除存储桶</el-dropdown-item>
              <!-- <el-dropdown-item  @click.native="">修改配额</el-dropdown-item>
							<el-dropdown-item  @click.native="">修改访问权限</el-dropdown-item>
							<el-dropdown-item  @click.native="">修改拥有者</el-dropdown-item>
							<el-dropdown-item  @click.native="">设置多版本</el-dropdown-item>
							<el-dropdown-item  @click.native="">生命周期管理</el-dropdown-item>
							<el-dropdown-item  @click.native="">存储桶策略</el-dropdown-item>
							<el-dropdown-item  @click.native="">存储桶站点管理</el-dropdown-item>
							<el-dropdown-item  @click.native="">存储桶标签管理</el-dropdown-item>
							<el-dropdown-item  @click.native="">详细描述</el-dropdown-item> -->
            </el-dropdown-menu>
          </el-dropdown>
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
    <el-dialog width="40%" title="转换文件系统" :visible.sync="modal">
      <el-form ref="form" :model="form" label-width="150px" :rules="rules" label-position="right">
        <el-form-item label="桶名称" prop="bucketName">
          <span>{{ form.BucketName }}</span>
        </el-form-item>
        <el-form-item label="读写权限" prop="ro" required>
          <el-radio-group v-model="form.ro">
            <el-radio :label="true">只读</el-radio>
            <el-radio :label="false">读写</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="modal=false">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmTrans">{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { listBucket } from '@/api/bucket'
// import { Gateway } from '@/api/gateway-request'
import {
  mountFS
} from '@/api/bucket'
export default {
  props: {
    searchVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      modal: false,
      Fsbucket: [],
      rules: {
        fsName: {
          required: true,
          trigger: ['change', 'blur'],
          validator: (rule, val, cb) => {
            if (!val) {
              return cb('请输入文件系统名称')
            } else {
              return cb()
            }
          }
        }
      },
      form: {
        fsName: '',
        path: '',
        BucketName: '',
        local: false,
        debug: false,
        memory: false
      },
      objectLogicSize: '',
      symbols: ['bytes', 'KB', 'MB', 'GB', 'TB'],
      loading: false,
      tableData: [],
      copy: [],
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      order: 'descending',
      prop: 'CreateDate'
    }
  },
  computed: {
  },
  watch: {
    searchVal(val) {
      this.tableData = [...this.copy]
      this.total = this.tableData.length
      this.currentPage = 1
      if (!val) { return }
      this.tableData = this.tableData.filter(item => {
        return item.BucketName.toLowerCase().indexOf(val.toLowerCase()) > -1
      })
      this.total = this.tableData.length
    }
  },
  mounted() {
    if (localStorage.getItem('port') != 'null') {
      this.listBuckets(true)
    }
  },
  methods: {
    // dialogOpen (e) {
    //   this.$nextTick(function () {
    //     this.$refs[e].$el.querySelector('input').focus()
    //   })
    // },
    confirmTrans() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const {
            fsName,
            BucketName,
            ro
          } = this.form
          const data = {
            fsName,
            bucket: BucketName,
            ro
          }
          mountFS(data).then((res) => {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.listBuckets()
            this.modal = false
          })
        }
      })
    },
    transFormFS(row) {
      this.modal = true
      this.form = {
        fsName: row.BucketName,
        BucketName: row.BucketName,
        ro: true
      }
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
      })
    },
    // mapIsBucketFs () {
    //   return new Promise((res) => {
    //     getFsList({
    //       pageSize: 10,
    //       pageIndex: 1
    //     }).then(res => {
    //       this.Fsbucket = (res.data.records || []).reduce((pre, cur) => {
    //         pre['BucketName'] = true
    //         return pre
    //       }, {})
    //       this.tableData = this.tableData.map(x => {
    //         if (this.Fsbucket[x.BucketName]) {
    //           x.FsBucket = true
    //         }
    //         return x
    //       })
    //     }).finally(() => {
    //       setTimeout(() => {
    //         res()
    //       }, 2000)
    //     })
    //   })
    // },
    updateUser(row) {
      this.$emit('updateBucket', row)
    },
    viewDetail: function(row) {
      this.$router.push({
        name: 'BucketList',
        params: {
          id: row.BucketName
          // ID: JSON.parse(localStorage.getItem('user')).name
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      // this.listBuckets()
      this.currentPage = 1
      // console.log(this.pageSize, '33333')
    },
    handleCurrentChange(val) {
      this.currentPage = val
      // this.listBuckets()
      // console.log(val, '1111')
    },
    next(val) {
      val++
    },
    back(val) {
      val--
    },
    deleteBucket: function(row) {
      // 子组件中触发父组件方法ee并传值cc12345a'q'q'q'q'q'q'q
      this.$emit('deleteBucket', row)
    },
    buttonControl(selection) {
      this.$emit('buttonControl', selection)
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    listBuckets(defaultSort) {
      this.loading = true
      listBucket().then(res => {
        this.tableData = res.BucketQuotaInfos || []
        if (defaultSort) {
          this.tableData.sort((a, b) => new Date(b.CreateDate).getTime() - new Date(a.CreateDate).getTime())
        } else {
          this.tableData.sort(this.sortMethod(this.prop, this.order))
        }
        // await this.mapIsBucketFs()
        this.copy = [...this.tableData]
        this.total = this.tableData.length
        if (this.$route.params.bucketName) {
          this.$emit('handleRouteParams')
        }
      }).finally(() => {
        this.loading = false
      })
      // this.$store.state._gatewayS3.call({ path: '/', param: { bucketWarp: '' }}).then(res => {
      //   this.tableData = res.data.BucketQuotaInfos || []
      //   if (defaultSort) {
      //     this.tableData.sort((a, b) => new Date(b.CreateDate).getTime() - new Date(a.CreateDate).getTime())
      //   } else {
      //     this.tableData.sort(this.sortMethod(this.prop, this.order))
      //   }
      //   this.copy = [...this.tableData]
      //   this.total = this.tableData.length
      // }).catch(err => {
      //   console.log('err', err)
      // }).finally(() => {
      //   this.loading = false
      // })
      // this.loading = true
      // listBucket().then((res) => {
      //   this.tableData = (res.data || []).map(item => {
      //     item.viewableUsers = item.viewableUsers || []
      //     return item
      //   })
      //   this.copy = [...this.tableData]
      //   this.tableData.sort(this.sortMethod(this.prop, this.order))
      //   this.total = this.tableData.length
      // }).finally(() => {
      //   this.loading = false
      // })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonControl(this.multipleSelection)
    },
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      this.tableData.sort(this.sortMethod(val.prop, val.order))
    }
  }
}
</script>

<style lang="scss" scoped>
.viewableUsers {
  display: flex;
  flex-wrap: wrap;
  p {
    width: 33%;
    padding: 5px 0;
  }
  .el-tag {
    color: #e39606;
    background-color: #384348;
    border-color: transparent;
  }
}
:deep(.el-form){
  padding-left: 30px;
  label.el-form-item__label {
    width: unset!important;
    margin-left: 0;
  }
}
</style>
