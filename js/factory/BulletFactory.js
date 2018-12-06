import SpaceBullet from '../subjects/SpaceBullet.js'

//  Constant geometry and material
const geometry = new THREE.SphereBufferGeometry(0.5, 12, 12);
const material = new THREE.MeshPhongMaterial({
  color: new THREE.Color("#b58900"),
  opacity: 1,
  flatShading: true,
  shininess: 0.3
});

class BulletFactory{
  //  Static method to create a new object
  static newSpaceBullet(dx, dy, speed, acceleration, listener){
    return new SpaceBullet(geometry, material, dx, dy, speed, acceleration, listener);
  }
}

export default BulletFactory;
