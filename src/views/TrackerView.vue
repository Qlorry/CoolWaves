<script setup lang="ts">
import TrackerComponent from '@/components/TrackerComponent.vue'

import { useOptionsStore } from '@/stores/options'

const options = useOptionsStore();
</script>

<template>
  <TrackerComponent :lines-count="options.numOfLines" :points-count="options.numOfPoints"
    :background-color="options.backgroundColor" :line-color="options.lineColor" />
</template>
