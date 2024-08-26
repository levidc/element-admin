<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 clearfix">
        <div class="right">
          <el-tooltip
            content="刷新"
            placement="top"
            effect="dark"
          >
            <i
              class="el-icon-refresh"
              @click="searchVal='';init()"
            />
          </el-tooltip>
        </div>
        <el-input
          v-model="searchVal"
          class="search_style search_btn right with_search mr_10"
          placeholder="存储桶名过滤"
          clearable
          @input="filterSearch"
        />
      </div>
      <DataTable
        :columns="columns"
        :table-data="tableData"
        :loading="loading"
        pagination
        :page-obj="{pageSize:10,currentPage:1}"
        :total="total"
        @renderPagination="getPageSearch"
      >
        <template slot="action">
          <el-table-column
            min-width="100px"
            label="操作"
          >
            <template slot-scope="scope">
              <el-button
                class="blue"
                type="text"
                @click="viewLifeCycleRule(scope.row)"
              >查看</el-button>
            </template>
          </el-table-column>
        </template>
      </DataTable>
    </div>
  </div>
</template>
<script>
import { getBucketRule } from '@/api/lifecycle'
import { debounce } from '@/utils/pass'
import moment from 'moment'
export default {
  name: 'LifecycleBucket',
  data() {
    return {
      total: 0,
      loading: false,
      searchVal: '',
      tableData: [],
      columns: [
        {
          title: '桶名称',
          prop: 'name',
          minWidth: '150px'
        },
        {
          title: '创建时间',
          prop: 'creationDate',
          minWidth: '150px',
          formatter: (__, _, val) => {
            return moment(val).format('YYYY-MM-DD HH:mm:ss')
          }
        },
        {
          slot: 'action'
        }
      ],
      pageNumber: 1,
      pageSize: 10
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    viewLifeCycleRule(row) {
      this.$router.push({
        path: `/main/bucket/BucketDetail/${row.name}/BucketLifeCycle`
      })
    },
    getPageSearch(val) {
      this.pageSize = val.pageNumber
      this.getList({
        pageNumber: val.pageNumber,
        pageSize: val.pageSize,
        bucketName: this.searchVal || ''
      })
    },
    // 添加防抖处理
    init() {
      this.getList({
        pageNumber: 1,
        pageSize: 10
      })
    },
    getList(query) {
      this.loading = true
      getBucketRule(query).then((res) => {
        this.tableData = res.data.list
        this.total = res.data.totalCount
      }).finally(() => {
        this.loading = false
      })
    },
    filterSearch: debounce.call(this, function() {
      this.getList({
        pageNumber: 1,
        pageSize: this.pageSize,
        bucketName: this.searchVal
      })
    }, 500)
  }
}
</script>

