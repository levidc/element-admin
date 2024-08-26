<template>
  <div
    class="roleDetailDiv"
    style="height:100%"
  >
    <el-row>
      <el-col :span="24" class="manage-area-title"><h2>{{ $ts('roleDetail') }}</h2></el-col>
    </el-row>
    <div class="page_content_wrap">
      <el-container>
        <el-main style="margin-right:10px;padding-bottom:0px">
          <el-tabs type="card" class="left_content">
            <el-tab-pane :label="$ts('role.detail.tab.title')" class="tab_title" style="background-color:#fff;">
              <div class="tab_row" style="min-height:67vh">
                <table v-show="!isShow" class="table">
                  <tbody>
                    <tr v-for="item in apis" :class="getTableRowClass(item)">
                      <td v-if="item.name!=null" class="rolesTitle" :rowspan="item.rowNum"><span>{{ $ts(item.name) }}</span></td>
                      <td v-for="(val,index) in item.val">
                        {{ val }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-show="isShow" class="role_default">
                  <div class="even">{{ $ts('role.detail.no.assign') }}</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-main>
        <el-aside
          width="382px"
          style="min-height:71vh;position:relative"
        >
          <div style="padding-bottom:13px;text-align:right;padding-top:12px;">
            <el-button size="small" type="primary" @click="refresh()">{{ $ts('refresh') }}</el-button>
            <el-button size="small" type="primary" @click="back()">{{ $ts('back') }}</el-button>
          </div>
          <div class="right-info">
            <div class="right_title">
              {{ $ts('role.detail') }}
            </div>
            <div class="right_inner">
              <div>
                <span class="proName">{{ $ts('role.name') }}：</span>
                <span v-model="roleName" class="proSize">{{ roleName }}</span>
              </div>
              <div>
                <span class="proName">{{ $ts('role.des') }}：</span>
                <span v-model="description" class="proSize">{{ description }}</span>
              </div>
            </div>
          </div>
        </el-aside>
      </el-container>
    </div>
  </div>
</template>
<script type="text/javascript">
export default {
  name: 'RoleDetail',
  components: {},
  data() {
    return {
      roleName: '',
      description: '',
      isShow: false,
      roleId: '',
      apis: []
    }
  },
  mounted() {
    this.roleId = this.$route.params.id
    this.getInfo()
    console.log(this.$route.path)
  },
  methods: {
    back() {
      this.$router.push({ name: 'Role' })
    },
    refresh() {
      this.getInfo()
    },
    getInfo() {
      var vm = this
      this.$http({
        method: 'get',
        url: 'listRole',
        params: {
          accountId: this.$store.state.user.accountId,
          version: this.$store.state.dosVersion,
          roleIds: vm.roleId
        }
      })
        .then(function(response) {
          $.each(response.data.data, function(i, v) {
            if (v.roleId == vm.roleId) {
              vm.roleName = response.data.data[i].name
              vm.description = response.data.data[i].description
              if ($.isEmptyObject(response.data.data[i].permissions)) {
                vm.isShow = true
              } else {
                let flag = true
                vm.apis = []
                for (const item in response.data.data[i].permissions) {
                  const val = []
                  let rowNum = 0
                  let tempArr = []
                  for (const v in response.data.data[i].permissions[item]) {
                    val.push(
                      response.data.data[i].permissions[item][v].chineseText
                    )
                  }
                  rowNum = Math.ceil(val.length / 6)
                  for (var k = 0; k < rowNum; k++) {
                    tempArr = []
                    for (var j = 0; j < 6; j++) {
                      tempArr.push(val[6 * k + j])
                    }
                    if (k == 0) {
                      vm.apis.push({
                        name: item,
                        cla: flag == true ? 'odd' : 'even',
                        val: tempArr,
                        rowNum: rowNum
                      })
                    } else {
                      vm.apis.push({
                        name: null,
                        cla: flag == true ? 'odd' : 'even',
                        val: tempArr,
                        rowNum: 1
                      })
                    }
                  }
                  flag = !flag
                }
                vm.isShow = false
              }
            }
          })
        })
        .catch(function(response) { })
    },
    getTableRowClass(item) {
      let str = 'table_' + item.cla
      if (item.name != null) {
        str += ' table_part'
      }
      return str
    }
  }
}
</script>

<style type="text/css" scoped>
.content {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  align-items: stretch;
}
.tab_row {
  border-top: none;
  border-bottom: 1px solid #ebf0f4;
  border-left: 1px solid #ebf0f4;
  border-right: 1px solid #ebf0f4;
  padding: 10px;
  padding-top: 20px;
}
.el-tabs--border-card {
  webkit-box-shadow: none;
  box-shadow: none;
}
.right-info {
  border: 1px solid #ebf0f4;
  background-color: #fff;
  padding-right: 20px;
  padding-left: 20px;
  padding-bottom: 20px;
  position: absolute;
  top: 58px;
  bottom: 0px;
  width: 340px;
}
.right_title {
  font-size: 16px;
  height: 46px;
  line-height: 46px;
  border-bottom: 1px solid #ebf0f4;
}
.right_inner div {
  margin-top: 20px;
  font-size: 14px;
  min-height: 20px;
  line-height: 20px;
}
.proName {
  color: #8997a5;
}
.proSize {
  color: #313131;
}
.btn_lightblue {
  width: 54px;
  height: 34px;
  background-color: #3095ff;
  color: #fff;
}
.btn:hover {
  cursor: pointer;
}
.role_default {
  font-size: 14px;
  margin: 20px;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
a {
  text-decoration: none;
  color: inherit;
}
</style>
<style type="text/css">
.roleDetailDiv .el-tabs__header {
  margin-bottom: 0px !important;
}
.roleDetailDiv
  .el-tabs--border-card
  > .el-tabs__header
  .el-tabs__item.is-active {
  color: #313131 !important;
}
.roleDetailDiv .el-tabs__item.is-active {
  color: #313131 !important;
  font-weight: normal !important;
}
.roleDetailDiv .el-tabs__item {
  height: 47px !important;
  width: 104px !important;
  line-height: 48px !important;
  font-size: 16px;
  font-weight: normal !important;
}
.roleDetailDiv .page_info {
  margin-bottom: 15px;
  border-bottom: 1px solid #ebf0f4;
}
.roleDetailDiv .page_info_title {
  font-size: 24px;
  color: #313131;
  height: 31px;
  line-height: 31px;
}
.roleDetailDiv .page_info_detail {
  font-size: 14px;
  color: #8997a5;
  height: 20px;
  line-height: 20px;
  margin-bottom: 10px;
}
.roleDetailDiv .el-tabs__nav {
  background-color: #fff;
}
.table_part {
  border-top: 5px solid #fff !important;
}
.table_odd {
  background-color: #fcfcfc;
}
.table_even {
  background-color: #f8f8f8;
}
.table {
  word-wrap: break-word;
  word-break: break-all;
  width: 100%;
  max-width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
}
.table td {
  padding: 3px;
  line-height: 1.42857143;
  vertical-align: middle;
  color: #8997a5;
  font-size: 14px;
  padding-left: 25px;
}
td.rolesTitle {
  text-align: center;
  color: #313131;
  padding-left: 0;
  width: 110px;
  vertical-align: middle;
  line-height: 29px;
}
.rolesTitle > span {
  margin: 3px;
  border-right: 1px solid #eaeaea;
  display: inline-block;
  width: 100%;
}
</style>
