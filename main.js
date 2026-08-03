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

// Imagen de portada
const portada = new Image();
portada.src = "assets/backgrounds/portada.png";

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

  // Reajustamos la transformación del contexto:
  // seguimos dibujando en coordenadas GAME_WIDTH x GAME_HEIGHT,
  // pero se escalan al tamaño real.
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}

// Dibuja la portada PNG en lugar de la pantalla negra y el texto
function drawPortada() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.drawImage(portada, 0, 0, GAME_WIDTH, GAME_HEIGHT);
}

// Inicialización
function init() {
  resizeCanvas();
  drawPortada();

  // Intentamos arrancar la música tras la primera interacción del usuario
  const tryPlayMusic = () => {
    music.play().catch(() => {
      // Si el navegador bloquea autoplay, simplemente no hacemos nada
    });

    // Quitamos los listeners, solo nos hacen falta una vez
    window.removeEventListener("click", tryPlayMusic);
    window.removeEventListener("keydown", tryPlayMusic);
  };

  window.addEventListener("click", tryPlayMusic);
  window.addEventListener("keydown", tryPlayMusic);
}

// Redimensionar al cambiar tamaño de ventana
window.addEventListener("resize", () => {
  resizeCanvas();
  drawPortada();
});

// Cuando cargue la imagen, mostramos la portada
portada.onload = () => {
  init();
};

// Arrancar juego
// OJO: si quieres que el juego empiece al pulsar un botón/enlace,
// esta línea debe cambiarse, pero la dejo tal como estaba en tu flujo.
window.addEventListener("click", () => {
  if (!game) {
    game = new Game(canvas, ctx, GAME_WIDTH, GAME_HEIGHT);
    game.start();
  }
}, { once: true });
