<template>
  <div>
    <el-header class="bdetail_header">
      <span
        v-for="(item,index) in routeArr"
        class="bdetail_title"
      >
        <router-link
          v-if="index+1!=routeArr.length"
          class="blue"
          :to="{name: 'BucketList'}"
        >
          <i
            v-if="index==0"
            class="fa fa-arrow-left mr_10"
          />
          {{ item+" / " }}
        </router-link>
        <span v-if="index+1==routeArr.length">
          {{ item }}
        </span>
      </span>
    </el-header>
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div
            id="basic-info-field"
            class="param-box"
          >
            <div class="param-hd">
              <h3 id="basicInfo">基本信息</h3>
            </div>
            <div class="param-bd">
              <ul class="item-descr-list">
                <li>
                  <span class="item-descr-tit">对象名称</span>
                  <span class="item-descr-txt">赤丸2.jpg</span>
                </li>
                <li>
                  <span class="item-descr-tit">对象大小</span>
                  <span class="item-descr-txt">35.86KB</span>
                </li>
                <li>
                  <span class="item-descr-tit">修改时间</span>
                  <span class="item-descr-txt">2020-09-01 17:10:57</span>
                </li>
                <li>
                  <span class="item-descr-tit">ETag</span>
                  <span class="item-descr-txt">d6c9306d4362bb5be93ed6e162f5d471</span>
                </li>
                <li>
                  <span class="item-descr-tit">
                    <el-popover
                      slot="label"
                      placement="top"
                      width="200"
                      :open-delay="500"
                      trigger="hover"
                      content="若已配置或添加相关域名，选择不同域名，对象地址会有相应的改变。"
                    >
                      <span slot="reference">指定域名&nbsp;<i class="fa  fa-question-circle" /></span>
                    </el-popover>
                  </span>
                  <span class="item-descr-txt">https://b1-1303029310.cos.ap-nanjing.myqcloud.com </span>
                </li>
                <li>
                  <span class="item-descr-tit">
                    <el-popover
                      slot="label"
                      placement="top"
                      width="200"
                      :open-delay="500"
                      trigger="hover"
                      content="若已设置存储桶或对象公共访问权限，可直接复制对象地址下载对象。"
                    >
                      <span slot="reference">对象地址&nbsp;<i class="fa  fa-question-circle" /></span>
                    </el-popover>
                  </span>
                  <span class="item-descr-txt">https://b1-1303029310.cos.ap-nanjing.myqcloud.com/%E8%B5%A4%E4%B8%B82.jpg </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="bucket-panel">
          <div
            id="tag-info-field"
            class="param-box"
          >
            <div class="param-hd">
              <h3 id="basicInfo">对象访问权限</h3>
            </div>
            <div class="param-bd">
              <ul class="item-descr-list has-table">
                <li>
                  <span class="item-descr-tit">公共权限</span>
                  <span class="item-descr-txt">
                    <el-radio
                      v-model="publicRadio"
                      label="1"
                    >继承权限</el-radio>
                    <el-radio
                      v-model="publicRadio"
                      label="2"
                    >私有读写</el-radio>
                    <el-radio
                      v-model="publicRadio"
                      label="3"
                    >公有读私有写</el-radio>
                    <p class="text-weak mb_12">该文件的访问权限以存储桶访问权限为准。</p>
                  </span>
                </li>
                <li>
                  <span class="item-descr-tit">
                    用户权限
                  </span>
                  <span class="item-descr-txt">
                    <el-table
                      ref="multipleTable"
                      :data="tableDataUser"
                      border
                      tooltip-effect="dark"
                      style="width: 100%"
                    >
                      <el-table-column
                        prop="tagKey"
                        label="用户类型"
                      />
                      <el-table-column
                        prop="tagValue"
                        label="账号ID"
                      />
                      <el-table-column
                        prop="tagValue"
                        label="权限"
                      />
                      <el-table-column label="操作">
                        <template slot-scope="scope">
                          <div
                            v-show="scope.row.isEdit"
                            class="tag_table_a"
                          >
                            <el-button
                              type="text"
                              size="mini"
                              @click="scope.row.isEdit=!scope.row.isEdit"
                            >保存</el-button>
                            <el-button
                              type="text"
                              size="mini"
                              @click="scope.row.isEdit=!scope.row.isEdit"
                            >取消</el-button>
                          </div>
                          <div
                            v-show="!scope.row.isEdit"
                            class="tag_table_a"
                          >
                            <el-button
                              type="text"
                              size="mini"
                              @click="doEdit(scope.$index, scope.row)"
                            >编辑</el-button>
                            <el-button
                              type="text"
                              size="mini"
                              @click="doDelete(scope.$index, scope.row)"
                            >删除</el-button>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                    <p class="moreTag"><el-button
                        type="text"
                        @click="handleAdd()"
                      >添加用户</el-button></p>
                  </span>
                </li>
              </ul>

            </div>
          </div>
        </div>
        <div class="bucket-panel">
          <div
            id="tag-info-field"
            class="param-box"
          >
            <div class="param-hd">
              <h3 id="basicInfo">对象标签管理</h3>
            </div>
            <div class="param-bd">
              <el-table
                ref="multipleTable"
                :data="tableDataTag"
                border
                tooltip-effect="dark"
                style="width: 100%"
              >
                <el-table-column prop="tagKey">
                  <template
                    slot="header"
                    slot-scope="scope"
                  >
                    <el-popover
                      slot="label"
                      placement="top"
                      width="300"
                      :open-delay="500"
                      trigger="hover"
                      content="标签键区分大小写，支持 中文, a-z, A-Z, 0-9, +, -, _, =, /, ., :, @ 等字符"
                    >
                      <span slot="reference">名称&nbsp;<i class="fa  fa-question-circle" /></span>
                    </el-popover>
                  </template>
                  <template slot-scope="scope">
                    <p v-show="!scope.row.isEdit">
                      {{ scope.row.tagKey }}
                    </p>
                    <el-input
                      v-show="scope.row.isEdit"
                      placeholder=""
                      :value="scope.row.tagKey"
                      size="mini"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="tagValue">
                  <template
                    slot="header"
                    slot-scope="scope"
                  >
                    <el-popover
                      slot="label"
                      placement="top"
                      width="300"
                      :open-delay="500"
                      trigger="hover"
                      content="标签值区分大小写，支持 中文, a-z, A-Z, 0-9, +, -, _, =, /, ., :, @ 等字符"
                    >
                      <span slot="reference">标签值&nbsp;<i class="fa  fa-question-circle" /></span>
                    </el-popover>
                  </template>
                  <template slot-scope="scope">
                    <p v-show="!scope.row.isEdit">
                      {{ scope.row.tagValue }}
                    </p>
                    <el-input
                      v-show="scope.row.isEdit"
                      placeholder=""
                      :value="scope.row.tagValue"
                      size="mini"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <div
                      v-show="scope.row.isEdit"
                      class="tag_table_a"
                    >
                      <el-button
                        type="text"
                        size="mini"
                        @click="scope.row.isEdit=!scope.row.isEdit"
                      >保存</el-button>
                      <el-button
                        type="text"
                        size="mini"
                        @click="scope.row.isEdit=!scope.row.isEdit"
                      >取消</el-button>
                    </div>
                    <div
                      v-show="!scope.row.isEdit"
                      class="tag_table_a"
                    >
                      <el-button
                        type="text"
                        size="mini"
                        @click="doEdit(scope.$index, scope.row)"
                      >编辑</el-button>
                      <el-button
                        type="text"
                        size="mini"
                        @click="doDelete(scope.$index, scope.row)"
                      >删除</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <p class="moreTag"><el-button
                  type="text"
                  @click="handleAdd()"
                >添加标签</el-button></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ObjDetail',
  filters: {
  },
  data () {
    return {
      tableDataUser: [],
      tableDataTag: [],
      routeArr: [],
      publicRadio: '1'
    }
  },
  computed: {

  },
  mounted: function () {
    this.routeArr = []
    this.routeArr.push(this.$route.params.id)
    if (this.$route.query.filename) {
      const fileArr = this.$route.query.filename.split('/')
      this.routeArr = this.routeArr.concat(fileArr)
    }
  },
  destroyed () {

  },
  methods: {
  }
}
</script>
<style scoped>
.item-descr-list.has-table {
  width: 100%;
}
.manage-area-main {
  max-width: 1360px;
  margin: 20px auto;
  background-color: #fff;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.2);
  padding: 20px;
  box-sizing: border-box;
}
.tc-data {
}
.tc-data .el-col {
  border-left: 1px solid #ddd;
  padding: 22px 10px 22px 20px;
}
.tc-data .el-col:first-of-type {
  border-left: none;
}
.tc-data-card-hd {
  position: relative;
  margin-bottom: 3px;
  font-size: 12px;
  color: #888;
  height: 18px;
}
.tc-data-card-hd .fa-question-circle {
  font-style: normal;
  font-weight: 400;
}
.tc-data-card-bd {
  height: 54px;
  line-height: 54px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Hiragina Sans GB",
    "WenQuanYi Micro Hei", "microsoft yahei ui", "microsoft yahei", sans-serif;
}
.tc-data-num {
  font-size: 36px;
}
.tc-data-unit {
  font-size: 12px;
}

.el-col-lg-4-8 {
  width: 20%;
}
</style>
