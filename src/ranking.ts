import { RankingEntry } from './types.js';
import { GAME_CONFIG } from './utils.js';

export class RankingManager {
    private readonly maxRankings: number = GAME_CONFIG.ranking.maxEntries;
    private readonly storageKey: string = 'shootingGameRankings';

    getRankings(): RankingEntry[] {
        const rankings = localStorage.getItem(this.storageKey);
        return rankings ? JSON.parse(rankings) : [];
    }

    saveScore(name: string, score: number): number | null {
        const rankings = this.getRankings();
        rankings.push({ 
            name: name, 
            score: score, 
            date: new Date().toLocaleDateString() 
        });
        rankings.sort((a, b) => b.score - a.score);
        rankings.splice(this.maxRankings); // 上位10位まで保持
        localStorage.setItem(this.storageKey, JSON.stringify(rankings));
        return this.getRank(score);
    }

    private getRank(score: number): number | null {
        const rankings = this.getRankings();
        const rank = rankings.findIndex(item => item.score === score) + 1;
        return rank <= this.maxRankings ? rank : null;
    }

    clearRankings(): void {
        localStorage.removeItem(this.storageKey);
    }

    isHighScore(score: number): boolean {
        const rankings = this.getRankings();
        return rankings.length < this.maxRankings || score > rankings[rankings.length - 1].score;
    }
} 