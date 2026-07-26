export default class Container {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;

    // Contenedores más grandes
    this.width = 90;   // antes 70
    this.height = 110; // antes 90

    this.type = type;

    this.image = new Image();

    const filename =
      type === "amarillo" ? "amarillo.png" :
      type === "azul"     ? "azul.png"     :
      type === "verde"    ? "verde.png"    :
      type === "marron"   ? "marrón.png"   :
                            "gris.png";

    this.image.src = `assets/contenedores/${filename}`;
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    const screenY = this.y;

    if (!this.image.complete || this.image.naturalWidth === 0) {
      ctx.fillStyle =
        this.type === "amarillo" ? "#ffdd55" :
        this.type === "azul"     ? "#4fa0ff" :
        this.type === "verde"    ? "#4caf50" :
        this.type === "marron"   ? "#a0522d" :
                                   "#777777";

      ctx.fillRect(screenX, screenY, this.width, this.height);
      return;
    }

    const scaleX = this.width / this.image.naturalWidth;
    const scaleY = this.height / this.image.naturalHeight;
    const drawWidth = this.image.naturalWidth * scaleX;
    const drawHeight = this.image.naturalHeight * scaleY;

    ctx.drawImage(
      this.image,
      screenX,
      screenY,
      drawWidth,
      drawHeight
    );
  }
}