export const getPresetConfig = (use) => {
  const data = [
    {
      use: 'HTGateWay',
      info: [
        {
          title: 'USP',
          logoInImg: require('../assets/login/logoin_left.png')
        }
      ]
    },
    {
      use: 'usp',
      info: [
        {
          title: 'USP',
          logoInImg: require('../assets/login/logo_login.png')
        }
      ]
    }
  ]
  const userData = data.find(item => item.use === use); return userData || data[0]
}
