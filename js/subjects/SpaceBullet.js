class SpaceBullet extends THREE.Mesh {
  constructor(dx, dy, speed, acceleration, radius, listener) {
    super(
      new THREE.SphereBufferGeometry(radius, 12, 12),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color("#b58900"),
        opacity: 1,
        flatShading: true,
        shininess: 0.3
      })
    );
    //  Raggio
    this.radius = radius;
    //  Direzione del proiettile
    this.direction = new THREE.Vector3(dx, dy, -1).normalize();
    //  Velocità e accelerazione
    this.initial_speed = speed;
    this.acceleration = acceleration;
    //  Posizione iniziale del proiettile
    this.position.x = dx;
    this.position.y = dy;
    console.log(dx + "\t" + dy);
    this.position.z = -1;
    //  Audio
    var sound = new THREE.PositionalAudio(listener);
    // Caricamento dell'oggetto audio
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load("/Solar/sound/bullet.ogg", function(buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(10);
      sound.setVolume(0.1);
      sound.play();
    });
    this.sound = sound;
    this.add(this.sound);
  }

  mute() {
    this.sound.stop();
  }
  //  Oggetto viene incontro
  update(delta) {
    var speed = delta * this.acceleration + this.initial_speed;
    this.position.x += this.direction.x * delta * speed;
    this.position.y += this.direction.y * delta * speed;
    this.position.z += this.direction.z * delta * speed;
    return this.position.z;
  }
}
