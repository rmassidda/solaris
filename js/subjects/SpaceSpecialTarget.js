class SpaceSpecialTarget extends THREE.Mesh {
	constructor(x, y, speed, acceleration, type,listener) {
		super(new THREE.OctahedronBufferGeometry(2, 0), new THREE.MeshPhongMaterial(
			{
				opacity: 1,
				flatShading: true,
				shininess: 0.3
			}
		));
		//	Tipo di pallina
		this.type = type;
		//	Colore
		switch (type) {
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
		//	Velocità
		this.initial_speed = speed;
		//	Accelerazione
		this.acceleration = acceleration;
		//	Posizione iniziale
		this.position.set(x, y, -250);
		//	Stato dell'oggetto
		this.die = false;
		this.dead = false;
		//	Rappresentazione HSL del colore
		this.hsl = {};
		this.material.color.getHSL(this.hsl);
		//	Audio
		var sound = new THREE.PositionalAudio(listener);
		// Caricamento dell'oggetto audio
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load('../../sound/die.ogg', function (buffer) {
			sound.setBuffer(buffer);
			sound.setRefDistance(20);
			sound.setVolume(0.6);
		});
		this.sound = sound;
		this.add(this.sound);
	}

	kill() {
		//	Scolorimento progressivo
		this.die = true;
		//	Suono
		this.sound.play();
	}

	update(delta) {
		var speed = delta * this.acceleration + this.initial_speed;
		var diespeed = 1/1.41;
		//	Se l'oggetto è in fase terminale
		if (this.die && !this.dead) {
			//	Desaturazione
			this.hsl.s -= delta;
			this.material.color.setHSL(this.hsl.h, this.hsl.s, this.hsl.l);
			//	Rimpicciolimento
			this.scale.x -= delta * diespeed;
			this.scale.y -= delta * diespeed;
			this.scale.z -= delta * diespeed;
			//	Se l'oggetto è troppo piccolo per essere visto viene terminato
			if (this.scale.x < 0 || this.scale.y < 0 || this.scale.z < 0) {
				this.dead = true;
			}
		}
        this.rotation.y += delta;
		this.position.z += delta * speed;
		return this.position.z;
	}
}

export default SpaceSpecialTarget;