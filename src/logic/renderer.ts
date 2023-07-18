import * as THREE from 'three'

export function drawLines(linesGroup: THREE.Group,
    linesData: Array<Array<number>>,
    lineMaterial: THREE.LineBasicMaterial,
    planeMaterial: THREE.MeshBasicMaterial): [THREE.Line[], THREE.Mesh[]] {
    disposeTreeGeometry(linesGroup);
    linesGroup.clear();
    let lines: THREE.Line[] = [];
    let meshes: THREE.Mesh[] = [];
    linesData.forEach((lineData, lineIndex) => {
        {
            const heartShape = new THREE.Shape()
            heartShape.moveTo(0, lineIndex + lineData[0])

            lineData.forEach((el, index) => {
                if (index == 0) {
                    return
                }
                heartShape.lineTo(index, lineIndex + el)
            })
            heartShape.lineTo(lineData.length, -1)
            heartShape.lineTo(0, -1)

            const geometry = new THREE.ShapeGeometry(heartShape)
            const mesh = new THREE.Mesh(geometry, planeMaterial)
            mesh.position.setZ(linesData.length - lineIndex)
            linesGroup.add(mesh)
            meshes.push(mesh);
        }
        {
            const points: THREE.Vector3[] = []
            lineData.forEach((el, index) => {
                points.push(new THREE.Vector3(index, lineIndex + el, 0))
            })

            const geometry = new THREE.BufferGeometry().setFromPoints(points)

            const line = new THREE.Line(geometry, lineMaterial)
            line.position.setZ(linesData.length - lineIndex)

            linesGroup.add(line)
            lines.push(line);
        }
    });
    return [lines, meshes];
}

export function updateLines(lines: THREE.Line[], meshes: THREE.Mesh[], linesData: Array<Array<number>>) {
    // disposeTreeGeometry(linesGroup);
    // linesGroup.clear();
    debugger
    for (let i = 0; i < lines.length; i++) {
        let points: THREE.Vector2[] = [];
        const linePosParam = lines[i].geometry.attributes.position;
        const meshPosParam = meshes[i].geometry.attributes.position;
        for (let j = 0; j < linePosParam.count; j++) {
            linePosParam.setXY(j, j, i + linesData[i][j]);
            // meshPosParam.setXY(j, j, i + linesData[i][j]);

            points.push(new THREE.Vector2(j, i + linesData[i][j]));
        }
        points.push(new THREE.Vector2(linePosParam.count, -1));
        points.push(new THREE.Vector2(0, -1));

        const sh = new THREE.Shape(points);
        const geom = new THREE.ShapeGeometry(sh);
        meshes[i].geometry.dispose();
        meshes[i].geometry = geom;

        meshPosParam.setXY(linePosParam.count, linePosParam.count, -1);
        meshPosParam.setXY(linePosParam.count + 1, 0, -1);

        linePosParam.needsUpdate = true;
        lines[i].geometry.computeBoundingBox();
        lines[i].geometry.computeBoundingSphere();
        lines[i].geometry.computeVertexNormals();

        meshPosParam.needsUpdate = true;
        //  meshes[i].geometry.computeBoundingBox();
        // meshes[i].geometry.computeBoundingSphere();
        // meshes[i].geometry.computeVertexNormals();
        // meshes[i].geometry.normalizeNormals();
        // meshes[i].updateMatrix();
    }
}


export function disposeTreeGeometry(node: any) {
    node.children.forEach((el: any) => {
        disposeTreeGeometry(el);
    })
    if (node.geometry && node.geometry.dispose) {
        node.geometry.dispose();
    }
}