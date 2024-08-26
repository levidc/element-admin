<template>
  <div class="bucket-detail">
    <div class="bucket-detail-inner">
      <div class="bucket-panel">
        <div
          id="logging-info-field"
          class="param-box"
        >
          <div class="param-hd">
            <h3 id="loggingControl">日志存储 </h3>
            <a
              v-show="!editLoggingControl"
              href="javascript:void(0);"
              class="link-edit"
              @click="editLoggingControl=!editLoggingControl"
            >编辑</a>
          </div>
          <div class="param-bd">
            <ul class="item-descr-list">
              <li>
                <span class="item-descr-tit">当前状态</span>
                <span
                  v-show="!editLoggingControl"
                  class="item-descr-txt"
                >{{ loggingControl?"开启":"关闭" }}</span>
                <el-switch
                  v-show="editLoggingControl"
                  v-model="loggingControl"
                />
              </li>
              <li v-show="editLoggingControl&&loggingControl">
                <span class="item-descr-tit">目标存储桶</span>
                <el-select
                  v-model="targetBucket"
                  filterable
                  size="mini"
                  clearable
                >
                  <el-option
                    label="存储桶名称"
                    value="bucket"
                  >存储桶名称</el-option>
                  <el-option
                    label="标签"
                    value="tag"
                  >标签</el-option>
                </el-select>
              </li>
              <li v-show="editLoggingControl&&loggingControl">
                <span class="item-descr-tit">路径前缀</span>
                <el-input
                  size="mini"
                  style="width:200px"
                />
                <p class="item-descr-p">日志文件存储路径为：b1-1303029310/cos-access-log/{YYYY}/{MM}/{DD}/{time}_{random}_{index}.gz</p>
              </li>
              <li v-show="editLoggingControl&&loggingControl">
                <span class="item-descr-tit">服务授权</span>
                <span class="item-descr-txt">该功能需要授权 CLS 产品服务向您的存储桶中投递访问日志, 点击授权</span>
              </li>
              <li v-show="editLoggingControl">
                <span class="item-descr-tit" />
                <div class="loggingControlBtnWrap">
                  <el-button
                    v-if="loggingControl"
                    type="default"
                    size="mini"
                    disabled
                  >保存</el-button>
                  <el-button
                    v-if="!loggingControl"
                    type="primary"
                    size="mini"
                  >保存</el-button>
                  <el-button
                    type="default"
                    size="mini"
                    @click="editLoggingControl=!editLoggingControl"
                  >取消</el-button>
                </div>

              </li>
            </ul>
          </div>
          <div class="bucket-18-input-tips mt-10">
            注：启用日志管理后，COS的所有访问请求信息都将以日志的形式，以5分钟为单位保存至目标存储桶中。<br>
            <span style="margin-left: 2em;">
              目标存储桶中生成的日志文件路径格式：目标存储桶/路径前缀{YYYY}/{MM}/{DD}/{time}_{random}_{index}.gz
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BucketLog',
  components: {},
  filters: {},
  data() {
    return {
      loggingControl: false,
      editLoggingControl: false,
      targetBucket: ''
    }
  },
  computed: {},
  mounted: function() { },
  destroyed() { },
  methods: {}
}
</script>
<style scoped>
.item-descr-p {
  font-size: 12px;
  color: #888;
  vertical-align: middle;
  margin: 8px 0;
}
</style>
