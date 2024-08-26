<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div
            id="openCache-info-field"
            class="param-box"
          >
            <div class="param-hd">
              <h3 id="openCache">冷热分层开关 </h3>
              <el-button
                v-show="!editVersionControl&&!loading"
                v-access="'s3:PutBucketVersioning'"
                class="modBtn"
                type="text"
                :disabled="!hideDisableTip"
                @click="editVersionControl=!editVersionControl"
              >
                <span
                  style="color: #ff8746;position: relative;top:3px"
                  :style="{opacity: hideDisableTip ? 1: .7}"
                >编辑</span>
              </el-button>
              <el-popover
                v-if="!hideDisableTip"
                placement="right"
                trigger="hover"
              >
                <p style="line-height:1.6;">冷热分层全局开关开启时才能配置</p>
                <i
                  slot="reference"
                  class="fa fa-question-circle"
                  style="position: relative;top:2px"
                />
              </el-popover>
            </div>
            <div
              v-loading="loading"
              class="param-bd"
            >
              <ul class="item-descr-list">
                <li>
                  <span class="item-descr-tit">当前状态</span>
                  <span
                    v-show="!editVersionControl&&!loading"
                    style="color:#ff8746"
                    class="item-descr-txt"
                  >{{ openCache?"开启":"关闭" }}</span>
                  <el-switch
                    v-show="editVersionControl"
                    v-model="openCache"
                    :width="40"
                  />
                </li>
                <li v-show="editVersionControl">
                  <span class="item-descr-tit" />
                  <div class="versionControlBtnWrap">
                    <el-button
                      type="default"
                      size="mini"
                      class="blue"
                      @click="editVersionControl=!editVersionControl;getConfig()"
                    >取消</el-button>
                    <el-button
                      type="primary"
                      class="golden"
                      size="mini"
                      @click="doSaveVersion();"
                    >应用更改</el-button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getBucketCacheConfig,
  saveBucketCacheConfig,
  getGlobalCacheConfig
} from '@/api/cacheConfig'
export default {
  name: 'BucketList',
  components: {},
  filters: {},
  data() {
    return {
      loading: false,
      openCache: false,
      noVersionControl: true,
      editVersionControl: false,
      isShowSaveTip: false,
      tableData: [],
      objectLock: false,
      hideDisableTip: true
    }
  },
  computed: {
    bucketName() {
      return this.$route.params.id
    }
  },
  mounted() {
    this.getConfig()
  },
  destroyed() { },
  methods: {
    getConfig() {
      this.loading = true
      getBucketCacheConfig({ bucketName: this.bucketName }).then(res => {
        if (res.data) {
          this.openCache = res.data.openCache
        } else {
          this.openCache = false
        }
      }).finally(() => {
        getGlobalCacheConfig().then(result => {
          const { openCache = false } = result.data
          this.hideDisableTip = openCache
        }).finally(() => {
          this.loading = false
        })
      })
    },
    doSaveVersion() {
      this.loading = true
      saveBucketCacheConfig({
        bucketName: this.bucketName,
        openCache: this.openCache
      }).then(() => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
      })
        .finally(() => {
          this.loading = false
          this.editVersionControl = false
          this.getConfig()
        })
    }
  }
}
</script>
<style scoped lang="scss">
.versionControlBtnWrap {
  margin: 20px 0;
}
</style>
