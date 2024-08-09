import messageBox from './src/index'
import BreadCrumbs from '@/components/BreadCrumbs'
import vueJsonEditor from 'vue-json-editor'
import JsonViewer from 'vue-json-viewer'
import selectColumns from '@/components/selectColumns'
import tableData from '@/components/tableData'
import draggable from 'vuedraggable'
import DataTable from '@/components/publicComponent/tableData'
import showToolTip from '@/components/publicComponent/showToolTip'
import selectStatus from '@/components/selectStatus'
const components = {
  'vueJsonEditor': vueJsonEditor,
  'JsonViewer': JsonViewer,
  'BreadCrumbs': BreadCrumbs,
  'SelectColumns': selectColumns,
  'TableData': tableData,
  'draggable': draggable,
  'DataTable': DataTable,
  'showToolTip': showToolTip,
  'SelectStatus': selectStatus,
}
export default {
  install (Vue) {
    Vue.prototype.$ts = messageBox
    for (const name in components) {
      Vue.component(name, components[name])
    }
  }
}
