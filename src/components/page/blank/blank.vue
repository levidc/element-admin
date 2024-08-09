<template>
  <div />
</template>

<script>
export default {
  name: 'Blank',
  data () {
    return {}
  },
  computed: {},
  mounted: function () {
    this.$nextTick(() => {
      if (window.firstJumpTo) {
        const to = window.firstJumpTo
        localStorage.setItem('to', to)
        this.$router.push({ path: this.$store.state.redirect || to })
      } else if (window.location.href.indexOf('s3sg') > -1) {
        this.$router.push({ name: 'eipInfo', query: { noAuth: true } })
      }
    })
  }
}
</script>
