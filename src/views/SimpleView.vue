<script setup lang="ts">
import SimpleComponent from '@/components/SimpleComponent.vue'

import { useOptionsStore } from '@/stores/options'

const options = useOptionsStore()
</script>

<template>
  <SimpleComponent
    :lines-count="options.numOfLines"
    :points-count="options.numOfPoints"
    :background-color="options.backgroundColor"
    :line-color="options.lineColor"
  />
</template>
