<template>
  <div class="breadEval">
    <el-row v-if="!bucketDetail">
      <el-col
        :span="24"
        class="manage-area-title"
      >
        <h2>{{ renderTitle }}</h2>
      </el-col>
    </el-row>
    <div
      v-if="breadListLast&&breadListLast.length"
      class="breadTitle"
    >
      <el-breadcrumb separator=">">
        <el-breadcrumb-item
          v-for="(item, i) in breadListLast"
          :key="item.name + Math.random()"
        >
          <a
            v-if="accessRouterLink(item, i)"
            @click="routerLink(item)"
          >{{ doTrans(item.name) }}</a>
          <span v-else>{{ doTrans(item.name) }}</span>
          <!-- path -->
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
  </div>
</template>
<script type="text/javascript">
import { constantRouterMap } from '@/router'
export default {
  name: 'BreadCrumbs',
  data () {
    return {
      breadListLast: []
    }
  },
  computed: {
    bucketDetail () {
      return this.$route.path.indexOf('Dashboard') > -1 || this.$route.path.indexOf('bucket/BucketDetail') > -1
    },
    renderTitle () {
      const lastItem = this.breadListLast[this.breadListLast.length - 1]
      return lastItem && this.doTrans(lastItem.name)
    }
  },
  watch: {
    $route (to, from) {
      this.loadChange()
    }
  },
  // 页面挂载之后,解析路由，给出面包屑
  mounted: function () {
    this.loadChange()
  },
  methods: {
    // 解决跳转到详情页、再通过面包屑导航跳转上级导致路由失效问题
    routerLink (item) {
      if (item.name === 'Pool') {
        const params = JSON.parse(sessionStorage.getItem('breadcrumbs'))
        const domainId = params.PoolDetail.did
        const domainName = params.PoolDetail.dName
        this.$router.push({
          name: item.name,
          params: { domainId, domainName }
        })
      } else {
        this.$router.push({ name: item.name, params: item.params || {}})
      }
    },
    accessRouterLink (link, i) {
      const router = constantRouterMap[1].children
      const flag = router.filter(item => link.name && item.name === link.name)
        .length
      // 确保link生效过滤最后位链接、中间位的link需要匹配路由name
      return flag && i !== this.breadListLast.length - 1
    },
    loadChange () {
      const dashboard = [{ path: '/main/dashboard', name: 'Dashboard' }]
      const matchArr = this.$route.matched

      // matched 匹配到:动态路由参数，需要保存其参数到本地下次面包屑跳转传入params参数
      const breadcrumb = JSON.parse(localStorage.getItem('breadcrumbs')) || {}
      if (this.$route.params) {
        breadcrumb[this.$route.name] = this.$route.params
      }
      localStorage.setItem('breadcrumbs', JSON.stringify(breadcrumb))

      const pathArr =
        matchArr &&
        matchArr.length &&
        matchArr[matchArr.length - 1].path
          .split('/')
          .filter(item => item && item.indexOf(':') == -1)
      const res = []
      // 匹配params对应的key
      var menuName = Object.keys(breadcrumb)
      pathArr.forEach((item, i) => {
        var name = item === 'bucket' ? 'Bucket' : item
        if (menuName.includes(name)) {
          res.push({
            name: name,
            params: breadcrumb[name]
          })
        } else {
          res.push({ name })
        }
      })
      if (res[0].name === 'main') {
        res.shift()
      }
      if (this.$route.matched[1].name !== 'Dashboard') {
        if (res && res.length > 1 && res[1].name === 'BucketDetail') {
          res[1].name = this.$route.params.id
          this.breadListLast = dashboard.concat(res)
        } else {
          this.breadListLast = dashboard.concat(res)
        }
      } else {
        this.breadListLast = []
      }
    },

    doTrans (name) {
      return this.$ts(name)
    }
  }
}
</script>
<style type="text/css" lang="scss">
.bread {
  margin-bottom: 10px;
  height: 20px;
  line-height: 20px;
}

.breadTitle {
  padding: 10px 0 10px 20px;

  .el-breadcrumb__inner {
    span {
      color: #8997a5;
    }
  }

  .el-breadcrumb__inner a:hover,
  .el-breadcrumb__inner.is-link:hover {
    color: #ff8746;
  }
}
</style>
