export const checkComplexity = (pass) => {
  const regs = [
    /[0-9]/,
    /[a-z]/,
    /[A-Z]/,
    /[^\w\s]/
  ]
  return regs.reduce((prev, reg) => prev + (reg.test(pass) ? 1 : 0), 0) >= 1
}

export const checkPasswordReg = (rule, data, callback) => {
  const reg = /[\u4e00-\u9fa5]/
  if (reg.test(data)) {
    return callback('密码不能包含中文')
  } else if (!checkComplexity(data)) {
    return callback('密码需至少包含英文大小写、数字、特殊字符中的3种及以上')
  } else if (data.length < 11 || data.length > 40) {
    return callback('密码长度限制为11-40位')
  }
  return callback()
}

export const debounce = function(fn, delay = 2000) {
  let timer = null
  return function() {
    const self = this
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(self, arguments)
    }, delay)
  }
}
