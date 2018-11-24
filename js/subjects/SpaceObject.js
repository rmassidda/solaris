class SpaceObject extends THREE.Mesh {
	constructor(x, y, speed, acceleration) {
		super(new THREE.IcosahedronBufferGeometry(2, 2), new THREE.MeshPhysicalMaterial({
			color: new THREE.Color('white'),
			//emissive: new THREE.Color('#ffffff')
			emissiveIntensity: 0.1
        }));
        this.initial_speed = speed;
        this.acceleration = acceleration;
		this.position.set(x, y, -1000);
    }

    update(delta) {
        var speed = delta*this.acceleration + this.initial_speed;
		this.position.z += delta*speed;
		return this.position.z;
    }
}

export default SpaceObject;