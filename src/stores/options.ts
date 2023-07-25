import { defineStore } from 'pinia'

export interface Options {
  lineColor: string
  backgroundColor: string
  numOfLines: number
  numOfPoints: number
}

export const useOptionsStore = defineStore('options', {
  state: () => {
    return {
      lineColor: '#00bd7e',
      backgroundColor: '#000',
      numOfLines: 150,
      numOfPoints: 200
    } as Options
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    setLineColor(newColor: string) {
      this.lineColor = newColor
    },
    setBackgroundColor(newColor: string) {
      this.backgroundColor = newColor
    },
    setLines(count: number) {
      this.numOfLines = count
    },
    setPoints(count: number) {
      this.numOfPoints = count
    }
  }
})
