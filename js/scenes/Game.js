import Lifebar from '../subjects/Lifebar.js'
import SpaceBullet from '../subjects/SpaceBullet.js'
import SpaceObject from '../subjects/SpaceObject.js'
import SpaceSpecialTarget from '../subjects/SpaceSpecialTarget.js'
import SpaceTarget from '../subjects/SpaceTarget.js'

const start_point = 3000;
const start_distance = 0;
const start_speed = 100;

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
    //  Orologio di gioco
    this.clock = new THREE.Clock();
    this.deltaTime = 0;
    this.deltaOutOfFuel = 0;
    //  Punteggio iniziale
    this.points = start_point;
    //  Distanza percorsa
    this.distance = start_distance;
    this.old_distance = this.distance;
    this.sign = 1;
    //  Velocità
    this.initial_speed = start_speed;
    this.speed = start_speed;
    //  Accelerazione
    this.acceleration = 2;
  }

  update() {
    // Elapsed time
    this.deltaTime = this.clock.getDelta();
    this.deltaOutOfFuel += this.deltaTime;
    //  Play state
    if (this.currentState == 'play') {
      //  Update game data
      this.distance += this.speed * this.deltaTime;
      this.speed += this.acceleration * this.deltaTime;
      //  Decrease player's points
      this.points -= (this.deltaTime * this.speed) / 2;
      //  Notification that a certain distance has been passed
      if (this.distance >= 1000 * this.sign) {
        this.notify.push({
          color: { r: 0, g: 1, b: 0 },
          value: 1000 * this.sign + "!",
          position: "left"
        });
        this.sign++;
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
      if (this.points <= 0) {
        //  Zero Punti
        this.points = 0;
        //  Game Over
        this._updateCurrentState('game_over');
      }
    }
    if (this.currentState == "game_over" || this.currentState == "intro") {
      this.end();
    }
    if (this.currentState != "pause") {
      //  Ambient Object
      var n, aX, bX, aY, bY, x, y, obj;
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
      //  Spostamento degli oggetti ambientali
      for (let i = 0; i < this.ambient.length; i++) {
        //  Oggetto non visibile da rimuovere
        if (this.ambient[i].update(this.deltaTime) > 0) {
          this.to_remove.add(this.ambient[i]);
        }
      }
      //  Probabilità uniforme 1/100 che durante un frame sia generato un oggetto
      if (
        this.distance - this.old_distance > this.speed &&
        this.currentState == "play"
      ) {
        //  Scelta del tipo di oggetto
        /*
                ALFA:   50%
                BETA:   30%
                GAMMA:  15%
                DELTA:  5%
                */
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
        //  Y tra -1 e 1
        //  X tra -ratio + ratio
        aX = -this.camera.aspect * 10; // this.canvas.width / 100;
        bX = -aX;
        aY = -10; //this.canvas.height / 100;
        bY = -aY;
        x = aX + (bX - aX) * Math.random();
        y = aY + (bY - aY) * Math.random();
        if (Math.random() < 0.5)
          obj = new SpaceTarget(
            x,
            y,
            this.speed / 4,
            this.acceleration,
            type,
            this.listener
          );
        else
          obj = new SpaceTarget(
            x,
            y,
            this.speed / 4,
            this.acceleration,
            type,
            this.listener
          );
        this.targets.push(obj);
        this.scene.add(obj);
        this.old_distance = this.distance;
      }
      //  Spostamento degli oggetti di gioco
      for (let i = 0; i < this.targets.length; i++) {
        //  Oggetto non visibile da rimuovere
        if (
          this.targets[i].update(this.deltaTime) > 0 ||
          this.targets[i].dead
        ) {
          this.to_remove.add(this.targets[i]);
        }
      }
      //  Spostamento dei proiettili
      for (let i = 0; i < this.bullets.length; i++) {
        var bullet = this.bullets[i];
        //  Aggiornamento della posizione
        bullet.update(this.deltaTime);
        //  Eventuale collisione
        //  Distanza telecamera oggetto
        //  TODO: Valore di far = 10 trovato sperimentalmente, giustificazione teorica?
        var raycaster = new THREE.Raycaster(
          bullet.position,
          bullet.direction,
          0,
          10
        );
        //  Il raggio interseca un qualche target?
        var intersects = raycaster.intersectObjects(this.targets, false);
        if (intersects.length > 0) {
          //  Se l'oggetto non è già stato colpito
          if (!intersects[0].object.die) {
            //  Azione sull'oggetto
            intersects[0].object.kill();
            //  Aumento del punteggio
            this.points += intersects[0].object.bonus;
            //  Il punteggio ha un massimo
            if (this.points > start_point) {
              this.points = start_point;
            }
            //  Rimozione del proiettile
            bullet.mute();
            this.to_remove.add(bullet);

            //  Notifica
            this.notify.push({
              color: intersects[0].object.material.color,
              value: intersects[0].object.bonus,
              position: "center"
            });
          }
        }

        //  Se il proiettile non è più visibile viene rimosso
        if (bullet.position.z < -200) {
          bullet.mute();
          this.to_remove.add(bullet);
        }
      }
    }

    //  Aggiornamento della lifebar
    this.lifebar.update(this.points);
    //  Rimozione degli oggetti non più visibili
    this.ambient = this.ambient.filter(obj => !this.to_remove.has(obj));
    this.bullets = this.bullets.filter(obj => !this.to_remove.has(obj));
    this.targets = this.targets.filter(obj => !this.to_remove.has(obj));
    this.scene.children = this.scene.children.filter(
      obj => !this.to_remove.has(obj)
    );
    //  Azzeramento dell'insieme
    this.to_remove.clear();
    //  Render della scena
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
      target.kill();
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
      this.initial_speed,
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
