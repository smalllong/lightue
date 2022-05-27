import { defineConfig } from 'vitepress'

export default defineConfig({
  lastUpdated: true,

  locales: {
    '/': {
      lang: 'en-US',
      title: 'Lightue',
      description: 'A lightweight and simple model-view framework inspired by Vue.js',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Lightue',
      description: '一个启发自Vue.js的轻量简单的状态视图框架',
    },
  },

  themeConfig: {
    repo: 'smalllong/lightue',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,

    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        ariaLabel: 'Select language',
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last Updated',
        nav: [
          { text: 'Guide', link: '/', activeMatch: '^/$|^/guide/' },
          {
            text: 'API',
            link: '/api/global',
            activeMatch: '^/api/',
          },
        ],

        sidebar: {
          '/guide/': getGuideSidebar(''),
          '/api/': getAPISidebar(''),
          '/': getGuideSidebar(''),
        },
      },
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        ariaLabel: '选择语言',
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新',
        nav: [
          { text: '教程', link: '/', activeMatch: '^/$|^/guide/' },
          {
            text: 'API',
            link: '/api/global',
            activeMatch: '^/api/',
          },
        ],

        sidebar: {
          '/guide/': getGuideSidebar('/zh'),
          '/api/': getAPISidebar('/zh'),
          '/': getGuideSidebar('/zh'),
        },
      },
    },
  },
})

function getGuideSidebar(dir) {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'What is Lightue?', link: dir + '/' },
        { text: 'Getting Started', link: dir + '/guide/getting-started' },
      ],
    },
    // {
    //   text: 'Advanced',
    //   children: [
    //     { text: 'Frontmatter', link: dir + '/guide/frontmatter' },
    //   ],
    // },
  ]
}

function getAPISidebar(dir) {
  return [
    {
      text: 'API',
      children: [
        { text: 'Global methods', link: dir + '/api/global' },
        { text: 'VDomSrc', link: dir + '/api/template' },
      ],
    },
    // {
    //   text: 'Theme Config',
    //   children: [{ text: 'Homepage', link: dir + '/config/homepage' }],
    // },
  ]
}
