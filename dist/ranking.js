import { GAME_CONFIG } from './utils.js';
export class RankingManager {
    constructor() {
        this.maxRankings = GAME_CONFIG.ranking.maxEntries;
        this.storageKey = 'shootingGameRankings';
    }
    getRankings() {
        const rankings = localStorage.getItem(this.storageKey);
        return rankings ? JSON.parse(rankings) : [];
    }
    saveScore(name, score) {
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
    getRank(score) {
        const rankings = this.getRankings();
        const rank = rankings.findIndex(item => item.score === score) + 1;
        return rank <= this.maxRankings ? rank : null;
    }
    clearRankings() {
        localStorage.removeItem(this.storageKey);
    }
    isHighScore(score) {
        const rankings = this.getRankings();
        return rankings.length < this.maxRankings || score > rankings[rankings.length - 1].score;
    }
}
//# sourceMappingURL=ranking.js.map