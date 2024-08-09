<template>
  <div>
    <div
      ref="echart"
      :style="{ width, height }"
      @click="onClick"
    />
    <span class="quotaTip">默认资源</span>
  </div>
</template>
<script>
export default {
  name: 'Echart',
  components: {},
  props: {
    labelColor: {
      type: String,
      default: ''
    },
    radius: {
      type: Array,
      default: []
    },
    useRatio: {
      type: Number,
      default: 0
    },
    datas: {
      type: Array,
      default: []
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
    },
    colors: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      option: {},
      echart: null,
      elMain: null,
      resizeTimer: 0
    }
  },
  computed: {
    // option () {
    //   const option = { ...this.options }
    //   option.series = Object.assign(option.series || {}, { width: this.width, height: this.height })
    //   return option
    // },
  },
  watch: {
  },
  mounted () {
    this.$nextTick(() => {
      this.init()
      window.addEventListener('resize', this.resizeHandler)
      this.elMain = document.getElementsByClassName('el-main')[0]
      this.elMain && this.elMain.addEventListener('transitionend', this.contentResizeHandler)
    })
  },
  activated () {
    // this.echart && this.echart.resize()
  },
  beforeDestroy () {
    // window.removeEventListener('resize', this.resizeHandler)
    // this.elMain && this.elMain.removeEventListener('transitionend', this.contentResizeHandler)
    // this.elMain = null
  },
  methods: {
    renderSize () {
      let width = window.innerWidth
      if (width < 1800 && width > 1600) {
        this.option.series[0].label.normal.textStyle.fontSize = 35
      } else if (width < 1600) {
        this.option.series[0].label.normal.textStyle.fontSize = 25
      } else if (width > 1800) {
        this.option.series[0].label.normal.textStyle.fontSize = 45
      }
      if (width < 1800) {
        if (width < 1635) {
          width = 0
        } else {
          width = parseInt((width - 1200) / 120)
        }
      } else if (width > 2200) {
        width = 20
      } else if (width > 2000) {
        width = parseInt((width - 1200) / 58)
      } else if (width >= 1800) {
        width = parseInt((width - 1200) / 70)
      }
      console.log(this.echart, '1233', width)
      this.option.series[0].radius = (40 + width) + '%'
    },
    onClick (data) {
      this.$emit('click', { ...data, title: this.title })
    },
    init () {
      if (!this.echart && this.$refs.echart) {
        this.echart = this.$echarts.init(this.$refs.echart)
        if (this.echart) {
          // this.datas[0].itemStyle = {
          //   normal: {
          //     borderWidth: 10,
          //     borderColor: '#675c9d'
          //   }
          // }
          this.option = {
            title: {
              subtext: ' %',
              left: '54%',
              top: '40%',
              subtextStyle: {
                fontSize: 25,
                color: this.useRatio >= 0.9 ? '#c83579' : '#7566b5'
              }
            },
            grid: {
              top: 20
            },
            tooltip: {
              show: true,
              trigger: 'item',
              backgroundColor: 'rgba(50,50,50,0.9)',
              valueFormatter: (v) => {
                const data = this.byteConvertImpl(v)
                data[0] = Number(data[0]).toFixed(1)
                return data.join('')
              },
              textStyle: {
                color: '#d3d6d8'
              }
            },

            // legend: {
            //   bottom: 0,
            //   formatter: (row) => {
            //     return row + '(' + '默认资源' + ')'
            //   },
            //   textStyle: {
            //     color: '#d3d6d8'
            //   }
            // },
            series: [
              {
                type: 'liquidFill',
                show: this.liquidFill,
                radius: '60%',
                center: ['50%', '50%'],
                data: [this.useRatio],
                backgroundStyle: {
                  color: '#2f323a' // 水波图中心
                },
                shape: 'circle',
                // shape: 'path://M 100 120 a 140 140 0 1 0 198 0 c -26 -26 -44 -48 -44 -90 c -42 28 -128 64 -154 90"',
                label: {
                  normal: {
                    color: this.useRatio >= 0.9 ? '#c83579' : '#9f86ff',
                    insideColor: this.useRatio >= 0.9 ? '#c83579' : '#694eda',
                    textStyle: {
                      fontSize: 38
                    },
                    fontWeight: 400,
                    formatter: function (params) {
                      return parseInt((params.value * 100).toFixed(2))
                    }
                  }
                },
                tooltip: {
                  show: false
                },
                color: [new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: '#bae2f5'
                },
                {
                  offset: 0.3,
                  color: '#7acdf5'
                },
                {
                  offset: 0.75,
                  color: '#15b9e7'
                },
                {
                  offset: 1,
                  color: '#1a8fb0'
                }])],
                // color: [{
                //   type: 'linear',
                //   x: 0,
                //   y: 1,
                //   x2: 0,
                //   y2: 0,
                //   colorStops: [{
                //     offset: 1,
                //     color: ['#fff'] // 0% 处的颜色
                //   },
                //   {
                //     offset: 0.5,
                //     color: ['#ccc'] // 100% 处的颜色
                //   },
                //   {
                //     offset: 0,
                //     color: ['#d3d6d8'] // 100% 处的颜色
                //   }]
                // }],
                amplitude: 3,
                animationDuration: 1000,
                // waveAnimation: false,
                animationDurationUpdate: 1000,
                outline: {
                  show: false,
                  borderDistance: 5,
                  itemStyle: {
                    borderColor: 'rgba(67,209,100,1)',
                    borderWidth: 0
                  }
                }
              },
              {
                data: this.datas,
                type: 'pie',
                // roseType: 'area',
                percentPrecision: 1,
                // stillShowZeroSum: false,
                startAngle: 45,
                minAngle: 5,
                emphasis: {
                  scaleSize: 10
                },
                radius: this.radius,
                left: 'center',
                color: this.colors,
                avoidLabelOverlap: true,
                itemStyle: {
                  normal: {
                    borderColor: 'transparent',
                    borderWidth: 2,
                    color: (params) => {
                      // const colorList = this.colors
                      // { offset: 0, color: '#4933ab' },
                      // { offset: 1, color: '#2f323a' }
                      const colorList = ['#4933ab', '#2d60a7']
                      if (!params.dataIndex) {
                        return new this.$echarts.graphic.LinearGradient(1, 0, 0, 0, [{ // 颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                          offset: 0,
                          color: '#4933ab'
                        },
                        {
                          offset: 0.5,
                          color: '#3d3377'
                        },
                        {
                          offset: 1,
                          color: '#2f323a'
                        }])
                      } else {
                        return new this.$echarts.graphic.LinearGradient(1, 0, 0, 0, [{ // 颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                          offset: 0,
                          color: '#1567d4 '
                        },
                        {
                          offset: 0.5,
                          color: '#385384'
                        },
                        {
                          offset: 1,
                          color: '#3351cc'
                        }])
                      }
                    }
                  }
                },
                labelLine: {
                  show: true,
                  smooth: true,
                  normal: {
                    length: 5,
                    length2: 10
                    // length2: 30,
                    // minTurnAngle: 30,
                  }
                },
                label: {
                  show: true,
                  formatter: (params) => {
                    // console.log(params, '1233')
                    return params.name + '\n' + params.data.fval
                  },
                  minTurnAngle: 60,
                  color: '#d3d6d8',
                  width: 250,
                  positio: 'outSide',
                  alignTo: 'edge',
                  margin: 10
                  // toDoooo....
                  // fontSize: 16
                  // rich: {
                  //   val: {
                  //     color: this.labelColor,
                  //     fontSize: 16,
                  //     lineHeight: 16,
                  //     textBorderWidth: 0
                  //   }
                  // }
                }
              }
            ]
          }
          setTimeout(() => {
            this.echart?.dispatchAction({
              type: 'highlight',
              name: '已使用资源'
            })
          })
          // this.renderSize()
          this.echart.setOption(this.option)
          this.echart.on('click', this.onClick)
          this.echart.on('legendselectchanged', this.onClick)
        }
      }
    },
    resizeHandler () {
      if (this.resizeTimer > 0) clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        this.renderSize()
        this.echart.setOption(this.option)
        this.echart && this.echart.resize()
        this.resizeTimer = 0
      }, 100)
    },
    contentResizeHandler (e) {
      if (e.propertyName === 'width') {
        this.resizeHandler()
      }
    }
  }
}
</script>

<style scoped>
</style>
