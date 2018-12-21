class Bullet extends THREE.Mesh {
  constructor(geometry, material, dx, dy, speed, acceleration, listener) {
    super(geometry, material);
    //  Where the bullet is
    this.position.set(dx, dy, -1);
    //  How the bullet moves
    this.direction = new THREE.Vector3(dx, dy, -1).normalize();
    this.initial_speed = speed;
    this.acceleration = acceleration;
    //  Audio
    var sound = new THREE.PositionalAudio(listener);
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load("../../sound/bullet.ogg", function(buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(10);
      sound.setVolume(0.1);
      sound.play();
    });
    this.add(sound);
  }

  //  Update position
  update(delta) {
    var speed = delta * this.acceleration + this.initial_speed;
    this.position.x += this.direction.x * delta * speed;
    this.position.y += this.direction.y * delta * speed;
    this.position.z += this.direction.z * delta * speed;
    return this.position.z;
  }
}

export default Bullet;
