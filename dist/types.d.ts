export interface Vector2 {
    x: number;
    y: number;
}
export interface Bounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
export interface RankingEntry {
    name: string;
    score: number;
    date: string;
}
export interface BuffState {
    active: boolean;
    timer: number;
}
export interface PlayerBuffs {
    shield: BuffState;
    beam: BuffState;
    speed: BuffState;
    rapid: BuffState;
}
export interface ComboState {
    count: number;
    lastKillTime: number;
    multiplier: number;
    displayTimer: number;
}
export type AttackPattern = 'single' | 'triple' | 'spread';
export type MovePattern = 'vertical' | 'circle' | 'complex';
export interface BossConfig {
    stage: number;
    name: string;
    emoji: string;
    description: string;
    hp: number;
    color: string;
    fireRate: number;
    attackPattern: AttackPattern;
    movePattern: MovePattern;
}
export type WeaponType = 'normal' | 'double' | 'triple';
export type PowerUpType = 'double' | 'triple' | 'shield' | 'beam' | 'speed' | 'rapid' | 'life' | 'bomb' | 'megabomb';
export type GameState = 'title' | 'playing' | 'ranking' | 'gameOver' | 'stageClear';
export interface GameConfig {
    canvas: {
        width: number;
        height: number;
    };
    player: {
        baseSpeed: number;
        baseFireRate: number;
    };
    stages: {
        total: number;
        enemiesNeededForBoss: number;
        bosses: BossConfig[];
    };
    ranking: {
        maxEntries: number;
    };
    combo: {
        timeWindow: number;
        maxMultiplier: number;
        displayDuration: number;
        breakOnDamage: boolean;
    };
}
export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    type: ParticleType;
    gravity?: number;
    fade?: boolean;
}
export type ParticleType = 'explosion' | 'spark' | 'trail' | 'fire' | 'smoke' | 'star' | 'fragment';
export interface ParticleConfig {
    count: number;
    speed: {
        min: number;
        max: number;
    };
    size: {
        min: number;
        max: number;
    };
    life: {
        min: number;
        max: number;
    };
    colors: string[];
    gravity?: number;
    fade?: boolean;
}
export type EnemyType = 'basic' | 'fighter' | 'scout' | 'bomber';
export type EnemyMovePattern = 'straight' | 'wave' | 'zigzag' | 'rush';
export interface EnemyConfig {
    type: EnemyType;
    name: string;
    emoji: string;
    hp: number;
    speed: {
        min: number;
        max: number;
    };
    size: {
        width: number;
        height: number;
    };
    color: string;
    score: number;
    movePattern: EnemyMovePattern;
    special?: {
        shootsBack?: boolean;
        fastMove?: boolean;
        toughArmor?: boolean;
    };
}
//# sourceMappingURL=types.d.ts.map