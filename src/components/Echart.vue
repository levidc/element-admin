<template>
  <div
    ref="echart"
    :style="{ width, height }"
  />
</template>

<script>
export default {
  name: 'Echart',
  components: {},
  props: {
    options: {
      type: Object,
      required: true
    },
    datas: {
      type: Array,
      default: () => []
    },
    legendWithData: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    }
  },
  data() {
    return {
      echart: null,
      elMain: null,
      resizeTimer: 0
    }
  },
  computed: {
    option() {
      const option = { ...this.options || {}}
      option.series = Object.assign(option.series || {}, { width: this.width, height: this.height })
      return option
    }
  },
  watch: {
    option() {
      this.echart && this.echart.setOption(this.option || {})
    },
    datas() {
      this.setData()
    }
  },
  mounted() {
    this.init()
    window.addEventListener('resize', this.resizeHandler)
    this.elMain = document.getElementsByClassName('el-main')[0]
    this.elMain && this.elMain.addEventListener('transitionend', this.contentResizeHandler)
  },
  activated() {
    this.echart && this.echart.resize()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler)
    this.elMain && this.elMain.removeEventListener('transitionend', this.contentResizeHandler)
    this.elMain = null
  },
  methods: {
    init() {
      if (!this.echart && this.$refs.echart) {
        this.echart = this.$echarts.init(this.$refs.echart)
        if (this.echart) {
          this.echart.setOption(this.option || {})
          this.setData()
          this.echart.on('click', this.onClick)
          this.echart.on('legendselectchanged', this.onClick)
          this.resizeHandler()
        }
      }
    },
    setData() {
      this.echart && this.echart.setOption({ series: [{ data: JSON.parse(JSON.stringify(this.datas)) }] })
      // setTimeout(() => {
      //   this.echart?.dispatchAction({
      //     type: 'highlight',
      //     name: '已使用资源'
      //   })
      // })
    },
    onClick(e) {
      this.$emit('click', e)
    },
    resizeHandler() {
      if (this.resizeTimer > 0) clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        this.echart && this.echart.resize()
        this.resizeTimer = 0
      }, 100)
    },
    contentResizeHandler(e) {
      if (e.propertyName === 'width') {
        this.resizeHandler()
      }
    }
  }
}
</script>

<style scoped>
</style>
