<template>
  <div class="dashboard">
    <el-row>
      <el-col
        :span="24"
        class="manage-area-title"
      >
        <h2>Dashboard</h2>
      </el-col>
    </el-row>
    <div
      v-loading="loading"
      class="content"
    >
      <div
        v-show="!loading"
        class="flexMenu"
      >
        <el-card
          v-for="item in totalInfo"
          :key="item.label"
          :body-style="{
            backgroundColor: '', cursor: [item.name ? 'pointer' : null]
          }"
          @click.native="jumpPage(item)"
        >
          <el-tooltip
            popper-class="db_Top_Tip"
            :content="String(item.tooltip).replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            placement="top"
          >
            <div class="targetItems">
              <p>{{ item.label }}</p>
              <div>
                <svg
                  class="icon"
                  aria-hidden="true"
                >
                  <use :xlink:href="svgPath(item.icon)" />
                </svg>
                <p>{{ item.value }}</p>
              </div>
            </div>
          </el-tooltip>
        </el-card>
      </div>

      <!-- 负载组 -->
      <div
        v-show="!loading&&isAdmin"
        class="chartContainer barChart"
      >
        <div
          v-if="loadGroupChart.length"
          style="width:100%"
        >
          <el-col
            v-for="{loadGroupName,loadGroupUseSize,loadGroupUnusedSize,defaultGroup,storageType,resourceList} in loadGroupChart"
            :key="loadGroupName"
            :span="12"
            :class="renderTripleLoadGroup()"
          >
            <div class="chartTitle loadGroupType">
              <div class="loadGroupName">
                <span>负载组:</span>
                <showToolTip
                  :text="loadGroupName"
                  width="85%"
                />
              </div>
              <div class="loadGroupTag">
                <el-tag v-if="defaultGroup">
                  {{ defaultGroup?'默认':'' }}
                </el-tag>
                <el-tag>
                  {{ storageType | renderType }}
                </el-tag>
              </div>
            </div>
            <div class="loadGroupContent">
              <!-- loadGroupUnusedSize 配额无上限 -->
              <Echarts
                v-if="loadGroupUnusedSize!==''"
                :options="renderPieOption(loadGroupUseSize,loadGroupUnusedSize)"
                height="250px"
                @click="e=>jumpToLoadGroup(loadGroupName,e)"
              />
              <Echarts
                v-else
                height="250px"
                :options="renderPie(loadGroupUseSize)"
                @click="e=>jumpToLoadGroup(loadGroupName,e)"
              />
            </div>
            <template v-if="resourceList.length">
              <p class="chartTitle">
                <a
                  v-if="resourceList.length>5"
                  class="more"
                  @click="jumpToLoadGroup(loadGroupName)"
                >更多</a>
              </p>
              <Echarts
                height="200px"
                :options="renderBarChart(resourceList,renderLoadType(storageType))"
                @click="e=>loadChartClick(e,loadGroupName)"
              />
            </template>
            <div
              v-else
              class="emptyContainer"
            >
              <span style="color:#d3d6d8;font-size:16px">暂无资源</span>
            </div>
          </el-col>

          <!-- <el-col :span="12">
            <p class="chartTitle">负载组:
              <span>loadGruop2</span>
            </p>
            <div class="loadGroupContent">
              <Echarts v-if="rank.bucketUsedSizeTop.length" height="250px" :options="renderPie()" />
              <div v-else class="emptyContainer">
                <span>暂无数据</span>
              </div>
            </div>
            <p style="margin-top:50px;" class="chartTitle">NAS资源
              <a v-if="nasList.length>10" class="more" @click="openDrawer('usePercent')">更多</a>
            </p>
            <Echarts v-if="nasList.length" width="90%" height="250px" :options="renderBarChart(nasList)" />
          </el-col> -->
        </div>
        <div
          v-else
          style="width:100%"
        >
          <p class="chartTitle">负载组</p>
          <div class="emptyContainer">
            <span>暂无数据</span>
          </div>
        </div>
      </div>

      <div
        v-show="!loading"
        class="chartContainer"
        style="margin-top:30px"
      >
        <el-row :gutter="30">
          <el-col :span="12">
            <p class="chartTitle">{{ $ts('Dashboard.bucketTrend') }}</p>
            <Echarts
              v-if="trend.bucketCountDate.length"
              height="300px"
              :options="getOption({ title: $ts('Dashboard.Bucket'), legend: $ts('Dashboard.Bucket'), unit: $ts('Dashboard.Count') }, trend.bucketCountDate, [trend.bucketCountVal])"
            />
            <div
              v-else
              class="emptyContainer"
            >
              <span>{{ $ts('common.noData') }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <p class="chartTitle">{{ $ts('Dashboard.usedSizeTrend') }}</p>
            <Echarts
              v-if="trend.bucketUsedSizeDate.length"
              height="300px"
              :options="getOption({ title: $ts('Dashboard.usedSize'), legend: $ts('Dashboard.usedSize'), unit: 'GB' }, trend.bucketUsedSizeDate, [trend.bucketUsedSizeVal])"
            />
            <div
              v-else
              class="emptyContainer"
            >
              <span>{{ $ts('common.noData') }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <div
        v-show="!loading"
        class="page_content_wrap"
      >
        <el-row
          type="flex"
          class="widget-row"
          :gutter="20"
        >
          <el-col
            :span="12"
            class="widget-item"
          >
            <div class="topTitle">
              <span>{{ $ts('Dashboard.bucketCapacity') }}  TOP10 </span>
              <a class="more" @click="openDrawer('useSize')">{{ $ts('Dashboard.more') }}</a>
            </div>
            <DynamicBar
              v-if="rank.bucketUsedSizeTop.length"
              style="width:90%"
              title="size"
              label-unit="G"
              :datas="rank.bucketUsedSizeTop"
              :colors="['#188d']"
              class="widget-chart"
              bar-width="25%"
              :bar-count="10"
              @click="jumpBucket"
            />
            <div
              v-else
              class="emptyContainer"
            >
              <span>{{ $ts('common.noData') }}</span>
            </div>
          </el-col>
          <el-col
            :span="12"
            class="widget-item"
          >
            <!-- <el-tooltip placement="top" width="200">
              <div slot="content">
                <p>设置配额的桶按百分比显示</p>
                <p>无配额的桶排列在有配额桶下方</p>
              </div>
              <i class="fa fa-question-circle more" />
            </el-tooltip> -->
            <div class="topTitle">
              <span>桶已用容量百分比 TOP10</span>
              <a
                class="more"
                @click="openDrawer('usePercent')"
              >更多</a>
            </div>
            <DynamicBar
              v-if="rank.bucketUsedPercentTop.length"
              style="width:90%"
              title="percent"
              :data-max="100"
              label-unit="%"
              :datas="rank.bucketUsedPercentTop"
              class="widget-chart"
              bar-width="25%"
              :bar-count="10"
              @click="jumpBucket"
            />
            <div
              v-else
              class="emptyContainer"
            >
              <span>{{ $ts('common.noData') }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-drawer
      :visible.sync="drawerFlag"
      size="50%"
      destroy-on-close
    >
      <div slot="title">
        <span style="color:#d3d6d8;font-size: 16px;">
          {{ drawerTitle }}
        </span>
      </div>
      <div v-if="drawerType === 'useSize'">
        <DataTable
          inner-ref="type1"
          :table-data="drawerUsed.list"
          :columns="drawerColumn"
          :loading="drawerUsed.loading"
          :page-obj="{ currentPage: 1, pageSize: 10 }"
          :total="drawerUsed.total"
          :pagination="true"
          :row-style="{
            cursor: 'pointer'
          }
          "
          @renderPagination="renderPagination"
          @rowClick="rowClick"
        />
      </div>
      <div v-else-if="drawerType === 'usePercent'">
        <DataTable
          inner-ref="type2"
          :table-data="drawerPercent.list"
          :columns="drawerColumn"
          :loading="drawerPercent.loading"
          :page-obj="{ currentPage: 1, pageSize: 10 }"
          :total="drawerPercent.total"
          :pagination="true"
          :row-style="{
            cursor: 'pointer'
          }
          "
          @renderPagination="renderPagination"
          @rowClick="rowClick"
        >
          <el-table-column
            slot="value"
            label="桶用量百分比"
          >
            <template slot-scope="scope">
              <span v-if="Number(scope.row.value) === -1">无容量上限</span>
              <span
                v-else-if="Number(scope.row.value) >= 90"
                style="color: #fe3b3b;"
              >{{ scope.row.value + '%' }}</span>
              <span
                v-else-if="Number(scope.row.value) >= 70"
                style="color: #d8b020;"
              >{{ scope.row.value + '%' }}</span>
              <span v-else>{{ Number(scope.row.value).toFixed(1) + '%' }}</span>
            </template>
          </el-table-column>
        </DataTable>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  getGroupList,
  listStorageDevice
} from '@/api/storage'
import {
  getTrend,
  getTotal,
  getRank,
  getRankPage
} from '@/api/dashboard'
import Echarts from '@/components/Echart.vue'
import DynamicBar from './DynamicBar.vue'
export default {
  name: 'Dashboard',
  components: { DynamicBar, Echarts },
  filters: {
    renderType (val) {
      return val === 'IAM' ? 'AWS' : val
    }
  },
  data () {
    return {
      allResourceList: [],
      loadGroupChart: [],
      timer: null,
      drawerUsed: {
        list: [],
        total: 0,
        loading: false
      },
      drawerPercent: {
        list: [],
        total: 0,
        loading: false
      },
      drawerNoQuota: {
        list: [],
        total: 0,
        loading: false
      },

      drawerType: 'useSize',
      loading: true,
      totalInfo: [
        { label: '用户', tooltip: '', value: '', icon: 'user', name: 'Users' },
        { label: '桶', tooltip: '', value: '', icon: 'bucket', name: 'Bucket' },
        { label: '对象数', tooltip: '', value: '', icon: 'object' },
        { label: '对象容量', tooltip: '', value: '', icon: 'usedCount2' }
      ], // 顶部汇总信息
      trend: {
        bucketCountDate: [],
        bucketCountVal: [],
        bucketUsedSizeDate: [],
        bucketUsedSizeVal: []
      },
      rank: {
        bucketUsedSizeTop: [],
        bucketUsedPercentTop: [],
        bucketUsedPercnetNoQuotaTop: []
      },

      bucketUserSize: [],
      useRatioArr: [],
      useRatio: 0,
      drawerTabelData: [],
      drawerTitle: '',
      drawerFlag: false,
      memoryData2: [],
      buckeInfo: {},
      CpuData: [],
      memoryData: [],
      spaceData: {
        theUsedUnitSpace: 0,
        theunUsedUnitSpace: 0,
        freeSpace: 0,
        totalCapacity: 0
      },
      colors: {
        fuchsia: '#FF2073',
        orange: '#F49300',
        skyBlue: '#49dff0',
        blue: '#6ca5e1',
        yellow: '#FFC72B',
        purple: '#6A3C9B',
        red: '#FF7070',
        green: '#91CC75'
      },
      processData: {
        tieleFontSize: 22, // 标题文字大小
        labelfontSize: 22, // lable标签文字大小
        name: '默认资源用量',
        value: 55,
        valueColor: '#ffffff',
        max: 100,
        colorArr: [
          [
            { offset: 0, color: '#C0CDFF' },
            { offset: 1, color: '#156BFF' }

          ],
          [
            { offset: 0, color: 'rgba(243,237,153,0)' },
            { offset: 1, color: 'rgba(243,237,153,1)' }
          ],
          [
            { offset: 0, color: 'rgba(140,181,255,0)' },
            { offset: 1, color: 'rgba(140,181,255,1)' }
          ],
          [
            { offset: 0, color: 'rgba(140,181,255,0)' },
            { offset: 1, color: 'rgba(140,181,255,1)' }
          ]
        ]
      }
    }
  },
  computed: {
    drawerColumn () {
      return this.drawerTitle === '桶已用容量'
        ? [
          {
            prop: 'bucketName',
            title: '桶名称'
          },
          {
            prop: 'value',
            title: '桶已用容量',
            formatter: (row, data, val) => {
              return this.byteConvert(val)
            }
          },
          {
            prop: 'quotaSize',
            title: '桶容量上限',
            formatter: (_, __, val) => {
              return String(val) === '-1' ? '无容量上限' : this.byteConvert(val)
            }
          }
          // {
          //   prop: 'quotaCont',
          //   title: '桶对象数上限',
          //   formatter: (_, __, val) => {
          //     return String(val) === '-1' ? '无数量上限' : this.bigNumberTransform(val)
          //   }
          // }
        ]
        : [
          {
            prop: 'bucketName',
            title: '桶名称'
          },
          {
            slot: 'value'
          },
          {
            prop: 'quotaSize',
            title: '桶容量上限',
            formatter: (_, __, val) => {
              return String(val) === '-1' ? '无容量上限' : this.byteConvert(val)
            }
          }
          // {
          //   prop: 'quotaCont',
          //   title: '桶对象数上限',
          //   formatter: (_, __, val) => {
          //     return String(val) === '-1' ? '无数量上限' : this.bigNumberTransform(val)
          //   }
          // }
        ]
    },
    isAdmin () {
      return this.$store.state['api'] && this.$store.state['api']['isAdmin']
    }
  },
  watch: {
  },
  mounted () {
    this.$nextTick(() => {
      this.init(true)
    })
  },
  destroyed () {
  },
  methods: {
    renderTripleLoadGroup () {
      if (this.loadGroupChart.length > 2) {
        return 'multiple'
      } else {
        return 'double'
      }
    },
    renderLoadType (storageType) {
      switch (storageType) {
        case 'NAS':
          return 'NAS 资源'
        case 'S3':
          return 'S3 资源'
        case 'IAM':
          return 'AWS 资源'
        default:
          break
      }
    },
    init (loading) {
      if (loading) {
        this.loading = true
      }
      const getAsyncTotal = getTotal()
      const getAsyncTrend = getTrend({ days: 14 })
      const getAsyncRank = getRank({ count: 10 })
      const asyncList = this.isAdmin ? [
        getAsyncTotal, getAsyncTrend, getAsyncRank, getGroupList(), listStorageDevice()
      ] : [
        getAsyncTotal, getAsyncTrend, getAsyncRank
      ]
      Promise.allSettled(asyncList).then((res) => {
        // 汇总信息
        const total = res[0].value && res[0].value.data || {}
        const {
          bucketCount = 0,
          objectCount = 0,
          userCount = 0,
          objectSize = 0
        } = total
        // 展示上层对象存储信息、不包含缓存
        this.totalInfo = [
          { label: '用户', tooltip: userCount, value: this.bigNumberTransform(userCount), icon: 'user', name: 'Users' },
          { label: '桶', tooltip: bucketCount, value: this.bigNumberTransform(bucketCount), icon: 'bucket', name: 'Bucket' },
          { label: '对象数', tooltip: objectCount, value: this.bigNumberTransform(objectCount), icon: 'object' },
          { label: '对象容量', tooltip: this.byteConvert(objectSize), value: this.byteConvert(objectSize), icon: 'usedCount2' }
        ]
        // 趋势图
        const trend = res[1].value && res[1].value.data || {}
        const {
          bucketCountTrendList = [],
          objectSizeTrendList = []
        } = trend
        bucketCountTrendList.forEach(x => {
          this.trend.bucketCountVal.push(x.value)
          this.trend.bucketCountDate.push(x.date)
        })
        objectSizeTrendList.forEach(x => {
          this.trend.bucketUsedSizeVal.push(x.value)
          this.trend.bucketUsedSizeDate.push(x.date)
        })
        // this.trend.bucketUsedSizeVal = [123, 345, 31, 31, 333]
        // top图
        const rank = res[2].value && res[2].value.data || {}
        const {
          sizeRanking = [],
          percentRanking = []
        } = rank
        this.rank.bucketUsedSizeTop = sizeRanking
        // 无上限排序前、无上限展示进度条
        this.rank.bucketUsedPercentTop = percentRanking.map(x => {
          x.value = Number(x.value).toFixed(1)
          return x
        }).sort((a, b) => {
          // 无上限排序后
          return (Number(b.value) - Number(a.value))
        })
        // loadGroup 图表
        if (this.isAdmin) {
          const loadGroup = res[3].value && res[3].value.data || []
          const device = res[4].value && res[4].value.data || []
          // 保存所有资源用于后续处理展示resource信息
          // 添加映射到负载组下资源
          const resources = device.reduce((pre, cur) => {
            pre.push(...cur.storageResourceModelList.map(x => {
              x.deviceName = cur.deviceName
              return x
            }))
            return pre
          }, []).reduce((pre, cur) => {
            if (!pre[cur.resourceId]) {
              pre[cur.resourceId] = { ...cur }
            }
            return pre
          }, {})

          const loadGroupList = loadGroup.map(x => {
            if (x.items && x.items.length) {
              x.items.map((t, i) => {
                if (t.resourceId in resources) {
                  Object.assign(t, {
                    ...resources[String(t.resourceId)]
                  })
                } else {
                  x.deleteResourceId = (x.deleteResourceId || []).concat(t.resourceId)
                }
                if (i == (x.items.length - 1) && x.deleteResourceId && x.deleteResourceId.length) {
                  x.items = x.items.filter(k => {
                    return !x.deleteResourceId.includes(k.resourceId)
                  })
                }
              })
            }
            return x
          })
          this.loadGroupChart = loadGroupList.map(x => {
            const resourceList = []
            let loadGroupUseSize = 0
            let loadGroupUnusedSize = 0
            x.items && x.items.forEach((e, i) => {
              // console.log(e, '123')
              const {
                usedSpace, // 用量返回字节
                storageName,
                objectSize, // 配额根据sizeUnit计算得字节
                unit,
                resourceId
              } = e
              loadGroupUseSize += Number(usedSpace)
              const totalSpace = objectSize === '-1' ? '' : unit === 'GB' ? objectSize * 1024 ** 3 : objectSize * 1024 ** 4
              const useRatio = totalSpace ? ((usedSpace / totalSpace) * 100).toFixed(1) : ''
              this.allResourceList.push({
                usedSpace,
                totalSpace,
                storageName,
                useRatio,
                resourceId
              })
              resourceList.push({
                usedSpace,
                totalSpace,
                storageName,
                useRatio,
                resourceId
              })
            })
            // 资源用量信息 配额无上限、total 为''，useRatil ''
            for (let i = 0; i < resourceList.length; i++) {
              if (resourceList[i].totalSpace) {
                loadGroupUnusedSize += resourceList[i].totalSpace - resourceList[i].usedSpace
              } else {
                loadGroupUnusedSize = ''
                break
              }
            }
            return {
              loadGroupName: x.loadGroupName, // 负载组名称
              loadGroupUseSize, // 负载组已用,
              loadGroupUnusedSize, // 负载组未用
              defaultGroup: x.defaultGroup, // 是否默认
              storageType: x.storageType, // 类型
              resourceList
            }
          }).sort((a, b) => b.defaultGroup - a.defaultGroup)
          // this.loadGroupChart[1].resourceList = this.loadGroupChart[0].resourceList
          // this.loadGroupChart[3].resourceList = []
        }
      }).finally(() => {
        this.loading = false
      })
    },
    renderPie (usedSize) {
      const { PI, cos, sin } = Math
      const val1 = (300 / 360) * 100
      const angle1 = PI * val1 / 50 / 2
      const pointStart = [
        0.5 - 0.5 * cos(angle1) * sin(angle1),
        0.5 + 0.5 * cos(angle1) * cos(angle1)
      ]
      // 渐变终点
      const pointEnd1 = [
        0.5 - 0.5 * sin(angle1),
        0.5 + 0.5 * cos(angle1)
      ]
      const option = {
        title: {
          text: this.byteConvert(usedSize),
          subtext: '已用容量',
          left: 'center',
          top: 'center',
          textStyle: {
            fontSize: 20,
            color: '#fff'
          },
          subtextStyle: {
            fontSize: 16,
            color: '#d3d6d8'
          }
        },
        tooltip: {
          show: false
        },
        series: [
          {
            type: 'pie',
            label: { show: true },
            radius: ['70%', '85%'],
            avoidLabelOverlap: false,
            labelLine: { show: false },
            center: ['50%', '50%'],
            startAngle: 50,
            itemStyle: {
              normal: {
                borderColor: 'transparent',
                borderWidth: 2,
                borderRadius: [20, '20', '20', '20'],
                color: (params) => {
                  if (params.dataIndex === 0) {
                    return {
                      type: 'linear',
                      x: pointStart[0],
                      y: pointStart[1], //  注意此处注释掉了，若没有注释将是另一种效果
                      x2: pointEnd1[0],
                      y2: pointEnd1[1],
                      colorStops: [
                        // !! 在此添加想要的渐变过程色 !!
                        {
                          offset: 0,
                          color: '#3959ff'
                        },
                        {
                          offset: 1,
                          color: '#36464e'
                        }
                        // { offset: 0, color: '#4933ab' },
                        // { offset: 1, color: '#36464e' }
                      ]
                    }
                  } else {
                    return 'transparent'
                  }
                }
              }
            },
            emphasis: {
              disabled: true,
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            data: [{ value: 80 }, { value: 20 }]
          }
        ]
      }
      return option
    },
    handleLoadDrawer (type, pagination) {
      getRankPage(
        { type, ...pagination }
      ).then(res => {
        if (type === 1) {
          this.drawerUsed.list = res.data.list || []
          this.drawerUsed.total = res.data.totalCount
          this.drawerUsed.loading = false
        } else if (type == 2) {
          this.drawerPercent.list = (res.data.list || []).map(item => {
            item.value = Number(item.value).toFixed(1)
            return item
          })
          this.drawerPercent.total = res.data.totalCount
          this.drawerPercent.loading = false
        }
      })
    },
    async openDrawer (str) {
      this.drawerType = str
      this.drawerFlag = true
      if (str === 'useSize') {
        this.drawerTitle = '桶已用容量'
        this.drawerUsed.loading = true
        this.handleLoadDrawer(1, {
          pageNum: 1,
          pageSize: 10
        })
      } else {
        this.drawerTitle = '桶已用容量百分比'
        this.drawerPercent.loading = true
        this.handleLoadDrawer(2, {
          pageNum: 1,
          pageSize: 10
        })
      }
    },
    renderPagination (val) {
      const { ref, pageNumber, pageSize } = val
      const type = ref === 'type1' ? 1 : 2
      if (type == 1) {
        this.drawerUsed.loading = true
      } else if (type == 2) {
        this.drawerPercent.loading = true
      }
      this.handleLoadDrawer(type, {
        pageNum: pageNumber, pageSize: pageSize
      })
    },
    svgPath (icon) {
      return '#icon-' + icon
    },
    rowClick (row) {
      const { bucketName } = row
      this.goPage('BucketList', {
        id: bucketName
        // ID: JSON.parse(localStorage.getItem('user')).name
      })
    },
    jumpBucket (data) {
      let bucketName = ''
      if (data.componentType === 'yAxis') {
        bucketName = data.value
      } else if (data.componentType === 'series') {
        bucketName = data.data.bucketName
      }
      this.goPage('BucketList', {
        id: bucketName
        // ID: JSON.parse(localStorage.getItem('user')).name
      })
    },
    jumpPage (row) {
      const { name } = row
      if (name) {
        this.goPage(name)
      }
    },
    goPage (name, params = {}) {
      this.$router.push({ name, params })
    },
    getEnumData (type, index) {
      switch (type) {
        case '桶':
          return this.trend['bucketCountVal'][index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        case '已用资源容量':
          return this.byteConvert(this.trend['bucketUsedSizeVal'][index])
        // return ((this.trend['bucketUsedSizeVal'][index]) / 1024 ** 3).toFixed(1) + 'GB'
        case '桶用量':
          return this.byteConvert(this.dataUnit[index]['bucketUserSize'])
        case '上传对象量':
          return this.byteConvert(this.dataUnit[index]['uploadSize'])
        case '删除对象量':
          return this.byteConvert(this.dataUnit[index]['deleteSize'])
        case '上传对象数':
          return this.buckeInfo['uploadCount'][index]
        case '删除对象数':
          return this.buckeInfo['deleteCount'][index]
      }
    },
    renderCapacity (val, Index) {
      if (Index) {
        return ((val / 1024 ** Index).toFixed(1))
      } else {
        return val
      }
    },
    getOption (text, dataX, dataY) {
      let { unit } = text
      let Index
      if (!unit) {
        // 此处自适应容量单位
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        Index = dataY.flat(2).reduce((pre, cur) => {
          pre = Math.max(pre, units.indexOf(this.byteConvertImpl(cur)[1]))
          return pre
        }, 0)
        // if (Index !== 0) {
        //   Index -= 1
        // }
        unit = units[Index]
        // 最大单位需减去1位、保证展示容量单位合理
      }

      text.color = text.color ? text.color.split(',') : ['#5B8FF9']
      const series = dataY.map((item, i) => {
        return {
          name: text.legend ? text.legend.split(',')[i] : text.title,
          type: 'line',
          smooth: false,
          data: unit === '个' ? item : item && item.length && item.map(x => {
            return this.renderCapacity(x, Index)
          }),
          sampling: 'lttb',
          // symbol: 'none',
          areaStyle: {
            color: i == 0 ? new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#357adb'
              },
              {
                offset: 0.3,
                color: '#357adb'
              },
              {
                offset: 0.5,
                color: '#4d6dc0'
              },
              {
                offset: 0.75,
                color: '#5566b1'
              },
              {
                offset: 1,
                color: '#8e78df'
              }
            ]) : new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(241,120,120)'
              },
              {
                offset: 1,
                color: 'rgb(219,87,87)'
              }
            ]),
            opacity: '.5'
          },
          // stack: 'total',
          // emphasis: {
          //   focus: 'series'
          // },
          lineStyle: {
            width: 0
          },
          symbolSize: 2 // default 4
        }
      })
      return {
        color: ['#3480ca', '#bb5456'],
        title: {
          text: text.title.split(',').join('/') + `(${unit})`,
          top: 10,
          left: 20,
          textStyle: {
            color: '#d3d6d8',
            fontSize: 16,
            fontWeight: 400
          }
        },
        axisPointer: {
          lineStyle: {
            color: '#3b3e47'
          }
        },
        tooltip: {
          trigger: 'axis',
          textStyle: {
            color: '#d3d6d8'
          },
          borderColor: 'rgba(50,50,50,0.9)',
          backgroundColor: 'rgba(50,50,50,0.9)',
          // position: function (pt) {
          //   return [pt[0], '10%']
          // },
          formatter: (type) => {
            // name:date
            const date = type[0].name + '<br />'
            const res = type.reduce((pre, cur) => {
              return pre + cur.marker + cur.seriesName + `
              <span style="font-weight:bold;margin-left:10px;">
                ${this.getEnumData(cur.seriesName, cur.dataIndex)}
              </span>
              ` + '<br />'
            }, '')
            return date + res
          },
          axisPointer: {
            type: 'line',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        // legend: {
        //   textStyle: {
        //     color: '#d3d6d8'
        //   },
        //   data: text.legend ? text.legend.split(',') : [text.title]
        // },
        xAxis: {
          boundaryGrap: false,
          type: 'category',
          data: dataX,
          axisLabel: {
            color: '#d3d6d8'
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#3b3e47'
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                color: '#3b3e47'
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#3b3e47'
              }
            },
            axisLabel: {
              // margin: 4,
              showMinLabel: false,
              inside: false,
              textStyle: {
                color: '#d3d6d8'
              },
              formatter: (data) => {
                return unit === '个' ? this.bigNumberTransform(data) : this.preciseDemi(data)
              }
            }
          }

        ],
        series
      }
    },

    renderData (obj) {
      if (JSON.stringify(obj) === '{}') return []
      else {
        const { percent, title } = obj
        return [{ value: percent ? percent * 100 : '', name: title }]
      }
    },

    renderPieOption (used, unused) {
      const data = this.renderLoadGroupChart(used, unused)
      const text = Number(used + unused) === 0 ? '0%' : (used / (used + unused) * 100).toFixed(1) + '%'
      return {
        title: {
          text: text,
          left: 'center',
          top: 'center',
          textStyle: {
            fontSize: 25,
            color: this.useRatio >= 0.9 ? '#c83579' : '#d3d6d8'
          }
        },
        // legend: {
        //   // show: false,
        //   show: !length,
        //   bottom: 90,
        //   textStyle: {
        //     color: '#d3d6d8'
        //   },
        //   formatter: val => {
        //     if (val === '已使用资源') {
        //       return val + ' ' + this.byteConvert(used)
        //     } else {
        //       return val + ' ' + this.byteConvert(unused)
        //     }
        //   }
        // },
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
        series: [
          {
            // data: this.datas,
            data,
            type: 'pie',
            // roseType: 'area',
            percentPrecision: 1,
            // stillShowZeroSum: false,
            minAngle: 15,
            startAngle: 270,
            emphasis: {
              scaleSize: 10
            },
            // radius: this.radius,
            radius: [80, 100],
            // color: this.colors,
            color: ['#9f86ff', '#3351cc'],
            avoidLabelOverlap: true,
            itemStyle: {
              normal: {
                borderColor: 'transparent',
                borderWidth: 2,
                color: (params) => {
                  // const colorList = this.colors
                  // { offset: 0, color: '#4933ab' },
                  // { offset: 1, color: '#2f323a' }
                  // const colorList = ['#4933ab', '#2d60a7']
                  if (!params.dataIndex) {
                    return new this.$echarts.graphic.LinearGradient(1, 0, 0, 0, [
                      {
                        offset: 0,
                        color: '#3959ff'
                      },
                      {
                        offset: 1,
                        color: '#2ec8cf'
                      }
                      //   { // 颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                      //   offset: 0,
                      //   color: '#4933ab'
                      // },
                      // {
                      //   offset: 0.5,
                      //   color: '#3d3377'
                      // },
                      // {
                      //   offset: 1,
                      //   color: '#2f323a'
                      // }
                    ])
                  } else {
                    return '#bfbfbf'
                    // return new this.$echarts.graphic.LinearGradient(1, 0, 0, 0, [{ // 颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                    //   offset: 0,
                    //   color: '#1567d4 '
                    // },
                    // {
                    //   offset: 0.5,
                    //   color: '#385384'
                    // },
                    // {
                    //   offset: 1,
                    //   color: '#3351cc'
                    // }])
                  }
                }
              }
            },
            labelLine: {
              show: true,
              smooth: true,
              normal: {
                length: 5,
                length2: 5
                // minTurnAngle: 30,
              }
            },
            label: {
              show: true,
              formatter: (params) => {
                // console.log(params, '1233')
                // return params.name + '\n' + params.data.fval
                return params.data.fval
              },
              minTurnAngle: 60,
              color: '#d3d6d8',
              width: 200,
              fontSize: 14
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
    },
    // 负载组图表
    renderOption ({ val, percent }) {
      const option = {
        series: [
          {
            type: 'gauge',
            radius: '90%', // 控制半圆的大小，可以调整为合适的值
            startAngle: 190, // 起始角度为180度，即半圆
            endAngle: -10, // 结束角度为0度
            center: ['50%', '70%'], // 控制半圆的位置
            data: [

            ],
            title: {
              color: '#fff',
              offsetCenter: [0, '50%'],
              fontSize: '18px'
              // show: false
            },
            itemStyle: {
              color: '#3451b9',
              // color: '#58D9F9',
              // shadowColor: 'rgba(0,138,255,0.45)',
              borderRadius: 10,
              borderColor: '#3451b9',
              shadowColor: '#262eccb3',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            pointer: {
              show: false
            },
            progress: {
              show: true,
              roundCap: true,
              width: 12
            },
            splitNumber: 10, // 分隔线的数量
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 10, // 进度条的宽度
                color: percent !== '' ? [
                  // [0.3, '#fff'],
                  [1, '#ccc']
                ] : [[1, '#3451b9']]
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            animation: false,
            detail: {
              // formatter: '{value}%',
              // backgroundColor: '#fff',
              // borderColor: '#999',
              // width: '60%',
              // lineHeight: 40,
              // height: 40,
              // offsetCenter: [0, '35%'],
              valueAnimation: true,
              formatter: function (value) {
                if (value) {
                  return '{value|' + value.toFixed(0) + '%' + '}' + ' / ' + '{data|' + val + '}'
                } else {
                  return val
                }
              },
              offsetCenter: [0, '10%'],
              color: '#ccc',
              fontSize: '25px',
              padding: percent === '' ? [-30, 0, 0, 0] : '',
              rich: {
                value: {
                  fontSize: 25,
                  fontWeight: 'bolder',
                  color: percent >= 0.7 ? '#c83579' : '#d3d6d8',
                  verticalAlign: 'bottom'
                },
                data: {
                  fontSize: 15,
                  color: '#ccc',
                  verticalAlign: 'bottom',
                  fontStyle: 'italic',
                  padding: [-10, 0, 0, 0]
                }
              }
            }
          }
        ]
      }
      return option
    },
    getResourceData (name) {
      return this.allResourceList.find(x => x.storageName === name)
    },
    renderLoadGroupChart (loadGroupUseSize, loadGroupUnusedSize) {
      return [
        { name: '已使用资源', value: loadGroupUseSize, fval: this.byteConvert(loadGroupUseSize) },
        { name: '未使用资源', value: loadGroupUnusedSize, fval: this.byteConvert(loadGroupUnusedSize) }]
    },
    loadChartClick (e, resourceLoadGroup) {
      this.$router.push({
        name: 'LoadGroup',
        params: {
          resourceName: e.name || '',
          resourceLoadGroup
        }
      })
    },
    jumpToLoadGroup (name, e) {
      if (e && e.type === 'legendselectchanged') return
      else {
        // 跳转负载组、查询负载组名称或者资源
        this.$router.push({
          name: 'LoadGroup',
          params: {
            loadGroupName: name
          }
        })
      }
    },
    renderBarChart (arr, text) {
      const list = JSON.parse(JSON.stringify(arr))
      list.length > 5 ? list.length = 5 : null
      const yData = []
      const titleList = []
      const usedList = []
      const totalList = Array(list.length).fill(1)
      list.forEach(x => {
        const {
          usedSpace,
          storageName,
          totalSpace,
          useRatio
        } = x
        // 注意无上限 时 用量为0情况
        const title = this.byteConvert(usedSpace) + `（${useRatio ? useRatio + '%' : '无上限'}）`
        yData.push(storageName)
        usedList.push(totalSpace ? useRatio / 100 : 1) // 按total有无上限 图表展示用量按百分比填充
        titleList.push(title)
      })
      const { PI, cos, sin } = Math
      const val1 = (300 / 360) * 100
      const angle1 = PI * val1 / 50 / 2
      const pointStart = [
        0.5 - 0.5 * cos(angle1) * sin(angle1),
        0.5 + 0.5 * cos(angle1) * cos(angle1)
      ]
      // 渐变终点
      const pointEnd1 = [
        0.5 - 0.5 * sin(angle1),
        0.5 + 0.5 * cos(angle1)
      ]
      // console.log(pointStart, pointEnd1)
      return {
        title: {
          text,
          textStyle: {
            color: '#d3d6d8'
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '5%',
          top: '10%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          },
          textStyle: {
            color: '#d3d6d8'
          },
          borderColor: 'rgba(50,50,50,0.9)',
          backgroundColor: 'rgba(50,50,50,0.9)',
          formatter: (params) => {
            const resource = this.getResourceData(params[0].name)
            // console.log(resource, '123')
            let {
              usedSpace,
              totalSpace
            } = resource
            totalSpace = totalSpace ? this.byteConvert(totalSpace - usedSpace) : '无上限'
            const title = params[0].name + '<br/>'
            const usedTitle = '<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#3959ff;"></span>' + `<span style="display:inline-block;margin-right:10px">${params[0].seriesName + ':'}</span>` + this.byteConvert(usedSpace) + '<br/>'
            const unUsedTitle = params[1].marker + `<span style="display:inline-block;margin-right:10px">${params[1].seriesName + ':'}</span>` + totalSpace + '<br/>'
            return title + usedTitle + unUsedTitle
          }
          //     return (
          //       params[0].name +
          // '<br/>' +
          // "<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:rgba(36,207,233,0.9)'></span>" +
          // params[0].seriesName +
          // ' : ' +
          // Number(
          //   (params[0].value.toFixed(4) / 10000).toFixed(2)
          // ).toLocaleString() +
          // ' 万元<br/>'
          //     )
          //   }
        },
        xAxis: {
          show: false,
          type: 'value'
        },
        yAxis: [
          {
            type: 'category',
            inverse: true,
            axisLabel: {
              show: true,
              textStyle: {
                color: '#fff'
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            data: yData
          },
          {
            type: 'category',
            inverse: true,
            axisTick: 'none',
            axisLine: 'none',
            show: true,
            axisLabel: {
              textStyle: {
                color: '#ffffff',
                fontSize: '12'
              },
              formatter: function (value) {
                const percent = value.match(/\（(.*)\）/)
                if (percent && percent.length > 1 && parseInt(percent[1]) >= 90) {
                  return '{alarm|' + value + '}'
                } else {
                  return '{default|' + value + '}'
                }
              },
              rich: {
                alarm: {
                  color: '#c83573',
                  fontWeight: 'bold',
                  fontSize: 14
                },
                default: {
                  color: '#3393e6',
                  fontWeight: 'bold',
                  fontSize: 14
                }
                // active: {
                //   color: '#ff8746',
                //   fontWeight: 'bold',
                //   fontSize: 14
                // }
              }
            },
            data: titleList
          }
        ],
        series: [
          {
            name: '已用资源容量',
            type: 'bar',
            zlevel: 1,
            itemStyle: {
              normal: {
                barBorderRadius: 30,
                borderColor: '#36464e',
                color: (val) => {
                  if (val.value == 1) {
                    return {
                      type: 'linear',
                      x: pointStart[0],
                      y: pointStart[1], //  注意此处注释掉了，若没有注释将是另一种效果
                      x2: pointEnd1[0],
                      y2: pointEnd1[1],
                      colorStops: [
                        // !! 在此添加想要的渐变过程色 !!
                        { offset: 0, color: '#36464e' },
                        { offset: 0.3, color: '#2e4a58' },
                        { offset: 0.6, color: '#2ec8cf' },
                        { offset: 1, color: '#3959ff' }
                      ]
                    }
                  } else {
                    return new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      {
                        offset: 0,
                        color: '#3959ff'
                      },
                      {
                        offset: 1,
                        color: '#2ec8cf'
                      }
                    ])
                  }
                }
              }
            },
            barWidth: 12,
            data: usedList
          },
          {
            name: '未使用资源容量',
            type: 'bar',
            barWidth: 12,
            barGap: '-100%',
            data: totalList,
            itemStyle: {
              normal: {
                color: '#bfbfbf',
                barBorderRadius: 30
              }
            }
          }
        ]
      }
    }
  }
}
</script>
<style scoped lang="scss">
.page_content_wrap {
  padding: 0 40px;
  // position: relative;
  // top: -25px;

  .widget-row {
    height: 300px;

    .widget-item {
      position: relative;
      height: 100%;

      .topTitle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 50px;

        span {
          font-size: 18px;
        }
      }

      .widget-chart {
        width: 100%;
        height: 100%;
      }
    }
  }
}

::v-deep .flexMenu {
  position: relative;
  margin: 0 40px;
  display: flex;
  justify-content: space-between;

  .el-card {
    width: 25%;
    margin-right: 2%;
    border: 1px solid #3b3e47 !important;
    &:last-of-type {
      margin-right: 0;
      // margin-left: 5%;
    }
    .el-card__body {
      height: 80%;
      .targetItems {
        // display: flex;
        // align-items: center;
        min-width: 150px;
        height: 90%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        & > p {
          margin-left: 4px;
        }

        .icon {
          width: 2em;
          height: 2em;
          margin-right: 0;
        }

        .fa {
          font-size: 20px;
        }

        p {
          font-size: 25px;
        }

        div {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          p {
            font-size: 2.5em;
            // &:nth-of-type(2) {
            //   font-size: 38px;
            // }
          }
        }
      }
    }
  }

  .pieContainer {
    width: 30%;
    position: relative;
    top: -45px;
    left: 30px;

    .pieNoQuota {
      cursor: pointer;
      position: relative;
      top: 50%;
      left: 50%;
      transform: translate(-35%, -50%);
    }

    .noQuotaTip {
      position: absolute;
      left: 45%;
      bottom: -20px;
      transform: translate(0%, 15%);
      display: flex;
      align-items: center;
      vertical-align: middle;
      font-size: 18px;

      .square {
        width: 13px;
        height: 12px;
        background-color: #5733e6;
        margin-right: 10px;
      }
    }

    .pieSetQuota {
      // top: 32px;
      width: 100%;
      // width: 420px;
      height: 250px;
      position: relative;

      .quotaTip {
        display: inline-block;
        position: absolute;
        font-size: 14px;
        left: 50%;
        transform: translate(-50%);
        bottom: -20px;
        width: auto;
      }
    }
  }
}

.chartContainer {
  margin-top: 10px;
  padding: 0 40px;
  &.barChart {
    display: flex;
    justify-content: space-between;
    .el-col {
      cursor: pointer;
      box-shadow: 0 4px 15px 0 rgb(0, 0, 0, 0.4);
      padding: 20px 20px 0;
      margin-top: 20px;
      &.double {
        width: 48%;
        &:nth-of-type(2n) {
          margin-left: 4%;
        }
      }
      &.multiple {
        width: 32%;
        &:nth-of-type(3n-1) {
          margin-left: 2%;
          margin-right: 2%;
        }
      }
      .more {
        z-index: 999;
        position: absolute;
        right: 0;
        font-size: 12px;
        top: 5px;
      }
    }
  }
  .chartTitle {
    position: relative;
    font-size: 18px;
    // span{
    //   margin-left: 15px;
    //   font-size: 16px;
    // }
    &.loadGroupType {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .loadGroupTag {
        width: 20%;
        max-width: 200px;
        display: flex;
        justify-content: flex-end;
        .el-tag {
          &:first-of-type {
            margin-left: 0;
          }
        }
      }
      .loadGroupName {
        flex: 1;
        min-width: 160px;
        & > span {
          width: 70px;
          margin-right: 0;
        }
        .tooltip-container {
          max-width: calc(100% - 100px);
          position: relative;
          top: -2px;
          left: 3px;
        }
        // &
        display: flex;
        align-items: center;
      }
      .el-tag {
        color: #e39606 !important;
        background-color: #373a3b;
        border-color: transparent;
        height: 22px;
        margin-left: 5px;
        line-height: 20px;
        border-radius: 20px;
        text-align: center;
      }
    }
  }
  .loadGroupContent {
    width: 100%;
    display: flex;
    justify-content: center;
    .loadGroupPie {
      width: 100%;
      margin-right: 2%;
    }
    .loadGroupResource {
      // margin-left: 5%;
      width: 60%;
      min-width: 300px;
      position: relative;
      top: 30px;
    }
  }
}

.dashboard {
  height: 100%;
  .content {
    // padding-top: 50px;
    position: relative;

    .manage-area-title {
      position: absolute;
    }

    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.more {
  color: #ff8746;
}

::v-deep .el-drawer {
  background: "";

  .el-drawer__body {
    padding: 0 20px;
  }

  .el-icon-close {
    color: #ff8746;
  }
}
</style>

<style lang="scss">
.db_Top_Tip {
  font-size: 20px;
}
.emptyContainer {
  width: 100%;
  height: 200px;
  color: #909399;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
