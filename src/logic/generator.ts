function getRandomNumber(min: number, max: number) {
  return Math.round(Math.floor(Math.random() * (max - min + 1)) + min)
}

export function createData(
  linesCount: number,
  pointsInLine: number,
  maxHeight: number,
  minPeakHeight: number = 10,
  peakPercentage = 10,
  peakZone = 3,
  lowZoneShift = 5
) {
  let linesData: number[][] = []
  const leftLowValueZone = pointsInLine / (peakZone * 2)
  const rightLowValueZone = (pointsInLine / (peakZone * 2)) * (peakZone * 2 - 1)
  for (let lines = 0; lines < linesCount; lines++) {
    linesData.push(Array<number>(pointsInLine))
    for (let points = 0; points < pointsInLine; points++) {
      if (points <= leftLowValueZone + (Math.random() * pointsInLine) / lowZoneShift) {
        linesData[lines][points] = Math.sin(Math.random())
      } else if (points >= rightLowValueZone - (Math.random() * pointsInLine) / lowZoneShift) {
        linesData[lines][points] = Math.sin(Math.random())
      } else {
        linesData[lines][points] = -1
      }
    }

    const pointsToWork = Math.round(pointsInLine / peakZone)
    const mainPoints = Math.round((pointsToWork / 100) * peakPercentage) //10%
    let mainPointsPosVal = []
    for (let i = 0; i < mainPoints; i++) {
      mainPointsPosVal.push([
        getRandomNumber(pointsInLine / peakZone, 2 * (pointsInLine / peakZone)),
        getRandomNumber(minPeakHeight, maxHeight)
      ])
    }

    mainPointsPosVal.forEach((el) => {
      if (linesData[lines][el[0]] == -1) {
        linesData[lines][el[0]] = el[1]
      }
    })

    linesData[lines].forEach((element, index, arr) => {
      if (element === -1) {
        const previousValue = arr[index - 1]
        let nextValue = -1
        let nextIndex = index + 1

        // Find the next valid value
        while (nextIndex < arr.length) {
          if (arr[nextIndex] !== -1) {
            nextValue = arr[nextIndex]
            break
          }
          nextIndex++
        }
        // Interpolate the value
        const interpolatedValue = previousValue + (nextValue - previousValue) / (nextIndex - index)
        arr[index] = interpolatedValue + Math.random()
      }
    })
  }
  return linesData
}

export function createNoisyData(linesCount: number, pointsInLine: number) {
  let linesData: number[][] = []
  for (let lines = 0; lines < linesCount; lines++) {
    linesData.push(Array<number>(pointsInLine))
    for (let points = 0; points < pointsInLine; points++) {
      linesData[lines][points] = Math.sin(Math.random() * 3.5)
      linesData[lines][points] = linesData[lines][points] < 0 ? 0 : linesData[lines][points];
    }
  }

  return linesData
}

export function createSinData(linesCount: number, pointsInLine: number) {
  let linesData: number[][] = []
  const conversion = Math.PI / 180
  for (let lines = 0; lines < linesCount; lines++) {
    linesData.push(Array<number>(pointsInLine))
    const phase = 10 * lines * conversion
    for (let points = 0; points < pointsInLine; points++) {
      linesData[lines][points] = Math.sin(40 * points * conversion + phase) * 2
    }
  }

  return linesData
}
