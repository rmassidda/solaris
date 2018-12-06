class Lifebar extends THREE.Mesh {
  constructor(initial, limit, stack) {
    super(
      new THREE.PlaneBufferGeometry(1, 0.05),
      new THREE.MeshBasicMaterial()
    );
    //  Maximum points
    this.limit = limit;
    //  Initial position
    this.position.set(0, -1 + 0.05 * stack, -1);
    //  First update
    this.update(initial);
  }

  update(points) {
    //  Scaling of the bar
    var old = this.scale.x;
    this.scale.x = points / this.limit;
    if (this.scale.x <= 0) {
      this.scale.x = old;
    }
    //  The lowest the points the redest the bar
    this.material.color.setHSL(
      (Math.pow(this.scale.x, 4) * 100) / 360,
      0.6,
      0.5
    );
    //  Position of the bar
    this.position.x = -(1 - this.scale.x) / 2;
  }
}

export default Lifebar;
