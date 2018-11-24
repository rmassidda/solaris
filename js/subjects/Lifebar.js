class Lifebar extends THREE.Mesh {
  constructor(initial, limit, stack) {
    super(
      new THREE.PlaneBufferGeometry(1, 0.05),
      new THREE.MeshBasicMaterial()
    );
    this.limit = limit;
    this.position.set(0, -1 + 0.05 * stack, -1);
    this.update(initial);
  }
  update(points) {
    var old = this.scale.x;
    this.scale.x = points / this.limit;
    if (this.scale.x <= 0) {
      this.scale.x = old;
    }
    this.material.color.setHSL(
      (Math.pow(this.scale.x, 4) * 100) / 360,
      0.6,
      0.5
    );
    this.position.x = -(1 - this.scale.x) / 2;
  }
}

export default Lifebar;