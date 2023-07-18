import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface Options {
  lineColor: string
  backgroundColor: string
  numOfLines: number
  numOfPoints: number
}

export const useCounterStore = defineStore('options', () => {
  const opt = ref({
    lineColor: '#00bd7e',
    backgroundColor: '#000',
    numOfLines: 150,
    numOfPoints: 200
  } as Options)

  // const doubleCount = computed(() => count.value * 2)

  // function increment() {
  //   count.value++
  // }

  // return { opt, doubleCount, increment }
  return { opt }
})
