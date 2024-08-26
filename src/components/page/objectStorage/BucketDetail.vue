<template>
  <div>
    <el-main class="bucketContainer">
      <div class="breadTitle">
        <div class="bucketName">
          <el-tooltip
            placement="top"
            content="返回桶列表"
          >
            <i
              class="el-icon-back backBox"
              @click="$router.push({name:'bucketList'}),goback()"
            />
          </el-tooltip>
          <span>{{ $route.params.id }}</span>
        </div>
        <el-menu
          class="bucketMenu"
          :default-active="activeIndex"
          mode="horizontal"
          @select="handleSelect"
        >
          <el-menu-item
            v-access="'s3:ListBucket'"
            index="BucketList"
          >对象列表</el-menu-item>
          <el-submenu
            v-if="apis['s3:GetBucketVersioning'] || apis['s3:GetBucketObjectLockConfiguration'] || apis['admin:UpdateBucketQuota']"
            index="2"
          >
            <template slot="title">高级配置</template>
            <el-menu-item
              v-access="'s3:GetBucketVersioning'"
              index="BucketHighConfig"
            >版本控制</el-menu-item>
            <el-menu-item
              v-access="'s3:GetBucketObjectLockConfiguration'"
              index="BucketObjectLock"
            >对象锁定</el-menu-item>
            <el-menu-item
              v-access="'admin:UpdateBucketQuota'"
              index="BucketQuota"
            >配额管理</el-menu-item>
          </el-submenu>
          <el-menu-item
            v-if="apis['s3:GetLifecycleConfiguration']"
            index="BucketLifeCycle"
          >生命周期规则</el-menu-item>
          <el-submenu
            v-if="apis['s3:GetBucketPolicy'] || apis['s3:GetBucketAcl']"
            index="3"
          >
            <template slot="title">权限管理</template>
            <el-menu-item
              v-access="'s3:GetBucketPolicy'"
              index="BucketPermisson"
            >存储桶策略</el-menu-item>
            <el-menu-item
              v-access="'s3:GetBucketAcl'"
              index="BucketAccess"
            >访问控制列表</el-menu-item>
          </el-submenu>
          <el-menu-item
            v-if="apis['admin:QosController']"
            index="BucketQoS"
          >QoS配置</el-menu-item>
          <!-- <el-menu-item
            v-if="apis['admin:BucketCache']"
            index="BucketDataClassification"
          >冷热分层开关</el-menu-item> -->
          <el-menu-item
            v-if="apis['isAdmin']"
            index="BucketLoadGroup"
          >负载路由</el-menu-item>
          <el-menu-item index="highAvailability">高可用管理</el-menu-item>
        </el-menu>
      </div>
      <router-view />
      <el-backtop
        target=".bucketContainer"
        :bottom="10"
      />
    </el-main>
  </div>
</template>

<script>
export default {
  name: 'BucketDetail',
  filters: {},
  data() {
    return {
      tabVal: 'BucketList',
      activeIndex: 'BucketList'
    }
  },
  computed: {
    apis() {
      return this.$store.state['user']['api'] || JSON.parse(localStorage.getItem('api') || null)
    }
  },
  mounted: function() {
    this.activeIndex = this.$route.name === 'ObjectDetail' ? 'BucketList' : this.$route.name
  },
  destroyed() { },
  methods: {
    goback() {
      // localStorage.removeItem('isHtGateway')
    },
    handleSelect(key, keyPath) {
      // console.log(key, 'key')
      this.$router.push({
        name: key
      })
    },
    handleClick() {
      this.$router.push({
        name: this.tabVal
      })
    }
  }
}
</script>
<style scoped lang="scss">
.bucketName {
  .el-icon-back {
    color: #ff8746;
    font-size: 26px;
    margin-right: 12px;
  }
  span {
    font-size: 22px;
    color: #ff8746;
    font-weight: 600;
  }
}

::v-deep .el-menu.bucketMenu {
  border-right: none !important;

  .el-menu-item,
  .el-submenu__title {
    margin-right: 30px;
    padding: 0;
  }
}

li.el-menu-item.is-active {
  color: #ff8746 !important;
}

.bucketContainer {
  height: 100%;
}
</style>
