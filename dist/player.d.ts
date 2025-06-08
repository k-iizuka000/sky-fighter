import { GameObject } from './utils.js';
import { WeaponType, PlayerBuffs } from './types.js';
import { Bullet, BeamBullet } from './bullets.js';
export declare class Player extends GameObject {
    private baseSpeed;
    private baseFireRate;
    private fireCounter;
    private shieldEffect;
    speed: number;
    fireRate: number;
    weapon: WeaponType;
    buffs: PlayerBuffs;
    constructor(x: number, y: number);
    update(): void;
    private updateBuffs;
    render(ctx: CanvasRenderingContext2D): void;
    fire(): (Bullet | BeamBullet)[];
    setWeapon(weapon: WeaponType): void;
    activateBuff(buffType: keyof PlayerBuffs, duration?: number): void;
    isShielded(): boolean;
}
//# sourceMappingURL=player.d.ts.map