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

// ボス関連の型定義
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
export type GameState = 'title' | 'playing' | 'ranking' | 'gameOver';

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