/* 🌈 Bubble Pop Game — 414730175 黃詩婷
 * 點擊泡泡得分、30 秒倒數、柔和背景 + 美化 HUD
 */

let gameState = 'start';
let bubbles = [];
let particles = [];
let score = 0;
let timeLimit = 30 * 1000; // 30 秒
let startTime = 0;
let lastSpawn = 0;
let spawnInterval = 400; // 出現更頻繁

function setup() {
  createCanvas(windowWidth, windowHeight).parent('game-container');
  textFont('Noto Sans TC, Microsoft JhengHei, sans-serif');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  drawBackground();

  if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'play') {
    runGame();
  } else if (gameState === 'end') {
    drawEndScreen();
  }
}

/* ---------------- 畫面階段 ---------------- */

function drawStartScreen() {
  drawTitle('Bubble Pop Game');
  drawSub('點擊圓圈得分，30 秒倒數，看看你能拿幾分！');
  drawButton(width / 2, height * 0.62, 220, 56, '開始遊戲', startGame);
}

function startGame() {
  bubbles = [];
  particles = [];
  score = 0;
  startTime = millis();
  lastSpawn = millis();
  gameState = 'play';
}

function runGame() {
  if (millis() - lastSpawn >= spawnInterval) {
    spawnBubble();
    lastSpawn = millis();
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.update();
    b.draw();
    if (b.dead) bubbles.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.dead) particles.splice(i, 1);
  }

  drawHUD();

  if (millis() - startTime >= timeLimit) gameState = 'end';
}

function drawEndScreen() {
  drawTitle('時間到！');
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(`你的分數：${score} 分`, width / 2, height * 0.48);

  drawButton(width / 2, height * 0.62, 220, 56, '再玩一次', startGame);
  drawButton(width / 2, height * 0.72, 220, 44, '回到首頁', () => (gameState = 'start'));
}

/* ---------------- 泡泡類 ---------------- */

class Bubble {
  constructor(x, y, r, col) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.col = col;
    this.vy = random(1, 2);
    this.vx = random(-0.5, 0.5);
    this.dead = false;
    this.popped = false;
    this.fade = 255;
  }

  update() {
    if (!this.popped) {
      this.y -= this.vy;
      this.x += this.vx;
      if (this.y + this.r < -20) this.dead = true;
    } else {
      this.fade -= 15;
      if (this.fade <= 0) this.dead = true;
    }
  }

  draw() {
    push();
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.fade);
    circle(this.x, this.y, this.r * 2);
    pop();
  }

  hit(mx, my) {
    return dist(mx, my, this.x, this.y) < this.r;
  }

  pop() {
    this.popped = true;
    for (let i = 0; i < 15; i++) {
      particles.push(new Particle(this.x, this.y, this.col));
    }
  }
}

/* ---------------- 粒子特效 ---------------- */

class Particle {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.life = 40;
    this.size = random(2, 5);
    const col = color(c);
    this.c = color(red(col), green(col), blue(col), 230);
    this.dead = false;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.dead = true;
  }
  draw() {
    noStroke();
    fill(this.c);
    circle(this.x, this.y, this.size);
  }
}

/* ---------------- 泡泡生成 ---------------- */

function spawnBubble() {
  const r = random(20, 50);
  const x = random(r, width - r);
  const y = height + r + random(10, 100);
  const palette = ['#A2D2FF', '#FFC8DD', '#FFAFCC', '#CDB4DB', '#BDE0FE', '#F8EDEB'];
  const col = random(palette);
  bubbles.push(new Bubble(x, y, r, col));
}

/* ---------------- 互動 ---------------- */

function mousePressed() {
  if (gameState === 'start' || gameState === 'end') return;

  if (gameState === 'play') {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (bubbles[i].hit(mouseX, mouseY) && !bubbles[i].popped) {
        bubbles[i].pop();
        score++;
        break;
      }
    }
  }
}

function mouseReleased() {
  if (!drawButton._areas) return;
  const areas = drawButton._areas.slice();
  drawButton._areas = [];
  for (const a of areas) {
    if (mouseX >= a.x && mouseX <= a.x + a.w && mouseY >= a.y && mouseY <= a.y + a.h) {
      a.onClick && a.onClick();
      break;
    }
  }
}

/* ---------------- UI 元件 ---------------- */

function drawHUD() {
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text('414730175', 16, 14); // 學號在左上角

  textAlign(RIGHT, TOP);
  text(`分數：${score}`, width - 16, 14); // 分數在右上角

  const elapsed = millis() - startTime;
  const left = max(0, timeLimit - elapsed);
  const sec = ceil(left / 1000);

  const barW = min(width * 0.45, 420);
  const ratio = constrain(left / timeLimit, 0, 1);

  noStroke();
  fill(255, 255, 255, 40);
  rect(width / 2 - barW / 2, 40, barW, 10, 8);

  fill('#6C63FF');
  rect(width / 2 - barW / 2, 40, barW * ratio, 10, 8);

  fill(255);
  textAlign(CENTER, TOP);
  textSize(14);
  text(`剩餘：${sec} 秒`, width / 2, 54);
}

function drawTitle(t) {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(min(width, height) * 0.08);
  text(t, width / 2, height * 0.34);
}

function drawSub(t) {
  fill(240);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(t, width / 2, height * 0.46);
}

function drawButton(cx, cy, w, h, label, onClick) {
  if (!drawButton._areas) drawButton._areas = [];
  const hover = mouseX >= cx - w/2 && mouseX <= cx + w/2 &&
                mouseY >= cy - h/2 && mouseY <= cy + h/2;
  noStroke();
  fill(hover ? '#6C63FF' : '#7F7FFF');
  rectMode(CENTER);
  rect(cx, cy, w, h, 12);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(label, cx, cy + 1);
  drawButton._areas.push({x: cx-w/2, y: cy-h/2, w, h, onClick});
}

/* ---------------- 背景漸層 ---------------- */

function drawBackground() {
  for (let y = 0; y < height; y++) {
    const inter = map(y, 0, height, 0, 1);
    const c = lerpColor(color('#A2D2FF'), color('#FFC8DD'), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

