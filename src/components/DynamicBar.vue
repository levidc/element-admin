<template>
  <Echart
    class="dash-chart"
    :options="option"
    :datas="datas"
    @click="onClick"
  />
</template>

<script>
import Echart from '@/components/Echart.vue'
export default {
  name: 'DynamicBar',
  components: { Echart },
  props: {
    title: {
      type: String,
      default: ''
    },
    datas: {
      type: Array,
      default: () => []
    },
    totalLabel: {
      type: String,
      default: ''
    },
    total: {
      type: [Number, String],
      default: 0
    },
    labelUnit: {
      type: String,
      default: ''
    },
    legendWithData: {
      type: Boolean,
      default: true
    },
    colors: {
      type: Array,
      default: () => []
    },
    fontSize: {
      type: Number,
      default: 18
    },
    formatUnit: {
      type: Function,
      default: (num, unit) => `${num}${unit}`
    },
    labelFormatter: {
      type: [String, Function],
      default: null
    },
    labelColor: {
      type: String,
      default: '#fff'
    },
    barColor: {
      type: String,
      default: '#188df0'
    },
    barWidth: {
      type: String,
      default: ''
    },
    barCount: {
      type: Number,
      default: 0
    },
    dataMax: {
      type: Number,
      default: 0
    },
    extraOption: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    option () {
      return Object.assign(
        {
          title: {
            show: false,
            text: this.title,
            top: '25px',
            // padding: [2, 65],
            textStyle: {
              color: '#d3d6d8',
              fontSize: 16,
              fontWeight: 'normal'
            }
          },
          grid: {
            left: 250,
            right: 70,
            top: 20
            // containLabel: true,
          },
          xAxis: {
            show: false,
            max: this.dataMax || 'dataMax'
          },
          yAxis: {
            type: 'category',
            triggerEvent: 'click',
            inverse: true,
            offset: 0,
            data: this.datas.map(it => it.bucketName),
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              fontSize: 12,
              margin: 15,
              // showMaxLabel: true,
              color: this.labelColor,
              height: 20,
              width: 40,
              // overflow: 'truncate', //换行
              formatter: (name) => this.sliceStr(name)
            },
            animationDuration: 300,
            animationDurationUpdate: 300,
            max: this.barCount || (this.datas || []).length // only the largest 3 bars will be displayed
          },
          tooltip: {
            trigger: 'item',
            position: ['50%', '20%'],
            borderColor: 'rgba(50,50,50,0.9)',
            backgroundColor: 'rgba(50,50,50,0.9)',
            extraCssText: 'width:300px;whiteSpace:wrap;',
            textStyle: {
              color: '#d3d6d8'
            },
            formatter: (type, item) => {
              let value
              if (type.seriesName === 'percent') {
                // percent = type.data.value + '%'
                value = Number(type.value) > 0 ? type.value + '%' : '-'
                return ` <p class="tipName">桶名称: ${type.name}</p>
              <div class="tipCustom">
                <div>桶用量百分比: &nbsp;  <span>${value}</span></div>
              </div
              `
              } else {
                // percent = (type.data.percent * 100).toFixed(1) + '%'
                value = this.byteConvert(type.value)
                return ` <p class="tipName">桶名称: ${type.name}</p>
              <div class="tipCustom">
                <div>桶已用容量: &nbsp;  <span>${value}</span></div>
              </div
              `
              }
              // <div>桶用量百分比: &nbsp; <span>${percent}</span></div>
            }
            // triggerOn:
            // show: false,
            // trigger: 'axis',
            // axisPointer: {
            //   type: 'none'
            // }
          },
          series: [
            {
              name: this.title,
              realtimeSort: true,
              type: 'bar',
              radius: '20%',
              data: this.datas.map(x => x.value),
              barWidth: this.barWidth,
              label: {
                show: true,
                color: this.labelColor,
                position: 'right',
                barWidth: 0,
                offset: [5, 1],
                // formatter: this.labelFormatter || `{c}${this.labelUnit ? ' ' + this.labelUnit : ''}`,
                valueAnimation: true,
                rich: {
                  noQuota: {
                    color: '#d3d6d8'
                  }
                },
                formatter: (item, row) => {
                  if (item.seriesName === 'size') {
                    return this.byteConvert(item.value)
                  } else if (Number(item.value) >= 0) {
                    return item.value + '%'
                  } else {
                    return '{noQuota|无容量上限}'
                    // return "<span style=color:'ff8746'>无容量上限</span>"
                  }
                  // return this.labelUnit ? item.data.value + this.labelUnit : item.data.unit
                }
              },
              itemStyle: {
                // color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                //   { offset: 0, color: (this.colors[0] || this.barColor) + '90' },
                //   { offset: 1, color: (this.colors[0] || this.barColor) }
                // ])
                normal: {
                  borderRadius: 100,
                  color: item => {
                    if (item.seriesName === 'percent') {
                      let { value } = item
                      value = Number(value)
                      if (value >= 90) {
                        return new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                          // { offset: 0, color: '#343252' },
                          // { offset: 0.5, color: '#4933ac' },
                          // { offset: 1, color: '#5933ee' }
                          { offset: 0, color: '#af4b4b' },
                          { offset: 0.5, color: '#c83535' },
                          { offset: 1, color: '#c83573' }
                        ])
                      } else if (value >= 70) {
                        return new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                          { offset: 0, color: '#655a9a' },
                          { offset: 0.5, color: '#9e86fd' },
                          { offset: 1, color: '#8064f5' }
                        ])
                      } else {
                        return new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                          { offset: 0, color: '#0276da' },
                          { offset: 0.5, color: '#3053cd' },
                          { offset: 1, color: '#4441c3' }
                        ])
                      }
                    } else {
                      return new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#0276da' },
                        { offset: 0.5, color: '#3053cd' },
                        { offset: 1, color: '#4441c3' }
                      ])
                      // return new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      //   { offset: 0, color: '#4a476b' },
                      //   { offset: 0.5, color: '#937dea' },
                      //   { offset: 1, color: '#5433db' }
                      // ])
                    }
                  }
                }
              },
              // 悬浮交互样式
              emphasis: {
                show: true
                // itemStyle: {
                //   color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                //     { offset: 0, color: (this.colors[0] || this.barColor) + '60' },
                //     { offset: 1, color: (this.colors[0] || this.barColor) + '90' }
                //   ])
                // }
              }
            }
          ],
          animationDuration: 0,
          animationDurationUpdate: 700,
          animationEasing: 'linear',
          animationEasingUpdate: 'linear'
        }, this.extraOption)
    }
  },
  watch: {},
  mounted () {
  },
  methods: {
    onClick (data) {
      this.$emit('click', data)
    },
    // getTxtNum () {
    //   const width = window.innerWidth
    //   // const DynamicTxtNum = width > 1200 ? parseInt((window.innerWidth - 600)) / 120 + 6 : 4
    //   // return DynamicTxtNum
    //   return 33
    // },
    sliceStr (params) {
      var newParamsName = ''// 最终拼接成的字符串
      var paramsNameNumber = params.length// 实际标签的个数
      // var DynamicTxtNum = this.getTxtNum()// 每行能显示的字的个数
      // var rowNumber = Math.ceil(paramsNameNumber / DynamicTxtNum)// 换行的话，需要显示几行，向上取整
      // if (rowNumber > 2) {
      //   rowNumber = 2
      //   console.log(params, '123')
      //   params = params.substring(0, DynamicTxtNum) + '...'
      // }
      if (paramsNameNumber > 33) {
        return params.substring(0, 30) + '...'
        // return params.substring(0, 33) + '...'
      } else {
        return params
      }
      /**
       * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
       */
      // 条件等同于rowNumber>1
      if (paramsNameNumber > DynamicTxtNum) {
        /** 循环每一行,p表示行 */
        for (var p = 0; p < rowNumber; p++) {
          var tempStr = ''// 表示每一次截取的字符串
          var start = p * DynamicTxtNum// 开始截取的位置
          var end = start + DynamicTxtNum// 结束截取的位置
          // 此处特殊处理最后一行的索引值
          if (p == rowNumber - 1) {
            // 最后一次不换行
            tempStr = params.substring(start, paramsNameNumber)
          } else {
            // 每一次拼接字符串并换行
            tempStr = params.substring(start, end) + '\n'
          }
          newParamsName += tempStr// 最终拼成的字符串
        }
      } else {
        // 将旧标签的值赋给新标签
        newParamsName = params
      }
      // 将最终的字符串返回
      return newParamsName
    }
  }
}
</script>

<style lang="scss">
.tipName {
  width: 300px;
  word-break: break-all;
  white-space: pre-wrap;
}

.tipCustom {
  & > div {
    width: 180px;
    display: flex;

    span {
      color: #ff8746;
    }
  }
}
</style>
