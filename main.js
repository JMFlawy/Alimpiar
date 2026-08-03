import Game from "./engine/Game.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// NUEVO: crear objeto Audio para la música
const music = new Audio("assets/audio/musica1.mp3"); // o .ogg/.wav según tu archivo
music.loop = true; // que se repita
music.volume = 0.6; // ajusta el volumen a tu gusto

// Tamaño lógico del juego (mundo base)
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

let game = null;

// Ajuste a pantalla completa con HiDPI
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Calculamos escala para encajar GAME_WIDTH x GAME_HEIGHT en la ventana
  const scale = Math.min(vw / GAME_WIDTH, vh / GAME_HEIGHT);

  // Tamaño lógico efectivo
  const displayWidth = GAME_WIDTH * scale;
  const displayHeight = GAME_HEIGHT * scale;

  // Tamaño interno en píxeles físicos
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;

  // Tamaño CSS (visible)
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  // Reajustamos la transformación del contexto
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}

// Inicialización
function init() {
  resizeCanvas();

  game = new Game(canvas, ctx, GAME_WIDTH, GAME_HEIGHT);
  game.start();

  // Intentamos arrancar la música tras la primera interacción del usuario
  const tryPlayMusic = () => {
    music.play().catch(() => {});

    window.removeEventListener("click", tryPlayMusic);
    window.removeEventListener("keydown", tryPlayMusic);
  };

  window.addEventListener("click", tryPlayMusic);
  window.addEventListener("keydown", tryPlayMusic);
}

// Redimensionar al cambiar tamaño de ventana
window.addEventListener("resize", () => {
  resizeCanvas();
});

// Arrancar juego
init();
