<script setup lang="ts">
import FlowerTrackerComponent from '@/components/FlowerTrackerComponent.vue'

import { useOptionsStore } from '@/stores/options'

const options = useOptionsStore()
</script>

<template>
  <FlowerTrackerComponent
    :lines-count="options.numOfLines"
    :points-count="options.numOfPoints"
    :background-color="options.backgroundColor"
    :line-color="options.lineColor"
  />
</template>
