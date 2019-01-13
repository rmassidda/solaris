import Lifebar from '../subjects/Lifebar.js'
import BulletFactory from '../factory/BulletFactory.js'
import StarFactory from '../factory/StarFactory.js'
import TargetFactory from '../factory/TargetFactory.js'

const start_point = 3000;
const start_speed = 100;
const start_acceleration = 2;
const bullet_loss = 10;

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
    this.bullets_to_add = [];
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
    this.highscore = 0;
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

  _buildUndertone() {
    //  Source
    var sound = new THREE.Audio(this.listener);
    //  Load of the audio file
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load("sound/ambient.ogg", function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.7);
      sound.play();
    });
    return sound;
  }

  _updateCurrentState(state) {
    this.currentState = state;
    this.stateStack.unshift(state);
  }

  _initialize() {
    //  Game Clock
    this.clock = new THREE.Clock();
    this.deltaTime = 0;
    //  Time since last "Out Of Fuel" notification
    this.deltaOutOfFuel = 0;
    //  Time since last taget generation
    this.deltaGenerate = 0;
    //  Timeout to start new game
    this.gameOverTimeout = 0;
    //  Initial data
    this.points = start_point;
    this.score = 0;
    this.speed = start_speed;
    this.acceleration = start_acceleration;
    this.selected_target = null;
    this.muted = false;
  }

  _generate() {
    let n, aX, bX, aY, bY, x, y, obj;
    if (this.currentState != 'pause') {
      //  Star generation
      x = Math.floor(this.canvas.width * (1 - 2 * Math.random()));
      y = Math.floor(this.canvas.height * (1 - 2 * Math.random()));
      obj = StarFactory.newStar(x, y, this.speed, this.acceleration);
      this.ambient.unshift(obj);
      this.scene.add(obj);

      if (this.currentState == 'play') {
        //  The game is going to end in five seconds.
        if (this.points <= (this.speed + this.acceleration * 5) * 5) {
          //  The notification has been sent more than a second ago
          if (this.deltaOutOfFuel > 1) {
            this.notify.unshift({
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
        if (this.deltaGenerate > 1) {
          //  Random type
          var choice = Math.random();
          var type = "";
          if (choice <= 0.5) {
            type = "alfa";
          } else if (choice <= 0.8) {
            type = "beta";
          } else if (choice <= 0.95) {
            type = "gamma";
          } else {
            type = "delta";
          }
          //  Space coordinates
          x = this.camera.aspect * 10 * (1 - 2 * Math.random());
          y = 10 * (1 - 2 * Math.random());
          obj = TargetFactory.newTarget(
            x,
            y,
            this.speed / 4,
            this.acceleration,
            type,
            this.listener
          );
          //  Add to targets
          this.targets.unshift(obj);
          this.scene.add(obj);
          this.deltaGenerate = 0;
        }
        while (this.bullets_to_add.length != 0) {
          let bullet = this.bullets_to_add.pop();
          this.scene.add(bullet);
          this.bullets.unshift(bullet);
          this.points -= bullet_loss;
        }
      }
    }
  }

  update() {
    // Update times
    this.deltaTime = this.clock.getDelta();
    this.deltaOutOfFuel += this.deltaTime;
    this.deltaGenerate += this.deltaTime;
    this.gameOverTimeout += this.deltaTime;
    //  Play state
    if (this.currentState == 'play') {
      //  Update game data
      this.speed += this.acceleration * this.deltaTime;
      //  Decrease player's points
      this.points -= (this.deltaTime * this.speed) / 2;
      //  Update bullets position and detect collisions
      this.bullets.forEach(bullet => {
        //  Ray caster to detect collision
        let raycaster = new THREE.Raycaster(bullet.position, bullet.direction, 0, 10);
        let intersects = raycaster.intersectObjects(this.targets, false);
        if (intersects.length > 0) {
          //  If the object isn't already been hitten
          if (!intersects[0].object.hitten) {
            //  Hit it!
            intersects[0].object.hit();
            //  Achieve bonus
            this.points += intersects[0].object.bonus;
            this.score += intersects[0].object.bonus;
            //  Remove bullet
            this.to_remove.add(bullet);
            //  Notification
            this.notify.unshift({
              color: intersects[0].object.material.color,
              value: intersects[0].object.bonus,
              position: "center"
            });
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
      if (this.currentState != "edit") {
        this.targets.forEach(target => {
          if (target.update(this.deltaTime) > 0 || target.dead) {
            //  Material can't be reused, so it's disposed
            target.material.dispose();
            this.to_remove.add(target);
          }
        });
      }
      this.bullets.forEach(bullet => {
        if (bullet.update(this.deltaTime) < -200) {
          this.to_remove.add(bullet);
        }
      });
      this.ambient.forEach(star => {
        if (star.update(this.deltaTime) > 0) {
          this.to_remove.add(star);
        }
      });
    }
    //  Lifebar update
    this.lifebar.update(this.points);
    //  Cleaning
    this.ambient = this.ambient.filter(obj => !this.to_remove.has(obj));
    this.bullets = this.bullets.filter(obj => !this.to_remove.has(obj));
    this.targets = this.targets.filter(obj => !this.to_remove.has(obj));
    //  THREE.JS documentation suggests to remove meshes like this
    this.to_remove.forEach(obj => {
      this.scene.remove(obj);
    });
    //  Empty set
    this.to_remove.clear();
    //  Generate new objects
    this._generate();
    //  Render
    this.renderer.render(this.scene, this.camera);
  }

  //  State control functions
  play() {
    if (this.gameOverTimeout > 1) {
      this._initialize();
      this._updateCurrentState('play');
    }
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

  edit() {
    if (this.currentState == "play") {
      this._updateCurrentState("edit");
    } else if (this.currentState == "edit") {
      this._updateCurrentState("play");
      //  Deselect old target
      if (this.selected_target !== null) {
        this.selected_target.deselect();
        this.selected_target = null;
      }
    }
  }

  select(tap) {
    //  Deselect old target
    if (this.selected_target !== null) {
      this.selected_target.deselect();
    }
    //  Ray in the direction of the tap
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(tap, this.camera);
    // Targets intersecting the ray
    var intersects = raycaster.intersectObjects(this.targets);
    if (intersects.length > 0) {
      //  Target tapped
      this.selected_target = intersects[0].object;
      this.selected_target.select();
      return this.selected_target;
    } else {
      return null;
    }
  }

  addTarget(tap) {
    //  Ray in direction of the tap
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(tap, this.camera);
    //  Intersection with the plane
    //  Plane
    let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 50);
    let point = raycaster.ray.intersectPlane(plane,new THREE.Vector3());
    //  New Object
    var obj = TargetFactory.newTarget(
      0,
      0,
      this.speed / 4,
      this.acceleration,
      "alfa",
      this.listener
    );
    //  Position it in the intersection
    obj.position.copy(point);
    //  Add to the target set
    this.targets.unshift(obj);
    //  Add to the scene
    this.scene.add(obj);
    //  Select it!
    if (this.selected_target !== null) {
      this.selected_target.deselect();
    }
    this.selected_target = obj;
    obj.select();
    return obj;
  }

  changeTargetType() {
    if (this.selected_target !== null) {
      this.selected_target.changeType();
    }
  }

  depthTarget(direction) {
    if (this.selected_target !== null) {
      if (direction) {
        this.selected_target.position.z += 10;
      } else {
        this.selected_target.position.z -= 10;
      }
    }
  }

  end() {
    //  Game is ended, start timeout
    this.gameOverTimeout = 0;
    //  Update highscore
    if (this.score > this.highscore) {
      this.highscore = this.score;
    }
    //  Destroy remaining targets
    this.targets.forEach(target => {
      if (!target.hitten) {
        target.hit();
      }
    });
  }

  restart() {
    this.end();
    this.play();
  }

  shoot(mouse) {
    //  Creazione del proiettile
    var bullet = BulletFactory.newBullet(
      mouse.x * this.camera.aspect,
      mouse.y,
      start_speed,
      0,
      this.listener
    );
    this.bullets_to_add.unshift(bullet);
  }

  onWindowResize() {
    var width = canvas.width;
    var height = canvas.height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  //  Audio
  mute() {
    if (this.muted) {
      this.listener.setMasterVolume(1);
    } else {
      this.listener.setMasterVolume(0);
    }
    this.muted = !this.muted;
  }
}

export default Game;
