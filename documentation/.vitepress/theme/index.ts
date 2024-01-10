import DefaultTheme from 'vitepress/theme'
import MermaidChart from '../../components/MermaidChart.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({app}) {
    // register your custom global components
    app.component('mermaid', MermaidChart)
  },
}
