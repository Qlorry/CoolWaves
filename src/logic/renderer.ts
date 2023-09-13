import * as THREE from 'three'

export function drawLines(
  linesGroup: THREE.Group,
  linesData: Array<Array<number>>,
  lineMaterial: THREE.LineBasicMaterial,
  planeMaterial: THREE.MeshBasicMaterial
): [THREE.Line[], THREE.Mesh[]] {
  disposeTreeGeometry(linesGroup)
  linesGroup.clear()
  let lines: THREE.Line[] = []
  let meshes: THREE.Mesh[] = []
  linesData.forEach((lineData, lineIndex) => {
    //Prepare points
    const points: THREE.Vector2[] = []
    lineData.forEach((el, index) => {
      points.push(new THREE.Vector2(index, lineIndex + el))
    })

    // Create outlines
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(lineGeometry, lineMaterial)
    line.position.setZ(linesData.length - lineIndex)

    linesGroup.add(line)
    lines.push(line)
    
    points.push(new THREE.Vector2(lineData.length, -1));
    points.push(new THREE.Vector2(0, -1));

    debugger
    const planeShape = new THREE.Shape(points);
    const planeGeometry = new THREE.ShapeGeometry(planeShape);

    const mesh = new THREE.Mesh(planeGeometry, planeMaterial)
    mesh.position.setZ(linesData.length - lineIndex)
    linesGroup.add(mesh)
    meshes.push(mesh)


  })
  return [lines, meshes]
}

export function updateLines(
  lines: THREE.Line[],
  meshes: THREE.Mesh[],
  linesData: Array<Array<number>>
) {
  linesData.forEach((lineData, lineIndex) => {

    const points: THREE.Vector2[] = []
    lineData.forEach((el, index) => {
      points.push(new THREE.Vector2(index, lineIndex + el))
    })

    // const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    lines[lineIndex].geometry.setFromPoints(points);

    points.push(new THREE.Vector2(lineData.length, -1));
    points.push(new THREE.Vector2(0, -1));

    // meshes[lineIndex].geometry.setFromPoints(points);
    meshes[lineIndex].geometry = new THREE.ShapeGeometry(new THREE.Shape(points));
    lines[lineIndex].position.setZ(linesData.length - lineIndex)
    meshes[lineIndex].position.setZ(linesData.length - lineIndex)

    const linePosParam = lines[lineIndex].geometry.attributes.position
    // const meshPosParam = meshes[lineIndex].geometry.attributes.position

    linePosParam.needsUpdate = true
    // meshPosParam.needsUpdate = true
  })
}

export function disposeTreeGeometry(node: any) {
  node.children.forEach((el: any) => {
    disposeTreeGeometry(el)
  })
  if (node.geometry && node.geometry.dispose) {
    node.geometry.dispose()
  }
}
