import { GameObject } from './utils.js';
import { EnemyBullet } from './bullets.js';
import { EnemyConfig, EnemyType } from './types.js';
export declare class Enemy extends GameObject {
    readonly type: EnemyType;
    readonly config: EnemyConfig;
    hp: number;
    readonly maxHp: number;
    readonly score: number;
    private moveTimer;
    private shootTimer;
    private readonly baseSpeed;
    constructor(x: number, y: number, stage?: number);
    private static getEnemyConfigByStage;
    private initializeMovement;
    update(): void;
    private updateMovementPattern;
    takeDamage(damage?: number): boolean;
    canShootBack(): boolean;
    createReturnFire(): EnemyBullet | null;
    render(ctx: CanvasRenderingContext2D): void;
    private renderTypeSpecificDetails;
}
export declare class Boss extends GameObject {
    readonly stage: number;
    readonly maxHp: number;
    hp: number;
    readonly name: string;
    readonly description: string;
    readonly emoji: string;
    private readonly config;
    private movePattern;
    private moveTimer;
    private fireTimer;
    private patternTimer;
    private readonly fireRate;
    private readonly color;
    private readonly attackPattern;
    private readonly movePatternType;
    constructor(x: number, y: number, stage: number);
    /**
     * ステージごとの固定ボス設定を取得
     */
    private getBossConfig;
    update(): void;
    private updateMovement;
    updateAttack(): EnemyBullet[];
    private createBullets;
    takeDamage(damage?: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
    private renderDetails;
    /**
     * ボス情報を取得（UI表示用）
     */
    getBossInfo(): {
        name: string;
        description: string;
        emoji: string;
        stage: number;
    };
}
//# sourceMappingURL=enemies.d.ts.map