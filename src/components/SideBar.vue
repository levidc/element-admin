<template>
  <el-menu
    id="sider_nav"
    :collapse-transition="false"
    :default-active="currentPath"
    router
    :collapse="$store.state.isCollapse"
    unique-opened
  >
    <!-- :default-openeds="['objectStorage', 'user']" -->
    <template v-for="(item, i) in navArr">
      <el-submenu v-if="(!rootMenu.includes(item)) && matchMenu(item).length" :key="item" :index="item">
        <template slot="title">
          <svg class="icon" aria-hidden="true">
            <use :xlink:href="svgPath(item)" />
          </svg>
          <span slot="title">{{ $ts(item) }}</span>
          <span />
        </template>
        <el-menu-item
          v-for="(m, n) in matchMenu(item)"
          :key="n"
          v-router="'/main/' + m.path"
          :index="'/main/' + m.path"
          :title="$ts(m.name)"
        >
          {{ $ts(m.name) }}
        </el-menu-item>
      </el-submenu>
      <el-menu-item
        v-if="item == 'Dashboard'&& api['admin:HomepageReportController']"
        :key="i"
        v-router="'/main/Dashboard'"
        v-access="'admin:HomepageReportController'"
        index="/main/Dashboard"
        title="仪表盘"
      >
        <svg
          class="icon"
          aria-hidden="true"
        >
          <use :xlink:href="svgPath(item)" />
        </svg>
        <span slot="title">仪表盘</span>
      </el-menu-item>
      <el-menu-item
        v-if="item == 'bucket'"
        :key="i"
        v-access="'s3:ListAllMyBuckets'"
        v-router="'/main/bucket'"
        index="/main/bucket"
      >
        <svg class="icon" aria-hidden="true">
          <use :xlink:href="svgPath(item)" />
        </svg><span slot="title">{{ $ts('bucket') }}</span>
      </el-menu-item>
      <el-menu-item
        v-if="item === 'fileSystem'"
        :key="i"
        v-router="'/main/fileSystem'"
        title="文件系统"
        index="/main/fileSystem"
      >
        <svg class="icon" aria-hidden="true">
          <use :xlink:href="svgPath(item)" />
        </svg>
        <span slot="title">文件系统</span>
      </el-menu-item>
      <el-menu-item
        v-if="item === 'taskManagement'"
        :key="i"
        v-router="'/main/taskManagement'"
        index="/main/taskManagement"
      >
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-task" />
        </svg>
        <span slot="title">归档管理</span>
      </el-menu-item>
      <el-menu-item
        v-if="item === 'removeManagement'"
        :key="i"
        v-router="'/main/removeManagement'"
        index="/main/removeManagement"
      >
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-huiqian" />
        </svg>
        <span slot="title">回迁管理</span>
      </el-menu-item>
      <!-- <el-menu-item v-if="item === 'operationLog'" :key="i" v-router="'/main/operationLog'" index="/main/operationLog">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-operationLog" />
        </svg>
        <span slot="title">操作日志</span>
      </el-menu-item> -->
      <el-menu-item
        v-if="item == 'cluster'"
        :key="i"
        v-access="'admin:QosController'"
        v-router="'/main/cluster'"
        index="/main/cluster"
      >
        <svg class="icon" aria-hidden="true">
          <use :xlink:href="svgPath(item)" />
        </svg>
        <span slot="title">{{ $ts('cluster') }}</span>
      </el-menu-item>
      <el-menu-item
        v-if="item === 'deleteMark'"
        :key="i"
        v-access="'admin:ListDeletedObjects'"
        index="/main/deleteMark"
      >
        <svg class="icon" aria-hidden="true">
          <use :xlink:href="svgPath(item)" />
        </svg>
        <span slot="title" style="margin-left: 3px;">{{ $ts('deleteMark') }}</span>
      </el-menu-item>
      <el-menu-item
        v-if="item == 'globalConifg'"
        :key="i"
        v-access="'admin:GetGlobalConfig'"
        v-router="'/main/globalConifg'"
        index="/main/globalConifg"
        title="全局配置"
      >
        <svg class="icon" aria-hidden="true">
          <use :xlink:href="svgPath(item)" />
        </svg>
        <span slot="title">{{ $ts('globalconifg') }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>
<script>
import { constantRouterMap } from '@/router'
import { mapState } from 'vuex'
delete window.firstJumpTo
export default {
  name: 'SideBar',
  data () {
    return {
      currentPath: '',
      preKey: '',
      navArr: [],
      navComponents: [],
      rootMenu: [
        'Dashboard',
        'bucket',
        // 'objectResource',
        'service',
        'fileSystem',
        // 'policy',
        // 'permissionGroup',
        'taskManagement',
        'removeManagement',
        'globalConifg'
      ],
      timer: null
    }
  },
  computed: {
    // showService () {
    //   return this['serviceFlag'] == true
    // },
    ...mapState(['user', 'port', 'api']),
    routeArr () {
      return constantRouterMap.find(x => x.name === 'MainPage')?.children
    }
  },
  watch: {
    $route (to, from) {
      this.renderActivePath()
      // this.closeSubmenu(to.path)
    }
  },
  created () {
    this.refreshCookie()
  },
  mounted () {
    this.navComponents = this.$children[0].$children
    const obj = {}
    var temp = this.routeArr
    this.renderActivePath()
    for (let i = 0; i < temp.length; i++) {
      var navName = temp[i].path.split('/')[0]
      if (navName !== 'storage' && !obj[navName]) {
        obj[navName] = true
        this.navArr.push(navName)
      }
    }
    // window.postMessage({ uniqueKey: 'someUniqueValue' }, '*')
    // window.addEventListener('message', (event) => {
    //   console.log(event, '1233')
    //   if (event.data.uniqueKey) {
    //     const uniqueValue = event.data.uniqueKey
    //     // 处理收到的数据
    //   }
    // })
  },
  destroyed () {
    clearInterval(this.timer)
  },
  methods: {
    refreshCookie () {
      this.timer = setInterval(() => {
        const timeStamp = sessionStorage.getItem('expireTime')
        const isExpire = +new Date() - timeStamp >= 0
        if (isExpire) {
          // 提前1min拿token
          clearInterval(this.timer)
          this.$store.dispatch('getToken').then(() => {
            this.refreshCookie()
          })
        }
      }, 10 * 1000)
    },
    renderActivePath () {
      const arr = (window.location.href?.split('/#')[1] || '').split('/')
      if (arr.length == 3 || arr.includes('bucket')) {
        this.currentPath = arr.splice(0, 3).join('/')
      } else {
        this.currentPath = arr.splice(0, 4).join('/')
      }
    },
    svgPath (item) {
      // console.log(item)
      if (item === 'userAndPerm') {
        item = 'user'
      }
      return '#icon-' + item
    },
    matchMenu (menu) {
      // console.log(menu)
      var temp = this.routeArr
      return temp
        .filter(item => {
          return (
            item.path.indexOf(menu) !== -1 &&
            item.meta &&
            item.meta.showMenu &&
            item.meta.privilege &&
            (item.meta.multiple
              ? item.meta.privilege.some(e => this.$store.state.api[e])
              : item.meta.privilege.every(e => this.$store.state.api[e])
            )
          )
        })
        .sort((a, b) => a.meta.sort - b.meta.sort)
    }
    // closeSubmenu (key) {
    //   const length = this.navComponents.length
    //   for (let i = 1; i < length; i++) {
    //     if (this.navComponents[i].index === key || key.indexOf(this.navComponents[i].index) > -1) continue
    //     this.navComponents[i].opened && this.navComponents[i].handleClick()
    //   }
    // }
  }
}
</script>
<style lang="scss">
.el-menu {
  background-color: #25373e !important;

  .el-submenu__title {
    display: flex;
    align-items: center;

    .el-submenu__icon-arrow.el-icon-arrow-down {
      color: #ff8746;
    }
  }

  .el-menu-item {
    display: flex;
    align-items: center;
  }
}

.is-opened {
  background-color: #25373f !important;
}

.el-menu--vertical .el-menu-item:hover {
  background-color: #37464e;
}

.has-collapse {

  // icon激活、svg Fill属性移除
  .el-submenu.is-active,
  .el-menu-item.is-active {
    .icon {
      font-size: 18px;
      color: #ff8746;
    }
  }

  .el-menu-item,
  .el-submenu {
    display: flex;
    overflow: hidden;
  }
}

#sider_nav {
  border-style: none;
  overflow: hidden;

  [class^="el-icon-"] {
    margin-right: 15px;
    color: #fff;
  }
}

#sider_nav .el-menu--inline>.el-menu-item {
  padding-left: 51px !important;
}

// hover 菜单
#sider_nav .el-menu-item:focus,
#sider_nav .el-menu-item:hover,
#sider_nav .el-submenu__title:hover {
  background-color: #37464e;
}

// 菜单激活文字、hover、
#sider_nav .el-menu-item.is-active {
  background-color: #25373f;
  color: #ff8746;
}

// 收缩菜单 右侧弹窗
.el-menu--popup {
  -webkit-box-shadow: 0 2px 12px 0 #18213c !important;
  box-shadow: 0 2px 12px 0 #18213c !important;
}

.icon {
  color: #fff;
  font-size: 18px;

  &+span {
    margin-left: 10px;
  }
}
</style>
