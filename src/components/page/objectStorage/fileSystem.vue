<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 clearfix">
        <!-- <el-button v-access="'admin:CreateBucket'" class="golden" type="primary" @click="">{{ $ts("CREATE") }}</el-button> -->
        <div class="right">
          <el-tooltip content="刷新" placement="top" effect="dark">
            <i class="el-icon-refresh" @click="searchVal = '';init()" />
          </el-tooltip>
        </div>
        <el-input
          v-model="searchVal"
          class="search_style search_btn right with_search mr_10"
          placeholder="存储桶名过滤"
          clearable
        />
      </div>
      <el-table v-loading="loading" :data="tableData.slice((pageIndex-1)*pageSize,pageIndex*pageSize)" style="width: 100%">
        <!-- <el-table-column prop="fsName" label="文件系统名称" min-width="200px" /> -->
        <el-table-column prop="bucketName" label="桶名称" min-width="200px">
          <template slot-scope="scope">
            <a class="blue" @click="filterBucket(scope.row)">
              {{ scope.row.bucketName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="bucketName" label="读写权限" min-width="200px">
          <template slot-scope="scope">
            {{ renderAuth(scope.row.ro ) }}
          </template>
        </el-table-column>
      </el-table>
      <div class="page_block">
        <el-pagination
          :current-page="pageIndex"
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
</template>
<script>
import {
  getFsList
} from '@/api/bucket'
export default {
  name: 'FileSystem',
  components: {
  },
  filters: {
    nameFilter: function(arr) {
      if (!arr && arr.length) return ''
      const names = arr.map(item => item.name).join(',')
      return names
    }
  },
  data() {
    return {
      setQueryIndex: 0,
      setQuerySize: 1000,
      total: 0,
      pageIndex: 1,
      pageSize: 10,
      searchVal: '',
      loading: false,
      tableData: [],
      copyData: [],
      columns: [
        {
          title: '文件系统名称',
          prop: 'fsName',
          minWidth: '200px'
        },
        {
          title: '桶名称',
          prop: 'bucketName',
          minWidth: '200px'
        },
        // {
        //   title: '是否本地挂载',
        //   prop: 'local'
        // },
        {
          slot: 'action'
        }
      ]
    }
  },
  computed: {

  },
  watch: {
    searchVal(cur, pre) {
      if (!cur && pre) {
        this.loading = true
        setTimeout(() => {
          this.tableData = JSON.parse(JSON.stringify(this.copyData))
          this.total = this.tableData.length
          this.pageIndex = 1
          this.loading = false
        }, 500)
      } else {
        this.tableData = this.tableData.filter(x => x.bucketName.toLowerCase().indexOf(this.searchVal.toLowerCase()) > -1)
        this.total = this.tableData.length
      }
    }
  },
  mounted() {
    this.init()
    // this.loading = true
    // // const totalIterations = 100000000
    // // const iterationsPerChunk = 1000000
    // const totalIterations = 10000
    // const iterationsPerChunk = 1000

    // const totalChunks = totalIterations / iterationsPerChunk

    // for (let i = 0; i < totalChunks; i++) {
    //   for (let j = 0; j < iterationsPerChunk; j++) {
    //     this.tableData.push({
    //       label: 'label' + i + j,
    //       value: 'value' + i + j
    //     })
    //   }
    //   if (i == totalChunks - 1) {
    //     console.log(i, totalChunks - 1)
    //     this.loading = false
    //   }
    // }
  },

  destroyed() { },

  methods: {
    renderAuth(auth) {
      switch (auth) {
        case true:
          return '只读'
        case false:
          return '读写'
        default:
          return '只读'
      }
    },
    filterBucket(row) {
      this.$router.push({
        name: 'Bucket',
        params: { bucketName: row.bucketName }
      })
    },
    init() {
      // 初始化
      this.setQueryIndex = 0
      this.setQuerySize = 1000
      this.pageIndex = 1
      this.tableData = []
      this.getList({
        pageIndex: this.setQueryIndex,
        pageSize: this.setQuerySize
      })
    },
    getList(query) {
      this.loading = true
      getFsList(query).then((res) => {
        if (res.data.records && !res.data.records.length) {
          this.setQueryIndex = this.setQueryIndex ? this.setQueryIndex - 1 : 0
        }
        this.tableData = this.tableData.concat(res.data.records)
        this.copyData = JSON.parse(JSON.stringify(this.tableData))
        this.total = this.tableData.length
      })
        .finally(() => {
          this.loading = false
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.pageIndex = 1
    },
    handleCurrentChange(val) {
      // 最后一页请求分页
      this.pageIndex = val
      if (Math.ceil(this.total / this.pageSize) === val) {
        this.setQueryIndex = this.setQueryIndex + 1
        this.getList({
          pageIndex: this.setQueryIndex,
          pageSize: this.setQuerySize
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
