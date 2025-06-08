import { RankingEntry } from './types.js';
export declare class RankingManager {
    private readonly maxRankings;
    private readonly storageKey;
    getRankings(): RankingEntry[];
    saveScore(name: string, score: number): number | null;
    private getRank;
    clearRankings(): void;
    isHighScore(score: number): boolean;
}
//# sourceMappingURL=ranking.d.ts.map