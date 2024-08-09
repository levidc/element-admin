<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mv_10">

        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh right"
            @click="searchVal='';refresh()"
          />
        </el-tooltip>
        <!-- <el-input
          v-model="searchVal"
          class="search_style right"
          :placeholder="$ts('clusters.search.name')"
          width="14"
          clearable
        /> -->
      </el-row>
      <clusterTable
        ref="clusterTable"
        :search-val="searchVal"
        @handleSelect="handleSelect"
      />

    </div>

  </div>
</template>
<script>

import { createCluster } from '@/api/cluster'
import clusterTable from '@/components/page/cluster/clusterTable.vue'
export default {
  name: 'Cluster',
  components: {
    clusterTable
  },
  data () {
    return {
      createDialog: false,
      searchVal: '',
      createForm: {
        clusterName: '',
        clusterinfo: ''
      }

    }
  },

  methods: {

    handleSelect (val) {
      this.selection = val
    },
    resetForm (createForm) {
      this.$refs[createForm].resetFields()
    },
    refresh () {
      this.$refs.clusterTable.listClusters()
    }
  }
}

</script>
<style lang="scss" scoped>
::v-deep .inputWidth {
  width: 230px;
}
::v-deep .styleWidth {
  padding-left: 35px;
  padding-right: 20px;
  // margin-right: 55px;
}
::v-deep .createForm {
  .el-dialog__body {
    box-sizing: border-box;
    padding: 20px 50px 0 20px;
  }

  .bottomMenu {
    display: flex;
    justify-content: flex-end;
    margin-top: -30px;
    cursor: pointer;
    margin-right: 5px;

    i {
      border: 1px solid #ccc;
      padding: 5px;
      z-index: 99;
      font-size: 16px;
      margin-left: 10px;
    }
  }
}
</style>
