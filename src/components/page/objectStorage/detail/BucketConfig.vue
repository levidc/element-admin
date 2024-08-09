<template>
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
                <span class="item-descr-tit">空间名称</span>
                <span class="item-descr-txt">b1-1303029310</span>
              </li>
              <li>
                <span class="item-descr-tit">所属地域</span>
                <span class="item-descr-txt">南京 （中国）（ap-nanjing）</span>
              </li>
              <li>
                <span class="item-descr-tit">创建时间</span>
                <span class="item-descr-txt">2020-09-01 17:10:57</span>
              </li>
              <li>
                <span class="item-descr-tit">访问域名</span>
                <span class="item-descr-txt">https://b1-1303029310.cos.ap-nanjing.myqcloud.com </span>
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
            <h3 id="basicInfo">标签管理</h3>
          </div>
          <div class="param-bd">
            <el-table
              ref="multipleTable"
              :data="tableData"
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
</template>

<script>
export default {
  name: 'BucketConfig',
  components: {},
  filters: {},
  data () {
    return {
      tableData: [
        { tagKey: 1, tagValue: 1, isCreate: false, isEdit: false },
        { tagKey: 2, tagValue: 2, isCreate: false, isEdit: false },
        { tagKey: 3, tagValue: 3, isCreate: false, isEdit: false }
      ]
    }
  },
  computed: {},
  mounted: function () {
    console.log(this.$route.query.id)
  },
  destroyed () { },
  methods: {
    // 添加行
    handleAdd () {
      const row = {
        tagKey: '',
        tagValue: '',
        isEdit: true,
        isCreate: true
      }
      this.tableData.push(row)
    }, // 编辑
    doEdit (index, row) {
      console.log(index)
      console.log(row)
      row.isEdit = !row.isEdit
    },
    // 删除行
    doDelete (index, row) {
      console.log(index)
      console.log(row)
      this.tableData.splice(index, 1)
    }
  }
}
</script>
<style scoped>
</style>
