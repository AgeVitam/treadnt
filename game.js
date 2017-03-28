/*
Treadn't - a game based on a snake flag meme
Written in 2017 by "AgeVitam" sebastian.naugahyde@gmail.com

To the extent possible under law, the author(s) have dedicated all copyright 
and related and neighboring rights to this software to the public domain 
worldwide. This software is distributed without any warranty.

You should have received a copy of the CC0 Public Domain Dedication along 
with this software. 
If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
*/


//declarations
var stage = document.getElementById("gameCanvas");
stage.width = 640;
stage.height = 480;
var ctx = stage.getContext("2d");
ctx.font = "bold 40px sans-serif";
var gamePaused, movingCCW, textFade, snek, radius, score, sign, isMouseClicked,
    angle, incr, length, center, head, isGameOver, isKeyPressed, boots, maxBoots,
    fireworks;
reset();

//functions

function reset(){
  gamePaused      = false,
  movingCCW       = false,
  textFade        = 300,
  snek            = [],
  radius          = 30,
  score           =	0,
  angle           = 0,
  incr            = Math.PI / 16,	//angle of arc segment to move head each frame
  length          =	30,
  boots           = [],
  maxBoots        =	100,
  center = {
    'x': (stage.width / 2),
    'y': (stage.height / 2)
  };
  head = { 
    'x': (center.x + radius),
    'y': (stage.height / 2)
  };
  isGameOver      = false;
  isKeyPressed  	= false;
  isMouseClicked  = false;
  fireworks       = [];
}

function getRandomInt(min, max) { //inclusive min, exclusive max
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function magnitude(vec) {
  return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
}

function distance(vec1,vec2) {
  var vecr = {
    "x": (vec1.x - vec2.x),
    "y": (vec1.y - vec2.y)
  }
  return magnitude(vecr);
}

function clearScreen(){
  ctx.fillStyle = "#F4DC00";
  ctx.fillRect(0,0,stage.width, stage.height);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.strokeRect(0,0,stage.width, stage.height);
}

function gameOver() {
  ctx.fillStyle = "#000";
  ctx.fillText("GAME OVER", (stage.width - 280) / 2, stage.height / 2);
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("Press ESC to restart", (stage.width - 240) / 2, (stage.height / 2) + 20);
  ctx.font = "bold 40px sans-serif";
}

function explode(newx,newy,color,speed) {
  var strc
  if (color == 'red') {
    strc = 'rgba(255,0,0,'
  } else if (color == 'white') {
    strc = 'rgba(255,255,255,'
  } else { // blue
    strc = 'rgba(0,0,255,'
  }
  fireworks.push( 
    {
      'x': newx,
      'y': newy,
      'radius': 1,
      'color': strc,
      'alpha': 90,
      'speed': speed
    })
}

function drawFireworks() {
  fireworks.forEach (function(firework, index, array){
    var theta
    for(theta = 0; theta < (Math.PI *2); theta += (Math.PI / 32)) {
      ctx.beginPath();
      cos = Math.cos(theta);
      sin = Math.sin(theta);
      fx = firework.x + (firework.radius * cos);
      fy = firework.y + (firework.radius * sin);
      ctx.moveTo(fx,fy);
      fx = firework.x + ((firework.radius + 5) * cos);
      fy = firework.y + ((firework.radius + 5) * sin);
      ctx.lineTo(fx,fy);
      ctx.strokeStyle = firework.color + (firework.alpha / 90) + ')';
      ctx.stroke();
    }
    firework.radius += firework.speed;
    firework.alpha--;
		if (firework.alpha <= 0) {fireworks.splice(index,1)}
  })
}

function bootSpawn() {
  if (boots.length < maxBoots) {
    if (getRandomInt(0,100) > 98) {
      var newBoot = {
        "x": getRandomInt(1,(stage.width - 80)),
        "y": -80,
      };
      boots.push(newBoot);
    }
  }
}

function collisionDetect(object, xstart, ystart, xend, yend) {
	if ((object.x > xstart) && (object.x < xend)) {
		if ((object.y > ystart) && (object.y < yend)) { return true }
	}
	return false
}

function eatBoot(index) {
	score++;
	boots.splice(index, 1);
	explode(head.x, head.y, 'red', 3);
	explode(head.x, head.y, 'white', 2);
	explode(head.x, head.y, 'blue', 1);
}

function die() {
	isGameOver = true
}

function moveBoots() {
  boots.forEach(function(boot, bindex, array) {
    boot.y += (score == 0) ? 1 : Math.ceil(score / 10);
    if (boot.y > stage.height) {boots.splice(bindex, 1)};
    //collision detecion
		var hit1 = collisionDetect(head,boot.x,boot.y,boot.x + 34, boot.y + 85);
		var hit2 = collisionDetect(head,boot.x,boot.y + 67, boot.x + 85, boot.y + 85);
		if ((hit1 == true) || (hit2 == true)) {eatBoot(bindex)};
		snek.slice(0,(snek.length - 1)).forEach(function(point,sindex,array) {
			var hit3 = collisionDetect(point, boot.x, boot.y, boot.x + 34, boot.y + 85);
			var hit4 = collisionDetect(point, boot.x, boot.y + 67, boot.x + 85, boot.y +85);
			if ((hit3 == true) || (hit4 == true)) {die()}
		})
  })
}

function showPause() {
	ctx.fillStyle = "#000";
	ctx.fillText("PAUSED", ((stage.width - 170) / 2), (stage.height / 2));
	ctx.font = "bold 20px sans-serif";
	ctx.fillText("Press ESC to resume", ((stage.width - 240) / 2), ((stage.height / 2) + 20));
	ctx.font = "bold 40px sans-serif";
}

function moveHead() {
	sign = (movingCCW == true) ? (-1) : 1;
	snek.push({"x": head.x, "y": head.y});
	if (snek.length > length) {snek.shift()};
	angle += incr;
	if (angle >= 2 * Math.PI) {angle -= 2 * Math.PI};
	head.x = center.x + ((radius * Math.cos(angle * sign)));
	head.y = center.y + ((radius * Math.sin(angle * sign)));
	var hit = collisionDetect(head, 0, 0, stage.width, stage.height);
	if (hit == false) {die()}
}

function drawSnek() {
	ctx.fillStyle = "#000";
	snek.forEach(function(point, index, array) {
		ctx.beginPath();
		ctx.arc(point.x,point.y, 6, 0, Math.PI * 2);
		ctx.fill();
	});
}

function fadeText() {
	ctx.fillStyle = "rgba(0,0,0," + (textFade / 300) + ")";
	ctx.fillText("Treadn't", ((stage.width - 180) / 2), ((stage.height / 2) + 100));
	textFade--
}

function drawBoots() {
	boots.forEach(function(boot, index, array) {
		ctx.drawImage(bootImg, boot.x, boot.y);
	})
}
//event handling

function turnAround() {
  movingCCW = movingCCW ? false : true;
  center.x = ((2 * head.x) - center.x);
  center.y = ((2 * head.y) - center.y);
  angle = Math.PI - angle;
}

function keyDownHandler(event) {
  if (isKeyPressed == false) {
    isKeyPressed = true
    var keyName = event.key;
    if (isGameOver == false) {
      if (keyName == "Escape") {
        gamePaused = gamePaused ? false : true;
      } else {turnAround()}
    } else {
      if (keyName == "Escape") {
        reset();
      }
    }
  }
}

function keyUpHandler(event) {
  if (isKeyPressed == true) {
    isKeyPressed = false;
    var keyName = event.key;
    if ((keyName != "Escape") && (isGameOver == false)) {turnAround()}
  }
}

function mouseDownHandler(event) {
  if (isMouseClicked == false) {
    isMouseClicked = true;
    turnAround();
  }
}

function mouseUpHandler(event) {
  if (isMouseClicked == true) {
    if (isGameOver == true) {
      reset();
    } else {
      isMouseClicked = false;
      turnAround();
    }
  }
}
    

//loading screen

//TODO: load assets and display loading message

var bootImg = new Image();
bootImg.src = "img/boot.png";

//initialize game
gameloop = setInterval(update, 33);
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousedown", mouseDownHandler);
document.addEventListener("mouseup", mouseUpHandler);
document.addEventListener("touchstart", mouseDownHandler);
document.addEventListener("touchend", mouseUpHandler);

//game loop

function update() {
  clearScreen();
  if (isGameOver == false) {
    if (gamePaused == true) {
      showPause()
    } else {
      drawFireworks();
      moveHead();
      bootSpawn();
      moveBoots();
      if (textFade > 0) { fadeText() };
      drawSnek();
			drawBoots()
    };
  } else {gameOver()};
  //score
  ctx.fillStyle = "rgba(0,0,0,.85)";
  ctx.fillText("Score: " + score, 5, stage.height - 5);
}