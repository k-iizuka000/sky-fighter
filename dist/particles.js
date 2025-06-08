export class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    /**
     * パーティクルエフェクトを生成
     */
    createEffect(x, y, type, scale = 1) {
        const config = ParticleSystem.PARTICLE_CONFIGS[type];
        const particleCount = Math.floor(config.count * scale);
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = this.randomBetween(config.speed.min, config.speed.max) * scale;
            const size = this.randomBetween(config.size.min, config.size.max) * scale;
            const life = Math.floor(this.randomBetween(config.life.min, config.life.max));
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            const particle = {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life,
                maxLife: life,
                size,
                color,
                type,
                gravity: config.gravity,
                fade: config.fade
            };
            this.particles.push(particle);
        }
    }
    /**
     * 爆発エフェクト（敵破壊時）
     */
    createExplosion(x, y, scale = 1) {
        this.createEffect(x, y, 'explosion', scale);
        this.createEffect(x, y, 'spark', scale * 0.7);
    }
    /**
     * パワーアップエフェクト
     */
    createPowerUpEffect(x, y) {
        this.createEffect(x, y, 'star', 1.2);
        this.createEffect(x, y, 'spark', 0.8);
    }
    /**
     * ボス爆発エフェクト
     */
    createBossExplosion(x, y) {
        this.createEffect(x, y, 'explosion', 2.5);
        this.createEffect(x, y, 'fire', 1.8);
        this.createEffect(x, y, 'fragment', 1.5);
        this.createEffect(x, y, 'smoke', 1.2);
    }
    /**
     * 弾丸トレイルエフェクト
     */
    createBulletTrail(x, y) {
        if (Math.random() < 0.3) { // 30%の確率で生成
            this.createEffect(x, y, 'trail', 0.5);
        }
    }
    /**
     * ヒットエフェクト
     */
    createHitEffect(x, y) {
        this.createEffect(x, y, 'spark', 0.6);
    }
    /**
     * パーティクルの更新
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            // 位置更新
            particle.x += particle.vx;
            particle.y += particle.vy;
            // 重力効果
            if (particle.gravity !== undefined) {
                particle.vy += particle.gravity;
            }
            // ライフタイム減少
            particle.life--;
            // 寿命が尽きたパーティクルを削除
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    /**
     * パーティクルの描画
     */
    render(ctx) {
        ctx.save();
        for (const particle of this.particles) {
            const alpha = particle.fade
                ? particle.life / particle.maxLife
                : 1;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            // パーティクルの種類によって描画方法を変更
            this.renderParticle(ctx, particle);
        }
        ctx.restore();
    }
    /**
     * 個別パーティクルの描画
     */
    renderParticle(ctx, particle) {
        const { x, y, size, type } = particle;
        switch (type) {
            case 'star':
                this.drawStar(ctx, x, y, size);
                break;
            case 'trail':
                this.drawTrail(ctx, x, y, size);
                break;
            default:
                // デフォルト：円形
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
    /**
     * 星形の描画
     */
    drawStar(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const outerRadius = size;
            const innerRadius = size * 0.4;
            if (i === 0) {
                ctx.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
            }
            else {
                ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
            }
            const innerAngle = angle + Math.PI / 5;
            ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    /**
     * トレイルの描画
     */
    drawTrail(ctx, x, y, size) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, ctx.fillStyle);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    /**
     * 全パーティクルをクリア
     */
    clear() {
        this.particles = [];
    }
    /**
     * パーティクル数を取得
     */
    getParticleCount() {
        return this.particles.length;
    }
    /**
     * 指定範囲の乱数を生成
     */
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
}
// 定義済みのパーティクル設定
ParticleSystem.PARTICLE_CONFIGS = {
    explosion: {
        count: 20,
        speed: { min: 2, max: 8 },
        size: { min: 2, max: 6 },
        life: { min: 20, max: 40 },
        colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF4757', '#FF3838'],
        gravity: 0.1,
        fade: true
    },
    spark: {
        count: 15,
        speed: { min: 1, max: 5 },
        size: { min: 1, max: 3 },
        life: { min: 15, max: 30 },
        colors: ['#FFFFFF', '#FFFF00', '#FFA500', '#FF69B4'],
        gravity: 0.05,
        fade: true
    },
    trail: {
        count: 5,
        speed: { min: 0.5, max: 2 },
        size: { min: 1, max: 4 },
        life: { min: 10, max: 20 },
        colors: ['#00BFFF', '#0080FF', '#4169E1', '#1E90FF'],
        fade: true
    },
    fire: {
        count: 12,
        speed: { min: 1, max: 4 },
        size: { min: 2, max: 5 },
        life: { min: 25, max: 45 },
        colors: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'],
        gravity: -0.1,
        fade: true
    },
    smoke: {
        count: 8,
        speed: { min: 0.5, max: 2 },
        size: { min: 3, max: 8 },
        life: { min: 30, max: 60 },
        colors: ['#696969', '#A9A9A9', '#808080', '#D3D3D3'],
        gravity: -0.05,
        fade: true
    },
    star: {
        count: 10,
        speed: { min: 1, max: 3 },
        size: { min: 1, max: 3 },
        life: { min: 20, max: 40 },
        colors: ['#FFD700', '#FFFF00', '#FFFFFF', '#F0E68C'],
        fade: true
    },
    fragment: {
        count: 25,
        speed: { min: 3, max: 10 },
        size: { min: 1, max: 4 },
        life: { min: 15, max: 35 },
        colors: ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],
        gravity: 0.2,
        fade: true
    }
};
//# sourceMappingURL=particles.js.map