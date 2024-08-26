import Vue from 'vue'
import messageVue from './message.vue'
const defaults = {
  show: false,
  text: '',
  duration: '3000',
  type: ''
}
const messageVueConstructor = Vue.extend(messageVue)
messageVueConstructor.prototype.close = function() {
  var vm = this
  this.$on('after-leave', _ => {
    if (vm.$el && vm.$el.parentNode) {
      vm.$el.parentNode.removeChild(vm.$el)
    }
    this.$destroy()
  })
  vm.show = false
}
var singleInstance = 0
const instanceList = []
const messageBox = (options = {}) => {
  if (Vue.prototype.$isServer) return
  options = Object.assign({}, defaults, options)
  const parent = document.body
  const instance = new messageVueConstructor({
    el: document.createElement('div'),
    data: options
  })
  instanceList.push(instance)
  singleInstance += 1
  parent.appendChild(instance.$el)
  Vue.nextTick(() => {
    instance.show = true
    if (singleInstance !== 1) {
      instanceList[0].close()
      instanceList.shift()
    }
    setTimeout(function() {
      instance.close()
      instanceList.pop()
      singleInstance = 0
    }, options.duration)
  })

  return instance
}

export default messageBox
