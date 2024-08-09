<template>
  <div id="headerTemplate">
    <div :class="[classObject,'header-left']">
      <span style="margin-left: 18px;">USP</span>
      <!-- <img src="../assets/login/logoin_left.png" style="width: 150px;height: 24px;"> -->
      <i slot="reference" class="fa fa-question-circle" style="visibility:hidden" />
    </div>
    <div
      v-if="$store.state.isCollapse"
      class="showCollapseLogo"
    >
      <!-- <div class="collapseLogo" /> -->
    </div>
    <div class="header-right" :style="{marginLeft:$store.state.isCollapse?'18px':''}">
      <i
        :class="[$store.state.isCollapse ? 'el-icon-s-fold' : 'el-icon-s-unfold']"
        style="font-size:25px;"
        @click="toggles()"
      />
      <TabsView />
      <div class="rightMenu">
        <!-- <el-tooltip content="版本信息">
          <li class="header-img" @click="getVersion()"><i class="el-icon-info" /></li>
        </el-tooltip> -->
        <el-dropdown @command="handleCommand">
          <div
            id="login-user"
            class="el-dropdown-link"
          >
            <i class="el-icon-user" />
            <span
              id="currentAccountName"
              :title="$ts('header.user')"
            >{{ currnentAccount }}</span>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="two"><i class="el-icon-switch-button" />{{ $ts('header.user.logout') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

    </div>
    <el-dialog
      :title="$ts('header.update.pwd')"
      :visible.sync="updatePwdDialog"
      width="600px"
      @open="dialogOpen('tableFocus')"
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="userRule"
        size="mini"
        label-width="100px"
        style="padding:0 5%"
      >
        <el-form-item
          :label="$ts('header.pwd.old')"
          prop="oldP"
        >
          <el-input
            ref="tableFocus"
            v-model="userForm.oldP"
            type="password"
            clearable
          />
        </el-form-item>
        <el-form-item
          :label="$ts('header.pwd.new')"
          prop="pwd"
        >
          <el-input
            v-model="userForm.pwd"
            type="password"
            clearable
          />
        </el-form-item>
        <el-form-item
          :label="$ts('user.confirmPwd')"
          prop="confirmPwd"
        >
          <el-input
            v-model="userForm.confirmPwd"
            type="password"
            clearable
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="updatePwd('userForm')"
        >{{ $ts('button.confirm') }}</el-button>
        <el-button @click="updatePwdDialog = false">{{ $ts('button.cancel') }}</el-button>

      </div>
    </el-dialog>
    <el-dialog
      :title="$ts('header.version')"
      :visible.sync="versionDialog"
      width="600px"
    >
      <img
        :src="logoImg"
        width="200px"
        height=""
        class="version_img"
      >
      <el-form
        :model="vform"
        class="version_form"
        size="mini"
        label-width="180px"
        style="padding:0 5%"
      >

        <el-form-item :label="$ts('header.software')">
          <span class="version_input">{{ vform.name }}</span>
        </el-form-item>

        <el-form-item :label="$ts('header.version')">
          <span class="version_input">{{ 'V' + vform.version }}</span>
        </el-form-item>
        <!-- <el-form-item :label="$ts('header.time')">
          <span class="version_input">{{ vform.time }}</span>
        </el-form-item> -->
        <el-form-item :label="$ts('header.company')">
          <span class="version_input">{{ vform.company }}</span>
        </el-form-item>
        <!-- <el-form-item :label="$ts('header.email')">
          <span class="version_input">{{ vform.email }}</span>
        </el-form-item>
        <el-form-item :label="$ts('header.tel')">
          <span class="version_input">{{ vform.tel }}</span>
        </el-form-item> -->
        <!-- <el-form-item v-show="fixDiv" :label="$ts('header.fixbug')">
          <el-collapse v-model="activeNames" class="version_input mt_m10" @change="handleChange">
            <el-collapse-item :title="$ts('header.detail')" name="1">
              <div v-for="(item, index) in fixList" :key="index">{{ index + 1 }}:{{ item }}</div>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
        <el-form-item v-show="newDiv" :label="$ts('header.newisu')">
          <el-collapse v-model="activeNames" class="version_input mt_m10" @change="handleChange">
            <el-collapse-item :title="$ts('header.detail')" name="2">
              <div v-for="(item, index) in newList" :key="index">{{ index + 1 }}:{{ item }}</div>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
        <el-form-item v-show="bugDiv" :label="$ts('header.info')">
          <el-collapse v-model="activeNames" class="version_input" @change="handleChange">
            <el-collapse-item :title="$ts('header.detail')" name="3">
              <div v-for="(item, index) in bugList" :key="index">{{ index + 1 }}:{{ item }}</div>
            </el-collapse-item>
          </el-collapse>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="versionDialog = false;">{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import TabsView from '@/components/publicComponent/TabsView'
import { getSystemInfo } from '@/api/dashboard'
export default {
  name: 'HeaderInner',
  components: { TabsView },
  data () {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$ts('please.enter.pwd')))
      } else {
        if (this.userForm.confirmPwd !== '') {
          this.$refs.userForm.validateField('confirmPwd')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$ts('please.enter.pwd.again')))
      } else if (value !== this.userForm.pwd) {
        callback(new Error(this.$ts('pwd.confirm.error')))
      } else {
        callback()
      }
    }
    return {
      logoImg: '',
      updatePwdDialog: false,
      versionDialog: false,
      isCollapse: true,
      fixDiv: false,
      newDiv: false,
      bugDiv: false,
      toggle: false,
      fixList: [],
      newList: [],
      bugList: [],
      formLabelWidth: '100px',
      userForm: {
        oldP: '',
        pwd: '',
        confirmPwd: ''
      },
      vform: {
        version: '',
        time: '',
        fixbug: '',
        newisu: '',
        company: '',
        tel: '',
        email: ''
      },
      lang: localStorage.getItem('lang') || 'zh-CN',
      activeNames: ['1'],
      userRule: {
        oldP: [
          {
            required: true,
            message: this.$ts('header.rule.pwd.old'),
            trigger: 'blur'
          }
        ],
        pwd: [
          {
            required: true,
            message: this.$ts('header.rule.pwd.new'),
            trigger: 'blur'
          },
          { validator: validatePass, trigger: 'blur' }
        ],
        confirmPwd: [
          {
            required: true,
            message: this.$ts('please.confirm.pwd'),
            trigger: 'blur'
          },
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    currnentAccount () {
      const usr = this.$store.state.user
      return usr && usr.name || ''
    },
    classObject: function () {
      return {
        'hideLogo': this.$store.state.isCollapse
      }
    },
    getLogoImg () {
      return JSON.parse(sessionStorage.getItem('logoInfo')) == null ? this.$store.state.logoInfo.logoInImg : JSON.parse(sessionStorage.getItem('logoInfo')).logoInImg
    }
  },
  watch: {
    // 右上角判断用户信息清除 自动退出登录
    '$store.state.user' (val) {
      // 判断存在用户信息、否则进入登录页面、在route 钩子中每次赋值user的操作
      if (!val) {
        this.$router.push({ path: '/login' })
        localStorage.removeItem('to')
      }
    }
  },
  created () {

  },
  mounted () {
    window.onresize = () => {
      if (window.innerWidth < 1200) {
        this.$store.state.isCollapse = true
      } else {
        this.$store.state.isCollapse = false
      }
    }
  },
  methods: {
    jumpAlarm (level) {
      this.$router.push({ name: 'Alert', query: { level }})
    },
    toggles () {
      this.$store.state.isCollapse = !this.$store.state.isCollapse
    },
    dialogOpen (e) {
      this.$nextTick(function () {
        this.$refs[e].$el.querySelector('input').focus()
      })
    },
    handleCommand (command) {
      if (command == 'one') {
        this.resetForm('userForm')
        this.updatePwdDialog = true
      } else {
        //
        if (String(this.$store.state.isEip) === 'true') {
          this.$store.commit('eipLogout')
        } else {
          this.logout()
        }
      }
    },
    handleLanguage (command) {
      this.lang = command
      localStorage.setItem('lang', this.lang)
      this.$i18n.locale = this.lang
      window.history.go(0)
    },
    resetForm (formName) {
      if (this.$refs[formName] != undefined) {
        this.$refs[formName].resetFields()
      } else {
        setTimeout(() => {
          this.userForm.oldP = ''
        }, 300)
      }
    },
    updatePwd (formName) {
      // var vm = this
      // this.$refs[formName].validate(valid => {
      //   if (valid) {
      //     const loading = this.$loading(this.loadingOption)
      //     ({
      //       url: 'updatePassword',
      //       method: 'PUT',
      //       data: {
      //         oldPassword: vm.userForm.oldP,
      //         newPassword: vm.userForm.pwd,
      //         accountName: vm.$store.state.user.name,
      //         version: 'v1',
      //         accountId: this.$store.state.user.accountId
      //       }
      //     })
      //       .then(function (response) {
      //         loading.close()
      //         vm.updatePwdDialog = false
      //       })
      //       .catch(function (response) {
      //         loading.close()
      //       })
      //   } else {
      //     return false
      //   }
      // })
    },
    getVersion () {
      getSystemInfo()
        .then(res => {
          this.vform.company = res.corporation
          this.vform.version = res.version.replace(/\"/g, '')
          this.vform.name = res.name
          // this.vform.time = '2022-07-15' || res.timeStamp.split('_')[0]
          // this.vform.email = res.email
          // this.vform.tel = res.tel
          // if (res.knownIssuesStringList.length > 0) {
          //   this.bugList = res.knownIssuesStringList
          //   /* this.bugDiv=true;*/
          // }
          // if (res.fixedIssuesStringList.length > 0) {
          //   this.fixList = res.fixedIssuesStringList
          //   this.fixDiv = true
          // }
          // if (res.newFeaturesStringList.length > 0) {
          //   this.newList = res.newFeaturesStringList
          //   this.newDiv = true
          // }
          this.logoImg = require('@/assets/components/logo-white.png')
          const image = new Image()
          image.src = this.logoImg
          image.onload = () => {
            this.versionDialog = true
          }
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    handleChange (val) { },
    logout () {
      this.$store.dispatch('logout')
    }
  }
}
</script>
<style lang="scss" scoped>
#headerTemplate {
  display: flex;
  // justify-content: space-between;
  .header-right {
    overflow: hidden;
    flex: 1 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tags-view-container {
      min-width: 200px;
      max-width: calc(100% - 220px);
    }
  }
}

::v-deep .el-collapse-item .el-collapse-item__content {
  background-color: #37464e !important;
}

.header-left {
  width: 200px;
  height: 50px;
  float: left;
  display: flex;
  justify-content: center;
  align-items: center;
  // margin-right: 29px;
  text-align: center;
  font-size: 19px;
  letter-spacing: 1px;
  font-weight: bold;
}
.hideLogo {
  display: none;
}
.showCollapseLogo {
  // float: left;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 10px 0 -10px;
  .collapseLogo {
    width: 30px;
    height: 20px;
    background: url("../assets/dashboard/dos.png") 30px 0;
  }
}

.header-right {
  cursor: pointer;
}

.header-img i {
  font-size: 20px;
  margin: 5px;
}

#login-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  // border: 1px solid #dce5ee;
  line-height: 32px;
  padding-right: 10px;
  &:hover {
    // border-color: #3095ff;
    // color: #3095ff;
    background-size: 18px 18px;
  }

  i {
    font-size: 14px;
    color: #d3d6d8;
    margin: 0 0 0 5px;
  }
}

#currentAccountName {
  font-size: 14px;
  color: #ff8746;
  padding-left: 8px;
}

.el-dropdown-menu__item {
  line-height: 32px;
  font-size: 12px;
  white-space: nowrap;
}

.el-collapse-item__arrow {
  margin-right: 420px !important;
  line-height: 40px !important;
}

.el-collapse-item__header {
  border-bottom: 0px !important;
  line-height: 0px !important;
}

.version_img {
  margin: -50px 0 20px 180px;
}

.version_input {
  /*   display: inline-block; */
  margin-left: 10px;
}

.el-collapse {
  border-top: none !important;
  border-bottom: none !important;
}
.rightMenu {
  display: flex;
  align-items: center;
}
</style>
