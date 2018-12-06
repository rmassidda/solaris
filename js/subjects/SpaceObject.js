class SpaceObject extends THREE.Mesh {
	constructor(geometry, material, x, y, speed, acceleration) {
		super(geometry,material);
		//	Where the object is
		this.position.set(x, y, -1000);
		//	How the object moves
    this.initial_speed = speed;
    this.acceleration = acceleration;
    }

		//	Update position
    update(delta) {
			var speed = delta * this.acceleration + this.initial_speed;
			this.position.z += delta * speed;
			return this.position.z;
    }
}

export default SpaceObject;
