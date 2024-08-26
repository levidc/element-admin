<template>
  <div class="bucket-resource-item">
    <el-input
      v-model="resource.keyName"
      size="mini"
      style="width: 0px; flex-grow: 1;"
      @change="onChange"
      @input="onChanginput"
    >
      <template slot="prepend">{{ resource.bucketName }}/</template>
      <template slot="suffix">
        <span v-if="err" style="color: #f9686b; padding-left: 10px; line-height: 26px;">{{ err }}</span>
      </template>
    </el-input>
    <el-button v-if="!addable" class="blue" size="mini" icon="el-icon-delete" style="margin-left: 6px;" @click="onDel" />
    <el-button v-if="addable" class="golden" size="mini" icon="el-icon-plus" style="margin-left: 6px;" @click="onAdd" />

  </div>
</template>

<script>

export default {
  name: 'AwzBucketResourceItem',
  props: {
    idx: {
      type: Number,
      default: -1
    },
    value: {
      type: String,
      default: ''
    },
    editable: {
      type: Boolean,
      default: false
    },
    addable: {
      type: Boolean,
      default: false
    },
    err: {
      type: String,
      default: void 0
    }
  },
  data() {
    return {
      resource: {
        bucketName: '',
        keyName: ''
      },
      upKeyName: ''
    }
  },
  computed: {

  },
  watch: {
    value() {
      this.refreshResource()
    }

  },
  mounted() {
    this.refreshResource()
  },
  methods: {
    refreshResource() {
      const v = this.value.split(':')
      this.resource.bucketName = v[5].split('/')[0] || ''
      this.resource.keyName = v[5].split(this.resource.bucketName + '/')[1] || ''
    },
    onChange(val) {
      this.$emit('change', this.idx, this.resource, this)
    },
    onChanginput(val) {
      this.$emit('input', this.idx, this.resource, this)
    },
    onAdd() {
      this.$emit('add', this.resource, this)
    },
    onDel() {
      this.$emit('del', this.idx)
    },
    clearKeyName() {
      this.resource.keyName = ''
    }
  }
}
</script>

<style scoped lang="scss">
.bucket-resource-item {
  display: flex;
  align-items: center;

  :deep(.el-input-group__prepend) {
    padding: 0 6px;
  }

  :deep(.el-button--mini) i {
    font-size: 12px !important;
    color: white;
  }
}
</style>
