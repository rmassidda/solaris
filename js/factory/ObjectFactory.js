import SpaceObject from '../subjects/SpaceObject.js'

//  Constant geometry and material
const geometry = new THREE.IcosahedronBufferGeometry(2, 2);
const material =  new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('white'),
  emissive: new THREE.Color('#ffffff'),
  emissiveIntensity: 0.1
});

class ObjectFactory{
  //  Static method to create a new object
  static newSpaceObject(x, y, speed, acceleration){
    return new SpaceObject(geometry,material,x, y, speed, acceleration);
  }
}

export default ObjectFactory;
