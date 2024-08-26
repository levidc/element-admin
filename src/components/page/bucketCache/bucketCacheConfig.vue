<template>
  <div>
    <div>
      <el-container
        v-loading="loading"
        class="page_content_wrap"
        style="min-height:300px"
      >
        <el-main v-show="!loading">
          <div class="configInfo">
            <div class="globalstyle">
              <h2 style="font-size: 17px;">全局配置</h2>
              <span
                class="editestyle"
                @click="drawerFlag=true"
              ><a>编辑</a></span>
              <el-tooltip
                content="刷新"
                placement="top"
                effect="dark"
              >
                <i
                  class="el-icon-refresh"
                  @click="init()"
                />
              </el-tooltip>
            </div>
            <div class="config_container">
              <div class="detailInfo">
                <el-tag>冷热分层开关:
                  <span>{{ form.openCache ? '开' : '关' }}</span>
                </el-tag>
                <el-tag>缓存最大对象:
                  <span>{{ form.maxObjectSize + 'MB' }}</span>
                </el-tag>
                <el-tag>缓存过期时间:
                  <span>{{ form.maxExpires + 'h' }}</span>
                </el-tag>
              </div>
              <!-- <Echarts v-if="JSON.stringify(cacheSize)!=='{}'" :datas="renderData(cacheCount)" :options="renderOption(cacheCount)" height="200px" width="30%" /> -->
            </div>
          </div>
          <div class="title">
            <h2 style="font-size: 20px;">热数据缓存</h2>
            <div class="usedChart">
              <div>
                <svg
                  class="icon usedCount"
                  aria-hidden="true"
                >
                  <use xlink:href="#icon-usedCount2" />
                </svg>
                <span>已缓存对象数量
                  {{ bigNumberTransform(cacheCount.val) }}
                </span>
              </div>
            </div>
          </div>
          <DataTable
            style="width: 100%;margin-bottom:20px;"
            :table-data="resoureData"
            :loading="false"
            :columns="columns"
            pagination
          >
            <el-table-column
              slot="resourceName"
              label="资源名"
              min-width="100px"
            >
              <template slot-scope="scope">
                <showToolTip :text="scope.row.resourceName" />
              </template>
            </el-table-column>
            <el-table-column
              slot="deviceName"
              label="设备名"
              min-width="100px"
            >
              <template slot-scope="scope">
                <showToolTip :text="scope.row.deviceName" />
              </template>
            </el-table-column>
            <el-table-column
              slot="loadGroupName"
              label="负载组名"
              min-width="100px"
            >
              <template slot-scope="scope">
                <showToolTip :text="scope.row.loadGroupName" />
              </template>
            </el-table-column>
            <el-table-column
              slot="capacityRatio"
              label="缓存最大空间"
              min-width="200px"
            >
              <template slot-scope="scope">
                <span>{{ renderCapacityRatio(scope.row) }}</span>
                <i
                  v-if="Number(scope.row.capacity)!==-1"
                  style="margin-left:15px;font-size:16px;cursor:pointer;color:#ff8746"
                  class="el-icon-edit"
                  @click="editPopover(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              slot="usedCount"
              label="已缓存对象数"
              prop="usedCount"
              width="120px"
              fixed="right"
            >
              <template slot-scope="scope">
                {{ renderUsedCount(scope.row.usedCount) }}
              </template>
            </el-table-column>
            <template slot="chart">
              <el-table-column
                label="用量情况"
                width="200px"
                align="center"
                fixed="right"
              >
                <template slot-scope="scope">
                  <div v-if="!loading && Number(scope.row.capacity)!==-1">
                    <Echarts
                      :datas="renderData(scope.row.cacheSize)"
                      :options="renderOption(scope.row.cacheSize)"
                      width="100%"
                      height="120px"
                    />
                  </div>
                  <span v-else>无上限</span>
                </template>
              </el-table-column>
            </template>
          </DataTable>
        </el-main>
      </el-container>
    </div>
    <el-drawer
      :visible.sync="drawerFlag"
      size="50%"
      destroy-on-close
      @close="init"
    >
      <div
        slot="title"
        style="color:#ccc;font-size: 20px;"
      >
        更改配置
      </div>
      <el-form
        ref="modifyForm"
        :rules="modifyRules"
        :model="modifyForm"
        style="width: 90%;margin-left: 20px;"
      >
        <el-descriptions
          :content-style="rowCenter"
          :label-style="rowCenter"
          direction="vertical"
          :column="1"
          border
        >
          <el-descriptions-item label="冷热分层开关">
            <el-form-item prop="openCache">
              <el-switch
                v-model="modifyForm.openCache"
                active-text="开"
                inactive-text="关"
                :width="50"
              >
                />
              </el-switch>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="缓存最大对象">
            <el-form-item
              prop="maxObjectSize"
              class="slider_maxObjectSize"
            >
              <el-slider
                v-model="modifyForm.maxObjectSize"
                style="width: 80%;transform: translateX(25%);"
                :marks="marksSize"
                :min="1"
                show-input
                :format-tooltip="val => val + 'MB'"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="缓存过期时间">
            <el-form-item prop="maxExpires">
              <el-slider
                v-model="modifyForm.maxExpires"
                style="width: 80%;transform: translateX(25%);"
                :marks="marksTime"
                :min="1"
                :max="168"
                show-input
                :format-tooltip="val => val + 'h'"
              />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
        <el-row style="margin-top: 50px;float:right">
          <el-button
            class="blue"
            @click="drawerFlag = false"
          >取消</el-button>
          <el-button
            class="golden"
            @click="confirmApply"
          >应用</el-button>
        </el-row>
      </el-form>
    </el-drawer>
    <el-drawer
      :visible.sync="visible"
      size="50%"
      destroy-on-close
      @close="init"
    >
      <div
        slot="title"
        style="color:#ccc;font-size: 20px;"
      >
        更改缓存空间
      </div>
      <div style="height:200px;position:relative;padding:10px;">
        <el-slider
          v-model="modifyResource.cacheMaxSizeRatio"
          style="width: 90%;transform: translateX(12%);"
          :marks="getMarks(modifyResource)"
          show-input
          :min="1"
          :format-tooltip="formatTooltip"
        />
        <div
          class="mt_20"
          style="position:absolute;right:0; bottom:20px"
        >
          <el-button
            class="blue"
            @click="visible=false"
          >取消</el-button>
          <el-button
            class="golden"
            @click="updateResource"
          >应用</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import {
  updateObjectStorageResource
} from '@/api/storage'
import {
  getGlobalCacheConfig,
  saveGlobalCacheConfig
} from '@/api/cacheConfig'
import Echarts from '@/components/Echart.vue'
export default {
  name: 'ClassificationConfig',
  components: { Echarts },
  filters: {
    renderRatio(val) {
      return val < 1 ? '0%' : Math.round(val) + '%'
    }
  },
  data() {
    return {
      modifyResource: {},
      visible: false,
      marksTime: {
        1: '1h',
        12: '12h',
        24: '1d',
        48: '2d',
        72: '3d',
        96: '4d',
        120: '5d',
        144: '6d',
        168: '7d'
      },
      marksSize: {
        1: '1MB',
        25: '25MB',
        50: '50MB',
        75: '75MB',
        100: '100MB'
      },
      marks: {},
      nasOptions: [],
      loading: false,
      cacheSize: {},
      hittingAccuary: {},
      cacheCount: {},
      rowCenter: { 'text-align': 'center', color: '#ccc' },
      drawerFlag: false,
      form: {
        controlBtn: false,
        maxObjectSize: '',
        maxExpires: '',
        capacityRatio: '',
        deviceName: '',
        resourceName: '',
        realCapacity: '',
        capacity: '',
        openCache: false
      },
      modifyForm: {
        maxObjectSize: '',
        maxExpires: '',
        capacityRatio: '',
        openCache: false
      },
      // rules: {
      //   maxObjectSize: [{
      //     pattern: '^(?:[1-9][0-9]?|100)$',
      //     message: '缓存最大对象范围1-100'
      //   }],
      //   maxExpires: [
      //     {

      //     }
      //   ],
      //   capacityRatio: []
      // },
      sizeSelect: [
        { label: 'MB', value: 'MB' },
        { label: 'GB', value: 'GB' },
        { label: 'TB', value: 'TB' }
      ],
      cacheTimeSelect: [
        { label: '小时', value: 'hour' },
        { label: '天', value: 'day' },
        { label: '周', value: 'week' }
      ],
      resoureData: [],
      columns: [
        {
          slot: 'resourceName'
        },
        {
          slot: 'deviceName'
        },
        {
          slot: 'loadGroupName'
        },
        {
          slot: 'capacityRatio'
        },
        {
          prop: 'capacity',
          title: '总容量',
          minWidth: '120px',
          formatter: (row, __, val) => {
            return Number(val) === -1 ? '无上限' : this.byteConvert(val)
          }
        },
        {
          prop: 'usedCapacity',
          title: '已用容量',
          minWidth: '120px'
        },
        {
          slot: 'usePercent'
        },
        {
          slot: 'usedCount'
        },
        {
          slot: 'chart'
        },
        {
          slot: 'action'
        }
      ],
      modifyRules: {
        maxObjectSize: {
          validator: (_, val, cb) => {
            const maxObjectSize = val * (1024 ** 2)
            const ratioCapacitySize = this.modifyForm.capacityRatio * 0.01 * (this.modifyForm.capacity)
            // console.log(maxObjectSize, 'ratioCapacitySize', ratioCapacitySize)
            if (ratioCapacitySize && ratioCapacitySize > 0) {
              if (maxObjectSize > ratioCapacitySize) {
                return cb('缓存最大对象不能超过当前缓存最大空间的容量')
              } else {
                return cb()
              }
            } else {
              return cb()
            }
          }
        }
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    renderUsedCount(count) {
      return Number(count) > 0 ? this.bigNumberTransform(count) : 0
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      console.log(columns, 'params', param)
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[index] += ' '
        } else {
          sums[index] = ' '
        }
      })

      return sums
    },
    init() {
      this.loading = true
      getGlobalCacheConfig().then(res => {
        const { nasResources, maxObjectSize, maxExpires, openCache } = res.data || {}
        // nasResources.push(...JSON.parse(JSON.stringify(nasResources)))
        this.form.maxExpires = this.handleTimeReq(maxExpires, 'res')
        this.form.maxObjectSize = parseInt(maxObjectSize / 1024 ** 2)
        this.form.openCache = openCache
        this.cacheCount.val = 0
        this.resoureData = nasResources.map(x => {
          const {
            usedCapacity = '0',
            realCapacity = '0',
            capacity
          } = x
          let percent = ''
          if (usedCapacity) {
            if (realCapacity && realCapacity >= 0) {
              percent = Number((usedCapacity / realCapacity).toFixed(2)) || '0.001'
            } else if (String(realCapacity) === '-1') {
              percent = '0.001'
            }
          } else {
            percent = '0.001'
          }
          x.percent = percent
          Object.assign(x, {
            realCapacity: String(realCapacity) !== '-1' ? this.byteConvert(realCapacity) : '无上限', // 可用容量
            usedCapacity: String(usedCapacity) !== '-1' ? this.byteConvert(usedCapacity) : '无上限', // 已用容量
            capacity: String(realCapacity) !== '-1' ? capacity : '-1',
            percent: (percent * 100).toFixed(2),
            cacheSize: {
              val: this.byteConvert(usedCapacity),
              percent
            }
          })
          this.cacheCount.val += Number(x.usedCount)
          return x
        })
        Object.assign(this.modifyForm, {
          maxObjectSize: Number(parseInt(maxObjectSize / 1024 ** 2)),
          maxExpires: Number(this.handleTimeReq(maxExpires, 'res')),
          openCache
        })
      }).finally(() => {
        this.loading = false
      })
    },
    formatTooltip(val) {
      // 添加step、处理step显示的容量与百分比
      const {
        realCapacity = '0',
        capacity
      } = this.modifyResource
      const totalCapacity = String(realCapacity) !== '-1' ? capacity : '0'
      const percentCapacity = this.byteConvert(totalCapacity * val * 0.01)
      return val + '%' + '\r' + '|' + ' ' + percentCapacity
    },
    handleSizeReq(size, type) {
      if (type === 'req') {
        // 最小单位h
        return size * 1024 * 1024
      } else if (type === 'res') {
        return parseInt(size / (1024 * 1024))
      }
    },
    handleTimeReq(time = 0, type) {
      if (type === 'req') {
        // 最小单位h
        return time * 3600 * 1000
      } else if (type === 'res') {
        return parseInt(time / (3600 * 1000))
      }
    },
    handleCascaderSearch(node, value) {
      return node.text.toLowerCase().indexOf(value.toLowerCase()) > -1
    },
    renderCapacityRatio(row) {
      const {
        capacityRatio,
        realCapacity,
        capacity
      } = row
      return capacity === '-1' ? '无上限' : capacityRatio + '%' + ' | ' + realCapacity + ''
    },
    renderData(obj) {
      if (JSON.stringify(obj) === '{}') return []
      else {
        const { percent, title } = obj
        return [{ value: percent ? percent * 100 : '', name: title }]
      }
    },
    renderOption({ val, percent }) {
      const option = {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            center: ['50%', '70%'],
            title: {
              color: '#fff',
              offsetCenter: [0, '50%'],
              fontSize: '18px'
              // show: false
            },
            itemStyle: {
              color: percent === '0.001' ? 'transparent' : '#354edb',
              // color: '#58D9F9',
              borderColor: percent === '0.001' ? 'transparent' : '#3451b9',
              shadowColor: 'rgba(42,0,200,0.2)',
              // shadowColor: 'rgba(0,138,255,0.45)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            progress: {
              show: true,
              roundCap: true,
              width: 5
            },
            pointer: {
              show: false
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 5, // 进度条的宽度
                color: percent !== '' ? [
                  // [0.3, '#fff'],
                  [1, '#ccc']
                ] : [[1, '#3451b9']]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            splitNumber: 0,
            axisLabel: {
              show: false
            },
            animation: false,
            detail: {
              valueAnimation: false,
              formatter: function(value) {
                if (value) {
                  return '{value|' + value.toFixed(0) + '%' + '}' + '\n' + '{data|' + val + '}'
                } else {
                  return val
                }
              },
              offsetCenter: [0, '10%'],
              color: '#ccc',
              fontSize: '16px',
              padding: percent === '' ? [-30, 0, 0, 0] : '',
              rich: {
                value: {
                  fontSize: 18,
                  fontWeight: 'bolder',
                  color: percent >= 0.7 ? '#c83579' : '#d3d6d8'
                },
                data: {
                  fontSize: 0,
                  // fontSize: 12,
                  color: '#ccc',
                  padding: [-10, 0, 0, 0]
                }
              }
            }
          }
        ]
      }
      return option
    },
    editPopover(row) {
      this.visible = true
      this.modifyResource = JSON.parse(JSON.stringify(
        Object.assign(this.modifyResource, {
          cacheMaxSizeRatio: Number(row.capacityRatio),
          ...row
        })
      ))
    },
    getMarks(row) {
      const {
        realCapacity = '0',
        capacity
      } = row
      const totalCapacity = String(realCapacity) !== '-1' ? capacity : '0'
      let marks = {}
      if (totalCapacity !== '0') {
        // 渲染缓存空间百分比step对应的size
        const arr = [1, 25, 50, 75, 100]
        for (let i = 0; i < arr.length; i++) {
          // Number(totalCapacity[0] * (arr[i] / 100)).toFixed(2) + totalCapacity[1]
          marks[arr[i]] = arr[i] + '%' + '\n' + this.byteConvert(totalCapacity * arr[i] * 0.01)
        }
      } else {
        marks = null
      }
      return marks
    },
    updateResource() {
      const { deviceId, resourceId, cacheMaxSizeRatio } = this.modifyResource
      updateObjectStorageResource({
        deviceId, resourceId, cacheMaxSizeRatio
      }).then(() => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
        this.visible = false
      }).finally(() => {
        this.init()
      })
    },
    confirmApply() {
      // 百分比 int、size 转换byte、时间转换ms
      this.$refs['modifyForm'].validate((valid) => {
        if (valid) {
          saveGlobalCacheConfig({
            // capacityRatio: this.modifyForm.capacityRatio,
            maxExpires: this.handleTimeReq(this.modifyForm.maxExpires, 'req'),
            maxObjectSize: this.handleSizeReq(this.modifyForm.maxObjectSize, 'req'),
            openCache: this.modifyForm.openCache
          }).then(res => {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.drawerFlag = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.editestyle {
  color: rgb(255, 135, 70);
  font-size: 16px;
}

:deep(.el-table) {
  // max-height: 500px!important;
  max-height: 600px !important;
  overflow-y: scroll;
  background-color: #36464e;
}
:deep(.el-slider__marks-text) {
  white-space: pre-wrap;
  line-height: 20px;
  text-align: center;
  width: 80px;
}

.el-container {
  box-shadow: 0 2px 12px 0 rgb(0, 0, 0, 0.2);
  margin: 20px 50px 0;
  display: flex;
  justify-content: space-between;

  .configInfo {
    box-shadow: 0 4px 15px 0 rgb(0, 0, 0, 0.4);
    margin-bottom: 50px;
    padding-bottom: 10px;
    .config_container {
      display: flex;
      justify-content: space-between;
    }
    .globalstyle {
      position: relative;
      display: flex;
      justify-content: space-between;
      .editestyle {
        position: absolute;
        left: 70px;
        margin: 5px 0 0 10px;
        font-size: 14px;
      }
    }
  }

  .detailInfo {
    // flex: 1 auto;
    width: 50%;
    display: flex;
    padding: 30px 0;
    justify-content: space-between;
    .el-tag {
      width: fit-content;
      font-size: 14px;
      color: #d3d6d8;
      background-color: transparent;
      border-color: transparent;
      margin-bottom: 5px;
      span {
        margin-left: 10px;
        color: #e39606;
      }
    }
  }
}

:deep(.el-drawer) {
  .el-drawer__body {
    padding: 0 30px;
    margin-top: 100px;
  }
}
:deep(.slider_maxObjectSize) .el-form-item__error {
  margin: 12px 0 0 150px;
}

.el-loading-spinner {
  margin-top: 50px;
}
.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  .usedChart {
    justify-content: flex-end;
    display: flex;
    div {
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .usedCount {
        font-size: 60px;
        & + span {
          width: 140px;
          white-space: pre-wrap;
          display: inline-block;
          line-height: 30px;
          font-size: 18px;
          word-break: break-all;
        }
      }
    }
  }
}
</style>
