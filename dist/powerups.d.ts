import { GameObject } from './utils.js';
import { PowerUpType } from './types.js';
export declare class PowerUp extends GameObject {
    readonly type: PowerUpType;
    private readonly colors;
    private readonly icons;
    constructor(x: number, y: number, type: PowerUpType);
    update(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=powerups.d.ts.map