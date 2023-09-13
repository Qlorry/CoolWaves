import * as THREE from 'three'

export interface Lines {
  outline: THREE.Line[];
  plane: THREE.Mesh[];
  planeDisplacement: Float32Array[];
  materials: [THREE.LineBasicMaterial, THREE.ShaderMaterial];
}

const vshader = `
attribute float displacement;

void main() {

  vec4 newPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * newPosition;
}
`
const fshader = `

uniform vec3 color;

void main() {


  gl_FragColor = vec4( color , 1.0 );

}
`
const BOTTOM_Y_FOR_PLANE = -1;

export function createLines(
  linesGroup: THREE.Group,
  linesData: Array<Array<number>>,
  lineColor: string,
  planeColor: string
): Lines {
  disposeTreeGeometry(linesGroup)
  linesGroup.clear()
  let lines: THREE.Line[] = []
  let meshes: THREE.Mesh[] = []
  let displacenents: Float32Array[] = [];

  const lineMaterial = new THREE.LineBasicMaterial({ color: new THREE.Color(lineColor) });

  // const uniforms = {
  //   'color': { value: new THREE.Color(planeColor) }
  // };
  // const planeMaterial = new THREE.ShaderMaterial({
  //   uniforms: uniforms,
  //   vertexShader: vshader,
  //   fragmentShader: fshader
  // });
  const planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})
  debugger
  linesData.forEach((lineData, lineIndex) => {
    //Prepare points
    const points: THREE.Vector2[] = []

    points.push(new THREE.Vector2(0, BOTTOM_Y_FOR_PLANE));
    lineData.forEach((el, index) => {
      points.push(new THREE.Vector2(index, lineIndex + el))
      // points.push(new THREE.Vector2(index, lineIndex))
    })

    points.push(new THREE.Vector2(lineData.length - 1, BOTTOM_Y_FOR_PLANE));

    //Create outlines
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    const planeShape = new THREE.Shape(points);
    const planeGeometry = new THREE.ShapeGeometry(planeShape);

    let displacement = new Float32Array(lineGeometry.attributes.position.count);
    displacenents.push(displacement);
    lineGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1));
    const mesh = new THREE.Mesh(planeGeometry, planeMaterial)

    mesh.position.setZ((linesData.length - lineIndex) * 2)
    // mesh.position.setX()
    linesGroup.add(mesh)
    meshes.push(mesh)

    const line = new THREE.Line(lineGeometry, lineMaterial)
    line.position.setZ((linesData.length - lineIndex) * 2 + 1)
    linesGroup.add(line)
    lines.push(line)
  })
  return { outline: lines, plane: meshes, planeDisplacement: displacenents, materials: [lineMaterial, planeMaterial] }
}

export function updateLines(
  lineObjects: Lines,
  linesData: Array<Array<number>>
) {
  debugger
  linesData.forEach((lineData, lineIndex) => {
    //Prepare points
    const points: THREE.Vector2[] = []
    points.push(new THREE.Vector2(0, BOTTOM_Y_FOR_PLANE));

    lineData.forEach((el, index) => {
      points.push(new THREE.Vector2(index, lineIndex + el))
    })
    points.push(new THREE.Vector2(lineData.length - 1, BOTTOM_Y_FOR_PLANE));

    //Update outline
    lineObjects.outline[lineIndex].geometry.setFromPoints(points);
    // lineObjects.outline[lineIndex].position.setZ(linesData.length - lineIndex)

    //Update plane
    lineObjects.plane[lineIndex].geometry.setFromPoints(points);
    // const maxYValue = points.reduce((maxY, currentObj) => {
    //   return Math.max(maxY, currentObj.y);
    // }, 0) + Math.abs(BOTTOM_Y_FOR_PLANE);

    // const displacement = lineObjects.planeDisplacement[lineIndex];
    // for (let i = 0; i < displacement.length && i < points.length; i++) {
    //   displacement[i] = points[i].y;
    //   lineObjects.plane[lineIndex].geometry.attributes.uv.setY(i, points[i].y);
    // }
    // lineObjects.plane[lineIndex].geometry.attributes.displacement.needsUpdate = true;
    // lineObjects.plane[lineIndex].geometry.attributes.uv.needsUpdate = true;
    // lineObjects.plane[lineIndex].position.setZ(linesData.length - lineIndex)
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
