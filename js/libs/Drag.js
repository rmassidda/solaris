class Drag {
  constructor(target) {
    //  Object to be moved
    this.target = target;
    this.offset = new THREE.Vector3();
    this.intersection = new THREE.Vector3();
    this.worldPosition = new THREE.Vector3();
    this.inverseMatrix = new THREE.Matrix4();
    this.raycaster = new THREE.Raycaster();
  }

  start(tap, camera) {
    //  Ray generation
    this.raycaster.setFromCamera(tap, camera);
    //  Plane at the same distance of the object
    let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -this.target.position.z);
    //  Get the intersection of the object and the plane
    if (this.raycaster.ray.intersectPlane(plane, this.intersection)) {
      //  Inverse matrix used to
      this.inverseMatrix.getInverse(this.target.parent.matrixWorld);
      //  Offset from the tapped point and the object, in world coordinates
      this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(this.target.matrixWorld));
    }
  }

  continue (tap, camera) {
    //  Ray generation
    this.raycaster.setFromCamera(tap, camera);
    //  Plane at the same distance of the Object
    let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -this.target.position.z);
    //  Get the intersection of the object and the plane
    if (this.raycaster.ray.intersectPlane(plane, this.intersection)) {
      //  Move the object considering the previous calculated offset
      this.target.position.copy(this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix));
    }
  }
}

export default Drag;
