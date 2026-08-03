export default class Player {
  constructor(x, y) {
    // Posición y física
    this.x = x;
    this.y = y;

    // Hitbox
    this.width = 72;
    this.height = 108;
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    this.speed = isMobile ? 2.35 : 2.2;

    this.vx = 0;
    this.vy = 0;

    this.gravity = 0.1;
    this.jumpStrength = -4;

    this.onGround = false;
    this.onPlatform = false;
    this.facing = 1;

    // SPRITES
    this.idleFrames = [];
    this.walkFrames = [];
    this.jumpFrames = [];
    this.seeFrames = [];   // animación "viendo1/viendo2"

    this.currentAnim = "idle";
    this.currentFrameIndex = 0;
    this.animFrameCounter = 0;

    this.animationSpeeds = {
      idle: 70,
      walk: 26,
      jump: 30,
      see: 300   // velocidad de viendo1/viendo2
    };

    this.loadFrames(this.idleFrames, ["idle1.png", "idle2.png", "idle3.png"]);
    this.loadFrames(this.walkFrames, ["walk1.png", "walk2.png", "walk3.png", "walk4.png"]);
    this.loadFrames(this.jumpFrames, ["jump1.png", "jump2.png", "jump3.png"]);
    this.loadFrames(this.seeFrames,  ["viendo1.png", "viendo2.png"]);
  }

  loadFrames(targetArray, names) {
    names.forEach(name => {
      const img = new Image();
      img.src = `assets/hero/${name}`;
      targetArray.push(img);
    });
  }

  update(keys, worldWidth, groundY, platforms) {
    // Movimiento horizontal normal
    this.vx = 0;
    if (keys["ArrowLeft"]) {
      this.vx = -this.speed;
      this.facing = -1;
    }
    if (keys["ArrowRight"]) {
      this.vx = this.speed;
      this.facing = 1;
    }

    // Salto normal
    if ((keys["ArrowUp"] || keys[" "]) && this.onGround) {
      this.vy = this.jumpStrength;
      this.onGround = false;
      this.onPlatform = false;
    }

    // Gravedad
    this.vy += this.gravity;

    // Aplicar movimiento
    this.x += this.vx;
    this.y += this.vy;

    // Limitar al mundo
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > worldWidth) this.x = worldWidth - this.width;

    // Reseteo de estado de suelo/plataforma
    this.onGround = false;
    this.onPlatform = false;

    // Colisión con plataformas (solo por arriba)
    for (const p of platforms) {
      
const pieIzquierdo = this.x + 14;
const pieDerecho = this.x + this.width - 14;

if (
  pieIzquierdo < p.x + p.width &&
  pieDerecho > p.x &&
  this.y + this.height > p.y &&
  this.y + this.height < p.y + p.height &&
  this.vy >= 0
) {
        this.y = p.y - this.height;
        this.vy = 0;
        this.onGround = true;
        this.onPlatform = true;
      }
    }

    // Suelo principal (solo si no hemos tocado plataforma)
    if (!this.onPlatform && this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.onGround = true;
    }

    // Selección de animación:
    // - si Game ha puesto currentAnim="see" (al empezar la secuencia final),
    //   cuando está quieto mantendrá "see"; si se mueve, pasa a "walk".
    if (!this.onGround) {
      this.setAnimation("jump");
    } else if (this.vx !== 0) {
      this.setAnimation("walk");
    } else {
      if (this.currentAnim === "see") {
        this.setAnimation("see");   // idle especial: viendo1/viendo2
      } else {
        this.setAnimation("idle");  // idle normal antes de la secuencia
      }
    }

    this.updateAnimation();
  }

  setAnimation(name) {
    if (this.currentAnim !== name) {
      this.currentAnim = name;
      this.currentFrameIndex = 0;
      this.animFrameCounter = 0;
    }
  }

  updateAnimation() {
    const frames = this.getCurrentFrames();
    if (!frames || frames.length === 0) return;

    const speed = this.animationSpeeds[this.currentAnim] || 24;

    this.animFrameCounter++;
    if (this.animFrameCounter >= speed) {
      this.animFrameCounter = 0;
      this.currentFrameIndex++;
      if (this.currentFrameIndex >= frames.length) {
        this.currentFrameIndex = 0;
      }
    }
  }

  getCurrentFrames() {
    switch (this.currentAnim) {
      case "walk":
        return this.walkFrames;
      case "jump":
        return this.jumpFrames;
      case "see":
        return this.seeFrames;
      case "idle":
      default:
        return this.idleFrames;
    }
  }

  draw(ctx, cameraX, carriedItem) {
    const screenX = this.x - cameraX;
    const screenY = this.y;

    const frames = this.getCurrentFrames();
    const img = frames && frames[this.currentFrameIndex];

    // Offset visual: más hundido en suelo, menos en plataforma
    const visualOffsetY = (!this.onPlatform && this.onGround) ? 15 : 5;

    // Fallback sin imagen
    if (!img || !img.complete || img.naturalWidth === 0) {
      ctx.fillStyle = "#ffcc66";
      ctx.fillRect(screenX, screenY + visualOffsetY, this.width, this.height);

      if (carriedItem && carriedItem.image && carriedItem.image.complete) {
        this.drawCarriedItem(ctx, screenX, screenY + visualOffsetY, carriedItem);
      }
      return;
    }

    // Escalado del sprite para encajar con la hitbox
    const scaleX = this.width / img.naturalWidth;
    const scaleY = this.height / img.naturalHeight;
    const drawWidth = img.naturalWidth * scaleX;
    const drawHeight = img.naturalHeight * scaleY;

    ctx.save();

    // Flip horizontal si mira a la izquierda
    if (this.facing === -1) {
      ctx.translate(screenX + drawWidth / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(screenX + drawWidth / 2), 0);
    }

    const drawX = this.facing === 1 ? screenX : screenX - (drawWidth - this.width);

    ctx.drawImage(
      img,
      drawX,
      screenY + visualOffsetY,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    // Objeto encima de la cabeza (en la fase normal)
    if (carriedItem && carriedItem.image && carriedItem.image.complete) {
      this.drawCarriedItem(ctx, screenX, screenY + visualOffsetY, carriedItem);
    }
  }

  drawCarriedItem(ctx, screenX, screenYWithOffset, carriedItem) {
    const img = carriedItem.image;
    const cfg = carriedItem.cfg || { cols: 1 };
    const cols = cfg.cols;

    const fullW = img.naturalWidth;
    const fullH = img.naturalHeight;

    const spriteW = fullW / cols;
    const spriteH = fullH;
    const sx = carriedItem.spriteIndex * spriteW;
    const sy = 0;

    const drawW = 32;
    const drawH = 32;

    const objX = screenX + this.width / 2 - drawW / 2;
    const objY = screenYWithOffset - drawH - 8;

    ctx.drawImage(
      img,
      sx,
      sy,
      spriteW,
      spriteH,
      objX,
      objY,
      drawW,
      drawH
    );
  }
}
