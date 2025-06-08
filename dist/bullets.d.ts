import { GameObject } from './utils.js';
export declare class Bullet extends GameObject {
    private color;
    constructor(x: number, y: number, speedX: number, speedY?: number, color?: string);
    update(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare class BeamBullet extends GameObject {
    private color;
    private glowEffect;
    constructor(x: number, y: number, speedX: number, speedY?: number, color?: string);
    update(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare class EnemyBullet extends GameObject {
    private color;
    constructor(x: number, y: number, speedX: number, speedY: number, color?: string);
    update(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=bullets.d.ts.map