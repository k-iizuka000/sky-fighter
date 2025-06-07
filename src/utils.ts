import { Vector2, Bounds } from './types.js';

export class Vector2D implements Vector2 {
    constructor(public x: number = 0, public y: number = 0) {}
}

export abstract class GameObject {
    public position: Vector2D;
    public velocity: Vector2D;
    public active: boolean = true;

    constructor(
        public x: number, 
        public y: number, 
        public width: number, 
        public height: number
    ) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
    }

    update(): void {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    abstract render(ctx: CanvasRenderingContext2D): void;

    getBounds(): Bounds {
        return {
            left: this.position.x,
            right: this.position.x + this.width,
            top: this.position.y,
            bottom: this.position.y + this.height
        };
    }

    checkCollision(other: GameObject): boolean {
        const a = this.getBounds();
        const b = other.getBounds();
        return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    }
}

export const GAME_CONFIG = {
    canvas: {
        width: 1200,
        height: 800
    },
    player: {
        baseSpeed: 3,
        baseFireRate: 10
    },
    stages: {
        total: 3,
        enemiesNeededForBoss: 15
    },
    ranking: {
        maxEntries: 10
    }
} as const; 