const types = ['alfa', 'beta', 'gamma', 'delta'];

class Target extends THREE.Mesh {
  constructor(geometry, x, y, speed, acceleration, type, listener) {
    super(geometry, new THREE.MeshPhongMaterial({
      opacity: 1,
      flatShading: true,
      shininess: 0.3
    }));
    //	HSL represention of the color
    this.hsl = {};
    //	Target type
    this.type = type;
    this._commitType();
    //	Where the target is
    this.position.set(x, y, -250);
    //	How the target moves
    this.initial_speed = speed;
    this.acceleration = acceleration;
    //	State of the object
    this.hitten = false;
    this.dead = false;
    //	Audio
    var sound = new THREE.PositionalAudio(listener);
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load('../../sound/die.ogg', function(buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(100);
      sound.setVolume(0.1);
    });
    this.sound = sound;
    this.add(this.sound);
  }

  _commitType() {
    //	Color and bonus value depends on the type
    switch (this.type) {
      case 'alfa':
        //	Solarized Red
        this.material.color = new THREE.Color('#dc322f');
        this.bonus = 100;
        break;
      case 'beta':
        //	Solarized Blue
        this.material.color = new THREE.Color('#268bd2');
        this.bonus = 200;
        break;
      case 'gamma':
        //	Solarized Orange
        this.material.color = new THREE.Color('#cb4b16');
        this.bonus = 500;
        break;
      case 'delta':
        //	Solarized Violet
        this.material.color = new THREE.Color('#6c71c4');
        this.bonus = 1000;
        break;
    }
    this.material.color.getHSL(this.hsl);
  }

  changeType() {
    let i = types.indexOf(this.type);
    i = (i + 1) % types.length;
    //	Change type and commit
    this.type = types[i];
    this._commitType();
  }

  hit() {
    //	The target is been hitten
    this.hitten = true;
    //	Suono
    this.sound.play();
  }

  select() {
    this.material.emissive = new THREE.Color(0xffffff);
    this.material.emissiveIntensity = 0.2;
  }

  deselect() {
    this.material.emissive = new THREE.Color(0x000000);
    this.material.emissiveIntensity = 1;
  }

  update(delta) {
    //	Movement speed
    var speed = delta * this.acceleration + this.initial_speed;
    //	Speed based on the duration of the sound emitted by the object
    var diespeed = 1 / 1.45;
    //	If the object is been hitten and isn't already disappeared
    if (this.hitten && !this.dead) {
      //	Desaturation
      this.hsl.s -= delta * diespeed;
      this.material.color.setHSL(this.hsl.h, this.hsl.s, this.hsl.l);
      //	Resizing
      this.scale.x -= delta * diespeed;
      this.scale.y -= delta * diespeed;
      this.scale.z -= delta * diespeed;
      //	If the object is too little it is considered dead
      if (this.scale.x < 0 || this.scale.y < 0 || this.scale.z < 0) {
        this.dead = true;
      }
    }
    //	Rotation
    this.rotation.y += delta * diespeed;
    //	Movement
    this.position.z += delta * speed;
    return this.position.z;
  }
}

export default Target;
