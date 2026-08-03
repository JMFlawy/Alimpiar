import Game from "./engine/Game.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const music = new Audio("assets/audio/musica1.mp3");
music.loop = true;
music.volume = 0.6;

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

let game = null;
let gameStarted = false;

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

function init() {
  resizeCanvas();

  game = new Game(canvas, ctx, GAME_WIDTH, GAME_HEIGHT);
  game.start();
}

export function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  init();

  music.play().catch(() => {});
}

window.addEventListener("resize", () => {
  resizeCanvas();
});

window.startGame = startGame;
