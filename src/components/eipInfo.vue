<template>
  <div
    v-show="!loading"
    class="eipInfo"
  >
    <div>提示</div>
    <div style="color:#fff">请联系管理员申请权限!</div>
  </div>
</template>
<script>
import { eipLogin } from '@/api/dashboard'
import Cookies from 'js-cookie'
export default {
  data () {
    return {
      loading: true,
      timer: null
    }
  },
  mounted () {
    if (this.$route.query.noAuth) {
      this.loading = false
      this.judgeLogout()
      return
    }
    // 同步自动登录
    // add
    if (this.$route.params.autoLogin) {
      // toDo login
      window.location.reload()
    }
    this.tryLogin()
  },
  destroyed () {
    clearInterval(this.timer)
  },
  methods: {
    tryLogin () {
      this.loading = true
      const loading = this.$loading()
      eipLogin().then(res => {
        if (res.code === '200') {
          this.$store.commit('SET_TOKEN', res.data.accessToken)
          this.$store.commit('SET_EXPIRE_TOKEN', res.data.refreshToken)
          this.$store.dispatch('login', {
            name: res.data.username || 'NaN'
          }).then(() => {
            this.$store.commit('SET_ISEIP', true)
            delete window.firstJumpTo
            localStorage.removeItem('to')
            this.$router.push({ name: 'blank' })
            setTimeout(() => {
              this.loading = false
            }, 200)
          }).catch((err) => {
            this.loading = false
            this.judgeLogout()
            console.log('无权限访问不跳转')
          })
        }
      }).catch(err => {
        // auth-error 不跳转
        // noJump
        // console.log();
        this.loading = false
        this.judgeLogout()
      }).finally(() => {
        loading.close()
      })
    },
    judgeLogout () {
      sessionStorage.setItem('eipToken', Cookies.get('sensorsdata2015jssdkcross'))
      this.timer = setInterval(() => {
        const preToken = sessionStorage.getItem('eipToken')
        const curToken = decodeURI(Cookies.get('sensorsdata2015jssdkcross'))
        if (preToken && preToken !== 'undefined' && preToken !== curToken) {
          this.$route.query.noAuth && this.$router.push({ name: 'eipInfo', query: {} })
          this.tryLogin()
        }
      }, 3000)
    }
  }
}
</script>
<style lang="scss" scoped>
.eipInfo {
  margin: 50px auto;
  width: 300px;
  height: 120px;
  background-color: #2b3d44;
  color: #b6c4cb;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  text-align: center;
}
</style>
