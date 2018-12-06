import Target from '../subjects/Target.js'

//  Constant geometry
const geometry = new THREE.SphereBufferGeometry(2, 12, 12);

class TargetFactory{
  //  Static method to create a new object
  static newTarget(x, y, speed, acceleration, type,listener){
    return new Target(geometry, x, y, speed, acceleration, type,listener);
  }
}

export default TargetFactory;
