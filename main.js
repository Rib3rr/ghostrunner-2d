let xKordinat = 200;
let yKordinat = 200;
const spillerHastighed  = 2;
const spøgelser = [];
const spøgelseHastighed = 2;
let tid = 0;
let score = 0;
let liv = 3;
let skydeTimer = 5;
let projektiler = [];
let baggrundsBilled;
let spillerBilled;
let modstanderBilled;
let rykHøjre = false;

function preload() {
  baggrundsBilled = loadImage("bg.png");
  spillerBilled = loadImage("miner.png");
  modstanderBilled = loadImage("spøgelse.png")
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 10; i++) {
    let x = random(width);
    let y = random(height);
    let distance = dist(x, y, xKordinat, yKordinat);
    if (distance > 100) {
      spøgelser.push({
        x: x,
        y: y,
      });
    }
  }
}

function draw() {
  image(baggrundsBilled, 0, 0, width, height);

  tid += 1 / 60; 
  
  textAlign(RIGHT);
  textSize(16);
  fill(220);
  text("Tid: " + tid.toFixed(2), width - 10, 20);
  text("Score: " + score, width - 10, 40);
  text("Liv: " + liv, width - 10, 60);

  noStroke();
  fill(255, 0, 0);
  rect(10, 10, 50, 10);
  fill(0, 255, 0);
  rect(10, 10, liv * 50, 10);

  rykSpiller();

  tegnSpiller();

  tegnModstander();

  tegnProjektiler();

  skydFjender();

  checkKollision();
}

function rykSpiller() {
  if (keyIsDown(87)) {
    yKordinat -= spillerHastighed ;
  }
  if (keyIsDown(65)) {
    xKordinat -= spillerHastighed ;
  }
  if (keyIsDown(83)) {
    yKordinat += spillerHastighed ;
  }
  if (keyIsDown(68)) {
    xKordinat += spillerHastighed ;
  }
}

function keyPressed() {
  if (keyCode === 68) {
    rykHøjre = true;
    xKordinat += spillerHastighed ;
  } else if (keyCode === 65) {
    rykHøjre = false;
    xKordinat -= spillerHastighed ;
  }
}

function tegnSpiller() {
  push();
  translate(xKordinat, yKordinat);
  scale(0.5, 0.6);
  if (rykHøjre) {
    scale(-1, 1);
  }
  image(spillerBilled, -spillerBilled.width / 2, -spillerBilled.height / 2);
  pop();
}

function tegnModstander() {
  let modstanderMængde = Math.floor(tid / 10) + 10; 
  modstanderMængde = Math.min(modstanderMængde, 100);
  let spawnInterval = 60 / (modstanderMængde - spøgelser.length + 1); 
  if (spawnInterval < 1) spawnInterval = 1; 
  if (frameCount % spawnInterval == 0 && spøgelser.length < modstanderMængde) {
    
    let nytSpøgelse = {
      x: random(width),
      y: random(height),
      spillerHastighed: spøgelseHastighed + tid / 1000, 
    };
    while (dist(nytSpøgelse.x, nytSpøgelse.y, xKordinat, yKordinat) < 100) {
      nytSpøgelse.x = random(width);
      nytSpøgelse.y = random(height);
    }
    spøgelser.push(nytSpøgelse);
  }
  for (let i = spøgelser.length - 1; i >= 0; i--) {
    let spøgelse = spøgelser[i];
    push();  
    let scaleFactor = 0.1; 
    scale(scaleFactor); 
    image(modstanderBilled, spøgelse.x / scaleFactor - modstanderBilled.width / 2, spøgelse.y / scaleFactor - modstanderBilled.height / 2);
    pop();   
    let direction = createVector(xKordinat - spøgelse.x, yKordinat - spøgelse.y);
    direction.normalize();
    direction.mult(spøgelse.speed);
    spøgelse.x += direction.x;
    spøgelse.y += direction.y;
 }
}



function checkKollision() {
  
  for (let spøgelse of spøgelser) {
    let distance = dist(spøgelse.x, spøgelse.y, xKordinat, yKordinat);
    if (distance < 25) {  
      liv--;
      xKordinat = 200;
      yKordinat = 200;

     
      if (liv === 0) {
        let playAgainBtn = createButton("Play again");
        playAgainBtn.position(width / 2 - 100, height / 2 + 50);
        playAgainBtn.style("font-size", "24px");
        playAgainBtn.size(200, 50);
        playAgainBtn.mousePressed(function () {
         
          window.location.reload();
        });
        noLoop();
      }
    }
  }

  
  
  for (let i = projektiler.length - 1; i >= 0; i--) {
    let projektil = projektiler[i];
    for (let j = spøgelser.length - 1; j >= 0; j--) {
      let spøgelse = spøgelser[j];
      let distance = dist(projektil.x, projektil.y, spøgelse.x, spøgelse.y);
      if (distance < 10) {
        spøgelser.splice(j, 1);
        projektiler.splice(i, 1);
        score++;
      
        spøgelser.push({
          x: random(width),
          y: random(height),
        });
      }
    }
  }
}



function skydFjender() {
  
  skydeTimer += 1 / 60; 
  if (skydeTimer > 1) {
    let nærmesteSpøgelse = null;
    let minDistance = Infinity;
    for (let spøgelse of spøgelser) {
      let distanceToPlayer = dist(spøgelse.x, spøgelse.y, xKordinat, yKordinat);
      if (distanceToPlayer < minDistance) {
        nærmesteSpøgelse = spøgelse;
        minDistance = distanceToPlayer;
      }
    }
    if (nærmesteSpøgelse && minDistance < 200) {
      
    
      let direction = createVector(
        nærmesteSpøgelse.x - xKordinat,
        nærmesteSpøgelse.y - yKordinat
      );
      direction.normalize();
      projektiler.push({
        x: xKordinat,
        y: yKordinat,
        direction: direction,
      });
      skydeTimer = 0;
    }
  }
}


function tegnProjektiler() {
  for (let i = projektiler.length - 1; i >= 0; i--) {
    let projektil = projektiler[i];
    stroke(255, 0, 0);
    strokeWeight(3); 
    line(
      projektil.x,
      projektil.y,
      projektil.x + projektil.direction.x * 30,
      projektil.y + projektil.direction.y * 30
    ); 
    projektil.x += projektil.direction.x * 10;
    projektil.y += projektil.direction.y * 10;
    for (let j = spøgelser.length - 1; j >= 0; j--) {
      let spøgelse = spøgelser[j];
      let distance = dist(projektil.x, projektil.y, spøgelse.x, spøgelse.y);
      if (distance < 10) {
        spøgelser.splice(j, 1);
        projektiler.splice(i, 1);
        score++;
        spøgelser.push({
          x: random(width),
          y: random(height),
        });
      }
    }
  }
}


if (
  projektil.x < 0 ||
  projektil.x > width ||
  projektil.y < 0 ||
  projektil.y > height
) {
  projektiler.splice(i, 1);
}
