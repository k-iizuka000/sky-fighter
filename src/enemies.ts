import { GameObject, GAME_CONFIG } from './utils.js';
import { EnemyBullet } from './bullets.js';
import { BossConfig, AttackPattern, MovePattern, EnemyConfig, EnemyType } from './types.js';

export class Enemy extends GameObject {
    public readonly type: EnemyType;
    public readonly config: EnemyConfig;
    public hp: number;
    public readonly maxHp: number;
    public readonly score: number;
    private moveTimer: number = 0;
    private shootTimer: number = 0;
    private readonly baseSpeed: number;
    
    constructor(x: number, y: number, stage: number = 1) {
        // ステージに基づいて敵の設定を取得
        const config = Enemy.getEnemyConfigByStage(stage);
        super(x, y, config.size.width, config.size.height);
        
        this.config = config;
        this.type = config.type;
        this.maxHp = config.hp;
        this.hp = this.maxHp;
        this.score = config.score;
        
        // 速度をランダムに設定
        this.baseSpeed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
        this.velocity.x = -this.baseSpeed;
        
        // 移動パターンに応じた初期化
        this.initializeMovement();
        
        console.log(`👾 ${config.name} 出現 (Stage ${stage})`);
    }

    private static getEnemyConfigByStage(stage: number): EnemyConfig {
        switch (stage) {
            case 1:
                return GAME_CONFIG.enemies.stage1;
            case 2:
                return GAME_CONFIG.enemies.stage2;
            case 3:
                return GAME_CONFIG.enemies.stage3;
            default:
                return GAME_CONFIG.enemies.stage1;
        }
    }

    private initializeMovement(): void {
        switch (this.config.movePattern) {
            case 'straight':
                this.velocity.y = 0;
                break;
            case 'wave':
                this.velocity.y = (Math.random() - 0.5) * 2;
                break;
            case 'zigzag':
                this.velocity.y = Math.random() > 0.5 ? 1 : -1;
                break;
            case 'rush':
                this.velocity.x = -this.baseSpeed * 1.5; // より速く
                this.velocity.y = (Math.random() - 0.5) * 0.5;
                break;
        }
    }

    update(): void {
        this.moveTimer++;
        this.shootTimer++;
        
        // 移動パターンの更新
        this.updateMovementPattern();
        
        super.update();
        
        // 画面外に出たら非アクティブに
        if (this.position.x < -this.width || this.position.y < -this.height || this.position.y > GAME_CONFIG.canvas.height) {
            this.active = false;
        }
    }

    private updateMovementPattern(): void {
        switch (this.config.movePattern) {
            case 'straight':
                // まっすぐ移動（変更なし）
                break;
                
            case 'wave':
                // 波状移動
                this.velocity.y = Math.sin(this.moveTimer * 0.1) * 1.5;
                break;
                
            case 'zigzag':
                // ジグザグ移動
                if (this.moveTimer % 60 === 0) {
                    this.velocity.y *= -1;
                }
                break;
                
            case 'rush':
                // 突進移動（プレイヤーの方向に微調整）
                if (this.moveTimer % 30 === 0) {
                    this.velocity.y += (Math.random() - 0.5) * 0.5;
                    this.velocity.y = Math.max(-2, Math.min(2, this.velocity.y));
                }
                break;
        }
    }

    takeDamage(damage: number = 1): boolean {
        // 装甲特性があれば半分のダメージ
        if (this.config.special?.toughArmor) {
            damage = Math.max(1, Math.floor(damage / 2));
        }
        
        this.hp -= damage;
        if (this.hp <= 0) {
            this.active = false;
            console.log(`💥 ${this.config.name} 撃破！`);
            return true; // 撃破
        }
        return false;
    }

    // 反撃能力があるかどうか
    canShootBack(): boolean {
        return this.config.special?.shootsBack === true && this.shootTimer > 120; // 2秒間隔
    }

    createReturnFire(): EnemyBullet | null {
        if (!this.canShootBack()) return null;
        
        this.shootTimer = 0;
        const bulletX = this.position.x - 10;
        const bulletY = this.position.y + this.height / 2;
        
        return new EnemyBullet(bulletX, bulletY, -3, 0, this.config.color);
    }

    render(ctx: CanvasRenderingContext2D): void {
        // ダメージエフェクト
        if (this.hp < this.maxHp) {
            ctx.save();
            ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.02) * 0.2;
        }
        
        // メインボディ
        ctx.fillStyle = this.config.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // タイプ別の詳細レンダリング
        this.renderTypeSpecificDetails(ctx);
        
        if (this.hp < this.maxHp) {
            ctx.restore();
        }
    }

    private renderTypeSpecificDetails(ctx: CanvasRenderingContext2D): void {
        switch (this.type) {
            case 'basic': // 偵察機
                ctx.fillStyle = '#C0392B';
                ctx.fillRect(this.position.x - 8, this.position.y + 8, 12, 8);
                // 翼
                ctx.fillStyle = '#A93226';
                ctx.fillRect(this.position.x - 5, this.position.y + this.height - 5, 8, 3);
                break;
                
            case 'fighter': // 戦闘ヘリ
                ctx.fillStyle = '#D35400';
                // プロペラ
                ctx.fillRect(this.position.x + 15, this.position.y - 5, 15, 3);
                // 武装
                ctx.fillStyle = '#922B21';
                ctx.fillRect(this.position.x - 8, this.position.y + 12, 10, 6);
                // 反撃可能の表示
                if (this.config.special?.shootsBack) {
                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(this.position.x - 3, this.position.y + 5, 4, 4);
                }
                break;
                
            case 'bomber': // 重爆撃機
                ctx.fillStyle = '#5D4037';
                // 重装甲の表現
                ctx.fillRect(this.position.x + 5, this.position.y + 5, this.width - 10, this.height - 10);
                // 爆弾ベイ
                ctx.fillStyle = '#2E2E2E';
                ctx.fillRect(this.position.x + 10, this.position.y + 15, 15, 8);
                // 装甲マーク
                if (this.config.special?.toughArmor) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(this.position.x + 2, this.position.y + 2, 6, 6);
                }
                break;
                
            case 'scout': // 将来的な拡張用
                ctx.fillStyle = '#27AE60';
                ctx.fillRect(this.position.x - 5, this.position.y + 5, 10, 5);
                break;
        }
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