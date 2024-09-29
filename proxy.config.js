module.exports = {
  devServerProxy: {
    '/api/': {
      // target: 'http://114.221.126.214:18308/',
      // target: 'http://10.0.3.235:8310',
      // target: 'http://10.0.2.173:8080', // usp
      target: 'http://10.0.2.151:8080/', // usp
      // target: 'http://10.0.2.151:8080/', //noc
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    }
  }
}
