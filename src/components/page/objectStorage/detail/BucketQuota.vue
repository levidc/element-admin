<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div class="param-box">
            <div class="param-hd">
              <h3>配额管理</h3>
              <!-- <el-button v-show="!editQuotaControl && !loading && !editQuota" class="modBtn" type="text" @click="editQuotaControl = !editQuotaControl">
                <span :style="spanTxt">编辑</span>
              </el-button> -->
              <el-switch
                v-if="gateWaySwitch"
                v-model="openStatic"
                style="margin-left: 10px;margin-top: 2px;"
                @change="changeSwitch"
              />
            </div>
            <div
              v-loading="loading"
              class="param-bd"
            >
              <ul class="item-descr-list">
                <!-- <li>
                  <span class="item-descr-tit">当前桶的统计功能</span>
                  <span v-show="!editQuotaControl" style="color:#ff8746" class="item-descr-txt">{{ openStatic ? "开启" : "关闭" }}</span>
                  <el-switch v-show="editQuotaControl" v-model="openStatic" />
                </li>
                <li v-show="editQuotaControl">
                  <span class="item-descr-tit" />
                  <span class="item-descr-txt">只有开启了桶统计功能才能设置配额</span>
                </li> -->
                <!-- <li v-show="editQuotaControl">
                  <span class="item-descr-tit" />
                  <div class="versionControlBtnWrap">
                    <el-button type="primary" class="golden" size="mini" @click="doSave();">应用更改</el-button>
                    <el-button type="default" size="mini" @click="cancelSave()">取消</el-button>
                  </div>
                </li> -->
              </ul>
              <div v-show="!loading && flage">
                <h3
                  style="font-size:16px;display:inline-block;"
                  class="mv_10"
                >配额详情</h3>
                <el-button
                  v-show="!editQuota"
                  type="text"
                  @click="SetBucketQuota"
                >
                  <span style="color:#ff8746">设置桶配额</span>
                </el-button>
                <div style="width: 50%;">
                  <el-descriptions
                    :content-style="rowCenter"
                    :label-style="rowCenter"
                    title=""
                    direction="vertical"
                    :column="2"
                    border
                  >
                    <el-descriptions-item label="对象已用总数(个)">
                      <el-tag size="small">{{ bucket.useCount | precisionNum }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="对象已用总容量">
                      <el-tag size="small">{{ byteConvert(bucket.useSize) }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item
                      v-if="!editQuota"
                      label="配置对象总数上限"
                    >
                      <el-tag size="small">{{ bucket.logicCount < 0 || bucket.logicCount == 0? '无限制' : bucket.logicCount | precisionNum }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item
                      v-if="!editQuota"
                      label="配置对象总容量上限"
                    >
                      <el-tag size="small">{{ bucket.logicSize < 0 || bucket.logicSize == 0 ? '无限制' : objectLogicSize }}</el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
                <div
                  v-if="editQuota"
                  style="width: 50%;"
                >
                  <el-form
                    ref="form"
                    :model="form"
                    :rules="rules"
                  >
                    <el-table :data="[form]">
                      <el-table-column label="设置对象总数">
                        <template slot-scope="scope">
                          <el-switch
                            v-model="bucket.limitCount"
                            active-text="无限制"
                            inactive-text="自定义"
                            @change="data => changeLimtCount(data, 'count')"
                          />
                          <el-form-item
                            v-if="!bucket.limitCount"
                            prop="bucketLogicCount"
                          >
                            <el-input
                              v-model="scope.row.bucketLogicCount"
                              style="width:70%;"
                              placeholder="请输入正整数"
                              @input="value => scope.row.bucketLogicCount = value.replace(/(^0+)|\D/g, '')"
                            />
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column label="设置对象总容量">
                        <template slot-scope="scope">
                          <el-switch
                            v-model="bucket.limitSize"
                            active-text="无限制"
                            inactive-text="自定义"
                            @change="data => changeLimtCount(data, 'size')"
                          />
                          <el-row
                            v-if="!bucket.limitSize"
                            :gutter="20"
                          >
                            <el-col :span="10">
                              <el-form-item prop="bucketLogicSize">
                                <el-input
                                  v-model="scope.row.bucketLogicSize"
                                  placeholder="请输入有效的容量数值"
                                />
                              </el-form-item>
                            </el-col>
                            <el-col :span="10">
                              <el-form-item prop="logicUnit">
                                <el-select
                                  v-model="scope.row.logicUnit"
                                  @change="changelogicUnit"
                                >
                                  <el-option
                                    v-for="item in sizeSelect"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                  />
                                </el-select>
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-form>
                  <!-- <div v-else class="mv_10">
                  <span class="item-descr-tit">桶配额限制</span>
                  <span style="color:#ff8746" class="item-descr-txt">{{ bucket.noLimit ? "无限制" : "自定义" }}</span>
                  <el-switch v-model="bucket.noLimit"></el-switch>
                </div> -->
                  <el-row class="mt-10">
                    <el-button
                      class="blue"
                      @click="editQuota = false; getBucketStatic()"
                    >取消</el-button>
                    <el-button
                      class="golden"
                      @click="setQuota"
                    >应用</el-button>
                  </el-row>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getBucketStatic, UpdateBucketQuota, SetBucketQuota
} from '@/api/storage'
export default {
  filters: {
    precisionNum (val) {
      if (!val) return '0'
      const reg = /\B(?=(\d{3})+(?!\d))/g
      return String(val).replace(reg, ',')
    }
  },
  data () {
    const checkLogicSize = (rule, data, callback) => {
      console.log(data, 'wws')

      if (this.form.logicUnit == 'bytes') {
        if (data > 90000000000000000) {
          return callback('不得超过90000000000000000bytes')
        }
      }
      if (this.form.logicUnit == 'KB') {
        if (data > 80000000000000) {
          return callback('不得超过80000000000000KB')
        }
      }
      if (this.form.logicUnit == 'MB') {
        if (data > 70000000000) {
          return callback('不得超过70000000000MB')
        }
      }
      if (this.form.logicUnit == 'GB') {
        if (data > 60000000) {
          return callback('不得超过60000000GB')
        }
      }
      if (this.form.logicUnit == 'TB') {
        if (data > 60000) {
          return callback('不得超过60000TB')
        }
      }

      const reg = new RegExp('^[0-9]+(\.[0-9]+)?$')
      if (!reg.test(data)) {
        return callback('请输入有效的数值')
      } else if (String(data)[0] == '0' && String(data)[1] !== '.') {
        return callback('请输入有效的数值')
      } else if (this.covertByte(data, this.form.logicUnit) < this.bucket.useSize) {
        return callback(`当前配置的容量至少需要${this.convertSize}`)
      }
      return callback()
    }
    const checkPositiveNumber = (rule, data, callback) => {
      if (data && String(data).indexOf('.') > -1) {
        return callback('请填入正整数')
      } else if (String(data)[0] == '0') {
        return callback('请填入正整数')
      }
      data = isNaN(Number(data)) ? 0 : Number(data)
      if (!data || data < 0) {
        return callback('请填入正整数')
      } else if (data < this.bucket.useCount) {
        // const reg = /\B(?=(\d{3})+(?!\d))/g
        return callback(`当前配置的对象总数不能小于${this.bucket.useCount}`)
      } else if (data > 2147483647) {
        return callback(`当前配置的对象总数不能大于2147483647个`)
      } else {
        return callback()
      }
    }
    return {
      objectLogicSize: '',
      bucketuseSize: '',
      bucketSize: '',
      gateWaySwitch: true,
      loading: false,
      flage: true,
      editQuotaControl: true,
      openStatic: false,
      editQuota: false,
      symbols: ['bytes', 'KB', 'MB', 'GB', 'TB'],
      form: {
        bucketLogicCount: '',
        bucketLogicSize: '',
        logicUnit: 'byte'
      },
      bucket: {
        useSize: '',
        useCount: '',
        logicSize: 9999,
        logicCount: '',
        limitCount: false,
        limitSize: false
      },
      sizeSelect: [
        { label: 'bytes', value: 'bytes' },
        { label: 'KB', value: 'KB' },
        { label: 'MB', value: 'MB' },
        { label: 'GB', value: 'GB' },
        { label: 'TB', value: 'TB' }
      ],
      rules:
      {
        bucketLogicSize: { trigger: ['change', 'blur'], validator: checkLogicSize },
        bucketLogicCount: { trigger: ['change', 'blur'], validator: checkPositiveNumber }
      },
      spanTxt: 'color:#ff8746;position:relative;top:3px;',
      rowCenter: { 'text-align': 'center' }
    }
  },
  computed: {
    convertSize () {
      return this.byteConvert(this.bucket.useSize)
    }
  },
  mounted () {
    this.gettGateway()
  },
  destroyed () {
  },
  methods: {
    changelogicUnit (val) {
      if (val == 'bytes') {
        this.form.bucketLogicSize = ''
      } else if (val == 'KB') {
        this.form.bucketLogicSize = ''
      } else if (val == 'MB') {
        this.form.bucketLogicSize = ''
      } else if (val == 'GB') {
        this.form.bucketLogicSize = ''
      } else if (val == 'TB') {
        this.form.bucketLogicSize = ''
      }
    },
    gettGateway () {
      if (localStorage.getItem('isHtGateway') == 'true') {
        this.gateWaySwitch = false
        this.flage = true
        this.getBucketStatic()
      }
      if (localStorage.getItem('isHtGateway') == 'false') {
        this.gateWaySwitch = true
        this.flage = false
        getBucketStatic({ bucketName: this.$route.params.id }).then((r) => {
          if (r.data.openStatic == true) {
            this.flage = true
            this.openStatic = true
            this.getBucketStatic()
          } else {
            this.flage = false
            this.openStatic = false
            this.getBucketStatic()
          }
        })
      }
    },
    changeSwitch () {
      this.flage = !this.flage
      UpdateBucketQuota({
        bucketName: this.$route.params.id,
        openStatic: this.openStatic
      }).then(() => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
      }).catch((err) => {
        console.error(err)
      })
    },
    changeLimtCount (data, type) {
      if (type == 'count') {
        !data ? this.bucket.logicCount < 0 ? this.form.bucketLogicCount = '' : null : null
      } else if (type == 'size') {
        !data ? this.bucket.logicSize < 0 ? this.form.bucketLogicSize = 0 : null : null
      }
    },

    covertByte (num, range) {
      switch (range) {
        case 'bytes':
          return num * 1
        case 'KB':
          return num * 1024
        case 'MB':
          return num * 1024 ** 2
        case 'GB':
          return num * 1024 ** 3
        case 'TB':
          return num * 1024 ** 4
      }
    },
    doSave () {
      UpdateBucketQuota({
        bucketName: this.$route.params.id,
        openStatic: true
      }).then(() => {
        // this.$ts({
        //   type: 'success',
        //   text: this.$ts('response.success')
        // })
      }).catch((err) => {
        // console.error(err)
      }).finally(() => {
        // this.getBucketStatic()
      })
      // this.openStatic
    },
    cancelSave () {
      this.getBucketStatic()
      this.editQuota = false
    },
    SetBucketQuota () {
      this.editQuota = true
      // const value = this.byteConvertImpl(this.bucket.logicSize)
      this.form.bucketLogicCount = this.bucket.logicCount
      this.form.bucketLogicSize = this.bucket.logicSize
      if (this.form.bucketLogicSize == -1) {
        this.form.logicUnit = this.sizeSelect[3].value
      } else {
        this.form.bucketLogicSize = this.byteConvertImpl(this.form.bucketLogicSize, this.symbols)[0]
        this.form.logicUnit = this.byteConvertImpl(this.bucket.logicSize, this.symbols)[1]
      }
    },
    getBucketStatic () {
      // 初始化 获取开关
      this.editQuotaControl = false
      this.loading = true
      getBucketStatic({
        bucketName: this.$route.params.id
      }).then((res) => {
        const { logicCount, logicSize, useCount, useSize, openStatic } = res.data
        this.byteConvertImpl(logicSize, this.symbols)[0]
        this.byteConvertImpl(logicSize, this.symbols)[1]

        this.objectLogicSize = this.byteConvertImpl(logicSize, this.symbols)[0] + this.byteConvertImpl(logicSize, this.symbols)[1]
        // this.bucketuseSize = this.byteConvert(useSize)
        // this.bucketSize = this.byteConvert(logicSize)
        this.bucket.useCount = useCount // 对象总数
        this.bucket.useSize = useSize //  对象总容量
        this.bucket.logicCount = logicCount
        this.bucket.logicSize = logicSize
        this.bucket.limitCount = this.bucket.logicCount < 0 // 配置对象总数
        this.bucket.limitSize = this.bucket.logicSize < 0 // 配置对象总容量
        this.openStatic = openStatic
        // console.log(
        //   logicCount < useCount, logicSize < useSize, logicCount == 0, logicSize == 0, logicCount, logicSize
        // )
        if ((!this.bucket.limitCount && logicCount < useCount) || (!this.bucket.limitSize && logicSize < useSize)) {
          this.$ts({
            text: '当前桶对象数或总容量已超出当前配额限制，请及时更改相关配置或删除对象',
            type: 'warn',
            duration: 8000
          })
        }
      }).catch(err => {
        this.openStatic = false
      })
        .finally(() => {
          this.loading = false
        })
    },
    setQuota () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // console.log(valid)
          // console.log(
          //   this.form.bucketLogicSize, 'logic', this.form.logicUnit,
          //   this.covertByte(this.form.bucketLogicSize, this.form.logicUnit)
          //   )
          const bucketLogicCount = this.bucket.limitCount ? -1 : this.form.bucketLogicCount
          const bucketLogicSize = this.bucket.limitSize ? -1 : this.covertByte(this.form.bucketLogicSize, this.form.logicUnit)
          SetBucketQuota({
            bucketName: this.$route.params.id,
            bucketLogicSize,
            bucketLogicCount
          }).then(() => {
            this.editQuota = false
            this.getBucketStatic()
            this.$ts({
              text: this.$ts('response.success'),
              type: 'success'
            })
          })
        }
      })
    }
  }
}

</script>

<style scoped lang="scss">
.versionControlBtnWrap {
  margin: 20px 0;
}

::v-deep .el-table {
  td.el-table__cell .cell {
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .el-form-item {
      margin-top: 20px;
    }
  }
}

::v-deep .el-descriptions {
  .el-descriptions-item__label {
    color: #ccc;
  }
}
.el-tag {
  color: #e39606;
  background-color: #384348;
  border-color: transparent;
}
::v-deep .el-form-item__error {
  width: 250px;
}
</style>
