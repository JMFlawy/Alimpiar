import Game from "./engine/Game.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const music = new Audio("assets/audio/musica1.mp3");
music.loop = true;
music.volume = 0.6;

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

let game = null;

const portadaImg = new Image();
portadaImg.src = "assets/backgrounds/portada.png";

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / GAME_WIDTH, vh / GAME_HEIGHT);

  const displayWidth = GAME_WIDTH * scale;
  const displayHeight = GAME_HEIGHT * scale;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;

  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}

function drawPortada() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.drawImage(portadaImg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function init() {
  resizeCanvas();
  drawPortada();

  const tryPlayMusic = () => {
    music.play().catch(() => {});
    window.removeEventListener("click", tryPlayMusic);
    window.removeEventListener("keydown", tryPlayMusic);
  };

  window.addEventListener("click", tryPlayMusic);
  window.addEventListener("keydown", tryPlayMusic);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  drawPortada();
});

portadaImg.onload = () => {
  init();
};

window.addEventListener("click", () => {
  if (!game) {
    game = new Game(canvas, ctx, GAME_WIDTH, GAME_HEIGHT);
    game.start();
  }
}, { once: true });
