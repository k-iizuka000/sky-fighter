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

export type WeaponType = 'normal' | 'double' | 'triple';
export type PowerUpType = 'double' | 'triple' | 'shield' | 'beam' | 'speed' | 'rapid' | 'life' | 'bomb';
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
    };
    ranking: {
        maxEntries: number;
    };
} 