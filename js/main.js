import fscreen from  './libs/fscreen/src/index.js'
import Game from './scenes/Game.js'
import Swipe from './libs/Swipe.js'

//	Canvas
const canvas = document.getElementById("canvas");
//	Scene
var gameScene = new Game(canvas);
//	Title
var title = document.getElementById("title");
title.style.opacity = 0;
title.style.visibility = 'visible';
//	Fullscreen abilitation
var enableFullscreen = true;
//	Statistics
var statistics = document.getElementById("statistics");
statistics.style.opacity = 0;
//	Highscore
var highscore = 0;
//	Internal status
var currentStatus;
//	Swipe
var swipe;
var tap = new THREE.Vector2();

//	Bind user events to callback functions
bindEventListeners();
//	First resize of the canvas
resizeCanvas();	
//	Start of the game loop
render();

function bindEventListeners() {
	//	Auto adjust the window
	window.addEventListener('resize',onResizeListener,false);
	//	Mouse events
	document.addEventListener('mousedown',onMouseDown,false);
	document.addEventListener('mousemove',onMouseMove,false);
	document.addEventListener('mouseup',onMouseUp,false);
	//	Touch events
	document.addEventListener('touchstart',onTouchStart,{passive: false});
	document.addEventListener('touchmove',onTouchMove,{passive: false});
	document.addEventListener('touchend',onTouchEnd,{passive: false});
	//	Keyboard event
	document.addEventListener('keydown',onKeyDown,false);
}

//	Viewable statistics
function switchStatistics(){
	if(statistics.style.opacity==0)
		statistics.style.opacity = 1;
	else
		statistics.style.opacity = 0;
}

function switchFullscreen(){
	enableFullscreen = !enableFullscreen;
}

function onKeyDown(event){
	//event.preventDefault();
	switch(event.key){
		case " ": gameScene.pause(); break;
		case "d": switchStatistics(); break;
		case "f": switchFullscreen(); break;
	}
}

function onMouseDown(event){
	event.preventDefault();
	handleStart(event.pageX,event.pageY);
}
function onTouchStart(event){
	event.preventDefault();
	handleStart(event.touches[0].pageX,event.touches[0].pageY);
}
function handleStart(x,y){
	tap.x = ( x / window.innerWidth ) * 2 - 1;
	tap.y = - ( y / window.innerHeight) * 2 + 1;
	swipe = new Swipe(tap.x,tap.y);
}

function onTouchMove(event){
	event.preventDefault();
}
function onMouseMove(event){
	event.preventDefault();
}

function onTouchEnd(event){
	event.preventDefault();
	handleEnd(event.changedTouches[0].pageX,event.changedTouches[0].pageY);
}
function onMouseUp(event){
	event.preventDefault();
	handleEnd(event.pageX,event.pageY);
}
function handleEnd(x,y){
	//	Tap coordinates
	tap.x = ( x /  window.innerWidth ) * 2 - 1;
	tap.y = - ( y /  window.innerHeight) * 2 + 1;
	var swipeDirection = swipe.checkSwipe(tap.x,tap.y);
	//	Single tap
	if(swipeDirection==null){
		//	Fullscreen when clicked
		if (fscreen.fullscreenElement === null && enableFullscreen) {
			fscreen.requestFullscreen(document.body);
			resizeCanvas();
		}
		//	Unpause game if paused
		if(currentStatus == 'pause'){
			gameScene.pause();
		}
		//	Play mode: shoot!
		else if(currentStatus == 'play'){
			gameScene.shoot(tap);
		}
		//	Intro/GameOver, start new game
		else{
			gameScene.start();
		}
	}
	//	Swipe Down
	else if(swipeDirection=='down'){
		//	Pause
		gameScene.pause();
	}
	//	Swipe Up
	else if(swipeDirection=='up'){
		//	If the game is paused, new game
		if(currentStatus=='pause'){
			gameScene.restart();
		}
	}
}

function onResizeListener(event){
	resizeCanvas();
}

function resizeCanvas() {
	canvas.style.width = '100%';
	canvas.style.height= '100%';
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
    gameScene.onWindowResize();
}

function titleDisappear(){
	//	Start animation
	title.style.animationName = 'disappear';
	title.style.opacity = 0;
}

function titleAppear(strings){
	//	Start animation
	title.style.animationName = 'appear';
	title.style.opacity = 1;
	//	Subtitle
	var subtitle = document.getElementById('subtitle');
	//	Remove old childs
	while(subtitle.firstChild){
		subtitle.removeChild(subtitle.firstChild);
	}
	//	Add messages
	strings.forEach(element => {
		//	HTML Tag
		var new_message = document.createElement('h3');
		//	Message
		new_message.innerText = element.message;
		//	Color
		if(element.color != null){
			new_message.style.color = element.color;
		}
		//	Add to DOM
		subtitle.appendChild(new_message);
	});
}

function render() {
	//	Update objects
	gameScene.update();

	var notification = gameScene.notify.pop();
	//	If there's some new notification
	if(notification!=null){
		//	Remove old notification (if present)
		var old_notification = document.getElementById(notification.position);
		if(old_notification!=null){
			document.body.removeChild(old_notification);
		}
		//	New notification element
		var new_notification = document.createElement('h1');
		//	Class name
		new_notification.className = 'notify';
		//	Unique ID
		new_notification.id = notification.position;
		//	Get the color
		var c = notification.color;
		//	Set the color
		new_notification.style.color = 'rgb('+c.r*100+'%,'+c.g*100+'%,'+c.b*100+'%)';
		//	Set opacity to zero, this is the value at the end of the animation
		new_notification.style.opacity = 0;
		//	Set the text value
		new_notification.innerText = notification.value;
		//	Add it to the document
		document.body.appendChild(new_notification);
	}

	var status = gameScene.status.pop();
	//	If there's a status change
	if(status!=null){
		if(status=='play'){
			titleDisappear();
		}
		else if(status== 'intro'){
			titleAppear([
				{
					message: 'New Game',
					color: 'green'
				},
				{
					message: 'Touch to start\nswipe down to pause'
				}
			]);
		}
		else if(status == 'game_over'){
			highscore = Math.ceil(Math.max(highscore,gameScene.distance));
			titleAppear([
				{
					message: 'Game Over',
					color: 'red'
				},
				{
					message: 'Current score\t'+Math.ceil(gameScene.distance)
				},
				{
					message: 'Highscore\t'+highscore
				}
			])
		}
		else if(status == 'pause'){
			titleAppear([
				{
					message: 'Pause',
					color: 'green'
				},
				{
					message: 'Touch to unpause\nswipe up to start new game'
				},
				{
					message: 'Current score\t'+Math.ceil(gameScene.distance)
				},
				{
					message: 'Highscore\t'+highscore
				}
			])
		}
		currentStatus = status;
	}

	//	Statistics
	statistics.innerText = 
		Math.floor(gameScene.points)+"LP\t"+
		gameScene.distance.toFixed(2)+"m\t"+
		gameScene.speed.toFixed(2)+"m/s";

	//	Next iteration
    requestAnimationFrame(render);
}