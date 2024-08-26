import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import i18n from './lang' // internationalization
import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

import VueMessage from '@/components/message'
Vue.use(VueMessage)
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import '@/icons/svg'
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
Vue.directive('access',
  {
    inserted(el, binding) {
      let hasPermission
      let value
      const fun = binding.arg || 'conceal'
      const api = store.state.api || JSON.parse(localStorage.getItem('api') || null)
      if (binding.value.indexOf('||') > -1) {
        // tab等情况需要其中一种权限即可
        value = binding.value.split('||')
        hasPermission = value.some(item => api[item])
      } else {
        value = binding.value.split(';')
        // 特殊情形、需要多个api同时满足权限
        if (value && value.length > 1) {
          hasPermission = value.every(item => api[item])
        } else {
          // 对象属性访问优先级.高于['']
          hasPermission = api[value[0]] || false
        }
      }
      if (!hasPermission) {
        switch (fun) {
          case 'conceal':
            // // tab页添加隐藏、绑在el-tabs 删除dom不对，重新匹配dom
            el.parentNode && el.parentNode.removeChild(el)
            break
          case 'disable':
            if (el.tagName === 'A') {
              el.style['pointerEvents'] = 'none'
            } else {
              el.disabled = true
            }
            break
        }
      }
    }
  })

Vue.directive('router', {
  inserted(el, binding) {
    if (!el.parentNode) return
    if (!window.firstJumpTo && binding.value) window.firstJumpTo = binding.value
  }
})
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false
Vue.prototype.showS3Msg = error => {
  if (error.code === 'XMLParserError') {
    setTimeout(async() => {
      Vue.prototype.$msg({
        type: 'error',
        text: 'token已失效，请重新登录'
      })
      await store.dispatch('user/logout')
      router.push(`/login?redirect=${router.currentRoute.fullPath}`)
    }, 200)
    return
  }
  const statusArr = store.state.statusCode.filter(item => {
    return item.code == error.name
  })
  let text
  if (statusArr && statusArr.length == 1) {
    text = statusArr[0].description_cn
    Vue.prototype.$msg({
      type: 'error',
      text
    })
  } else if (statusArr && statusArr.length > 1) {
    const res = statusArr.filter(item => {
      return item.description == error.message
    })
    text = (res.length && res[0].description_cn) || error.message
  }
  return Vue.prototype.$msg({
    type: 'error',
    text
  })
}
Vue.prototype.thousandthSeparator = (value) => {
  value = value ? value.toString() : ''
  const reg = /\B(?=(\d{3})+(?!\d))/g
  return value.replace(reg, ',')
}
Vue.prototype.checkType = params => {
  return Object.prototype.toString.call(params)
}

Vue.prototype.checkPositiveNum = (range) => (ruel, data, callback) => {
  data = isNaN(Number(data)) ? -1 : Number(data)
  if (data <= 0) {
    return callback('请输入正整数')
  } else if (data > range) {
    return callback('该整数值必须小于或等于' + range)
  } else {
    callback()
  }
}

Vue.prototype.descValidate = (max) => (rule, value, callback) => {
  const len = checkLen(value)
  if (len > max) {
    return callback(new Error(i18n.t('des.rule.left') + `${max}` + i18n.t('name.rule.right') + `${len}`))
  } else {
    callback()
  }
}

Vue.prototype.formatterG = function(row, column) {
  let data
  if (!column) {
    data = row
  } else {
    data = row[column.property]
  }
  return (data / 1024 / 1024 / 1024).toFixed(1)
}

Vue.prototype.nameValidate = (min, max) => (rule, value, callback) => {
  const len = checkLen(value)
  if (min == 0 && len == 0) {
    return callback()
  }
  const isFont = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(value)
  if (!isFont) {
    return callback(new Error(i18n.t('volume.name.rule')))
  }
  if (len > max || len < min) {
    return callback(new Error(i18n.t('name.rule.left') + `${min}-${max}` + i18n.t('name.rule.right') + `${len}`))
  } else {
    callback()
  }
}

Vue.prototype.byteConvertImpl = function(bytes, symbols = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']) {
  if (isNaN(bytes)) {
    return ['', '']
  }
  var exp = Math.floor(Math.log(bytes) / Math.log(2))
  if (exp < 1) {
    exp = 0
  }
  var i = Math.max(Math.min(Math.floor(exp / 10), symbols.length - 1), 0)
  bytes = bytes / Math.pow(2, 10 * i)
  if (bytes.toString().length > bytes.toFixed(2).toString().length) {
    bytes = bytes.toFixed(2)
  }
  return [bytes, symbols[i]]
}

Vue.prototype.byteConvert = function(bytes, symbols = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']) {
  bytes = Number(bytes) > 0 ? Number(bytes) : 0
  return Vue.prototype.byteConvertImpl(bytes, symbols).join(' ')
}
Vue.prototype.getFileType = function(name) {
  if (!name) return ''
  const reg = /\.([0-9a-z]+)(?:[\?#]|$)/i
  const arr = name.match(reg)
  if (arr && arr.length) {
    return arr[1]
  } else {
    return '/'
  }
}

Vue.prototype.formatDate = function(date) {
  if (isNaN(date)) {
    return '/'
  } else {
    date = new Date(date)
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    var d = date.getDate()
    var h = date.getHours()
    var m1 = date.getMinutes()
    var s = date.getSeconds()
    m = m < 10 ? ('0' + m) : m
    h = h < 10 ? ('0' + h) : h
    m1 = m1 < 10 ? ('0' + m1) : m1
    d = d < 10 ? ('0' + d) : d
    s = s < 10 ? ('0' + s) : s
    return y + '/' + m + '/' + d + ' ' + h + ':' + m1 + ':' + s
  }
}

Vue.prototype.timeTrans = function(time, type) {
  let date = new Date(new Date(time).getTime() + 8 * 3600 * 1000)
  date = date.toJSON()
  if (type === 1) {
    date = date.substring(0, 10)
  } else {
    date = date.substring(0, 19).replace('T', ' ')
  }
  return date
}

Vue.prototype.clearSelect = function(context, ref) {
  context.$refs[ref].$refs['TableData'].$refs['dataTable'].clearSelection()
}

Vue.prototype.$ts = function(val) {
  val += ''
  const originVal = val
  val = val.toLowerCase()
  // 小写翻译
  if (val !== i18n.t(val)) {
    return i18n.t(val)
  } else if (originVal !== i18n.t(originVal)) {
    // 驼峰翻译
    return i18n.t(originVal)
  } else {
    // s3翻译
    const s3Msg = store.state.statusCode?.find(item => (item.description && (item.description).toLowerCase().indexOf(val.toLowerCase().substr(0, 50)) > -1))
    return (s3Msg && s3Msg.description_cn) || val
  }
}
var checkLen = (value) => {
  var len = 0
  var l
  if (value) {
    for (var i = 0; i < value.length; i++) {
      l = value.charCodeAt(i)
      if (l >= 0 && l <= 128) {
        len += 1
      } else {
        len += 2
      }
    }
  }
  return len
}

Vue.prototype.filterSearch = function(tableData, searchVal, columns) {
  // sColumns contain slot ,cColumns is common
  const search = searchVal.toLowerCase()
  if (search) {
    return tableData.filter(data => {
      return columns.some(key => {
        if (!key.turnedFuciton || key.turnedFuciton == 'normal') {
          return String(eval('data.' + key.col)).toLowerCase().indexOf(search) > -1
        } else if (key.turnedFuciton == 'translation') {
          return i18n.t(String(eval('data.' + key.col))).indexOf(search) > -1
        } else if (!key.col) {
          console.log(key.turnedFuciton(data))
          return key.turnedFuciton(data).toLowerCase().indexOf(search) > -1
        } else {
          return key.turnedFuciton(eval('data.' + key.col)).toLowerCase().indexOf(search) > -1
        }
      })
    })
  }
  return tableData
}
Vue.prototype.filterTarget = function(all, target, key) {
  if (!Array.isArray(all) || !Array.isArray(target)) return
  return all.filter(item => {
    return target.some(i => {
      return item[key] == i[key]
    })
  })
}

Vue.prototype.filterDiff = function(all, target, key) {
  if (!Array.isArray(all) || !Array.isArray(target)) return
  return all.filter(item => {
    return target.every(i => {
      return item[key] !== i[key]
    })
  })
}

Vue.prototype.precisionNum = function(num) {
  if (!num) return
  const arr = num.toString().split('.')
  const int = arr[0]; const decimal = arr[1]
  const handleInt = (num) => {
    return num.split('').reverse().reduceRight((pre, cur, i) => {
      return pre + (i % 3 ? cur : `${cur},`)
    }, '').replace(/^,|,$/g, '')
  }
  const handleDemi = (num) => {
    return num.split('').reduce((pre, cur, i) => {
      return pre + ((i + 1) % 3 ? cur : `${cur},`)
    }, '.').replace(/^,|,$/g, '')
  }
  return arr.length > 1 ? handleInt(int) + handleDemi(decimal) : handleInt(int)
}

Vue.prototype.sortMethod = function(prop, order, props) {
  return function(obj1, obj2) {
    if (prop == '' || order == '') {
      return 0
    }
    const propArr = prop && prop.split('.')
    let val1
    let val2
    if (propArr && propArr.length > 1) {
      val1 = obj1[propArr[0]] && obj1[propArr[0]][propArr[1]]
      val2 = obj2[propArr[0]] && obj2[propArr[0]][propArr[1]]
    } else {
      val1 = obj1[prop] || obj1[props]
      val2 = obj2[prop] || obj2[props]
    }
    val1 = val1 || ''
    val2 = val2 || ''

    if (Array.isArray(val1) && Array.isArray(val2)) {
      val1 = val1.length
      val2 = val2.length
    } else if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
      val1 = Number(val1)
      val2 = Number(val2)
    }
    if (val1 < val2) {
      if (order == 'ascending') {
        return -1
      } else {
        return 1
      }
    } else if (val1 > val2) {
      if (order == 'ascending') {
        return 1
      } else {
        return -1
      }
    } else {
      return 0
    }
  }
}

String.prototype.getQuery = function(name) {
  var reg = new RegExp('(\\{|(,\\s*))' + name + '=\\S*(,|\\})')
  var r = this.substr(this.indexOf('\{')).match(reg)
  if (!r) return null
  var m = r[0].substring(r[0].indexOf('=') + 2)
  m = m.substr(0, m.length - 2)
  if (m != null) return m; return null
}
Vue.prototype.preciseDemi = (value) => {
  value = String(value)
  const reg = /\B(?=(\d{3})+(?!\d))/g
  return value.replace(reg, ',')
}

Vue.prototype.getTimeNotTable = function(e) {
  if (e * 1 == 0) {
    return ''
  } else {
    var data = e
    var now = new Date(data * 1)
    var year = now.getFullYear()
    var month = now.getMonth() + 1
    var date = now.getDate()
    var hours
    var minutes
    if (month < 10) {
      month = '0' + month
    }
    if (date < 10) {
      date = '0' + date
    }
    hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours()
    minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
    return year + '/' + month + '/' + date + ' ' + hours + ':' + minutes
  }
}

Vue.prototype.bigNumberTransform = (value) => {
  value = value || 0
  const newValue = ['', '', '']
  let fr = 1000
  let num = 3
  let text1 = ''
  let fm = 1
  while (value / fr >= 1) {
    fr *= 10
    num += 1
  }
  // 最大16位、超出16位、按兆单位处理、17位亿亿
  if (num <= 4) { // 千
    newValue[0] = parseFloat(value / 1000).toFixed(1) + ''
    newValue[1] = '千'
  } else if (num <= 8) { // 万
    text1 = parseInt(num - 4) / 3 > 1 ? '千万' : '万'
    fm = text1 === '万' ? 10000 : 10000000
    if (value % fm === 0) {
      newValue[0] = parseInt(value / fm) + ''
    } else {
      newValue[0] = parseFloat(value / fm).toFixed(1) + ''
    }
    newValue[1] = text1
  } else if (num <= 16) { // 亿
    text1 = (num - 8) / 3 > 1 ? '千亿' : '亿'
    text1 = (num - 8) / 4 > 1 ? '万亿' : text1
    text1 = (num - 8) / 7 > 1 ? '千万亿' : text1
    fm = 1
    if (text1 === '亿') {
      fm = 100000000
    } else if (text1 === '千亿') {
      fm = 100000000000
    } else if (text1 === '万亿') {
      fm = 1000000000000
    } else if (text1 === '千万亿') {
      fm = 1000000000000000
    }
    if (value % fm === 0) {
      newValue[0] = parseInt(value / fm) + ''
    } else {
      newValue[0] = parseFloat(value / fm).toFixed(1) + ''
    }
    newValue[1] = text1
  }
  if (value < 1000) {
    newValue[0] = value + ''
    newValue[1] = ''
  }
  return newValue.join('')
}

Vue.prototype.stringToBoolean = (string) => {
  string = string.toString()
  switch (string.toLowerCase().trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true
    case 'false':
    case 'no':
    case '0':
    case null:
      return false
    default:
      return Boolean(string)
  }
}

Vue.prototype.XMLToJSON = (XMLData = '') => {
  let ind = 0
  const obj = {}
  const XMLParse = (obj = {}) => {
    let value = ''
    let tag = ''
    // 遍历xml字符串
    while (ind < XMLData.length) {
      // 正在遍历标签内的值，记录标签名
      if (XMLData[ind] === '<' || (tag && XMLData[ind] !== '>')) {
        if (XMLData[ind] === '<') ind++
        tag += XMLData[ind]
      } else if (XMLData[ind] === '>') {
        // 获取到完整的标签名
        // 通过rowNum属性来判断是否为数组，有rowNum属性的即为数组
        const rowNum = tag.split(' ')[1] || ''
        tag = tag.split(' ')[0]
        if (tag[0] !== '/') {
          ind++
          // 同一层级当前标签为出现过且不包含rowNum属性，将其处理为对象
          if (obj[tag] === undefined && !rowNum.includes('rowNum')) {
            obj[tag] = {}
            const val = XMLParse(obj[tag], [tag])
            if (val) obj[tag] = val
            if (JSON.stringify(obj[tag]) === '{}') {
              obj[tag] = ''
            }
          } else {
            // 同一层级下拥有多个同名标签或包含rowNum属性，将其处理为数组
            if (obj[tag] === undefined) obj[tag] = [{}]
            else if (Array.isArray(obj[tag])) obj[tag].push({})
            else obj[tag] = [obj[tag], {}]
            const objInd = obj[tag].length - 1
            // 递归处理标签内的嵌套标签或提取值
            const val = XMLParse(obj[tag][objInd])
            // 有标签值的直接赋值，如：<a>111</a> -> {a:111}
            if (val) obj[tag][objInd] = val
            // 无子节点的赋空值
            if (JSON.stringify(obj[tag][objInd]) === '{}') {
              obj[tag][objInd] = ''
            }
          }
        } else {
          // 闭合标签，结束递归返回获取到的值
          return value
        }
        tag = ''
        value = ''
      } else {
        value += XMLData[ind]
      }
      ind++
    }
  }
  XMLParse(obj)
  return obj['?xml']
}

Vue.prototype.json2xml = (o, tab) => {
  var toXml = function(v, name, ind) {
    var xml = ''
    if (v instanceof Array) {
      for (var i = 0, n = v.length; i < n; i++) { xml += ind + toXml(v[i], name, ind + '\t') + '\n' }
    } else if (typeof (v) === 'object') {
      var hasChild = false
      xml += ind + '<' + name
      for (var m in v) {
        if (m.charAt(0) == '@') { xml += ' ' + m.substr(1) + '="' + v[m].toString() + '"' } else { hasChild = true }
      }
      xml += hasChild ? '>' : '/>'
      if (hasChild) {
        for (var m in v) {
          if (m == '#text') { xml += v[m] } else if (m == '#cdata') { xml += '<![CDATA[' + v[m] + ']]>' } else if (m.charAt(0) != '@') { xml += toXml(v[m], m, ind + '\t') }
        }
        xml += (xml.charAt(xml.length - 1) == '\n' ? ind : '') + '</' + name + '>'
      }
    } else {
      xml += ind + '<' + name + '>' + v.toString() + '</' + name + '>'
    }
    return xml
  }; var xml = ''
  for (var m in o) { xml += toXml(o[m], m, '') }
  return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, '')
}

Vue.prototype.isJSON = (str) => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  } else {
    return false
  }
}

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
