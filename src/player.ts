import { GameObject, GAME_CONFIG } from './utils.js';
import { WeaponType, PlayerBuffs } from './types.js';
import { Bullet, BeamBullet } from './bullets.js';

export class Player extends GameObject {
    private baseSpeed: number = GAME_CONFIG.player.baseSpeed;
    private baseFireRate: number = GAME_CONFIG.player.baseFireRate;
    private fireCounter: number = 0;
    private shieldEffect: number = 0;

    public speed: number = this.baseSpeed;
    public fireRate: number = this.baseFireRate;
    public weapon: WeaponType = 'normal';
    public buffs: PlayerBuffs = {
        shield: { active: false, timer: 0 },
        beam: { active: false, timer: 0 },
        speed: { active: false, timer: 0 },
        rapid: { active: false, timer: 0 }
    };

    constructor(x: number, y: number) {
        super(x, y, 60, 40);
    }

    update(): void {
        super.update();
        
        // 境界チェック
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x > GAME_CONFIG.canvas.width - this.width) {
            this.position.x = GAME_CONFIG.canvas.width - this.width;
        }
        if (this.position.y < 0) this.position.y = 0;
        if (this.position.y > GAME_CONFIG.canvas.height - this.height) {
            this.position.y = GAME_CONFIG.canvas.height - this.height;
        }

        if (this.fireCounter > 0) this.fireCounter--;
        
        // バフタイマー管理
        this.updateBuffs();
        
        this.shieldEffect += 0.2;
    }

    private updateBuffs(): void {
        let speedMultiplier = 1;
        let fireRateMultiplier = 1;
        
        // 各バフの時間管理
        for (const buffName in this.buffs) {
            const buff = this.buffs[buffName as keyof PlayerBuffs];
            if (buff.active) {
                buff.timer--;
                if (buff.timer <= 0) {
                    buff.active = false;
                }
            }
        }
        
        // スピードバフ
        if (this.buffs.speed.active) {
            speedMultiplier = 2;
        }
        
        // 高速射撃バフ
        if (this.buffs.rapid.active) {
            fireRateMultiplier = 0.3;
        }
        
        this.speed = this.baseSpeed * speedMultiplier;
        this.fireRate = this.baseFireRate * fireRateMultiplier;
    }

    render(ctx: CanvasRenderingContext2D): void {
        // シールドエフェクト
        if (this.buffs.shield.active) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(this.shieldEffect) * 0.3;
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x + this.width/2, this.position.y + this.height/2, 
                   this.width/2 + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.fillStyle = '#4A90E2';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // 飛行機の詳細
        ctx.fillStyle = '#2E5C8A';
        ctx.fillRect(this.position.x + 40, this.position.y + 15, 20, 10);
        
        // ウィング
        ctx.fillStyle = '#4A90E2';
        ctx.fillRect(this.position.x + 10, this.position.y - 5, 30, 10);
        ctx.fillRect(this.position.x + 10, this.position.y + 35, 30, 10);
        
        // スピードエフェクト
        if (this.buffs.speed.active) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(this.position.x - 10 - i * 5, this.position.y + 10 + i * 3, 8, 4);
                ctx.fillRect(this.position.x - 10 - i * 5, this.position.y + 25 - i * 3, 8, 4);
            }
        }
    }

    fire(): (Bullet | BeamBullet)[] {
        if (this.fireCounter > 0) return [];

        const bullets: (Bullet | BeamBullet)[] = [];
        const centerY = this.position.y + this.height / 2;

        // ビームモード
        if (this.buffs.beam.active) {
            bullets.push(new BeamBullet(this.position.x + this.width, centerY - 15, 12, 0, '#FF00FF'));
            this.fireCounter = this.fireRate;
            return bullets;
        }

        switch (this.weapon) {
            case 'normal':
                bullets.push(new Bullet(this.position.x + this.width, centerY - 2, 8, 0, '#FFFF00'));
                break;
            case 'double':
                bullets.push(new Bullet(this.position.x + this.width, centerY - 10, 8, 0, '#FF6B6B'));
                bullets.push(new Bullet(this.position.x + this.width, centerY + 5, 8, 0, '#FF6B6B'));
                break;
            case 'triple':
                bullets.push(new Bullet(this.position.x + this.width, centerY - 2, 8, 0, '#4ECDC4'));
                bullets.push(new Bullet(this.position.x + this.width, centerY - 12, 7, -1, '#4ECDC4'));
                bullets.push(new Bullet(this.position.x + this.width, centerY + 8, 7, 1, '#4ECDC4'));
                break;
        }

        this.fireCounter = this.fireRate;
        return bullets;
    }

    setWeapon(weapon: WeaponType): void {
        this.weapon = weapon;
    }

    activateBuff(buffType: keyof PlayerBuffs, duration: number = 300): void {
        this.buffs[buffType].active = true;
        this.buffs[buffType].timer = duration;
    }

    isShielded(): boolean {
        return this.buffs.shield.active;
    }
} 