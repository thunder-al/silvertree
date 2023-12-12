import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Silvertree Documentation',
  description: 'Silvertree Documentation',
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
    nav: [
      {text: 'Home', link: '/'},
      {text: 'Examples', link: '/examples/basic'},
      {
        text: 'Packages',
        items: [
          {text: '@silvertree/core', link: '/core/index'},
          {text: '@silvertree/logging', link: '/logging/index'},
          {text: '@silvertree/http', link: '/http/index'},
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
    },

    socialLinks: [
      {icon: 'github', link: 'https://github.com/thunder-al/silvertree'},
    ],
  },
})
