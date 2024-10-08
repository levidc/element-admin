// translate router.meta.title, be used in breadcrumb sidebar tagsview
export function generateTitle(title) {
  const hasKey = this.$ts('route.' + title)
  if (hasKey) {
    // $ts :this method from vue-i18n, inject in @/lang/index.js
    const translatedTitle = this.$ts('route.' + title)

    return translatedTitle
  } else {
    return this.$ts(title)
  }
  return title
}
