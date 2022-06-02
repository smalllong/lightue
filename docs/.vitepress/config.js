import { defineConfig } from 'vitepress'

export default defineConfig({
  lastUpdated: true,

  locales: {
    '/': {
      lang: 'en-US',
      title: 'Lightue',
      description: 'A lightweight and simple web frontend model-view framework inspired by Vue.js',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Lightue',
      description: '一个启发自Vue.js的轻量简单的web前端框架',
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
          { text: '教程', link: '/zh/', activeMatch: '^/zh/$|^/zh/guide/' },
          {
            text: 'API',
            link: '/zh/api/global',
            activeMatch: '^/zh/api/',
          },
        ],

        sidebar: {
          '/zh/guide/': getGuideSidebar('/zh'),
          '/zh/api/': getAPISidebar('/zh'),
          '/zh/': getGuideSidebar('/zh'),
        },
      },
    },
  },
})

function getGuideSidebar(dir) {
  return dir == ''
    ? [
        {
          text: 'Introduction',
          children: [
            { text: 'What is Lightue?', link: dir + '/' },
            { text: 'Install', link: dir + '/guide/install' },
          ],
        },
        {
          text: 'Essentials',
          children: [
            { text: 'Getting Started', link: dir + '/guide/getting-started' },
            { text: 'Template Syntax', link: dir + '/guide/template-syntax' },
            { text: 'State Driven', link: dir + '/guide/state' },
          ],
        },
      ]
    : [
        {
          text: '介绍',
          children: [
            { text: 'Lightue是什么?', link: dir + '/' },
            { text: '安装', link: dir + '/guide/install' },
          ],
        },
        {
          text: '基础',
          children: [
            { text: '开始上手', link: dir + '/guide/getting-started' },
            { text: '模板语法', link: dir + '/guide/template-syntax' },
            { text: '状态驱动', link: dir + '/guide/state' },
          ],
        },
      ]
}

function getAPISidebar(dir) {
  return dir == ''
    ? [
        {
          text: 'API',
          children: [
            { text: 'Global methods', link: dir + '/api/global' },
            { text: 'VDomSrc', link: dir + '/api/template' },
          ],
        },
      ]
    : [
        {
          text: 'API',
          children: [
            { text: '全局方法', link: dir + '/api/global' },
            { text: 'VDomSrc', link: dir + '/api/template' },
          ],
        },
      ]
}
