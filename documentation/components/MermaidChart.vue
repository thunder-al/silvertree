<template>
  <div :class="$style.mermaid" v-if="chart" v-html="chart"/>
</template>

<script lang="ts" setup>
  import {computed, getCurrentInstance, ref, useSlots, VNode, watch} from 'vue'
  import mermaid from 'mermaid'

  mermaid.initialize({
    theme: 'dark',
    darkMode: true,
  })

  const element = getCurrentInstance()

  function extractText(node: VNode): string {
    if (Array.isArray(node.children)) {
      return node.children.map(extractText).join('\n')
    }

    return (node.children?.toString() ?? '') + '\n'
  }

  const slots = useSlots()
  const chartQuery = computed(() =>
    slots.default?.()
      .map(el => extractText(el))
      .join('\n') ?? '',
  )

  const chart = ref('[chart]')

  watch(
    chartQuery,
    async (data) => {
      try {
        const m = await mermaid.render(`mermaid-${element!.uid}`, data)
        chart.value = m.svg
      } catch (e: any) {
        chart.value = `<pre>Mermaid graph error: ${e.message}</pre>`
      }
    },
    {immediate: true},
  )

</script>

<style module>
  .mermaid {
    display: flex;
    justify-content: center;
  }

  .mermaid > * {
    max-width: 100%;
  }
</style>
