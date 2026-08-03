import Player from "../entities/Player.js";
import Trash from "../entities/Trash.js";
import Container from "../entities/Container.js";

export default class Game {
  // Barajar un array (Fisher–Yates) [web:331]
  shuffleArray(arr) {
    const shuffled = arr.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  constructor(canvas, ctx, gameWidth, gameHeight) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.width = gameWidth;
    this.height = gameHeight;

    this.worldWidth = 2400;
    this.groundY = 420;

    this.cameraX = 0;

   this.keys = {};
   
    this.collectedItem = null;
    this.gameOver = false;
    this.sequenceFinished = false;
    this.fadeToBlack = false;
    this.fadeAlpha = 0;

    this.showStartScreen = true;

    this.gamepad = null;
    this.gamepadButtons = {};
    this.prevGamepadButtons = {};

    this.backgroundImage = new Image();
    this.backgroundImage.src = "assets/backgrounds/fondo1.png";

    this.groundImage = new Image();
    this.groundImage.src = "assets/backgrounds/suelo1.png";

    this.bushImage = new Image();
    this.bushImage.src = "assets/backgrounds/arbusto.png";

    this.platformImage = new Image();
    this.platformImage.src = "assets/backgrounds/plataforma.png";

    this.finishImage = new Image();
    this.finishImage.src = "assets/backgrounds/terminado.png";

    this.remainingImage = new Image();
    this.remainingImage.src = "assets/backgrounds/falta.png";

    this.startImage = new Image();
    this.startImage.src = "assets/backgrounds/inicio.png";

    this.backgroundMusic = new Audio("sounds/musica.mp3");
    this.backgroundMusic.loop = true;

    this.circulandoSound = new Audio("sounds/circulando.mp3");
    this.circulandoSound.loop = true;
    this.circulandoSound.volume = 0.8;

    this.basuratSound = new Audio("sounds/basurat.mp3");
    this.basuratSound.loop = false;
    this.basuratSound.volume = 0.9;

    this.player = new Player(100, this.groundY - 92);

    this.platforms = [
      { x: 260,  y: this.groundY - 90,  width: 200, height: 20 },
      { x: 520,  y: this.groundY - 120, width: 180, height: 20 },
      { x: 780,  y: this.groundY - 140, width: 180, height: 20 },
      { x: 1040, y: this.groundY - 120, width: 200, height: 20 },
      { x: 1340, y: this.groundY - 140, width: 200, height: 20 }
    ];

    this.containers = [
      new Container(300,  this.groundY - 85, "amarillo"),
      new Container(700,  this.groundY - 85, "azul"),
      new Container(1100, this.groundY - 85, "verde"),
      new Container(1500, this.groundY - 85, "marron"),
      new Container(1900, this.groundY - 85, "gris")
    ];

    // Posiciones fijas de basura (se mantienen iguales cada partida)
    this.trashPositions = [
      { x: 380,  y: this.groundY - 30 },
      { x: 450,  y: this.groundY - 30 },
      { x: 580,  y: this.groundY - 120 - 30 },
      { x: 840,  y: this.groundY - 140 - 30 },
      { x: 1260, y: this.groundY - 120 - 30 },
      { x: 1660, y: this.groundY - 30 }
    ];

    // Tipos posibles de basura (se barajan cada partida)
    this.trashDefinitions = [
      { type: "paper",   color: "azul"     },
      { type: "plastic", color: "amarillo" },
      { type: "plastic", color: "amarillo" },
      { type: "glass",   color: "verde"    },
      { type: "organic", color: "marron"   },
      { type: "resto",   color: "restos"   }
    ];

    // Crear basura con posiciones fijas y tipos aleatorios
    this.trashItems = [];
    const shuffledDefsInit = this.shuffleArray(this.trashDefinitions);
    for (let i = 0; i < this.trashPositions.length; i++) {
      const pos = this.trashPositions[i];
      const def = shuffledDefsInit[i];
      this.trashItems.push(
        new Trash(pos.x, pos.y, def.type, def.color)
      );
    }

    this.remainingTrash = this.trashItems.length;

    this.successSounds = [
      new Audio("sounds/S1.mp3"),
      new Audio("sounds/S2.mp3"),
      new Audio("sounds/S3.mp3"),
      new Audio("sounds/S4.mp3")
    ];

    this.failSounds = [
      new Audio("sounds/No1.mp3"),
      new Audio("sounds/No3.mp3"),
      new Audio("sounds/No4.mp3")
    ];

    this.finishSound = new Audio("sounds/terminado.mp3");

    this.finishTime = null;
    this.truckSequenceStarted = false;

    this.truckBaseImage = new Image();
    this.truckBaseImage.src = "assets/contenedores/camion.png";

    this.truckFrames = [];
    for (let i = 1; i <= 6; i++) {
      const img = new Image();
      img.src = `assets/contenedores/camion${i}.png`;
      this.truckFrames.push(img);
    }

    this.truckAnimIndex = 0;
    this.truckAnimCounter = 0;

    this.truckX = 0;
    this.truckY = this.groundY + 100;

    this.truckTargetX = 400;
    this.truckLeaving = false;
    this.truckLeaveTime = null;
    this.truckStopTime = null;
    this.yellowVisible = true;

    window.addEventListener("keydown", (e) => {
      if (this.showStartScreen) {
        this.startGameFromTitle();
        return;
      }

      if (this.sequenceFinished && this.fadeAlpha >= 1) {
        this.restartGame();
        return;
      }

      this.keys[e.key] = true;
    });

    this.canvas.addEventListener("mousedown", () => {
      if (this.showStartScreen) {
        this.startGameFromTitle();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
const bindTouchButton = (id, key) => {

    const button = document.getElementById(id);

    if (!button) return;

    const press = (e) => {

        e.preventDefault();

        this.keys[key] = true;
console.log(key, this.keys);
        if (!this.touchMusicStarted) {

            this.touchMusicStarted = true;

            if (this.showStartScreen) {
                this.startGameFromTitle();
            }

        }

    };

    const release = (e) => {

        e.preventDefault();

        this.keys[key] = false;

    };

    button.addEventListener("touchstart", press, { passive:false });
    button.addEventListener("touchend", release, { passive:false });
    button.addEventListener("touchcancel", release, { passive:false });

    button.addEventListener("mousedown", press);
    button.addEventListener("mouseup", release);
    button.addEventListener("mouseleave", release);

};

bindTouchButton("btnLeft", "ArrowLeft");

bindTouchButton("btnRight", "ArrowRight");

bindTouchButton("btnJump", "ArrowUp");

bindTouchButton("btnAction", "Control");
    
    window.addEventListener("gamepadconnected", (e) => {
      this.gamepad = e.gamepad;
      console.log("Gamepad conectado:", this.gamepad.id);
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      if (this.gamepad && e.gamepad.index === this.gamepad.index) {
        console.log("Gamepad desconectado:", this.gamepad.id);
        this.gamepad = null;
      }
    });
  }

  start() {
    requestAnimationFrame(this.loop.bind(this));
  }

  loop() {
    this.updateGamepadState();
    this.update();
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }

  updateGamepadState() {
    if (!navigator.getGamepads) return;

    const pads = navigator.getGamepads();
    if (!pads) return;

    if (!this.gamepad) {
      for (const pad of pads) {
        if (pad) {
          this.gamepad = pad;
          break;
        }
      }
      if (!this.gamepad) return;
    }

    const pad = navigator.getGamepads()[this.gamepad.index];
    if (!pad) return;

    this.prevGamepadButtons = { ...this.gamepadButtons };

    const aPressed = pad.buttons[0] && pad.buttons[0].pressed;
    const xPressed = pad.buttons[2] && pad.buttons[2].pressed;

    this.gamepadButtons["A"] = !!aPressed;
    this.gamepadButtons["X"] = !!xPressed;

    const dUp    = pad.buttons[12] && pad.buttons[12].pressed;
    const dDown  = pad.buttons[13] && pad.buttons[13].pressed;
    const dLeft  = pad.buttons[14] && pad.buttons[14].pressed;
    const dRight = pad.buttons[15] && pad.buttons[15].pressed;

    this.gamepadButtons["DUP"]    = !!dUp;
    this.gamepadButtons["DDOWN"]  = !!dDown;
    this.gamepadButtons["DLEFT"]  = !!dLeft;
    this.gamepadButtons["DRIGHT"] = !!dRight;

    const axes = pad.axes || [];
    const lx = axes[0] || 0;
    const ly = axes[1] || 0;

    const deadzone = 0.25;

    this.gamepadButtons["LLEFT"]  = lx < -deadzone;
    this.gamepadButtons["LRIGHT"] = lx >  deadzone;
    this.gamepadButtons["LUP"]    = ly < -deadzone;
    this.gamepadButtons["LDOWN"]  = ly >  deadzone;

    if (this.showStartScreen) {
      let anyButtonPressed = false;
      for (let i = 0; i < pad.buttons.length; i++) {
        if (pad.buttons[i].pressed) {
          anyButtonPressed = true;
          break;
        }
      }
      if (anyButtonPressed) {
        this.startGameFromTitle();
      }
    }
  }

  startGameFromTitle() {
    this.showStartScreen = false;
    this.fadeAlpha = 0;
    this.sequenceFinished = false;

    try {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.play().catch(() => {});
    } catch (e) {}
  }

  playRandomSound(list) {
    if (!list || list.length === 0) return;
    const i = Math.floor(Math.random() * list.length);
    const audio = list[i];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  startTruckSequence() {
    if (this.truckSequenceStarted) return;
    this.truckSequenceStarted = true;

    const yellowContainer = this.containers.find(c => c.type === "amarillo");
    if (yellowContainer) {
      this.truckTargetX = yellowContainer.x - 60;
    } else {
      this.truckTargetX = this.cameraX + this.width / 2;
    }

    this.truckX = this.cameraX + this.width + 300;
    this.truckY = this.groundY;

    this.truckAnimIndex = 0;
    this.truckAnimCounter = 0;
    this.truckLeaving = false;
    this.truckLeaveTime = null;
    this.truckStopTime = null;
    this.yellowVisible = true;

    try {
      this.circulandoSound.currentTime = 0;
      this.circulandoSound.play().catch(() => {});
    } catch (e) {}
  }

  updateTruckSequence() {
    const speed = 0.8;

    if (!this.truckLeaving && this.truckX > this.truckTargetX) {
      this.truckX -= speed;

      if (this.truckX <= this.truckTargetX && this.truckStopTime === null) {
        this.truckStopTime = performance.now();
      }
      return;
    }

    if (!this.truckLeaving && this.truckStopTime !== null && this.truckAnimIndex === 0) {
      const elapsedStop = performance.now() - this.truckStopTime;
      if (elapsedStop < 1000) {
        return;
      }
    }

    if (!this.truckLeaving) {
      this.truckAnimCounter++;
      if (this.truckAnimCounter >= 290) {
        this.truckAnimCounter = 0;

        if (this.truckAnimIndex === 0) {
          this.yellowVisible = false;
        }

        this.truckAnimIndex++;

        if (this.truckAnimIndex >= 2 && this.truckAnimIndex <= 4) {
          if (this.basuratSound.paused) {
            try {
              this.basuratSound.currentTime = 0;
              this.basuratSound.play().catch(() => {});
            } catch (e) {}
          }
        } else {
          if (!this.basuratSound.paused) {
            try {
              this.basuratSound.pause();
              this.basuratSound.currentTime = 0;
            } catch (e) {}
          }
        }

        if (this.truckAnimIndex === this.truckFrames.length - 2) {
          this.yellowVisible = true;
        }

        if (this.truckAnimIndex >= this.truckFrames.length) {
          this.truckAnimIndex = this.truckFrames.length - 1;
          this.truckLeaving = true;
          this.truckLeaveTime = performance.now();
        }
      }
    } else {
      this.truckX -= speed;

      const offscreenLimit = this.cameraX - 400;
      if (this.truckX < offscreenLimit) {
        this.truckSequenceStarted = false;
        this.sequenceFinished = true;
        this.fadeToBlack = true;
        this.fadeAlpha = 0;

        try {
          this.circulandoSound.pause();
          this.circulandoSound.currentTime = 0;
        } catch (e) {}

        try {
          this.basuratSound.pause();
          this.basuratSound.currentTime = 0;
        } catch (e) {}
      }
    }
  }

  update() {
    const now = performance.now();

    if (this.showStartScreen) {
      return;
    }

    if (this.gamepad) {
      if (this.gamepadButtons["A"]) {
        this.keys["ArrowUp"] = true;
      } else {
        this.keys["ArrowUp"] = false;
      }

      const prevX = this.prevGamepadButtons["X"];
      const currX = this.gamepadButtons["X"];
      if (!prevX && currX) {
        this.keys["Control"] = true;
      }

      const left  = this.gamepadButtons["DLEFT"]  || this.gamepadButtons["LLEFT"];
      const right = this.gamepadButtons["DRIGHT"] || this.gamepadButtons["LRIGHT"];

      this.keys["ArrowLeft"]  = left;
      this.keys["ArrowRight"] = right;
    }

    if (this.sequenceFinished) {
      if (this.fadeToBlack && this.fadeAlpha < 1) {
        this.fadeAlpha = Math.min(1, this.fadeAlpha + 0.01);
      }
      return;
    }

    if (
      !this.truckSequenceStarted &&
      this.keys["q"] && this.keys["r"] && this.keys["t"]
    ) {
      this.gameOver = true;
      this.finishTime = now;
      this.startTruckSequence();
    }

    if (this.gameOver && this.finishTime !== null) {
      const elapsed = now - this.finishTime;
      if (elapsed >= 8000 && !this.truckSequenceStarted) {
        this.startTruckSequence();
      }
    }

    if (this.truckSequenceStarted) {
      this.player.update(this.keys, this.worldWidth, this.groundY, this.platforms);

      if (!this.keys["ArrowLeft"] && !this.keys["ArrowRight"]) {
        this.player.setAnimation("see");
      }

      this.updateCamera();
      this.updateTruckSequence();
      return;
    }

    if (this.gameOver) {
      this.player.update({}, this.worldWidth, this.groundY, this.platforms);
    } else {
      this.player.update(this.keys, this.worldWidth, this.groundY, this.platforms);
    }

    this.updateCamera();

    if (this.truckSequenceStarted) {
      this.updateTruckSequence();
      return;
    }

    if (!this.collectedItem) {
      for (const item of this.trashItems) {
        if (!item.collected && this.isColliding(this.player, item)) {
          item.collected = true;
          this.collectedItem = item;
          break;
        }
      }
    }

    if (this.collectedItem && this.keys["Control"]) {
      for (const container of this.containers) {
        if (this.isColliding(this.player, container)) {
          const binType = container.type;
          const trashType = this.collectedItem.type;

          const correct =
            (binType === "amarillo" && trashType === "plastic") ||
            (binType === "azul"     && trashType === "paper")   ||
            (binType === "verde"    && trashType === "glass")   ||
            (binType === "marron"   && trashType === "organic") ||
            (binType === "gris"     && trashType === "resto");

          if (correct) {
            this.playRandomSound(this.successSounds);

            this.collectedItem = null;
            this.remainingTrash--;

            if (this.remainingTrash <= 0) {
              this.gameOver = true;
              this.finishTime = performance.now();

              setTimeout(() => {
                this.finishSound.currentTime = 0;
                this.finishSound.play().catch(() => {});
              }, 2500); // aquí puedes ajustar el retraso del sonido "terminado"
            }
          } else {
            this.playRandomSound(this.failSounds);
          }

          this.keys["Control"] = false;
          break;
        }
      }
    }
  }

  restartGame() {
    this.sequenceFinished = false;
    this.fadeToBlack = false;
    this.fadeAlpha = 0;
    this.truckSequenceStarted = false;
    this.truckLeaving = false;
    this.truckStopTime = null;
    this.truckLeaveTime = null;

    this.gameOver = false;
    this.finishTime = null;

    this.player = new Player(100, this.groundY - 92);
    this.cameraX = 0;

    // Nuevos tipos aleatorios en las mismas posiciones
    const shuffledDefs = this.shuffleArray(this.trashDefinitions);
    this.trashItems = [];
    for (let i = 0; i < this.trashPositions.length; i++) {
      const pos = this.trashPositions[i];
      const def = shuffledDefs[i];
      this.trashItems.push(
        new Trash(pos.x, pos.y, def.type, def.color)
      );
    }

    this.remainingTrash = this.trashItems.length;
    this.collectedItem = null;

    this.truckX = 0;
    this.truckTargetX = 400;
    this.truckAnimIndex = 0;
    this.truckAnimCounter = 0;
    this.yellowVisible = true;
  }

  updateCamera() {
    const targetX = this.player.x + this.player.width / 2 - this.width / 2;
    this.cameraX = Math.max(0, Math.min(targetX, this.worldWidth - this.width));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.showStartScreen) {
      if (this.startImage.complete && this.startImage.naturalWidth > 0) {
        const img = this.startImage;
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;

        const scale = Math.min(
          this.width / imgW,
          this.height / imgH
        );
        const drawW = imgW * scale;
        const drawH = imgH * scale;

        const x = (this.width - drawW) / 2;
        const y = (this.height - drawH) / 2;

        this.ctx.drawImage(img, x, y, drawW, drawH);
      } else {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "32px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Pulsa una tecla o botón para empezar", this.width / 2, this.height / 2);
      }
      return;
    }

    this.drawBackground();
    this.drawWorld();

    if (this.truckSequenceStarted || this.sequenceFinished) {
      if (this.sequenceFinished && this.fadeToBlack && this.fadeAlpha > 0) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
      }
      return;
    }

    let counterBoxX = 20;
    let counterBoxY = 60;
    let counterBoxW = 80;
    let counterBoxH = 40;

    if (this.remainingImage.complete && this.remainingImage.naturalWidth > 0) {
      const img = this.remainingImage;

      const scale = 0.15;
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      const x = 10;
      const y = 10;

      this.ctx.drawImage(img, x, y, w, h);

      counterBoxX = x + w + 10;
      counterBoxY = y + h - 40;
      counterBoxW = 40;
      counterBoxH = 40;
    }

    this.ctx.save();

    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(counterBoxX, counterBoxY, counterBoxW, counterBoxH);

    this.ctx.strokeStyle = "#888888";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(counterBoxX, counterBoxY, counterBoxW, counterBoxH);

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.moveTo(counterBoxX + 1, counterBoxY + counterBoxH - 1);
    this.ctx.lineTo(counterBoxX + 1, counterBoxY + 1);
    this.ctx.lineTo(counterBoxX + counterBoxW - 1, counterBoxY + 1);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#bbbbbb";
    this.ctx.moveTo(counterBoxX + counterBoxW - 1, counterBoxY + 1);
    this.ctx.lineTo(counterBoxX + counterBoxW - 1, counterBoxY + counterBoxH - 1);
    this.ctx.lineTo(counterBoxX + 1, counterBoxY + counterBoxH - 1);
    this.ctx.stroke();

    const textX = counterBoxX + counterBoxW / 2;
    const textY = counterBoxY + counterBoxH / 2;

    this.ctx.fillStyle = "#333333";
    this.ctx.font = "24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(`${this.remainingTrash}`, textX, textY);

    this.ctx.restore();

    if (this.gameOver) {
      if (this.finishImage.complete && this.finishImage.naturalWidth > 0) {
        const img = this.finishImage;
        const scale = 0.8;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const x = (this.width - w) / 2;
        const y = (this.height - h) / 2;
        this.ctx.drawImage(img, x, y, w, h);
      } else {
        this.ctx.font = "42px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#000";
        this.ctx.fillText("¡COMPLETADO!", 250, 220);
      }
    }
  }

  drawBackground() {
    const img = this.backgroundImage;

    if (img.complete && img.naturalWidth > 0) {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      const scale = (this.height * 1.1) / imgHeight;
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;

      const maxCamera = this.worldWidth - this.width;
      const t = maxCamera > 0 ? this.cameraX / maxCamera : 0;

      const maxOffset = Math.max(0, drawWidth - this.width);
      const offsetX = -t * maxOffset;
      const offsetY = -(drawHeight - this.height) * 0.5;

      this.ctx.drawImage(
        img,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );
    } else {
      this.ctx.fillStyle = "#87cfff";
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    if (this.groundImage.complete && this.groundImage.naturalWidth > 0) {
      const tileW = this.groundImage.naturalWidth;
      const tileH = this.groundImage.naturalHeight;

      const scale = (this.height - this.groundY) / tileH;
      const drawH = tileH * scale;
      const drawW = tileW * scale;

      for (let x = -this.cameraX % drawW; x < this.width; x += drawW) {
        this.ctx.drawImage(
          this.groundImage,
          x,
          this.groundY,
          drawW,
          drawH
        );
      }
    } else {
      this.ctx.fillStyle = "#6cc36c";
      this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
    }

    if (this.bushImage.complete && this.bushImage.naturalWidth > 0) {
      const bushW = this.bushImage.naturalWidth;
      const bushH = this.bushImage.naturalHeight;

      const scaleBush = 1 / 8;
      const drawBushW = bushW * scaleBush;
      const drawBushH = bushH * scaleBush;

      for (let x = -this.cameraX % 240; x < this.width; x += 240) {
        this.ctx.drawImage(
          this.bushImage,
          x,
          this.groundY - drawBushH,
          drawBushW,
          drawBushH
        );
      }
    } else {
      this.ctx.fillStyle = "#5aa14f";
      for (let x = -this.cameraX % 240; x < this.width; x += 240) {
        this.ctx.fillRect(x, this.groundY - 12, 140, 12);
      }
    }
  }

  drawWorld() {
    if (this.platformImage.complete && this.platformImage.naturalWidth > 0) {
      const img = this.platformImage;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      for (const platform of this.platforms) {
        const screenX = platform.x - this.cameraX;
        const screenY = platform.y;

        const scaleX = platform.width / imgW;
        const scaleY = platform.height / imgH;
        const drawW = imgW * scaleX;
        const drawH = imgH * scaleY;

        this.ctx.drawImage(
          img,
          screenX,
          screenY,
          drawW,
          drawH
        );
      }
    } else {
      this.ctx.fillStyle = "#8b5a2b";
      for (const platform of this.platforms) {
        const screenX = platform.x - this.cameraX;
        this.ctx.fillRect(screenX, platform.y, platform.width, platform.height);
      }
    }

    if (this.truckSequenceStarted) {
      const screenX = this.truckX - this.cameraX;
      const screenY = this.truckY;

      let img = this.truckBaseImage;
      if (this.truckX <= this.truckTargetX && this.truckFrames[this.truckAnimIndex]) {
        img = this.truckFrames[this.truckAnimIndex];
      }

      if (img.complete && img.naturalWidth > 0) {
        const scale = 0.8;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;

        this.ctx.drawImage(img, screenX, screenY - h + 25, w, h);
      }
    }

    this.player.draw(this.ctx, this.cameraX, this.collectedItem);

    for (const trash of this.trashItems) {
      if (!trash.collected) {
        trash.draw(this.ctx, this.cameraX);
      }
    }

    for (const container of this.containers) {
      if (
        this.truckSequenceStarted &&
        container.type === "amarillo" &&
        !this.yellowVisible
      ) {
        continue;
      }
      container.draw(this.ctx, this.cameraX);
    }
  }

  isColliding(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}
