<template>
  <div>
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%;margin-bottom: 20px;"
      border
      default-expand-all
      row-key="id"
      :tree-props="{children: 'gatewayStatusList', hasChildren: 'hasChildren'}"
    >
      <el-table-column
        prop="nginxAddress"
        label="nginxAddress"
        min-width="300px"
      >
        <template slot-scope="scope">
          {{ scope.row.nginxAddress }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="200px"
        prop="gatewayAddress"
        label="gatewayAddress"
      >
        <template slot-scope="scope">
          {{ scope.row.gatewayAddress }}
        </template>
      </el-table-column>
      <el-table-column
        width="200px"
        prop="status"
        label="状态"
      >
        <template slot-scope="scope">
          <span
            v-if="scope.row.status==true"
            style="color: #00a25b"
          >可用</span>
          <span
            v-if="scope.row.status==false"
            style="color: #d75a78"
          >不可用</span>
        </template>
      </el-table-column>
    </el-table>

  </div>

</template>
<script>
import { listCluster } from '@/api/cluster'
export default {
  props: {
    searchVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tableData: [],
      clusterData: [],
      loading: false,
      deleteFlag: false,
      updateDialog: false,
      detailDialog: false,
      detailClusterId: '',
      delClusterName: '',
      updateClusterName: '',
      clusterId: '',
      updateclusterId: '',
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  watch: {

  },
  mounted: function() {
    this.listClusters()
  },

  methods: {
    guid() {
      return Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36)
    },
    // 集群列表
    listClusters() {
      this.loading = true
      listCluster()
        .then(res => {
          this.tableData = res.data
          let i = 0
          this.tableData.forEach((item, index) => {
            i++
            item.id = i
            item.gatewayStatusList.forEach((cItem, cIndex) => {
              i++
              cItem.id = i
            })
          })
        }).finally(() => {
          this.loading = false
        })
    },
    // 集群详情
    onClusterDetail(val) {
      // this.detailDialog = true
      // this.detailClusterId = val
      // getClusterById({ clusterId: this.detailClusterId }).then((res) => {
      //   console.log(res)
      //   this.tableDetailData = []
      //   this.tableDetailData.push(res.data)
      // })
    },

    handleSizeChange(val) {
      this.pageSize = val
      /* this.listRole();*/
    },
    handleCurrentChange(val) {
      this.currentPage = val
      /* this.listRole();*/
    },
    handleSelectionChange(val) {
      this.$emit('handleSelect', val)
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
::v-deep .inputWidth {
  width: 200px;
}
::v-deep .styleWidth {
  margin-right: 55px;
}
</style>
