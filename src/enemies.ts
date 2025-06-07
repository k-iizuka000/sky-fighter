import { GameObject } from './utils.js';
import { EnemyBullet } from './bullets.js';

export class Enemy extends GameObject {
    constructor(x: number, y: number) {
        super(x, y, 40, 30);
        this.velocity.x = -1 - Math.random() * 1;
        this.velocity.y = (Math.random() - 0.5) * 1;
    }

    update(): void {
        super.update();
        if (this.position.x < -this.width) {
            this.active = false;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // 敵の詳細
        ctx.fillStyle = '#C0392B';
        ctx.fillRect(this.position.x - 10, this.position.y + 10, 15, 10);
    }
}

export class Boss extends GameObject {
    public readonly stage: number;
    public readonly maxHp: number;
    public hp: number;
    public readonly name: string;
    
    private movePattern: number = 0;
    private moveTimer: number = 0;
    private fireTimer: number = 0;
    private patternTimer: number = 0;
    private readonly fireRate: number;
    private readonly color: string;

    constructor(x: number, y: number, stage: number) {
        super(x, y, 120, 80);
        this.stage = stage;
        this.maxHp = 200 + (stage * 100);
        this.hp = this.maxHp;
        this.velocity.x = -0.5;
        
        // ステージ別設定
        const config = this.setupByStage();
        this.name = config.name;
        this.color = config.color;
        this.fireRate = config.fireRate;
    }

    private setupByStage(): { name: string; color: string; fireRate: number } {
        switch(this.stage) {
            case 1:
                return {
                    name: "🚁 アーマードヘリ",
                    color: '#8B4513',
                    fireRate: 60
                };
            case 2:
                return {
                    name: "🛸 エイリアンクルーザー",
                    color: '#800080',
                    fireRate: 40
                };
            case 3:
                return {
                    name: "🐲 メカドラゴン",
                    color: '#B22222',
                    fireRate: 30
                };
            default:
                return {
                    name: "🤖 未知の敵",
                    color: '#666666',
                    fireRate: 50
                };
        }
    }

    update(): void {
        this.moveTimer++;
        this.fireTimer++;
        this.patternTimer++;
        
        // 移動パターン
        this.updateMovement();
        
        super.update();
        
        // 画面内に留まる
        if (this.position.x < 800) this.position.x = 800;
        if (this.position.x > 1100) this.position.x = 1100;
        if (this.position.y < 50) this.position.y = 50;
        if (this.position.y > 700) this.position.y = 700;
    }

    private updateMovement(): void {
        if (this.patternTimer > 180) { // 3秒ごとにパターン変更
            this.movePattern = (this.movePattern + 1) % 3;
            this.patternTimer = 0;
        }
        
        switch(this.movePattern) {
            case 0: // 縦移動
                this.velocity.x = 0;
                this.velocity.y = Math.sin(this.moveTimer * 0.05) * 1.5;
                break;
            case 1: // 円運動
                this.velocity.x = Math.sin(this.moveTimer * 0.03) * 1;
                this.velocity.y = Math.cos(this.moveTimer * 0.03) * 1.5;
                break;
            case 2: // ジグザグ
                this.velocity.x = Math.sin(this.moveTimer * 0.1) * 0.8;
                this.velocity.y = (this.moveTimer % 120 < 60) ? 1 : -1;
                break;
        }
    }

    updateAttack(): EnemyBullet[] {
        if (this.fireTimer >= this.fireRate) {
            this.fireTimer = 0;
            return this.createBullets();
        }
        return [];
    }

    private createBullets(): EnemyBullet[] {
        const bullets: EnemyBullet[] = [];
        const centerX = this.position.x;
        const centerY = this.position.y + this.height / 2;
        
        switch(this.stage) {
            case 1: // 単発攻撃
                bullets.push(new EnemyBullet(centerX - 20, centerY, -5, 0, '#FF4500'));
                break;
            case 2: // 3方向攻撃
                bullets.push(new EnemyBullet(centerX - 20, centerY, -5, 0, '#FF00FF'));
                bullets.push(new EnemyBullet(centerX - 20, centerY, -4, -2, '#FF00FF'));
                bullets.push(new EnemyBullet(centerX - 20, centerY, -4, 2, '#FF00FF'));
                break;
            case 3: // 5方向攻撃
                for (let i = -2; i <= 2; i++) {
                    bullets.push(new EnemyBullet(centerX - 20, centerY, -4, i * 1.5, '#DC143C'));
                }
                break;
        }
        
        return bullets;
    }

    takeDamage(damage: number = 10): boolean {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.active = false;
            return true; // ボス撃破
        }
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        // ダメージエフェクト
        if (this.hp < this.maxHp * 0.3) {
            ctx.save();
            ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // ボスの詳細（ステージ別）
        this.renderDetails(ctx);
        
        if (this.hp < this.maxHp * 0.3) {
            ctx.restore();
        }
    }

    private renderDetails(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        switch(this.stage) {
            case 1: // ヘリコプター
                // プロペラ
                ctx.fillRect(this.position.x + 40, this.position.y - 10, 40, 5);
                // 機体詳細
                ctx.fillStyle = '#654321';
                ctx.fillRect(this.position.x + 20, this.position.y + 20, 80, 40);
                break;
            case 2: // UFO
                // 光る部分
                ctx.fillStyle = '#FF00FF';
                for (let i = 0; i < 5; i++) {
                    ctx.fillRect(this.position.x + i * 25, this.position.y + 60, 10, 10);
                }
                break;
            case 3: // ドラゴン
                // ウィング
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(this.position.x - 20, this.position.y + 10, 30, 60);
                ctx.fillRect(this.position.x + 110, this.position.y + 10, 30, 60);
                break;
        }
    }
} 