<template>
  <div
    id="tags-view-container"
    class="tags-view-container"
  >
    <!-- 路由标签显示区域（滚动）组件 -->
    <scroll-pane
      ref="scrollPane"
      class="tags-view-wrapper"
      @scroll="handleScroll"
    >
      <router-link
        v-for="tag in visitedViews"
        ref="tag"
        :key="tag.path"
        :class="isActive(tag)?'active':''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        tag="span"
        class="tags-view-item"
        :style="activeStyle(tag)"
        @click.middle.native="hanldeClick(tag)"
        @contextmenu.prevent.native="openMenu(tag,$event)"
      >
        {{ $ts(tag.name) }}
        <!-- 这个地方一定要click加个stop阻止，不然会因为事件冒泡一直触发父元素的点击事件，无法跳转另一个路由 -->
        <span
          v-if="!isAffix(tag)"
          class="el-icon-close"
          @click.prevent.stop="closeSelectedTag(tag)"
        />
      </router-link>
    </scroll-pane>
    <ul
      v-show="visible"
      :style="{left:left+'px',top:top+'px'}"
      class="contextmenu"
    >
      <li @click="refreshSelectedTag(selectedTag)"><i class="el-icon-refresh-right" /> 刷新页面</li>
      <li
        v-if="!isAffix(selectedTag)"
        @click="closeSelectedTag(selectedTag)"
      ><i class="el-icon-close" /> 关闭当前</li>
      <li @click="closeOthersTags"><i class="el-icon-circle-close" /> 关闭其他</li>
      <li
        v-if="!isFirstView()"
        @click="closeLeftTags"
      ><i class="el-icon-back" /> 关闭左侧</li>
      <li
        v-if="!isLastView()"
        @click="closeRightTags"
      ><i class="el-icon-right" /> 关闭右侧</li>
      <li @click="closeAllTags(selectedTag)"><i class="el-icon-circle-close" /> 全部关闭</li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane'
import path from 'path'

export default {
  components: { ScrollPane },
  data() {
    return {
      // 右键菜单隐藏对应布尔值
      visible: false,
      // 右键菜单对应位置
      top: 0,
      left: 0,
      // 选择的标签
      selectedTag: {},
      // 固钉标签，不可删除
      affixTags: []
    }
  },
  // 计算属性
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    routes() {
      return []
      // return this.$store.state.permission.routes
    }
  },
  // 监听
  watch: {
    // 监听路由变化
    $route() {
      this.addTags()
      this.moveToCurrentTag()
    },
    // 监听右键菜单的值是否为true，如果是就创建全局监听点击事件，触发closeMenu事件隐藏菜单，如果是false就删除监听
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  // 页面渲染后初始化
  mounted() {
    this.initTags()
    this.addTags()
  },
  methods: {
    hanldeClick(tag) {
      !this.isAffix(tag) ? this.closeSelectedTag(tag) : ''
    },
    isActive(route) {
      return route.path === this.$route.path
    },
    activeStyle(tag) {
      if (!this.isActive(tag)) return {}
      return {
        'background-color': this.theme,
        'border-color': this.theme
      }
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    isFirstView() {
      try {
        return this.selectedTag.fullPath === this.visitedViews[0].fullPath || this.selectedTag.fullPath === '/index'
      } catch (err) {
        return false
      }
    },
    isLastView() {
      try {
        return this.selectedTag.fullPath === this.visitedViews[this.visitedViews.length - 1].fullPath
      } catch (err) {
        return false
      }
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    /* 添加页签 */
    addTags() {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route)
      }
      return false
    },
    /* 移动到当前页签 */
    moveToCurrentTag() {
      const tags = this.$refs.tag
      if (!tags) {
        return
      }
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tag)
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              this.$store.dispatch('tagsView/updateVisitedView', this.$route)
            }
            break
          }
        }
      })
    },
    refreshSelectedTag(view) {
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        this.$nextTick(() => {
          this.$store.state.needReload = true
          setTimeout(() => {
            this.$store.state.needReload = false
          }, 200)
        })
      })
    },
    closeSelectedTag(view) {
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }
      })
    },
    closeRightTags() {
      this.$store.dispatch('tagsView/delRightTags', this.selectedTag).then(visitedViews => {
        if (!visitedViews.find(i => i.fullPath === this.$route.fullPath)) {
          this.toLastView(visitedViews)
        }
      })
    },
    closeLeftTags() {
      this.$store.dispatch('tagsView/delLeftTags', this.selectedTag).then(visitedViews => {
        if (!visitedViews.find(i => i.fullPath === this.$route.fullPath)) {
          this.toLastView(visitedViews)
        }
      })
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag)
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === this.$route.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView.fullPath)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu(tag, e) {
      // const menuMinWidth = 5
      // const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      // const offsetWidth = this.$el.offsetWidth // container width
      // const maxLeft = offsetWidth - menuMinWidth // left boundary
      // // const left = e.clientX - offsetLeft + 15 // 15: margin right
      // // console.log(offsetWidth, maxLeft, e.clientX, left)
      this.left = e.clientX

      // if (left > maxLeft) {
      //   this.left = maxLeft
      // } else {
      //   this.left = left
      // }

      this.top = e.clientY + 20
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    },
    handleScroll() {
      this.closeMenu()
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid transparent;
      // color: #495060;
      // background: #fff;
      color: #d3d6d8;
      background: #2c3b43;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        background-color: #36464e;
        color: #ff8746;
        border-color: #36464e;
        &::before {
          content: "";
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #19272e;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 6px 10px;
      color: #d3d6d8;
      cursor: pointer;
      &:hover {
        background: #25363e;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #ff8746;
        color: #fff;
      }
    }
  }
}
</style>

