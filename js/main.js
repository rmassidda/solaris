/*
	> Variables that refer to HTML elements are declared here.
	> 
*/
import fscreen from  './libs/fscreen/src/index.js'

//	Canvas
const canvas = document.getElementById("canvas");
//	Scene
var gameScene = new Game(canvas);
//	Title
var title = document.getElementById("title");
title.style.opacity = 0;
title.style.visibility = 'visible';
//	Notify
var notifications = [];
notifications[0]= document.getElementById("notify_left");
notifications[1] = document.getElementById("notify_center");
notifications[2] = document.getElementById("notify_right");
//	Fullscreen abilitation
var enable_fullscreen = true;
//	Statistics
var stat = document.getElementById("stats");
stat.style.opacity = 0;
stat.children[0].innerText = Math.floor(gameScene.points);
stat.children[1].innerHTML = gameScene.distance.toFixed(2);
stat.children[2].innerHTML = gameScene.speed.toFixed(2);
var highscore = 0;

//	Bind user events to callback functions
bindEventListeners();
//	First resize of the canvas
resizeCanvas();	
//	Start of the game loop
render();

function bindEventListeners() {
	//	Auto adjust the window
	window.addEventListener('resize',onResizeListener,false);
	//	Click/tap event
	document.addEventListener('mousedown',OnMouseDown,false);
	//	Keyboard event
	document.addEventListener('keydown',onKeyDown,false);
}

//	Viewable statistics
function switchStatistics(){
	if(stat.style.opacity==0)
		stat.style.opacity = 1;
	else
		stat.style.opacity = 0;
}

function switchFullscreen(){
	enable_fullscreen = !enable_fullscreen;
}

function onKeyDown(event){
	//event.preventDefault();
	switch(event.key){
		case " ": gameScene.pause(); break;
		case "d": switchStatistics(); break;
		case "f": switchFullscreen(); break;
	}
}

function OnMouseDown(event){
	event.preventDefault();
	var mouse = new THREE.Vector2();
	mouse.x = ( event.pageX /  window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.pageY /  window.innerHeight) * 2 + 1;
	if (fscreen.fullscreenElement === null && enable_fullscreen) {
		fscreen.requestFullscreen(document.body);
		resizeCanvas();
	}
	gameScene.shoot(mouse);
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

function render() {
	//	Update objects
	gameScene.update();

	//	Play!
	if(gameScene.mode == 'play'){
		title.style.opacity = 0;
		title.style.animationName = 'disappear';
		//	Get notification from the game
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
	}
	else{ 
		// Make the menu visible
		title.style.animationName = 'appear';
		title.style.opacity = 1;
		if(gameScene.mode == 'intro'){
			title.children[2].innerHTML = 'New Game';
			title.children[2].style.color = 'green';
			title.children[3].innerHTML = '';
			title.children[4].innerHTML = '';
		}
		else if(gameScene.mode == 'game_over'){
			highscore = Math.ceil(Math.max(highscore,gameScene.distance));
			title.children[2].innerHTML = 'Game Over';
			title.children[2].style.color = 'red';
			title.children[3].innerHTML = 'Current score\t'+Math.ceil(gameScene.distance);
			title.children[4].innerHTML = 'Highscore\t'+highscore;
		}
		else if(gameScene.mode == 'pause'){
			title.children[2].innerHTML = 'Pause';
			title.children[2].style.color = 'green';
			title.children[3].innerHTML = 'Current score\t'+Math.ceil(gameScene.distance);
			title.children[4].innerHTML = 'Highscore\t'+highscore;
		}
	}
	
	//	
	stat.children[0].innerText = Math.floor(gameScene.points);
	stat.children[1].innerHTML = gameScene.distance.toFixed(2);
	stat.children[2].innerHTML = gameScene.speed.toFixed(2);

	//	Next iteration
    requestAnimationFrame(render);
}