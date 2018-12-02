import Lifebar from '../subjects/Lifebar.js'
import SpaceBullet from '../subjects/SpaceBullet.js'
import SpaceObject from '../subjects/SpaceObject.js'
import SpaceSpecialTarget from '../subjects/SpaceSpecialTarget.js'
import SpaceTarget from '../subjects/SpaceTarget.js'

const start_point = 3000;
const start_distance = 0;
const start_speed = 100;
const start_acceleration = 2;

class Game {
  constructor(canvas) {
    //  Canvas
    this.canvas = canvas;
    //  Oggetti fondamentali per il rendering
    this.scene = this._buildScene();
    this.renderer = this._buildRender();
    this.camera = this._buildCamera();
    //  Listener
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    // Music
    this.undertone = this._buildUndertone();
    //  Light
    this.scene.add(new THREE.PointLight(0xffffff, 1, 1000));
    //  Lifebar
    this.lifebar = new Lifebar(this.points, start_point, 1);
    this.scene.add(this.lifebar);
    //  Game objects
    this.bullets = [];
    this.targets = [];
    this.ambient = [];
    this.to_remove = new Set();
    //  Notifications
    this.notify = [];
    //  Game state
    this.currentState = '';
    this.stateStack = [];
    //  Initialize game data
    this._initialize();
    //  Current game stae
    this._updateCurrentState('intro');
  }

  _buildScene() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    return scene;
  }

  _buildRender() {
    var renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(DPR);
    renderer.setSize(this.canvas.width, this.canvas.height);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    return renderer;
  }

  _buildCamera() {
    var aspectRatio = this.canvas.width / this.canvas.height;
    var fieldOfView = 90;
    var nearPlane = 1;
    var farPlane = 1800;
    var camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );
    return camera;
  }

  _buildUndertone(){
    //  Source
    var sound = new THREE.Audio(this.listener);
    //  Load of the audio file
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load("../../sound/ambient.ogg", function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.7);
      sound.play();
    });
    return sound;
  }

  _updateCurrentState(state){
    this.currentState = state;
    this.stateStack.push(state);
  }

  _initialize(){
    //  Game Clock
    this.clock = new THREE.Clock();
    this.deltaTime = 0;
    //  Time since last "Out Of Fuel" notification
    this.deltaOutOfFuel = 0;
    //  Time since last taget generation
    this.deltaGenerate = 0;
    //  Time since last distance sign
    this.deltaSign = 0;
    //  Initial data
    this.points = start_point;
    this.distance = start_distance;
    this.speed = start_speed;
    this.acceleration = start_acceleration;
  }

  update() {
    // Elapsed time
    this.deltaTime = this.clock.getDelta();
    this.deltaSign += this.deltaTime;
    this.deltaOutOfFuel += this.deltaTime;
    this.deltaGenerate += this.deltaTime;
    //  Play state
    if (this.currentState == 'play') {
      //  Update game data
      this.distance += this.speed * this.deltaTime;
      this.speed += this.acceleration * this.deltaTime;
      //  Decrease player's points
      this.points -= (this.deltaTime * this.speed) / 2;
      //  Notification that a certain distance has been passed
      if (this.deltaSign >= this.speed/100) {
        this.notify.push({
          color: { r: 0, g: 1, b: 0 },
          value: Math.floor(this.distance) + "!",
          position: "left"
        });
        this.deltaSign = 0;
      }
      //  The game is going to end in five seconds.
      if (this.points <= (this.speed + this.acceleration * 5) * 5){
        //  The notification has been sent more than a second ago
        if(this.deltaOutOfFuel > 1){
          this.notify.push({
            color: {
              r: 1,
              g: 0.1,
              b: 0.1
            },
            value: "OUT\nOF\nFUEL\n",
            position: "right"
          });
          this.deltaOutOfFuel = 0;
        }
      }
      //  The last element has been generated more than a second ago
      if (this.deltaGenerate > 1 ) {
        //  Random type
        var choice = Math.random();
        var type = "";
        if (choice <= 0.5){
          type = "alfa";
        } else if (choice <= 0.8) {
          type = "beta";
        } else if (choice <= 0.95) {
          type = "gamma";
        } else {
          type = "delta";
        }
        //  Space coordinates
        let aX = -this.camera.aspect * 10; // this.canvas.width / 100;
        let bX = -aX;
        let aY = -10; //this.canvas.height / 100;
        let bY = -aY;
        let x = aX + (bX - aX) * Math.random();
        let y = aY + (bY - aY) * Math.random();
        var obj = new SpaceTarget(
          x,
          y,
          this.speed / 4,
          this.acceleration,
          type,
          this.listener
        );
        //  Add to targets
        this.targets.push(obj);
        this.scene.add(obj);
        this.deltaGenerate = 0;
      }
      //  Update bullets position and detect collisions
      this.bullets.forEach(bullet =>{
        //  Update position
        if(bullet.update(this.deltaTime) < -200){
            bullet.mute();
            this.to_remove.add(bullet);
        }
        else{
          //  Ray caster to detect collision
          let raycaster = new THREE.Raycaster(bullet.position, bullet.direction,0,10);
          let intersects = raycaster.intersectObjects(this.targets, false);
          if (intersects.length > 0) {
            //  If the object isn't already been hitten
            if (!intersects[0].object.hitten) {
              //  Hit it!
              intersects[0].object.hit();
              //  Achieve bonus
              this.points += intersects[0].object.bonus;
              //  Remove bullet
              bullet.mute();
              this.to_remove.add(bullet);
              //  Notification
              this.notify.push({
                color: intersects[0].object.material.color,
                value: intersects[0].object.bonus,
                position: "center"
              });
            }
          }
        }
      });
      //  Max points
      if (this.points > start_point) {
        this.points = start_point;
      }
      //  Game Over
      if (this.points <= 0) {
        this.points = 0;
        this._updateCurrentState('game_over');
        this.end();
      }
    }
    if (this.currentState != "pause") {
      //  Let the targets die
      this.targets.forEach(target =>{
        if(target.update(this.deltaTime)>0||target.dead){
          this.to_remove.add(target);
        }
      });
      //  Ambient Object
      let n, aX, bX, aY, bY, x, y, obj;
      n = Math.floor(Math.random() * 2);
      aX = -this.canvas.width / 2;
      bX = -aX;
      aY = -this.canvas.height / 2;
      bY = -aY;
      for (let i = 0; i < n; i++) {
        x = Math.floor(aX + (bX - aX) * Math.random());
        y = Math.floor(aY + (bY - aY) * Math.random());
        obj = new SpaceObject(x, y, this.speed, this.acceleration);
        this.ambient.push(obj);
        this.scene.add(obj);
      }
      this.ambient.forEach(object =>{
        if(object.update(this.deltaTime)>0){
          this.to_remove.add(this.object);
        }
      });
    }

    //  Lifebar update
    this.lifebar.update(this.points);
    //  Cleaning
    this.ambient = this.ambient.filter(obj => !this.to_remove.has(obj));
    this.bullets = this.bullets.filter(obj => !this.to_remove.has(obj));
    this.targets = this.targets.filter(obj => !this.to_remove.has(obj));
    this.scene.children = this.scene.children.filter(obj => !this.to_remove.has(obj));
    //  Empty set
    this.to_remove.clear();
    //  Render
    this.renderer.render(this.scene, this.camera);
  }

  //  State control functions
  play(){
    this._initialize();
    this._updateCurrentState('play');
  }

  pause() {
    if (this.currentState == "pause") {
      this._updateCurrentState('play');
      this.clock.start();
    } else if (this.currentState == "play") {
      this._updateCurrentState('pause');
      this.clock.stop();
    }
  }

  end(){
    this.targets.forEach(target => {
      if(!target.hitten){
        target.hit();
      }
    });
  }

  restart(){
    this.end();
    this.play();
  }

  shoot(mouse) {
    //  Creazione del proiettile
    var bullet = new SpaceBullet(
      mouse.x * this.camera.aspect,
      mouse.y,
      start_speed,
      0,
      0.5,
      this.listener
    );
    //  Aggiunta alla scena e all'insieme dei proiettili
    this.scene.add(bullet);
    this.bullets.push(bullet);
    //  Perdita di punti #alebiagiotti
    this.points -= 10;
  }

  //  Other
  onWindowResize() {
    var width = canvas.width;
    var height = canvas.height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  mute(){
    if(this.undertone.isPlaying){
      this.undertone.pause();
    }
    else{
      this.undertone.play();
    }
  }
}

export default Game;
