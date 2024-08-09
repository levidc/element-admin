/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
  if (typeof str === 'string' || str instanceof String) {
    return true
  }
  return false
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

export const validBucketName = (rule, data, callback) => {
  // 禁用大写字母及除.-字符， 长度3-63、数字字母开头结尾
  // 以-s3alias结尾、xn--开头
  // 存储桶名称不能与 IP 地址相似
  // const regUrl = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/g
  const regChar = /[`~!@#$%^&*()_\+=<>?:"{}|,\/;'\\[\]·~！@#￥%……&*（）——\+={}|《》？：“”【】、；‘'，。、\sA-Z\u4e00-\u9fa5]/m
  const reg = /^[0-9a-z].*[0-9a-z]$/
  const regIp = /^([0-9]{1,3}\.){3}([0-9]{1,3})$/g
  const prefixSuffix = /^(xn--).*|(-s3alias)$/
  const fullPoint = /\.\./
  if (regChar.test(data)) {
    return callback('名称只能由小写字母、数字、点 (.) 和连字符 (-) 组成。')
  }
  if (data.length < 3 || data.length > 63) {
    return callback('名称长度为3-63位字符')
  }
  if (!reg.test(data)) {
    return callback('名称需以数字字母开头结尾')
    // 禁用大写字母及除.-字符， 长度3-63、数字字母开头结尾
  }
  if (fullPoint.test(data)) {
    return callback('名称不能包含两个相邻的句点')
  }
  if (prefixSuffix.test(data)) {
    return callback("不能以'xn--'开头和以-s3alias结尾")
  }
  if (regIp.test(data)) {
    return callback('存储桶名称不能与 IP 地址相似')
  }
  callback()
}

export const validateMaxIntGB = (int, msg, rule, data, cb) => {
  if (Number(data) > Number(int)) {
    return cb(msg)
  }
  return cb()
}

export const validateObjectKey = (_, data, cb) => {
  if (!data) return cb()
  const reg = /^[0-9a-zA-Z.!\-_*'()]+(\/[0-9a-zA-Z.!\-_*'()]+)*$/
  if (!reg.test(data)) {
    return cb('不符合S3规范')
  } else if (data.length > 1024) {
    return cb('对象key最大长度1024位')
  } else {
    return cb()
  }
}

export const validateMaxInt = (int, msg, rule, data, cb) => {
  if (Number(data) > Number(int)) {
    return cb(msg)
  }
  return cb()
}
