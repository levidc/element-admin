<template>
  <div class="tooltip-container">
    <el-tooltip
      class="my-tooltip"
      :disabled="showTooltip"
      :content="text"
      placement="top"
    >
      <span
        ref="outWidth"
        class="text-box"
        :style="style"
        @mouseenter="checkWidth"
      >
        <slot
          v-if="useSlot"
          name="data"
        />
        <span v-else>{{ text }}</span>
      </span>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'MyTooltip',
  props: {
    text: {
      type: String,
      default: () => ''
    },
    useSlot: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '100%'
    }
  },
  data() {
    return {
      style: {},
      showTooltip: true
    }
  },
  watch: {
    text: {
      handler() {
        this.$nextTick(() => this.checkWidth())
      },
      immediate: true
    }
  },
  mounted() {
    this.style = {
      width: this.width + '!important'
    }
  },
  methods: {
    checkWidth() {
      const out = this.$refs['outWidth']
      const outWidth = out.offsetWidth
      const innerWidth = out.childNodes[0].offsetWidth
      this.showTooltip = outWidth >= innerWidth
    }
  }
}
</script>
<style scoped lang="scss">
.tooltip-container {
  display: inline-block;
  width: 100%;
  height: 100%;
  .text-box {
    position: relative;
    top: 5px;
    display: inline-block !important;
    height: 100% !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
  }
}
</style>

