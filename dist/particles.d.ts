import { ParticleType } from './types.js';
export declare class ParticleSystem {
    private particles;
    private static readonly PARTICLE_CONFIGS;
    /**
     * パーティクルエフェクトを生成
     */
    createEffect(x: number, y: number, type: ParticleType, scale?: number): void;
    /**
     * 爆発エフェクト（敵破壊時）
     */
    createExplosion(x: number, y: number, scale?: number): void;
    /**
     * パワーアップエフェクト
     */
    createPowerUpEffect(x: number, y: number): void;
    /**
     * ボス爆発エフェクト
     */
    createBossExplosion(x: number, y: number): void;
    /**
     * 弾丸トレイルエフェクト
     */
    createBulletTrail(x: number, y: number): void;
    /**
     * ヒットエフェクト
     */
    createHitEffect(x: number, y: number): void;
    /**
     * パーティクルの更新
     */
    update(): void;
    /**
     * パーティクルの描画
     */
    render(ctx: CanvasRenderingContext2D): void;
    /**
     * 個別パーティクルの描画
     */
    private renderParticle;
    /**
     * 星形の描画
     */
    private drawStar;
    /**
     * トレイルの描画
     */
    private drawTrail;
    /**
     * 全パーティクルをクリア
     */
    clear(): void;
    /**
     * パーティクル数を取得
     */
    getParticleCount(): number;
    /**
     * 指定範囲の乱数を生成
     */
    private randomBetween;
}
//# sourceMappingURL=particles.d.ts.map