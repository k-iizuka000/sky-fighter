import { GameObject, GAME_CONFIG } from './utils.js';
export class Bullet extends GameObject {
    constructor(x, y, speedX, speedY = 0, color = '#FFFF00') {
        super(x, y, 8, 4);
        this.color = color;
        this.velocity.x = speedX;
        this.velocity.y = speedY;
    }
    update() {
        super.update();
        if (this.position.x > GAME_CONFIG.canvas.width || this.position.x < 0 ||
            this.position.y > GAME_CONFIG.canvas.height || this.position.y < 0) {
            this.active = false;
        }
    }
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}
export class BeamBullet extends GameObject {
    constructor(x, y, speedX, speedY = 0, color = '#FF00FF') {
        super(x, y, 20, 30);
        this.color = color;
        this.glowEffect = 0;
        this.velocity.x = speedX;
        this.velocity.y = speedY;
    }
    update() {
        super.update();
        this.glowEffect += 0.3;
        if (this.position.x > GAME_CONFIG.canvas.width || this.position.x < 0 ||
            this.position.y > GAME_CONFIG.canvas.height || this.position.y < 0) {
            this.active = false;
        }
    }
    render(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 + Math.sin(this.glowEffect) * 5;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.restore();
    }
}
export class EnemyBullet extends GameObject {
    constructor(x, y, speedX, speedY, color = '#FF4500') {
        super(x, y, 8, 8);
        this.color = color;
        this.velocity.x = speedX;
        this.velocity.y = speedY;
    }
    update() {
        super.update();
        if (this.position.x < -20 || this.position.x > GAME_CONFIG.canvas.width + 20 ||
            this.position.y < -20 || this.position.y > GAME_CONFIG.canvas.height + 20) {
            this.active = false;
        }
    }
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x + 4, this.position.y + 4, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
//# sourceMappingURL=bullets.js.map