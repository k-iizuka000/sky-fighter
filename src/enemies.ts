import { GameObject, GAME_CONFIG } from './utils.js';
import { EnemyBullet } from './bullets.js';
import { BossConfig, AttackPattern, MovePattern } from './types.js';

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
    public readonly description: string;
    public readonly emoji: string;
    private readonly config: BossConfig;
    
    private movePattern: number = 0;
    private moveTimer: number = 0;
    private fireTimer: number = 0;
    private patternTimer: number = 0;
    private readonly fireRate: number;
    private readonly color: string;
    private readonly attackPattern: AttackPattern;
    private readonly movePatternType: MovePattern;

    constructor(x: number, y: number, stage: number) {
        super(x, y, 120, 80);
        this.stage = stage;
        
        // ステージごとの固定ボス設定を取得
        this.config = this.getBossConfig(stage);
        
        this.name = this.config.name;
        this.description = this.config.description;
        this.emoji = this.config.emoji;
        this.maxHp = this.config.hp;
        this.hp = this.maxHp;
        this.color = this.config.color;
        this.fireRate = this.config.fireRate;
        this.attackPattern = this.config.attackPattern;
        this.movePatternType = this.config.movePattern;
        
        this.velocity.x = -0.5;
        
        console.log(`🎯 ステージ${stage}ボス出現: ${this.name} (HP: ${this.hp})`);
    }

    /**
     * ステージごとの固定ボス設定を取得
     */
    private getBossConfig(stage: number): BossConfig {
        const bossConfig = GAME_CONFIG.stages.bosses.find(boss => boss.stage === stage);
        
        if (!bossConfig) {
            console.warn(`⚠️ ステージ${stage}のボス設定が見つかりません。デフォルトボスを使用します。`);
            // デフォルトボス設定
            return {
                stage: stage,
                name: `🤖 未知の敵レベル${stage}`,
                emoji: "🤖",
                description: `ステージ${stage}の未定義ボス`,
                hp: 200 + (stage * 50),
                color: '#666666',
                fireRate: 50,
                attackPattern: 'single',
                movePattern: 'vertical'
            };
        }
        
        return bossConfig;
    }

    update(): void {
        this.moveTimer++;
        this.fireTimer++;
        this.patternTimer++;
        
        // 固定された移動パターンを実行
        this.updateMovement();
        
        super.update();
        
        // 画面内に留まる
        if (this.position.x < 800) this.position.x = 800;
        if (this.position.x > 1100) this.position.x = 1100;
        if (this.position.y < 50) this.position.y = 50;
        if (this.position.y > 700) this.position.y = 700;
    }

    private updateMovement(): void {
        // ステージごとに固定された移動パターンを実行
        switch(this.movePatternType) {
            case 'vertical': // ステージ1: 縦移動パターン
                this.velocity.x = 0;
                this.velocity.y = Math.sin(this.moveTimer * 0.05) * 1.5;
                break;
                
            case 'circle': // ステージ2: 円運動パターン
                this.velocity.x = Math.sin(this.moveTimer * 0.03) * 1;
                this.velocity.y = Math.cos(this.moveTimer * 0.03) * 1.5;
                break;
                
            case 'complex': // ステージ3: 複雑な移動パターン
                if (this.patternTimer > 180) { // 3秒ごとにパターン変更
                    this.movePattern = (this.movePattern + 1) % 3;
                    this.patternTimer = 0;
                }
                
                switch(this.movePattern) {
                    case 0: // ジグザグ
                        this.velocity.x = Math.sin(this.moveTimer * 0.1) * 0.8;
                        this.velocity.y = (this.moveTimer % 120 < 60) ? 1.5 : -1.5;
                        break;
                    case 1: // 8の字
                        this.velocity.x = Math.sin(this.moveTimer * 0.04) * 1.2;
                        this.velocity.y = Math.sin(this.moveTimer * 0.08) * 2;
                        break;
                    case 2: // 螺旋
                        const radius = Math.sin(this.moveTimer * 0.02) * 0.5 + 0.5;
                        this.velocity.x = Math.cos(this.moveTimer * 0.06) * radius;
                        this.velocity.y = Math.sin(this.moveTimer * 0.06) * radius * 2;
                        break;
                }
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
        
        // ステージごとに固定された攻撃パターンを実行
        switch(this.attackPattern) {
            case 'single': // ステージ1: 単発攻撃
                bullets.push(new EnemyBullet(centerX - 20, centerY, -5, 0, '#FF4500'));
                break;
                
            case 'triple': // ステージ2: 3方向攻撃
                bullets.push(new EnemyBullet(centerX - 20, centerY, -5, 0, '#FF00FF'));
                bullets.push(new EnemyBullet(centerX - 20, centerY, -4, -2, '#FF00FF'));
                bullets.push(new EnemyBullet(centerX - 20, centerY, -4, 2, '#FF00FF'));
                break;
                
            case 'spread': // ステージ3: 5方向拡散攻撃
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
            console.log(`💥 ${this.name} 撃破！`);
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
        
        // ボスの詳細（ステージ別レンダリング）
        this.renderDetails(ctx);
        
        if (this.hp < this.maxHp * 0.3) {
            ctx.restore();
        }
    }

    private renderDetails(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // ステージごとに固定された見た目を描画
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
                // 追加のドラゴン要素
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.position.x + 10, this.position.y + 10, 20, 10); // 角
                ctx.fillRect(this.position.x + 90, this.position.y + 10, 20, 10); // 角
                break;
        }
    }

    /**
     * ボス情報を取得（UI表示用）
     */
    getBossInfo(): { name: string; description: string; emoji: string; stage: number } {
        return {
            name: this.name,
            description: this.description,
            emoji: this.emoji,
            stage: this.stage
        };
    }
} 