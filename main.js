import Game from "./engine/Game.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Música
const music = new Audio("assets/audio/musica1.mp3");
music.loop = true;
music.volume = 0.6;

// Tamaño lógico del juego
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

let game = null;

// Ajuste a pantalla completa
function resizeCanvas() {

    const dpr = window.devicePixelRatio || 1;

    // Más fiable que innerWidth/innerHeight
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    const scale = Math.min(
        vw / GAME_WIDTH,
        vh / GAME_HEIGHT
    );

    const displayWidth = GAME_WIDTH * scale;
    const displayHeight = GAME_HEIGHT * scale;

    // Tamaño interno
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Tamaño visual
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Escala del contexto
    ctx.setTransform(
        dpr * scale,
        0,
        0,
        dpr * scale,
        0,
        0
    );
}

// Inicialización
function init() {

    resizeCanvas();

    game = new Game(
        canvas,
        ctx,
        GAME_WIDTH,
        GAME_HEIGHT
    );

    game.start();

    const tryPlayMusic = () => {

        music.play().catch(() => {});

        window.removeEventListener("click", tryPlayMusic);
        window.removeEventListener("keydown", tryPlayMusic);
    };

    window.addEventListener("click", tryPlayMusic);
    window.addEventListener("keydown", tryPlayMusic);
}

window.addEventListener("resize", resizeCanvas);

init();
