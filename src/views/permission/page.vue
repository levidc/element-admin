<template>
  <div class="app-container">
    <switch-roles @change="handleRolesChange" />
  </div>
</template>

<script>
import SwitchRoles from './components/SwitchRoles'
import axios from 'axios'
export default {
  name: 'PagePermission',
  components: { SwitchRoles },
  mounted() {
    axios({
      url: 'http://127.0.0.1:2386/pokemon',
      onDownloadProgress: ProgressEvent => {
        console.log(ProgressEvent)
      }
    }).then(res => {
      console.log(res.data)
    })
  },
  methods: {
    handleRolesChange() {
      this.$router.push({ path: '/permission/index?' + +new Date() })
    }
  }
}
</script>
