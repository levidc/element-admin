import defaultSettings from '@/settings'
import i18n from '@/lang'

const title = defaultSettings.title
//  || 'Vue Element Admin'

export default function getPageTitle(key) {
  return i18n.t('navbar.title')
  // const hasKey = i18n.te(`route.${key}`)
  // if (hasKey) {
  //   const pageName = i18n.t(`route.${key}`)
  //   return i18n.t('navbar.title') + '-' + (pageName || 'USP')
  //   // return `${pageName} - ${title}`
  // }
  // return `${title}`
}
