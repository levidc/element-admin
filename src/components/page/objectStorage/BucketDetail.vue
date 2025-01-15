<template>
  <div>
    <el-main class="bucketContainer">
      <div class="breadTitle">
        <div class="bucketName">
          <el-tooltip placement="top" :content="$ts('page.return')">
            <i class="el-icon-back backBox" @click="$router.push({ name: 'bucketList' }), goback()" />
          </el-tooltip>
          <span>{{ $route.params.id }}</span>
        </div>
        <el-menu class="bucketMenu" :default-active="activeIndex" mode="horizontal" @select="handleSelect">
          <el-menu-item v-access="'s3:ListBucket'" index="BucketList">{{ $ts('route.BucketList') }}</el-menu-item>
          <el-submenu
            v-if="apis['s3:GetBucketVersioning'] || apis['s3:GetBucketObjectLockConfiguration'] || apis['admin:UpdateBucketQuota']"
            index="2">
            <template slot="title">{{ $ts('policies.advancedConfig') }}</template>
            <el-menu-item v-access="'s3:GetBucketVersioning'" index="BucketHighConfig">{{ $ts('route.BucketHighConfig')
              }}</el-menu-item>
            <el-menu-item v-access="'s3:GetBucketObjectLockConfiguration'" index="BucketObjectLock">{{
              $ts('route.BucketObjectLock')
            }}</el-menu-item>
            <el-menu-item v-access="'admin:UpdateBucketQuota'" index="BucketQuota">{{ $ts('route.BucketQuota')
              }}</el-menu-item>
          </el-submenu>
          <el-menu-item v-if="apis['s3:GetLifecycleConfiguration']" index="BucketLifeCycle">{{
            $ts('route.BucketLifeCycle')
          }}</el-menu-item>
          <el-submenu v-if="apis['s3:GetBucketPolicy'] || apis['s3:GetBucketAcl']" index="3">
            <template slot="title">{{ $ts('route.permissionManagement')
              }}</template>
            <el-menu-item v-access="'s3:GetBucketPolicy'" index="BucketPermisson">{{ $ts('route.BucketPermisson')
              }}</el-menu-item>
            <el-menu-item v-access="'s3:GetBucketAcl'" index="BucketAccess">{{ $ts('route.BucketAccess')
              }}</el-menu-item>
          </el-submenu>
          <el-menu-item v-if="apis['admin:QosController']" index="BucketQoS">{{ $ts('route.BucketQoS')
            }}</el-menu-item>
          <!-- <el-menu-item
            v-if="apis['admin:BucketCache']"
            index="BucketDataClassification"
          >冷热分层开关</el-menu-item> -->
          <el-menu-item v-if="apis['isAdmin']" index="BucketLoadGroup">{{ $ts('route.BucketLoadGroup')
            }}</el-menu-item>
          <el-menu-item index="highAvailability">{{ $ts('route.highAvailability')
            }}</el-menu-item>
        </el-menu>
      </div>
      <router-view />
      <el-backtop target=".bucketContainer" :bottom="10" />
    </el-main>
  </div>
</template>

<script>
export default {
  name: 'BucketDetail',
  filters: {},
  data () {
    return {
      tabVal: 'BucketList',
      activeIndex: 'BucketList'
    }
  },
  computed: {
    apis () {
      return this.$store.state['user']['api'] || JSON.parse(localStorage.getItem('api') || null)
    }
  },
  mounted: function () {
    this.activeIndex = this.$route.name === 'ObjectDetail' ? 'BucketList' : this.$route.name
  },
  destroyed () { },
  methods: {
    goback () {
      // localStorage.removeItem('isHtGateway')
    },
    handleSelect (key, keyPath) {
      // console.log(key, 'key')
      this.$router.push({
        name: key
      })
    },
    handleClick () {
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

  .breadTitle {
    margin: 20px;
  }
}
</style>
