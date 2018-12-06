import Star from '../subjects/Star.js'

//  Constant geometry and material
const geometry = new THREE.IcosahedronBufferGeometry(2, 2);
const material =  new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('white'),
  emissive: new THREE.Color('#ffffff'),
  emissiveIntensity: 0.1
});

class ObjectFactory{
  //  Static method to create a new object
  static newStar(x, y, speed, acceleration){
    return new Star(geometry,material,x, y, speed, acceleration);
  }
}

export default ObjectFactory;
