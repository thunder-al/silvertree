import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Silvertree Documentation',
  description: 'Silvertree Documentation',
  head: [
    ['meta', {property: 'og:type', content: 'website'}],
    ['meta', {property: 'og:image', content: '/logo-1-wide.png'}],
    ['meta', {property: 'og:site_name', content: 'Silvertree Documentation'}],
  ],
  vite: {
    server: {
      port: 8080,
    },
  },
  lang: 'en',
  markdown: {
    lineNumbers: true,
  },
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    search: {
      provider: 'local',
    },

    nav: [
      {text: 'Home', link: '/'},
      {text: 'Examples', link: '/examples/basic'},
      {
        text: 'Packages',
        items: [
          {text: '@silvertree/core', link: '/core/start'},
          {text: '@silvertree/logging', link: '/logging/start'},
          {text: '@silvertree/http', link: '/http/start'},
        ],
      },
    ],

    sidebar: {
      '/examples/': [
        {
          text: 'Examples',
          items: [
            {text: 'Basic', link: '/examples/basic'},
            {text: 'Logging', link: '/examples/logging'},
            {text: 'Http', link: '/examples/http'},
          ],
        },
      ],
      '/core/': [
        {
          text: 'Introduction',
          items: [
            {text: 'Core Concepts', link: '/core/start'},
            {text: 'Architecture', link: '/core/architecture'},
            {text: 'Installation', link: '/core/installation'},
          ],
        },
        {
          text: 'Core',
          items: [
            {text: 'Directory Structure', link: '/core/directory-structure'},
            {text: 'Container', link: '/core/container'},
            {text: 'Modules', link: '/core/modules'},
          ],
        },
      ],
    },

    socialLinks: [
      {icon: 'github', link: 'https://github.com/thunder-al/silvertree'},
    ],
  },
})
