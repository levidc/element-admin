<template>
  <div ref="outer" class="scrollText">
    <div class="st-inner" :class="{'st-scrolling': needToScroll}">
      <!-- 预览添加截取的字段 -->
      <span ref="inner" class="st-section">{{ text }}</span>
      <span v-if="needToScroll" class="st-section">{{ text }}</span>
      <!-- 加两条是为了滚动的时候实现无缝衔接 -->
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      needToScroll: false,
      text: ''
    }
  },
  mounted () {
    this.startCheck()
  },
  beforeDestroy () {
    this.stopCheck()
  },
  methods: {
    showOverText (text) {
      return text.slice(0, text.length - 3) + '...'
    },
    // 检查当前元素是否需要滚动
    check () {
      this.setText()
      this.$nextTick(() => {
        const flag = this.isOverflow()
        this.needToScroll = flag
      })
    },

    // 判断子元素宽度是否大于父元素宽度，超出则需要滚动，否则不滚动
    isOverflow () {
      const outer = this.$refs.outer
      const inner = this.$refs.inner
      const outerWidth = this.getWidth(outer)
      const innerWidth = this.getWidth(inner)
      return innerWidth > outerWidth
    },

    // 获取元素宽度
    getWidth (el) {
      const { width } = el.getBoundingClientRect()
      return width
    },

    // 获取到父组件传过来的内容复传给this.text
    setText () {
      this.text =
      (this.$slots.default &&
        this.$slots.default.reduce((res, it) => res + it.text, '')) ||
      ''
    },

    // 增加定时器，隔一秒check一次
    startCheck () {
      this._checkTimer = setInterval(this.check, 1000)
      this.check()
    },

    // 关闭定时器
    stopCheck () {
      clearInterval(this._checkTimer)
    }
  }
}
</script>
<style lang="scss" scoped>
.scrollText {
  overflow: hidden;
  white-space: nowrap;
}
.st-inner {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.st-scrolling .st-section {
  margin-right: 5px;
// padding: 0 5px;
}

// 向左匀速滚动动画
.st-scrolling {
  &:hover{
    animation: scroll 10s linear infinite;
  }
}

@keyframes scroll {
0% {
  transform: translate3d(0%, 0, 0);
}
100% {
  transform: translate3d(-50%, 0, 0);
}
}
</style>
