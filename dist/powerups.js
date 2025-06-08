import { GameObject } from './utils.js';
export class PowerUp extends GameObject {
    constructor(x, y, type) {
        super(x, y, 35, 35);
        this.type = type;
        this.colors = {
            'double': '#FF6B6B',
            'triple': '#4ECDC4',
            'shield': '#00FFFF',
            'beam': '#FF00FF',
            'speed': '#FFFF00',
            'rapid': '#FF8C00',
            'life': '#FF69B4',
            'bomb': '#8B0000',
            'megabomb': '#FF0000'
        };
        this.icons = {
            'double': '2',
            'triple': '3',
            'shield': '🛡️',
            'beam': '⚡',
            'speed': '🚀',
            'rapid': '🔥',
            'life': '💖',
            'bomb': '💣',
            'megabomb': '🌟'
        };
        this.velocity.x = -2;
    }
    update() {
        super.update();
        if (this.position.x < -this.width) {
            this.active = false;
        }
    }
    render(ctx) {
        ctx.save();
        // 光るエフェクト
        ctx.shadowColor = this.colors[this.type];
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.colors[this.type] || '#FFD93D';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // アイコン
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.icons[this.type] || '?', this.position.x + this.width / 2, this.position.y + this.height / 2 + 7);
        ctx.restore();
    }
}
//# sourceMappingURL=powerups.js.map