import { Vector2, Bounds } from './types.js';
export declare class Vector2D implements Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
}
export declare abstract class GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    position: Vector2D;
    velocity: Vector2D;
    active: boolean;
    constructor(x: number, y: number, width: number, height: number);
    update(): void;
    abstract render(ctx: CanvasRenderingContext2D): void;
    getBounds(): Bounds;
    checkCollision(other: GameObject): boolean;
}
export declare const GAME_CONFIG: {
    readonly canvas: {
        readonly width: 1200;
        readonly height: 800;
    };
    readonly player: {
        readonly baseSpeed: 3;
        readonly baseFireRate: 10;
    };
    readonly mobile: {
        readonly speedMultiplier: 3;
    };
    readonly stages: {
        readonly total: 3;
        readonly enemiesNeededForBoss: 15;
        readonly bosses: readonly [{
            readonly stage: 1;
            readonly name: "🚁 アーマードヘリ";
            readonly emoji: "🚁";
            readonly description: "重装甲のヘリコプター型ボス";
            readonly hp: 150;
            readonly color: "#8B4513";
            readonly fireRate: 60;
            readonly attackPattern: "single";
            readonly movePattern: "vertical";
        }, {
            readonly stage: 2;
            readonly name: "🛸 エイリアンクルーザー";
            readonly emoji: "🛸";
            readonly description: "3方向攻撃の円盤型ボス";
            readonly hp: 200;
            readonly color: "#800080";
            readonly fireRate: 40;
            readonly attackPattern: "triple";
            readonly movePattern: "circle";
        }, {
            readonly stage: 3;
            readonly name: "🐲 メカドラゴン";
            readonly emoji: "🐲";
            readonly description: "5方向拡散攻撃の龍型ボス";
            readonly hp: 250;
            readonly color: "#B22222";
            readonly fireRate: 30;
            readonly attackPattern: "spread";
            readonly movePattern: "complex";
        }];
    };
    readonly ranking: {
        readonly maxEntries: 10;
    };
    readonly combo: {
        readonly timeWindow: 180;
        readonly maxMultiplier: 5;
        readonly displayDuration: 120;
        readonly breakOnDamage: true;
    };
    readonly enemies: {
        readonly stage1: {
            readonly type: "basic";
            readonly name: "🛩️ 偵察機";
            readonly emoji: "🛩️";
            readonly hp: 1;
            readonly speed: {
                readonly min: 1;
                readonly max: 2;
            };
            readonly size: {
                readonly width: 40;
                readonly height: 30;
            };
            readonly color: "#E74C3C";
            readonly score: 100;
            readonly movePattern: "straight";
        };
        readonly stage2: {
            readonly type: "fighter";
            readonly name: "🚁 戦闘ヘリ";
            readonly emoji: "🚁";
            readonly hp: 2;
            readonly speed: {
                readonly min: 0.5;
                readonly max: 1.5;
            };
            readonly size: {
                readonly width: 45;
                readonly height: 35;
            };
            readonly color: "#FF6B35";
            readonly score: 150;
            readonly movePattern: "wave";
            readonly special: {
                readonly shootsBack: true;
            };
        };
        readonly stage3: {
            readonly type: "bomber";
            readonly name: "💣 重爆撃機";
            readonly emoji: "💣";
            readonly hp: 3;
            readonly speed: {
                readonly min: 0.8;
                readonly max: 1.2;
            };
            readonly size: {
                readonly width: 60;
                readonly height: 40;
            };
            readonly color: "#8B4513";
            readonly score: 200;
            readonly movePattern: "zigzag";
            readonly special: {
                readonly toughArmor: true;
            };
        };
    };
};
//# sourceMappingURL=utils.d.ts.map