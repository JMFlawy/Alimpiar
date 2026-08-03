import Game from "./engine/Game.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const touchControls = document.getElementById("touchControls");

const music = new Audio("assets/audio/musica1.mp3");
music.loop = true;
music.volume = 0.6;

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

let game = null;
let musicStarted = false;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const scale = Math.min(vw / GAME_WIDTH, vh / GAME_HEIGHT);
  const displayWidth = Math.floor(GAME_WIDTH * scale);
  const displayHeight = Math.floor(GAME_HEIGHT * scale);

  canvas.width = Math.floor(displayWidth * dpr);
  canvas.height = Math.floor(displayHeight * dpr);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}

function tryPlayMusic() {
  if (musicStarted) return;
  musicStarted = true;
  music.play().catch(() => {});
}

function setKey(key, pressed) {
  if (!game) return;
  game.keys[key] = pressed;
}

function bindTouchButton(button, keyName) {
  if (!button) return;

  const press = (e) => {
    e.preventDefault();
    e.stopPropagation();
    tryPlayMusic();
    button.classList.add("is-pressed");
    setKey(keyName, true);
  };

  const release = (e) => {
    e.preventDefault();
    e.stopPropagation();
    button.classList.remove("is-pressed");
    setKey(keyName, false);
  };

  button.addEventListener("touchstart", press, { passive: false });
  button.addEventListener("touchend", release, { passive: false });
  button.addEventListener("touchcancel", release, { passive: false });

  button.addEventListener("pointerdown", press, { passive: false });
  button.addEventListener("pointerup", release, { passive: false });
  button.addEventListener("pointerleave", release, { passive: false });
  button.addEventListener("pointercancel", release, { passive: false });
}

function setupTouchControls() {
  if (!touchControls) return;
  bindTouchButton(document.getElementById("btnLeft"), "ArrowLeft");
  bindTouchButton(document.getElementById("btnRight"), "ArrowRight");
  bindTouchButton(document.getElementById("btnJump"), "ArrowUp");
  bindTouchButton(document.getElementById("btnAction"), "Control");
}

function init() {
  resizeCanvas();
  game = new Game(canvas, ctx, GAME_WIDTH, GAME_HEIGHT);
  game.start();

  window.addEventListener("pointerdown", tryPlayMusic, { passive: true });
  window.addEventListener("touchstart", tryPlayMusic, { passive: true });
  window.addEventListener("keydown", tryPlayMusic, { passive: true });

  setupTouchControls();
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
init();
