<template>
  <transition name="mei-message-fade">
    <div
      v-if="show"
      :class="['mei-message', type? `mei-message-${ type }` : '']"
    >
      <div
        v-if="type=='error'"
        class="mei-message-icon"
      >
        <div class="icon-error" />
        <span class="icon-title">{{ getMessageText("ERROR") }}</span>
      </div>
      <div
        v-if="type=='success'"
        class="mei-message-icon"
      >
        <div class="icon-success" />
        <span class="icon-title">{{ getMessageText("SUCCESS") }}</span>
      </div>
      <div
        v-if="type=='info'"
        class="mei-message-icon"
      >
        <div class="icon-info" />
        <span class="icon-title">{{ getMessageText("INFO") }}</span>
      </div>
      <div
        v-if="type=='warn'"
        class="mei-message-icon"
      >
        <div class="icon-warn" />
        <p class="icon-title">{{ getMessageText("WARNING") }}</p>
      </div>
      <div class="mei-message-con">{{ text }}</div>
    </div>
  </transition>
</template>

<script type="text/babel">
const typeMap = {
  success: 'success',
  info: 'info',
  warn: 'warn',
  error: 'error'
}
export default {
  data() {
    return {
      show: false,
      text: '',
      type: ''
    }
  },
  computed: {
    iconClass() {
      return this.type ? `mei-message-icon mei-icon-${typeMap[this.type]}` : ''
    }
  },
  methods: {
    getMessageText(status) {
      const infoObj = {
        WARNING: '警告',
        SUCCESS: '成功',
        ERROR: '错误',
        INFO: '信息'
      }
      if (localStorage.getItem('lang') == 'en-US') {
        return status
      } else {
        return infoObj[status]
      }
    }
  }
}
</script>
<style scoped>
.mei-message {
  /* transform: translateX(-50%); */
  background-color: #ffffff;
  transition: opacity 0.3s, transform 0.4s;
  color: #313131;
  border: 1px solid #ebf0f4;
  box-shadow: 0px 0px 6px 2px rgba(195, 206, 218, 0.2);
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  padding: 14px;
  position: fixed;
  right: 0px;
  z-index: 99999;
  width: 285px;
  top: 60px;
}
.icon-warn {
  background-position: -34px 0px;
  width: 24px;
  height: 24px;
  display: inline-block;
}
.icon-success {
  background-position: 0px 0px;
  width: 24px;
  height: 24px;
  display: inline-block;
}
.icon-error {
  background-position: -68px 0px;
  width: 24px;
  height: 24px;
  display: inline-block;
}
.icon-info {
  background-position: -102px 0px;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.icon-title {
  font-size: 16px;
  display: inline-block;
  padding-left: 12px;
  position: relative;
  top: -5px;
}

.mei-message-icon {
  height: 24px;
  line-height: 24px;
  div{
    background: url('../../../assets//components/message_icon.png') no-repeat;
  }
}
.mei-message-con {
  display: inline-block;
  margin-left: 40px;
  font-size: 12px;
  width: 250px;
  word-wrap: break-word;
  padding-top: 5px;
}
.mei-message-fade-enter-active {
  transition: all 0.3s linear;
}
.mei-message-fade-leave-active {
  transition: all 0.3s linear;
}
.mei-message-fade-enter,
.mei-message-fade-leave-to {
  opacity: 0;
}
</style>
