import { RankingManager } from './ranking.js';
import { Player } from './player.js';
import { Enemy, Boss } from './enemies.js';
import { Bullet, BeamBullet, EnemyBullet } from './bullets.js';
import { PowerUp } from './powerups.js';
import { GameState, PowerUpType, WeaponType, ComboState } from './types.js';
import { GAME_CONFIG } from './utils.js';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private rankingManager: RankingManager;
    
    // 画面要素
    private titleScreen: HTMLElement;
    private rankingScreen: HTMLElement;
    private gameOverScreen: HTMLElement;
    
    // ボタン要素
    private startButton: HTMLElement;
    private rankingButton: HTMLElement;
    private backToTitleButton: HTMLElement;
    private clearRankingButton: HTMLElement;
    private saveScoreButton: HTMLElement;
    private retryButton: HTMLElement;
    private backToTitleFromGameOver: HTMLElement;
    
    // ゲーム状態
    private gameState: GameState = 'title';
    private score: number = 0;
    private lives: number = 3;
    
    // コンボシステム
    private combo: ComboState = {
        count: 0,
        lastKillTime: 0,
        multiplier: 1.0,
        displayTimer: 0
    };
    
    // ステージ管理
    private currentStage: number = 1;
    private readonly totalStages: number = GAME_CONFIG.stages.total;
    private enemiesKilled: number = 0;
    private readonly enemiesNeededForBoss: number = GAME_CONFIG.stages.enemiesNeededForBoss;
    private bossActive: boolean = false;
    private boss: Boss | null = null;
    private stageClearTimer: number = 0;
    
    // ゲームオブジェクト
    private player: Player;
    private enemies: Enemy[] = [];
    private bullets: (Bullet | BeamBullet)[] = [];
    private enemyBullets: EnemyBullet[] = [];
    private powerUps: PowerUp[] = [];
    
    // タイマー
    private enemySpawnTimer: number = 0;
    private powerUpSpawnTimer: number = 0;
    
    // 入力管理
    private keys: Record<string, boolean> = {};

    constructor() {
        // Canvas初期化
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas context not available');
        }
        this.ctx = ctx;

        this.rankingManager = new RankingManager();
        
        // DOM要素の取得
        this.titleScreen = this.getElement('titleScreen');
        this.rankingScreen = this.getElement('rankingScreen');
        this.gameOverScreen = this.getElement('gameOverScreen');
        
        this.startButton = this.getElement('startButton');
        this.rankingButton = this.getElement('rankingButton');
        this.backToTitleButton = this.getElement('backToTitleButton');
        this.clearRankingButton = this.getElement('clearRankingButton');
        this.saveScoreButton = this.getElement('saveScoreButton');
        this.retryButton = this.getElement('retryButton');
        this.backToTitleFromGameOver = this.getElement('backToTitleFromGameOver');
        
        this.player = new Player(50, 380);
        
        this.setupEventListeners();
        this.gameLoop();
    }

    private getElement(id: string): HTMLElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return element;
    }

    private setupEventListeners(): void {
        this.startButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.startGame();
        });
        
        this.rankingButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRanking();
        });
        
        this.backToTitleButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTitle();
        });
        
        this.clearRankingButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('本当にランキングをクリアしますか？')) {
                this.rankingManager.clearRankings();
                this.updateRankingDisplay();
            }
        });
        
        this.saveScoreButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveScore();
        });
        
        this.retryButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.startGame();
        });
        
        this.backToTitleFromGameOver.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTitle();
        });
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
            }
            
            if (e.code === 'Enter' && this.gameState === 'gameOver') {
                this.saveScore();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    private showTitle(): void {
        this.gameState = 'title';
        this.titleScreen.classList.remove('hidden');
        this.rankingScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    private showRanking(): void {
        this.gameState = 'ranking';
        this.titleScreen.classList.add('hidden');
        this.rankingScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.updateRankingDisplay();
    }

    private showGameOver(): void {
        this.gameState = 'gameOver';
        this.titleScreen.classList.add('hidden');
        this.rankingScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        
        const finalScoreElement = document.getElementById('finalScore');
        if (finalScoreElement) {
            finalScoreElement.textContent = `スコア: ${this.score}`;
        }
        
        const rankingMessageElement = document.getElementById('rankingMessage');
        if (rankingMessageElement) {
            if (this.rankingManager.isHighScore(this.score)) {
                rankingMessageElement.textContent = '🎉 ハイスコア達成！お名前を入力してください！';
                rankingMessageElement.style.color = '#FFD700';
            } else {
                rankingMessageElement.textContent = 'スコアを記録しますか？';
                rankingMessageElement.style.color = '#FFFFFF';
            }
        }
        
        const nameInput = document.getElementById('nameInput') as HTMLInputElement;
        if (nameInput) {
            nameInput.value = '';
            nameInput.focus();
        }
    }

    private updateRankingDisplay(): void {
        const rankings = this.rankingManager.getRankings();
        const rankingList = document.getElementById('rankingList');
        if (!rankingList) return;
        
        rankingList.innerHTML = '';
        
        if (rankings.length === 0) {
            rankingList.innerHTML = '<div style="text-align: center; color: #888; font-size: 1.2em; padding: 20px;">まだスコアが登録されていません</div>';
            return;
        }
        
        rankings.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = `ranking-item ${index < 3 ? 'top3' : ''}`;
            
            const rankEmoji = ['🥇', '🥈', '🥉'][index] || `${index + 1}位`;
            
            div.innerHTML = `
                <span class="rank-number">${rankEmoji}</span>
                <span class="rank-name">${item.name}</span>
                <span class="rank-score">${item.score.toLocaleString()}点</span>
            `;
            
            rankingList.appendChild(div);
        });
    }

    private saveScore(): void {
        const nameInput = document.getElementById('nameInput') as HTMLInputElement;
        if (!nameInput) return;
        
        const name = nameInput.value.trim() || 'Anonymous';
        const rank = this.rankingManager.saveScore(name, this.score);
        
        if (rank) {
            alert(`${rank}位にランクイン！おめでとうございます！🎉`);
        } else {
            alert('スコアを保存しました！');
        }
        
        this.showRanking();
    }

    private startGame(): void {
        this.gameState = 'playing';
        this.titleScreen.classList.add('hidden');
        this.rankingScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.score = 0;
        this.lives = 3;
        
        // コンボをリセット
        this.resetCombo();
        
        // ステージリセット
        this.currentStage = 1;
        this.enemiesKilled = 0;
        this.bossActive = false;
        this.boss = null;
        this.stageClearTimer = 0;
        
        this.player = new Player(50, 380);
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.enemySpawnTimer = 0;
        this.powerUpSpawnTimer = 0;
        this.updateUI();
        this.updateStageUI();
    }

    private endGame(): void {
        this.showGameOver();
    }

    private handleInput(): void {
        if (this.gameState !== 'playing') return;

        const player = this.player;
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            player.velocity.y = -player.speed;
        } else if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            player.velocity.y = player.speed;
        } else {
            player.velocity.y = 0;
        }
        
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            player.velocity.x = -player.speed;
        } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            player.velocity.x = player.speed;
        } else {
            player.velocity.x = 0;
        }
        
        if (this.keys['Space']) {
            const newBullets = player.fire();
            this.bullets.push(...newBullets);
        }
    }

    private spawnEnemies(): void {
        if (this.bossActive) return;
        
        this.enemySpawnTimer++;
        const spawnRate = Math.max(40, 80 - (this.currentStage * 10));
        
        if (this.enemySpawnTimer > spawnRate) {
            this.enemies.push(new Enemy(GAME_CONFIG.canvas.width, Math.random() * (GAME_CONFIG.canvas.height - 30)));
            this.enemySpawnTimer = 0;
        }
    }

    private spawnBoss(): void {
        if (!this.bossActive && this.enemiesKilled >= this.enemiesNeededForBoss) {
            this.bossActive = true;
            this.boss = new Boss(1000, 360, this.currentStage);
            this.updateStageUI();
            this.showBossUI();
        }
    }

    private spawnPowerUps(): void {
        this.powerUpSpawnTimer++;
        if (this.powerUpSpawnTimer > 400) {
            const types: PowerUpType[] = ['double', 'triple', 'shield', 'beam', 'speed', 'rapid', 'life', 'bomb'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerUps.push(new PowerUp(GAME_CONFIG.canvas.width, Math.random() * (GAME_CONFIG.canvas.height - 35), type));
            this.powerUpSpawnTimer = 0;
        }
    }

    private activatePowerUp(type: PowerUpType): void {
        switch (type) {
            case 'double':
            case 'triple':
                this.player.setWeapon(type);
                break;
            case 'shield':
                this.player.activateBuff('shield', 300);
                break;
            case 'beam':
                this.player.activateBuff('beam', 300);
                break;
            case 'speed':
                this.player.activateBuff('speed', 300);
                break;
            case 'rapid':
                this.player.activateBuff('rapid', 300);
                break;
            case 'life':
                this.lives++;
                break;
            case 'bomb':
                this.score += this.enemies.length * 50;
                this.enemies = [];
                break;
        }
    }

    private checkCollisions(): void {
        // 弾と敵の衝突
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (bullet.checkCollision(enemy)) {
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    
                    // コンボシステム適用
                    this.addCombo();
                    const baseScore = 100;
                    const earnedScore = this.calculateScore(baseScore);
                    this.score += earnedScore;
                    
                    this.enemiesKilled++;
                    this.updateUI();
                    this.updateStageUI();
                    break;
                }
            }
        }

        // 弾とボスの衝突
        if (this.boss && this.boss.active) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                if (bullet.checkCollision(this.boss)) {
                    this.bullets.splice(i, 1);
                    const defeated = this.boss.takeDamage(10);
                    
                    // ボスへのダメージでもコンボ適用（小さなスコア）
                    this.addCombo();
                    const baseDamageScore = 20;
                    const earnedScore = this.calculateScore(baseDamageScore);
                    this.score += earnedScore;
                    
                    this.updateBossHp();
                    
                    if (defeated) {
                        // ボス撃破ボーナス（コンボ倍率適用）
                        const baseBossScore = 1000 * this.currentStage;
                        const bossScore = this.calculateScore(baseBossScore);
                        this.score += bossScore;
                        this.clearStage();
                    }
                    break;
                }
            }
        }

        // プレイヤーと敵の衝突（シールドチェック）
        if (!this.player.isShielded()) {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (this.player.checkCollision(enemy)) {
                    this.enemies.splice(i, 1);
                    this.takeDamage();
                }
            }
            
            // プレイヤーと敵弾の衝突
            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                const bullet = this.enemyBullets[i];
                if (this.player.checkCollision(bullet)) {
                    this.enemyBullets.splice(i, 1);
                    this.takeDamage();
                }
            }
            
            // プレイヤーとボスの衝突
            if (this.boss && this.boss.active && this.player.checkCollision(this.boss)) {
                this.takeDamage();
            }
        }

        // プレイヤーとパワーアップの衝突
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.player.checkCollision(powerUp)) {
                this.powerUps.splice(i, 1);
                this.activatePowerUp(powerUp.type);
                this.updateUI();
                this.score += 50;
            }
        }
    }

    private takeDamage(): void {
        this.lives--;
        
        // 被弾時にコンボをリセット
        if (GAME_CONFIG.combo.breakOnDamage) {
            this.resetCombo();
        }
        
        this.updateUI();
        if (this.lives <= 0) {
            this.endGame();
        }
    }
    
    // コンボシステム関連メソッド
    private addCombo(): void {
        const currentTime = Date.now();
        this.combo.count++;
        this.combo.lastKillTime = currentTime;
        this.combo.displayTimer = GAME_CONFIG.combo.displayDuration;
        
        // コンボ数に応じてスコア倍率を計算（最大値まで）
        // 5コンボごとに倍率+0.2、最大5倍
        this.combo.multiplier = Math.min(
            1.0 + Math.floor((this.combo.count - 1) / 5) * 0.2,
            GAME_CONFIG.combo.maxMultiplier
        );
    }
    
    private resetCombo(): void {
        this.combo.count = 0;
        this.combo.multiplier = 1.0;
        this.combo.displayTimer = 0;
    }
    
    private updateCombo(): void {
        const currentTime = Date.now();
        
        // 一定時間経過でコンボリセット
        if (this.combo.count > 0 && 
            currentTime - this.combo.lastKillTime > (GAME_CONFIG.combo.timeWindow * 1000 / 60)) {
            this.resetCombo();
        }
        
        // 表示タイマーを減らす
        if (this.combo.displayTimer > 0) {
            this.combo.displayTimer--;
        }
    }
    
    private calculateScore(baseScore: number): number {
        return Math.floor(baseScore * this.combo.multiplier);
    }
    
    private renderComboEffect(): void {
        // コンボが2以上かつ表示タイマーが有効な場合のみ表示
        if (this.combo.count >= 2 && this.combo.displayTimer > 0) {
            this.ctx.save();
            
            // コンボ数に応じて色を変化
            let comboColor = '#FFD700'; // 基本は金色
            if (this.combo.count >= 50) {
                comboColor = '#FF00FF'; // 50コンボ以上はマゼンタ
            } else if (this.combo.count >= 30) {
                comboColor = '#FF4500'; // 30コンボ以上はオレンジレッド
            } else if (this.combo.count >= 20) {
                comboColor = '#FF0000'; // 20コンボ以上は赤
            } else if (this.combo.count >= 10) {
                comboColor = '#00FF00'; // 10コンボ以上は緑
            }
            
            // アニメーション効果（点滅）
            const alpha = (Math.sin(Date.now() * 0.01) + 1) / 2 * 0.5 + 0.5;
            this.ctx.globalAlpha = alpha;
            
            // コンボテキストの描画
            this.ctx.fillStyle = comboColor;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            
            const comboText = `${this.combo.count} COMBO!`;
            const multiplierText = `×${this.combo.multiplier.toFixed(1)}`;
            
            // 影付きテキスト
            this.ctx.strokeText(comboText, GAME_CONFIG.canvas.width / 2, 100);
            this.ctx.fillText(comboText, GAME_CONFIG.canvas.width / 2, 100);
            
            // 倍率表示
            this.ctx.font = 'bold 24px Arial';
            this.ctx.strokeText(multiplierText, GAME_CONFIG.canvas.width / 2, 130);
            this.ctx.fillText(multiplierText, GAME_CONFIG.canvas.width / 2, 130);
            
            this.ctx.restore();
        }
    }

    private clearStage(): void {
        this.bossActive = false;
        this.boss = null;
        this.hideBossUI();
        this.stageClearTimer = 180; // 3秒間表示
        
        if (this.currentStage >= this.totalStages) {
            this.showGameClear();
        } else {
            this.currentStage++;
            this.enemiesKilled = 0;
            this.updateStageUI();
        }
    }

    private showGameClear(): void {
        this.score += 5000; // ボーナススコア
        setTimeout(() => {
            this.endGame();
        }, 3000);
    }

    private updateUI(): void {
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const weaponElement = document.getElementById('weapon');
        const comboElement = document.getElementById('combo');
        
        if (scoreElement) scoreElement.textContent = this.score.toLocaleString();
        if (livesElement) livesElement.textContent = this.lives.toString();
        
        const weaponNames: Record<WeaponType, string> = {
            'normal': '通常弾',
            'double': 'ダブルショット',
            'triple': 'トリプルショット'
        };
        if (weaponElement) weaponElement.textContent = weaponNames[this.player.weapon];
        
        // コンボ表示の更新
        if (comboElement) {
            if (this.combo.count > 1) {
                comboElement.textContent = `${this.combo.count} COMBO! (${this.combo.multiplier.toFixed(1)}x)`;
                comboElement.classList.remove('hidden');
            } else {
                comboElement.classList.add('hidden');
            }
        }
        
        this.updateBuffDisplay();
    }

    private updateBuffDisplay(): void {
        const buffsDiv = document.getElementById('activeBuffs');
        if (!buffsDiv) return;
        
        buffsDiv.innerHTML = '';
        
        const buffNames = {
            'shield': '🛡️ シールド',
            'beam': '⚡ ビーム',
            'speed': '🚀 スピード',
            'rapid': '🔥 高速射撃'
        };
        
        for (const buffName in this.player.buffs) {
            const buff = this.player.buffs[buffName as keyof typeof buffNames];
            if (buff.active) {
                const div = document.createElement('div');
                div.className = 'buff-item';
                const seconds = Math.ceil(buff.timer / 60);
                div.textContent = `${buffNames[buffName as keyof typeof buffNames]} (${seconds}s)`;
                buffsDiv.appendChild(div);
            }
        }
    }

    private updateStageUI(): void {
        const currentStageElement = document.getElementById('currentStage');
        const stageProgressElement = document.getElementById('stageProgress');
        
        if (currentStageElement) currentStageElement.textContent = this.currentStage.toString();
        
        if (stageProgressElement) {
            if (this.bossActive) {
                stageProgressElement.textContent = 'ボス戦！';
            } else if (this.stageClearTimer > 0) {
                stageProgressElement.textContent = 'ステージクリア！';
            } else {
                const remaining = this.enemiesNeededForBoss - this.enemiesKilled;
                stageProgressElement.textContent = `ボスまで残り${remaining}体`;
            }
        }
    }

    private showBossUI(): void {
        const bossNameElement = document.getElementById('bossName');
        const bossHpBarElement = document.getElementById('bossHpBar');
        
        if (this.boss && bossNameElement && bossHpBarElement) {
            bossNameElement.textContent = this.boss.name;
            bossNameElement.classList.remove('hidden');
            bossHpBarElement.classList.remove('hidden');
            this.updateBossHp();
        }
    }

    private hideBossUI(): void {
        const bossNameElement = document.getElementById('bossName');
        const bossHpBarElement = document.getElementById('bossHpBar');
        
        if (bossNameElement) bossNameElement.classList.add('hidden');
        if (bossHpBarElement) bossHpBarElement.classList.add('hidden');
    }

    private updateBossHp(): void {
        const bossHpFillElement = document.getElementById('bossHpFill');
        if (this.boss && bossHpFillElement) {
            const hpPercent = (this.boss.hp / this.boss.maxHp) * 100;
            bossHpFillElement.style.width = `${hpPercent}%`;
        }
    }

    private update(): void {
        if (this.gameState !== 'playing') return;

        this.handleInput();
        this.spawnEnemies();
        this.spawnBoss();
        this.spawnPowerUps();
        this.updateCombo();

        // ステージクリアタイマー
        if (this.stageClearTimer > 0) {
            this.stageClearTimer--;
            if (this.stageClearTimer === 0) {
                this.updateStageUI();
            }
        }

        // オブジェクトの更新
        this.player.update();
        
        this.enemies = this.enemies.filter(enemy => {
            enemy.update();
            return enemy.active;
        });
        
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.active;
        });
        
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return bullet.active;
        });
        
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            return powerUp.active;
        });

        // ボスの更新と攻撃
        if (this.boss && this.boss.active) {
            const newBullets = this.boss.updateAttack();
            this.enemyBullets.push(...newBullets);
            this.boss.update();
        }

        this.checkCollisions();
    }

    private render(): void {
        // 背景をクリア
        this.ctx.clearRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);

        if (this.gameState === 'playing') {
            // 雲の描画
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 8; i++) {
                const x = (Date.now() * 0.05 + i * 200) % (GAME_CONFIG.canvas.width + 100) - 100;
                const y = 50 + i * 100;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 30, 0, Math.PI * 2);
                this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
                this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // ゲームオブジェクトの描画
            this.player.render(this.ctx);
            this.enemies.forEach(enemy => enemy.render(this.ctx));
            this.bullets.forEach(bullet => bullet.render(this.ctx));
            this.enemyBullets.forEach(bullet => bullet.render(this.ctx));
            this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
            
            // ボスの描画
            if (this.boss && this.boss.active) {
                this.boss.render(this.ctx);
            }
            
            // コンボエフェクトの描画
            this.renderComboEffect();
            
            // ステージクリア演出
            if (this.stageClearTimer > 0) {
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
                
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = 'bold 48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`ステージ ${this.currentStage - 1} クリア！`, GAME_CONFIG.canvas.width / 2, 350);
                
                if (this.currentStage <= this.totalStages) {
                    this.ctx.font = 'bold 32px Arial';
                    this.ctx.fillText(`ステージ ${this.currentStage} 開始`, GAME_CONFIG.canvas.width / 2, 420);
                } else {
                    this.ctx.fillText('全ステージクリア！おめでとう！', GAME_CONFIG.canvas.width / 2, 420);
                }
                
                this.ctx.restore();
            }
        }
    }

    private gameLoop(): void {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ゲーム開始
window.addEventListener('load', () => {
    new Game();
}); 