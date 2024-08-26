<template>
  <div
    id="login_container"
    @keyup.13="loginIn()"
  >
    <div id="login_head_wrap">
      <div id="login_head">
        <img src="../../assets/images/logo.png" width="290px" alt="">
        <!-- <span class="login_lan" @click="changeLangEvent">{{ $ts('language') }}</span> -->
        <lang-select class="set-language" />
      </div>
    </div>
    <div id="login_content_wrap">
      <div class="login_pic" />
      <div id="login_content">
        <h2 class="login_title title">
          <h2 style="display:inline-block;height:25px;width:auto">USP</h2>
        </h2>
        <el-form ref="form" :model="loginForm" style="padding:50px 80px" :rules="rules">
          <!-- :label="$ts('username')" -->
          <el-form-item prop="username">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input ref="username" v-model="loginForm.username" class="login_border" :placeholder="$ts('validate.username')" clearable tabindex="1" />
          </el-form-item>
          <el-tooltip v-model="capsTooltip" :content="$ts('login.tipCapLock')" placement="right" manual>
            <el-form-item prop="password">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                :placeholder="$ts('login.password')"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup.native="checkCapslock"
                @blur="capsTooltip = false"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
              </span>
            </el-form-item>
          </el-tooltip>
          <button v-loading="loading" type="button" class="btn btn_lightblue btn-login" @click="loginIn()">
            {{ $ts('login.logIn') }}
          </button>
        </el-form>
      </div>
    </div>

    <p id="login_foot_wrap" class="page-footer">
      {{ getTime }}
    </p>
  </div>
</template>
<!-- <script type="text/javascript">

</script> -->
<script  type="text/javascript">
import LangSelect from '@/components/LangSelect'
import logo from '@/assets/images/logo_title.png'
import eventBus from '@/utils/eventBus'
import { login } from '@/api/dashboard'
import { mapState } from 'vuex'
export default {
  name: 'Login',
  components: { LangSelect },
  data() {
    return {
      redirect: undefined,
      otherQuery: {},
      passwordType: 'password',
      capsTooltip: false,
      logo: logo,
      arr: '',
      loading: false,
      loginForm: {
        username: '',
        password: 'superAdmin123!'
      },
      msg: '',
      lang: localStorage.getItem('lang') || 'zh-CN',
      yearTime: '',
      title: '',
      login_title: require('@/assets/images/logo_title.png'),
      rules: {
        username: {
          required: true, message: this.$ts('user.name.tool.tip'), trigger: ['blur', 'change']
        },
        password: {
          required: true, message: this.$ts('password.tool.tip'), trigger: ['blur', 'change']
        }
      }
    }
  },
  computed: {
    ...mapState(['user', 'port', 'api']),
    // copyRight信息
    getTime() {
      const date = new Date()
      return `${date.getFullYear()}` + ' © ' + 'PengYun Network'
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    localStorage.setItem('api', null)
    eventBus.$emit('cancelTimer')
    const cacheName = localStorage.getItem('user')
    this.loginForm.username = cacheName || ''
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroy() {
    eventBus.$off('cancelTimer')
  },

  methods: {
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    changeLangEvent() {
      this.lang = this.lang === 'zh-CN' ? 'en-US' : 'zh-CN'
      this.$i18n.locale = this.lang
      sessionStorage.setItem('lang', this.lang)
    },
    loginIn() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$msg({
                type: 'success',
                text: '登录成功',
                duration: 1000
              })
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch((err) => {
              this.$msg({
                type: 'error',
                text: this.$ts(err)
                // duration: 1000
              })
              console.log(err, '123')
              this.loading = false
            })
          return
          login({
            userName: this.username,
            password: this.password
          })
            .then(res => {
              if (res.code === '200') {
                const user = {
                  name: this.username
                }
                // refreshToken
                // 有accessToken和refreshToken
                //
                // 登录验证成功、保存用户信息、权限在其中、渲染显示菜单
                this.$store.commit('SET_TOKEN', res.data.accessToken)
                this.$store.commit('SET_EXPIRE_TOKEN', res.data.refreshToken)
                this.$store.dispatch('login', user).then((r) => {
                  // 确保getEndPoint执行创建s3jdk成功、getPermisson 渲染权限菜单成功
                  this.$ts({
                    type: 'success',
                    text: '登录成功',
                    duration: 1000
                  })
                  this.loading = false
                  delete window.firstJumpTo
                  this.$router.push({ name: 'blank' })
                }).catch((err) => {
                  console.log(err, 'err')
                  this.loading = false
                })
              } else {
                this.$ts({
                  type: 'error',
                  text: this.$ts(res.msg)
                })
                this.msg = this.$ts(res.msg)
                this.loading = false
                setTimeout(function() {
                  this.msg = ''
                }, 3000)
              }
            })
            .catch(error => {
              console.error(error)
              this.loading = false
              this.password = ''
            })
        }
      })
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;
$cursor: #fff;
#login_container {
  height: 100vh;
  min-height: 780px;
  background: url('~@/assets/images/login_bg.png') no-repeat;
  background-size: 100% 100%;
  ::v-deep .el-input {
    display: inline-block;
    // height: 47px;
    // width: 85%;
    .el-input__inner{
      padding-left: 30px;
      &[type^=password]{
        padding-right: 30px;
      }
    }
  }
}

#login_head_wrap {
  height: 60px;
  width: 100%;
  background: rgba(0, 0, 0, 0.15);
}

#login_head {
  height: 60px;
  width: 1200px;
  margin: 0 auto;
  position: relative;
}

#login_head img {
  margin-top: 15px;
}

#login_content_wrap {
  width: 1080px;
  height: 550px;
  border: 5px solid rgba(256, 256, 256, 0.08);
  border-radius: 8px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -545px;
  margin-top: -280px;
  display: flex;
}

#login_content {
  width: 480px;
  height: 100%;
  border-radius: 0px 4px 4px 0px;
}

.login_pic {
  width: 600px;
  height: 100%;
  background: url('~@/assets/images/left_pic.png') no-repeat;
}

#login_foot_wrap {
  position: fixed;
  padding: 0;
  margin: 0;
  border: none;
  color: #fff;
  font-size: 12px;
  text-align: center;
  height: 36px;
  line-height: 36px;
  width: 100%;
  background: rgba(0, 0, 0, 0.15);
  bottom: 0;
}

.login_title {
  font-weight: normal;
  color: #d3d6d8;
  letter-spacing: 0.03em;
  text-align: center;
  margin: 125px auto 0;
  font-size: 22px;
}

.btn-login {
  display: block;
  width: 100%;
  height: 35px;
  line-height: 35px;
  font-size: 16px;
  border-radius: 2px;
  cursor: pointer;
}

.login_lan {
  color: #fff;
  float: right;
  line-height: 60px;
  cursor: pointer;
}

.svg-container {
    // padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    position: absolute;
    left: 5px;
    z-index: 999;
    // display: inline-block;
  }
.show-pwd {
  position: absolute;
  right: 10px;
  top: 0;
  font-size: 16px;
  color: $dark_gray;
  cursor: pointer;
  user-select: none;
}
.set-language {
  color: #fff;
  position: absolute;
  top: 15px;
  font-size: 18px;
  right: 0px;
  cursor: pointer;
}

</style>
