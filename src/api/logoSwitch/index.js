export const getLoginInfoConfig = async() => {
  const res = {
    code: 200,
    message: undefined,
    data: {
      use: 'usp',
      info: [
        {
          title: 'USP',
          logoInImg: require('../../assets/login/logoin_left.png')
        }
      ]
    }
  }
  // console.log('api==', res)
  return res
}

