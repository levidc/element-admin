<template>
  <div>
    <div class="bucket-detail">
      <div class="mb_15 clearfix">
        <div class="right">
          <el-tooltip
            content="刷新"
            placement="top"
            effect="dark"
          >
            <i
              class="el-icon-refresh"
              @click="searchVal = ''; init()"
            />
          </el-tooltip>
        </div>
        <el-input
          v-model="searchVal"
          class="search_style search_btn right with_search mr_10"
          placeholder="存储桶名过滤"
          clearable
        />
      </div>
      <DataTable
        style="width: 100%;"
        :table-data="filterData"
        :loading="loading"
        :columns="columns"
        :page-obj="{ pageSize: 10, currentPage: 1 }"
      >
        <el-table-column
          slot="bucketName"
          label="桶名称"
          min-width="150px"
        >
          <template slot-scope="scope">
            <a
              class="blue"
              @click="viewDetail(scope.row.bucketName)"
            >{{ scope.row.bucketName }}</a>
          </template>
        </el-table-column>
        <el-table-column
          slot="action"
          label="冷热分层开关"
          min-width="150px"
        >
          <template slot-scope="scope">
            <el-popconfirm
              popper-class="confirmSwitch"
              placement="top"
              confirm-button-text="确认"
              cancel-button-text="取消"
              icon="el-icon-info"
              icon-color="#ff8746"
              :title="'请确认要' + (scope.row.openStatus ? '关闭' : '打开') + '冷热分层开关吗？'"
              @confirm="judgeChange(scope.row)"
            >
              <el-switch
                slot="reference"
                inactive-text="关"
                active-text="开"
                :value="scope.row.openStatus"
                :width="50"
              />
            </el-popconfirm>
          </template>
        </el-table-column>
      </DataTable>
    </div>
  </div>
</template>
<script>
import {
  listBucketCache,
  saveBucketCacheConfig
} from '@/api/cacheConfig'
export default {
  data() {
    return {
      searchVal: '',
      loading: false,
      tableData: [],
      columns: [
        {
          slot: 'bucketName'
        },
        // {
        //   title: '更新时间',
        //   prop: 'updateTime',
        //   formatter: (row, col, val) => {
        //     return moment(val).format('YYYY/MM/DD HH:mm:ss')
        //   }
        // },
        {
          slot: 'action'
        }
      ]
    }
  },
  computed: {
    filterData() {
      return JSON.parse(JSON.stringify(this.tableData)).filter(x => {
        return x.bucketName.toLowerCase().indexOf(this.searchVal.toLowerCase()) > -1
      })
    }
  },
  watch: {
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.loading = true
      listBucketCache()
        .then(res => {
          this.tableData = res.data || []
        })
        .finally(() => {
          this.loading = false
        })
    },
    viewDetail: function(bucketName) {
      this.$router.push({
        name: 'BucketDataClassification',
        params: {
          id: bucketName
          // ID: JSON.parse(localStorage.getItem('user')).name
        }
      })
    },
    judgeChange(row) {
      // 更改开关
      // row.openStatus = !row.openStatus
      const { bucketName, openStatus } = row
      this.loading = true
      saveBucketCacheConfig({
        bucketName,
        openCache: !openStatus
      }).then(() => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
      })
        .finally(() => {
          this.loading = false
          this.init()
        })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
<style lang="scss">
.confirmSwitch {
  .el-popconfirm__main {
    margin-bottom: 15px;
  }

  .el-button--primary {
    border: none;
    color: #fff;
    background: transparent
      linear-gradient(135deg, #d54927, #e36132 50%, #f58240) 0 0 no-repeat
      padding-box;
  }
}
</style>
