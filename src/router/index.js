import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
/* Layout */
import Layout from '@/layout'
import permission from '@/directive/permission'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    permission: ['admin:HomepageReportController'],
    root: true,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/components/Dashboard'),
        // component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'Dashboard', affix: true }
      }
    ]
  },
  // {
  //   path: '/documentation',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/documentation/index'),
  //       name: 'Documentation',
  //       meta: { title: 'documentation', icon: 'documentation', affix: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/guide',
  //   component: Layout,
  //   redirect: '/guide/index',
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/guide/index'),
  //       name: 'Guide',
  //       meta: { title: 'guide', icon: 'guide', noCache: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/profile',
  //   component: Layout,
  //   redirect: '/profile/index',
  //   hidden: true,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/profile/index'),
  //       name: 'Profile',
  //       meta: { title: 'profile', icon: 'user', noCache: true }
  //     }
  //   ]
  // },
  {
    path: '/bucket',
    name: 'Bucket',
    component: Layout,
    permission: ['s3:ListAllMyBuckets'],
    root: true,
    children: [
      {
        path: 'index',
        component: () => import('@/components/page/objectStorage/Bucket.vue'),
        name: 'bucketList',
        meta: { title: 'bucket', icon: 'bucket', noCache: true }
      }
    ]
  },
  {
    path: '/bucketDetail',
    name: 'bucketDetail',
    component: Layout,
    permission: ['s3:ListAllMyBuckets'],
    children: [{
      path: '/bucket/BucketDetail/:id',
      name: 'BucketDetail',
      meta: {
        title: 'bucket',
        icon: 'bucket',
        noCache: true,
        activeMenu: '/bucket/index'
      },
      hidden: true,
      component: () => import('@/components/page/objectStorage/BucketDetail'),
      children: [
        {
          path: 'BucketList',
          name: 'BucketList',
          component: () => import('@/components/page/objectStorage/detail/BucketList'),
          meta: {
            activeMenu: '/bucket/index',
            title: 'BucketList'
          }
        },
        {
          path: 'ObjectDetail',
          name: 'ObjectDetail',
          component: () => import('@/components/page/objectStorage/detail/ObjectDetail'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketConfig',
          name: 'BucketConfig',
          component: () => import('@/components/page/objectStorage/detail/BucketConfig'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketPermisson',
          name: 'BucketPermisson',
          component: () => import('@/components/page/objectStorage/detail/BucketPolicy'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketAccess',
          name: 'BucketAccess',
          component: () => import('@/components/page/objectStorage/detail/BucketAccess'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketOwnership',
          name: 'BucketOwnership',
          component: () => import('@/components/page/objectStorage/detail/BucketOwnership'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketLog',
          name: 'BucketLog',
          component: () => import('@/components/page/objectStorage/detail/BucketLog'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketHighConfig',
          name: 'BucketHighConfig',
          component: () => import('@/components/page/objectStorage/detail/BucketHighConfig'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketLifeCycle',
          name: 'BucketLifeCycle',
          component: () => import('@/components/page/objectStorage/detail/BucketLifeCycle'),
          meta: {
            activeMenu: '/bucket/index'
          }

        },
        // {
        //   path: 'BucketLifeCycleConfig',
        //   name: 'BucketLifeCycleConfig',
        //   component: BucketLifeCycleConfig,
        //   meta: {
        //     privilege: ['admin:LifecycleTaskCronController']
        //   }
        // },
        {
          path: 'BucketObjectLock',
          name: 'BucketObjectLock',
          component: () => import('@/components/page/objectStorage/detail/BucketObjectLock'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketQuota',
          name: 'BucketQuota',
          component: () => import('@/components/page/objectStorage/detail/BucketQuota'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketQoS',
          name: 'BucketQoS',
          component: () => import('@/components/page/objectStorage/detail/BucketQoS'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketDataClassification',
          name: 'BucketDataClassification',
          component: () => import('@/components/page/objectStorage/detail/BucketDataClassification'),
          meta: {
            activeMenu: '/bucket/index'
          }
        },
        {
          path: 'BucketLoadGroup',
          name: 'BucketLoadGroup',
          component: () => import('@/components/page/objectStorage/detail/BucketLoadGroup'),
          meta: {
            activeMenu: '/bucket/index'
          }

        },
        {
          path: 'highAvailability',
          name: 'highAvailability',
          component: () => import('@/components/page/highAvailability'),
          meta: {
            activeMenu: '/bucket/index'
          }

        }
      ]
    }]
  },
  {
    path: '/fileSystem',
    name: 'FileSystem',
    component: Layout,
    permission: ['admin:GetFileList'],
    root: true,
    children: [
      {
        path: 'index',
        component: () => import('@/components/page/objectStorage/fileSystem'),
        name: 'FileSystemList',
        meta: { title: 'fileSystem', icon: 'fileSystem', noCache: true }
      }
    ]
  },
  {
    path: '/objectResources',
    name: 'ObjectResource',
    component: Layout,
    redirect: '/objectResources/index',
    meta: {
      title: 'ObjectResource',
      icon: 'objectResources'
    },
    permission: ['admin:ListStorageDeviceController', 'isAdmin'],
    root: true,
    children: [
      {
        path: 'index',
        component: () => import('@/components/page/objectStorage/objectResource'),
        name: 'ObjectResourceList',
        meta: { title: 'ObjectResourceM', icon: '', noCache: true },
        privilege: ['admin:ListStorageDeviceController']
      },
      {
        path: 'LoadGroup',
        component: () => import('@/components/page/objectStorage/objectResource/loadGroup'),
        name: 'LoadGroup',
        meta: { title: 'LoadGroup', icon: '', noCache: true },
        permission: ['isAdmin']
      },
      {
        path: 'loadGroupRoute',
        component: () => import('@/components/page/objectStorage/objectResource/loadGroupRoute'),
        name: 'loadGroupRoute',
        meta: { title: 'loadGroupRoute', icon: '', noCache: true },
        permission: ['isAdmin']
      }
    ]
  },
  // {
  //   path: '/migrationManagement',
  //   name: 'migrationManagement',
  //   component: Layout,
  //   meta: {
  //     title: 'migrationManagement',
  //     icon: 'resourceManagement'
  //   },
  //   root: true,
  //   children: [
  //     {
  //       path: 'resource',
  //       component: () => import('@/components/page/objectStorage/objectResource/migrationResource'),
  //       name: 'resource',
  //       meta: { title: 'migrationResource', icon: '', noCache: true }
  //     },
  //     {
  //       path: 'taskManagement',
  //       component: () => import('@/components/page/task'),
  //       name: 'taskManagement',
  //       meta: { title: 'taskManagement', icon: '', noCache: true },
  //       permission: ['123']
  //     },
  //     {
  //       path: 'removeManagement',
  //       component: () => import('@/components/page/removeData'),
  //       name: 'removeManagement',
  //       meta: { title: 'removeManagement', icon: '', noCache: true }
  //     }
  //   ]
  // },

  {
    path: '/userAndPerm/user',
    name: 'migrationResource',
    component: Layout,
    meta: {
      title: 'user',
      icon: 'user'
    },
    children: [
      {
        path: 'Users',
        component: () => import('@/components/page/users/user/User'),
        name: 'Users',
        meta: { title: 'Users', icon: '', noCache: true }
      },
      {
        path: 'Users/userDetail/:name',
        name: 'UserDetail',
        component: () => import('@/components/page/users/user/UserDetail'),
        hidden: true
      },
      {
        path: 'Group',
        component: () => import('@/components/page/users/group/group'),
        name: 'Group',
        meta: { title: 'Group', icon: '', noCache: true }
      },
      {
        path: 'Group/groupDetail/:name',
        name: 'groupDetail',
        component: () => import('@/components/page/users/user/UserDetail'),
        hidden: true
      },
      {
        path: 'S3permission',
        component: () => import('@/components/page/permission/S3permission'),
        name: 'S3permission',
        meta: { title: 'S3permission', icon: '', noCache: true }
      },
      {
        path: 'GeneralStrategy',
        component: () => import('@/components/page/permission/GeneralStrategy/Policies'),
        name: 'GeneralStrategy',
        meta: { title: 'GeneralStrategy', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/lifecycle',
    name: 'lifecycle',
    component: Layout,
    meta: {
      title: 'lifecycle',
      icon: 'lifecycle'
    },
    children: [
      {
        path: 'lifecycleBucket',
        component: () => import('@/components/page/lifecycle/lifecycleBucket'),
        name: 'lifecycleBucket',
        meta: { title: 'lifecycleBucket', icon: '', noCache: true }
      },
      {
        path: 'lifecycleTaskConfig',
        component: () => import('@/components/page/lifecycle/lifecycleTaskConfig'),
        name: 'lifecycleTaskConfig',
        meta: { title: 'lifecycleTaskConfig', icon: '', noCache: true }
      }, {
        path: 'lifecycleTaskList',
        component: () => import('@/components/page/lifecycle/lifecycleTaskList'),
        name: 'lifecycleTaskList',
        meta: { title: 'lifecycleTaskList', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/bucketCache',
    name: 'bucketCache',
    component: Layout,
    meta: {
      title: 'bucketCache',
      icon: 'bucketCache'
    },
    children: [
      {
        path: 'bucketCacheConfig',
        component: () => import('@/components/page/bucketCache/bucketCacheConfig'),
        name: 'bucketCacheConfig',
        meta: { title: 'bucketCacheConfig', icon: '', noCache: true }
      },
      {
        path: 'bucketCacheList',
        component: () => import('@/components/page/bucketCache/bucketCacheList'),
        name: 'bucketCacheList',
        meta: { title: 'bucketCacheList', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/dataRecycle',
    name: 'dataRecycle',
    component: Layout,
    meta: {
      title: 'dataRecycle',
      icon: 'dataRecycle'
    },
    children: [
      {
        path: 'deleteMark',
        component: () => import('@/components/page/dataRecycle/deleteMark'),
        name: 'deleteMark',
        meta: { title: 'deleteMark', icon: '', noCache: true }
      },
      {
        path: 'restoreRecords',
        component: () => import('@/components/page/dataRecycle/restoreRecords'),
        name: 'restoreRecords',
        meta: { title: 'restoreRecords', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/operationLog',
    name: 'operationLog',
    component: Layout,
    alwaysShow: true,
    meta: {
      title: 'operationM',
      icon: 'operationLog'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/components/page/operation/auditLogs'),
        name: 'auditLogs',
        meta: { title: 'operationLog', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/globalConifg',
    name: 'globalConifg',
    component: Layout,
    meta: {
      title: 'globalConifg',
      icon: 'el-icon-s-help'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/components/page/operation/auditLogs'),
        name: 'globalConifgC',
        meta: { title: 'globalConifg', icon: 'globalConifg', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: 'permission',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'page',
        component: () => import('@/views/permission/page'),
        name: 'PagePermission',
        meta: {
          title: 'pagePermission',
          roles: ['editor'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'directive',
        component: () => import('@/views/permission/directive'),
        name: 'DirectivePermission',
        meta: {
          title: 'directivePermission'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RolePermission',
        meta: {
          title: 'rolePermission',
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '/migrationManagement',
    name: 'migrationManagement',
    component: Layout,
    meta: {
      title: 'migrationManagement',
      icon: 'resourceManagement'
    },
    root: true,
    children: [
      {
        path: 'resource',
        component: () => import('@/components/page/objectStorage/objectResource/migrationResource'),
        name: 'resource',
        meta: { title: 'migrationResource', icon: '', noCache: true }
      },
      {
        path: 'taskManagement',
        component: () => import('@/components/page/task'),
        name: 'taskManagement',
        meta: { title: 'taskManagement', icon: '', noCache: true },
        permission: ['123']
      },
      {
        path: 'removeManagement',
        component: () => import('@/components/page/removeData'),
        name: 'removeManagement',
        meta: { title: 'removeManagement', icon: '', noCache: true }
      }
    ]
  },
  // {
  //   path: '/icon',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/icons/index'),
  //       name: 'Icons',
  //       meta: { title: 'icons', icon: 'icon', noCache: true }
  //     }
  //   ]
  // },

  // /** when your routing map is too long, you can split it into small modules **/
  // componentsRouter,
  // chartsRouter,
  // nestedRouter,
  // tableRouter,

  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: '/example/list',
  //   name: 'Example',
  //   meta: {
  //     title: 'example',
  //     icon: 'el-icon-s-help'
  //   },
  //   children: [
  //     {
  //       path: 'create',
  //       component: () => import('@/views/example/create'),
  //       name: 'CreateArticle',
  //       meta: { title: 'createArticle', icon: 'edit' }
  //     },
  //     {
  //       path: 'edit/:id(\\d+)',
  //       component: () => import('@/views/example/edit'),
  //       name: 'EditArticle',
  //       meta: { title: 'editArticle', noCache: true, activeMenu: '/example/list' },
  //       hidden: true
  //     },
  //     {
  //       path: 'list',
  //       component: () => import('@/views/example/list'),
  //       name: 'ArticleList',
  //       meta: { title: 'articleList', icon: 'list' }
  //     }
  //   ]
  // },

  // {
  //   path: '/tab',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/tab/index'),
  //       name: 'Tab',
  //       meta: { title: 'tab', icon: 'tab' }
  //     }
  //   ]
  // },

  // {
  //   path: '/error',
  //   component: Layout,
  //   redirect: 'noRedirect',
  //   name: 'ErrorPages',
  //   meta: {
  //     title: 'errorPages',
  //     icon: '404'
  //   },
  //   children: [
  //     {
  //       path: '401',
  //       component: () => import('@/views/error-page/401'),
  //       name: 'Page401',
  //       meta: { title: 'page401', noCache: true }
  //     },
  //     {
  //       path: '404',
  //       component: () => import('@/views/error-page/404'),
  //       name: 'Page404',
  //       meta: { title: 'page404', noCache: true }
  //     }
  //   ]
  // },

  // {
  //   path: '/error-log',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'log',
  //       component: () => import('@/views/error-log/index'),
  //       name: 'ErrorLog',
  //       meta: { title: 'errorLog', icon: 'bug' }
  //     }
  //   ]
  // },

  // {
  //   path: '/excel',
  //   component: Layout,
  //   redirect: '/excel/export-excel',
  //   name: 'Excel',
  //   meta: {
  //     title: 'excel',
  //     icon: 'excel'
  //   },
  //   children: [
  //     {
  //       path: 'export-excel',
  //       component: () => import('@/views/excel/export-excel'),
  //       name: 'ExportExcel',
  //       meta: { title: 'exportExcel' }
  //     },
  //     {
  //       path: 'export-selected-excel',
  //       component: () => import('@/views/excel/select-excel'),
  //       name: 'SelectExcel',
  //       meta: { title: 'selectExcel' }
  //     },
  //     {
  //       path: 'export-merge-header',
  //       component: () => import('@/views/excel/merge-header'),
  //       name: 'MergeHeader',
  //       meta: { title: 'mergeHeader' }
  //     },
  //     {
  //       path: 'upload-excel',
  //       component: () => import('@/views/excel/upload-excel'),
  //       name: 'UploadExcel',
  //       meta: { title: 'uploadExcel' }
  //     }
  //   ]
  // },

  // {
  //   path: '/zip',
  //   component: Layout,
  //   redirect: '/zip/download',
  //   alwaysShow: true,
  //   name: 'Zip',
  //   meta: { title: 'zip', icon: 'zip' },
  //   children: [
  //     {
  //       path: 'download',
  //       component: () => import('@/views/zip/index'),
  //       name: 'ExportZip',
  //       meta: { title: 'exportZip' }
  //     }
  //   ]
  // },

  // {
  //   path: '/pdf',
  //   component: Layout,
  //   redirect: '/pdf/index',
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/pdf/index'),
  //       name: 'PDF',
  //       meta: { title: 'pdf', icon: 'pdf' }
  //     }
  //   ]
  // },
  // {
  //   path: '/pdf/download',
  //   component: () => import('@/views/pdf/download'),
  //   hidden: true
  // },

  // {
  //   path: '/theme',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/theme/index'),
  //       name: 'Theme',
  //       meta: { title: 'theme', icon: 'theme' }
  //     }
  //   ]
  // },

  // {
  //   path: '/clipboard',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/clipboard/index'),
  //       name: 'ClipboardDemo',
  //       meta: { title: 'clipboardDemo', icon: 'clipboard' }
  //     }
  //   ]
  // },

  // {
  //   path: '/i18n',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/i18n-demo/index'),
  //       name: 'I18n',
  //       meta: { title: 'i18n', icon: 'international' }
  //     }
  //   ]
  // },

  // {
  //   path: 'external-link',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'https://github.com/PanJiaChen/vue-element-admin',
  //       meta: { title: 'externalLink', icon: 'link' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
