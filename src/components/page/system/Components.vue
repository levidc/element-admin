<template>
  <div>
    <div class="page_content_wrap">
      <div class="right mb_12">
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh"
            @click="refreshList"
          />
        </el-tooltip>
      </div>
      <!-- <el-button class="right mb_15" type="primary" @click="refreshList">{{ $ts("refresh") }}</el-button> -->
      <br>
      <el-tabs
        v-model="tabVal"
        class="serverTabs mt_10"
      >
        <el-tab-pane
          v-if="$store.state.api['admin:CheckTikvStatusController']"
          name="tikv"
          label="tikv"
        >
          <tikv-table
            v-if="tabVal==='tikv'"
            ref="tikv"
          />
        </el-tab-pane>
        <el-tab-pane
          v-if="$store.state.api['admin:CheckRedisStatusController']"
          name="redis"
          label="redis"
        >
          <redis-table
            v-if="tabVal==='redis'"
            ref="redis"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import tikvTable from '@/components/page/system/tikvTable'
import redisTable from '@/components/page/system/redisTable'
export default {
  name: 'Components',
  components: {
    tikvTable,
    redisTable
  },
  data () {
    return {
      tabVal: ''
    }
  },
  mounted () {
    const flag = this.$store.state.api['admin:CheckTikvStatusController']
    this.tabVal = flag ? 'tikv' : 'redis'
  },
  methods: {
    refreshList () {
      if (this.tabVal == 'tikv') {
        this.$refs['tikv'].list()
      } else {
        this.$refs['redis'].list()
      }
    }
  }
}
</script>

<style>
.serverTabs .el-tabs__content {
  border: 1px solid #e4e7ed;
  border-top: none;
  height: calc(100% - 49px);
}

.serverTabs {
  height: 100%;
}

.serverTabs .el-tabs__header {
  margin-bottom: 0;
}
</style>
