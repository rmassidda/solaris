class Drag {
  constructor(target) {
    this.target = target;
    this.offset = new THREE.Vector3();
    this.intersection = new THREE.Vector3();
    this.worldPosition = new THREE.Vector3();
    this.inverseMatrix = new THREE.Matrix4();
    this.raycaster = new THREE.Raycaster();
  }

  start(tap, camera) {
    this.raycaster.setFromCamera(tap, camera);
    let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -this.target.position.z);
    if (this.raycaster.ray.intersectPlane(plane, this.intersection)) {
      this.inverseMatrix.getInverse(this.target.parent.matrixWorld);
      this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(this.target.matrixWorld));
    }
  }

  continue (tap, camera) {
    this.raycaster.setFromCamera(tap, camera);
    let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -this.target.position.z);
    if (this.raycaster.ray.intersectPlane(plane, this.intersection)) {
      this.target.position.copy(this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix));
    }
  }
}

export default Drag;
