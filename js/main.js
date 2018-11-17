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
var notify_left = document.getElementById("notify_left");
var notify_center = document.getElementById("notify_center");
var notify_right = document.getElementById("notify_right");
//	Statistics
var stat = document.getElementById("stats");
stat.children[0].innerText = Math.floor(gameScene.points);
stat.children[1].innerHTML = gameScene.distance.toFixed(2);
stat.children[2].innerHTML = gameScene.speed.toFixed(2);
var highscore = 0;
//	Giocabilità
var playable = false;

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

function onKeyDown(event){
	//event.preventDefault();
	switch(event.key){
		case " ": gameScene.pause();
	}
}

function OnMouseDown(event){
	event.preventDefault();
	var mouse = new THREE.Vector2();
	mouse.x = ( event.pageX /  window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.pageY /  window.innerHeight) * 2 + 1;
	//	TODO: should the game always be fullscreen?
	if (fscreen.fullscreenElement === null) {
		fscreen.requestFullscreen(document.body);
		resizeCanvas();
	}
	if(playable)
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
	
	//	Draw
	//	Make notifications disappear
	//	TODO: Use the game speed!
	//	TODO: Is there a smarter way to do this? Same code for three objects, maybe an array of notifies and a filter function
	/*
		Something like:
		var not = [left,center,right]
		var not_still_viewable = filter(not,function(x){x.style.opacity>0})
		for n in not_stillviewable
			same code written down 
	*/
	if(notify_right.style.opacity > 0){
		var opacity = parseFloat(notify_right.style.opacity);
		opacity -= 0.02;
		if(opacity<=0){
			notify_right.style.opacity = 0;
		}
		else{
			notify_right.style.opacity = opacity;
		}
	}
	if(notify_center.style.opacity > 0){
		var opacity = parseFloat(notify_center.style.opacity);
		opacity -= 0.02;
		if(opacity<=0){
			notify_center.style.opacity = 0;
		}
		else{
			notify_center.style.opacity = opacity;
		}
	}
	if(notify_left.style.opacity > 0){
		var opacity = parseFloat(notify_left.style.opacity);
		opacity -= 0.02;
		if(opacity<=0){
			notify_left.style.opacity = 0;
		}
		else{
			notify_left.style.opacity = opacity;
		}
	}
	//	Modalità di gioco
	if(gameScene.mode == 'play'){
		//	Se il titolo non è ancora scomparso
		if(title.style.visibility != 'hidden'){
			var opacity = parseFloat(title.style.opacity);
			opacity -= 0.02;
			if(opacity<=0){
				title.style.opacity = 0;
				title.style.visibility = 'hidden';
			}
			else{
				title.style.opacity = opacity;
			}
		}
		var notification = gameScene.notify.pop();
		if(notification!=null){
			var notify_slot;
			switch(notification.position){
				case 'left':
					notify_slot = notify_left;
					break;
				case 'center':
					notify_slot = notify_center;
					break;
				case 'right':
					notify_slot = notify_right;
					break;
			}
			var c = notification.color;
			notify_slot.style.color = 'rgb('+c.r*100+'%,'+c.g*100+'%,'+c.b*100+'%)';
			notify_slot.style.opacity = 1;
			notify_slot.firstElementChild.innerHTML = notification.value;
		}
	}
	else{
		//	Se il titolo non è ancora visibile
		if(title.style.visibility == 'hidden'){
			title.style.visibility = 'visible';
		}
		var opacity = parseFloat(title.style.opacity);
		if(opacity<1){
			playable = false;
			opacity += 0.01;
			title.style.opacity = opacity;
		}
		if(opacity<=0.5){
			//	Non si può giocare fin quando il titolo non è ricomparso
			playable = false;
		}
		else{
			//	Titolo ricomparso si può giocare
			playable = true;
		}
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