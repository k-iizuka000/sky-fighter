import { RankingManager } from './ranking.js';
import { Player } from './player.js';
import { Enemy, Boss } from './enemies.js';
import { Bullet, BeamBullet, EnemyBullet } from './bullets.js';
import { PowerUp } from './powerups.js';
import { ParticleSystem } from './particles.js';
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
    private stageClearScreen: HTMLElement;
    
    // ボタン要素
    private startButton: HTMLElement;
    private rankingButton: HTMLElement;
    private backToTitleButton: HTMLElement;
    private clearRankingButton: HTMLElement;
    private saveScoreButton: HTMLElement;
    private retryButton: HTMLElement;
    private backToTitleFromGameOver: HTMLElement;
    private nextStageButton: HTMLElement;
    
    // ゲーム状態
    private gameState: GameState = 'title';
    private score: number = 0;
    private lives: number = 3;
    private megaBombs: number = 0;
    
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
    
    // ゲームオブジェクト
    private player: Player;
    private enemies: Enemy[] = [];
    private bullets: (Bullet | BeamBullet)[] = [];
    private enemyBullets: EnemyBullet[] = [];
    private powerUps: PowerUp[] = [];
    private particleSystem: ParticleSystem;
    
    // タイマー
    private enemySpawnTimer: number = 0;
    private powerUpSpawnTimer: number = 0;
    private megaBombEffect: { active: boolean; timer: number } = { active: false, timer: 0 };
    
    // 入力管理
    private keys: Record<string, boolean> = {};
    
    // モバイル対応
    private isMobile: boolean = false;
    private touchControls: {
        up: boolean;
        down: boolean;
        left: boolean;
        right: boolean;
        shoot: boolean;
        bomb: boolean;
    } = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
        bomb: false
    };

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

        // モバイル判定
        this.isMobile = this.detectMobile();
        console.log('📱 Mobile detection:', this.isMobile);
        console.log('📱 User agent:', navigator.userAgent);
        console.log('📱 Max touch points:', navigator.maxTouchPoints);
        this.setupCanvasResize();

        this.rankingManager = new RankingManager();
        this.particleSystem = new ParticleSystem();
        
        // DOM要素の取得
        this.titleScreen = this.getElement('titleScreen');
        this.rankingScreen = this.getElement('rankingScreen');
        this.gameOverScreen = this.getElement('gameOverScreen');
        this.stageClearScreen = this.getElement('stageClearScreen');
        console.log('✅ stageClearScreen要素が正常に取得されました:', this.stageClearScreen);
        
        this.startButton = this.getElement('startButton');
        this.rankingButton = this.getElement('rankingButton');
        this.backToTitleButton = this.getElement('backToTitleButton');
        this.clearRankingButton = this.getElement('clearRankingButton');
        this.saveScoreButton = this.getElement('saveScoreButton');
        this.retryButton = this.getElement('retryButton');
        this.backToTitleFromGameOver = this.getElement('backToTitleFromGameOver');
        this.nextStageButton = this.getElement('nextStageButton');
        console.log('✅ nextStageButton要素が正常に取得されました:', this.nextStageButton);
        
        this.player = new Player(50, 380);
        
        this.setupEventListeners();
        if (this.isMobile) {
            this.setupMobileControls();
        }
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
        // メニューボタンにクリック＋タッチイベントを設定
        this.addButtonEvents(this.startButton, () => {
            this.startGame();
        });
        
        this.addButtonEvents(this.rankingButton, () => {
            this.showRanking();
        });
        
        this.addButtonEvents(this.backToTitleButton, () => {
            this.showTitle();
        });
        
        this.addButtonEvents(this.clearRankingButton, () => {
            if (confirm('本当にランキングをクリアしますか？')) {
                this.rankingManager.clearRankings();
                this.updateRankingDisplay();
            }
        });
        
        this.addButtonEvents(this.saveScoreButton, () => {
            this.saveScore();
        });
        
        this.addButtonEvents(this.retryButton, () => {
            this.startGame();
        });
        
        this.addButtonEvents(this.backToTitleFromGameOver, () => {
            this.showTitle();
        });
        
        this.addButtonEvents(this.nextStageButton, () => {
            this.proceedToNextStage();
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
        this.stageClearScreen.classList.add('hidden');
    }

    private showRanking(): void {
        this.gameState = 'ranking';
        this.titleScreen.classList.add('hidden');
        this.rankingScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.stageClearScreen.classList.add('hidden');
        this.updateRankingDisplay();
    }

    private showGameOver(): void {
        this.gameState = 'gameOver';
        this.titleScreen.classList.add('hidden');
        this.rankingScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        this.stageClearScreen.classList.add('hidden');
        
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
        this.stageClearScreen.classList.add('hidden');
        this.score = 0;
        this.lives = 3;
        this.megaBombs = 0;
        
        // コンボをリセット
        this.resetCombo();
        
        // ステージリセット
        this.currentStage = 1;
        this.enemiesKilled = 0;
        this.bossActive = false;
        this.boss = null;
        
        this.player = new Player(50, 380);
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.enemySpawnTimer = 0;
        this.powerUpSpawnTimer = 0;
        this.megaBombEffect = { active: false, timer: 0 };
        
        // パーティクルをクリア
        this.particleSystem.clear();
        
        this.updateUI();
        this.updateStageUI();
    }

    private endGame(): void {
        this.showGameOver();
    }

    private handleInput(): void {
        if (this.gameState !== 'playing') return;

        const player = this.player;
        
        // キーボード + モバイル入力の統合
        const upPressed = this.keys['KeyW'] || this.keys['ArrowUp'] || (this.isMobile && this.touchControls.up);
        const downPressed = this.keys['KeyS'] || this.keys['ArrowDown'] || (this.isMobile && this.touchControls.down);
        const leftPressed = this.keys['KeyA'] || this.keys['ArrowLeft'] || (this.isMobile && this.touchControls.left);
        const rightPressed = this.keys['KeyD'] || this.keys['ArrowRight'] || (this.isMobile && this.touchControls.right);
        
        if (upPressed) {
            player.velocity.y = -player.speed;
        } else if (downPressed) {
            player.velocity.y = player.speed;
        } else {
            player.velocity.y = 0;
        }
        
        if (leftPressed) {
            player.velocity.x = -player.speed;
        } else if (rightPressed) {
            player.velocity.x = player.speed;
        } else {
            player.velocity.x = 0;
        }
        
        if (this.keys['Space'] || (this.isMobile && this.touchControls.shoot)) {
            const newBullets = player.fire();
            this.bullets.push(...newBullets);
        }
        
        if (this.keys['KeyX'] || (this.isMobile && this.touchControls.bomb)) {
            this.activateMegaBomb();
            this.keys['KeyX'] = false; // 連続発動を防ぐ
            if (this.isMobile) {
                this.touchControls.bomb = false; // 連続発動を防ぐ
            }
        }
    }

    private spawnEnemies(): void {
        if (this.bossActive) return;
        
        this.enemySpawnTimer++;
        const spawnRate = Math.max(40, 80 - (this.currentStage * 10));
        
        if (this.enemySpawnTimer > spawnRate) {
            // ステージに応じた敵を生成
            this.enemies.push(new Enemy(
                GAME_CONFIG.canvas.width, 
                Math.random() * (GAME_CONFIG.canvas.height - 100) + 50,
                this.currentStage
            ));
            this.enemySpawnTimer = 0;
        }
    }

    private spawnBoss(): void {
        if (!this.bossActive && this.enemiesKilled >= this.enemiesNeededForBoss) {
            this.bossActive = true;
            
            // ステージごとの固定ボスを生成
            this.boss = new Boss(1000, 360, this.currentStage);
            
            this.updateStageUI();
            this.showBossUI();
        }
    }

    private spawnPowerUps(): void {
        this.powerUpSpawnTimer++;
        if (this.powerUpSpawnTimer > 400) {
            const types: PowerUpType[] = ['double', 'triple', 'shield', 'beam', 'speed', 'rapid', 'life', 'bomb', 'megabomb'];
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
                // 敵のタイプに応じたスコア計算
                let bombScore = 0;
                this.enemies.forEach(enemy => {
                    this.particleSystem.createExplosion(enemy.x, enemy.y);
                    bombScore += enemy.score;
                });
                this.score += bombScore;
                this.enemies = [];
                break;
            case 'megabomb':
                this.megaBombs++;
                break;
        }
    }

    private activateMegaBomb(): void {
        if (this.megaBombs <= 0 || this.megaBombEffect.active) return;
        
        this.megaBombs--;
        this.megaBombEffect.active = true;
        this.megaBombEffect.timer = 180; // 3秒間のエフェクト (60fps基準)
        
        // 全ての敵を破壊してスコア獲得
        const totalEnemies = this.enemies.length;
        if (totalEnemies > 0) {
            let totalScore = 0;
            
            // 各敵に爆発エフェクトとスコア計算
            this.enemies.forEach(enemy => {
                this.particleSystem.createExplosion(enemy.x, enemy.y, 1.5);
                
                // 敵のタイプに応じたスコア（メガボム倍率適用）
                this.addCombo();
                const baseScore = enemy.score * 2; // メガボムは2倍スコア
                const earnedScore = this.calculateScore(baseScore);
                totalScore += earnedScore;
            });
            
            this.score += totalScore;
            this.enemies = [];
        }
        
        // ボスがいる場合は大ダメージ
        if (this.boss && this.boss.active) {
            // ボスにヒットエフェクト
            this.particleSystem.createHitEffect(this.boss.x, this.boss.y);
            this.particleSystem.createEffect(this.boss.x, this.boss.y, 'fire', 2.0);
            
            const defeated = this.boss.takeDamage(100); // 大ダメージ
            
            // ボスへの大ダメージもコンボ適用
            for (let i = 0; i < 10; i++) {
                this.addCombo();
            }
            
            const baseDamageScore = 500;
            const earnedScore = this.calculateScore(baseDamageScore);
            this.score += earnedScore;
            
            this.updateBossHp();
            
            if (defeated) {
                // ボス爆発エフェクト
                this.particleSystem.createBossExplosion(this.boss.x, this.boss.y);
                
                const baseBossScore = 1000 * this.currentStage;
                const bossScore = this.calculateScore(baseBossScore);
                this.score += bossScore;
                this.clearStage();
            }
        }
        
        // 敵弾も全て消去
        this.enemyBullets = [];
        
        this.updateUI();
    }

    private checkCollisions(): void {
        // 弾と敵の衝突
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (bullet.checkCollision(enemy)) {
                    this.bullets.splice(i, 1);
                    
                    // 敵にダメージを与える
                    const defeated = enemy.takeDamage(1);
                    
                    if (defeated) {
                        // パーティクルエフェクト（敵爆発）
                        this.particleSystem.createExplosion(enemy.x, enemy.y);
                        
                        // 敵のタイプに応じたスコア
                        this.addCombo();
                        const baseScore = enemy.score;
                        const earnedScore = this.calculateScore(baseScore);
                        this.score += earnedScore;
                        
                        this.enemies.splice(j, 1);
                        this.enemiesKilled++;
                        this.updateUI();
                        this.updateStageUI();
                    } else {
                        // ダメージヒットエフェクト
                        this.particleSystem.createHitEffect(bullet.x, bullet.y);
                    }
                    break;
                }
            }
        }

        // 弾とボスの衝突
        if (this.boss && this.boss.active) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                if (bullet.checkCollision(this.boss)) {
                    // パーティクルエフェクト（ボスヒット）
                    this.particleSystem.createHitEffect(bullet.x, bullet.y);
                    
                    this.bullets.splice(i, 1);
                    const defeated = this.boss.takeDamage(10);
                    
                    // ボスへのダメージでもコンボ適用（小さなスコア）
                    this.addCombo();
                    const baseDamageScore = 20;
                    const earnedScore = this.calculateScore(baseDamageScore);
                    this.score += earnedScore;
                    
                    this.updateBossHp();
                    
                    if (defeated) {
                        // パーティクルエフェクト（ボス爆発）
                        this.particleSystem.createBossExplosion(this.boss.x, this.boss.y);
                        
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
                // パーティクルエフェクト（パワーアップ取得）
                this.particleSystem.createPowerUpEffect(powerUp.x, powerUp.y);
                
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

    private renderMegaBombEffect(): void {
        if (!this.megaBombEffect.active) return;
        
        this.ctx.save();
        
        // エフェクトの進行度（1.0から0.0へ）
        const progress = this.megaBombEffect.timer / 180;
        
        // 画面全体を白く光らせる
        const flashAlpha = Math.max(0, progress - 0.7) / 0.3; // 最初の30%で急激に光る
        if (flashAlpha > 0) {
            this.ctx.globalAlpha = flashAlpha * 0.8;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
        }
        
        // 衝撃波エフェクト
        const time = (1 - progress) * 500; // 時間経過
        const centerX = GAME_CONFIG.canvas.width / 2;
        const centerY = GAME_CONFIG.canvas.height / 2;
        
        // 複数の同心円で衝撃波を表現
        for (let i = 0; i < 3; i++) {
            const radius = time + i * 100;
            if (radius > 0 && radius < 1000) {
                this.ctx.globalAlpha = (1 - radius / 1000) * 0.3;
                this.ctx.strokeStyle = '#FF0000';
                this.ctx.lineWidth = 5;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        // パーティクルエフェクト
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = time * 2;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            if (x >= 0 && x <= GAME_CONFIG.canvas.width && y >= 0 && y <= GAME_CONFIG.canvas.height) {
                this.ctx.globalAlpha = Math.max(0, 1 - distance / 500);
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // メガボムテキスト
        if (progress > 0.5) {
            this.ctx.globalAlpha = (progress - 0.5) / 0.5;
            this.ctx.fillStyle = '#FF0000';
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 3;
            this.ctx.font = 'bold 64px Arial';
            this.ctx.textAlign = 'center';
            
            const text = 'MEGA BOMB!';
            this.ctx.strokeText(text, centerX, centerY - 50);
            this.ctx.fillText(text, centerX, centerY - 50);
        }
        
        this.ctx.restore();
    }

    private clearStage(): void {
        console.log('🎯 clearStage() が呼び出されました！');
        this.bossActive = false;
        this.boss = null;
        this.hideBossUI();
        
        if (this.currentStage >= this.totalStages) {
            console.log('🎉 全ステージクリア - showGameClear()を呼び出し');
            this.showGameClear();
        } else {
            console.log('🌟 ステージクリア - showStageClear()を呼び出し');
            this.showStageClear();
        }
    }

    private showStageClear(): void {
        console.log('📺 showStageClear() が呼び出されました！');
        console.log('🎮 ゲーム状態をstageClearに変更');
        this.gameState = 'stageClear';
        console.log('👁️ ステージクリア画面を表示');
        this.stageClearScreen.classList.remove('hidden');
        
        // デバッグ: 画面要素のスタイル確認
        console.log('🔍 stageClearScreen.classList:', this.stageClearScreen.classList.toString());
        console.log('🔍 stageClearScreen.style.display:', window.getComputedStyle(this.stageClearScreen).display);
        console.log('🔍 stageClearScreen.style.visibility:', window.getComputedStyle(this.stageClearScreen).visibility);
        console.log('🔍 stageClearScreen.style.zIndex:', window.getComputedStyle(this.stageClearScreen).zIndex);
        
        // ステージクリアボーナスの計算
        const stageBonus = this.currentStage * 500;
        this.score += stageBonus;
        
        // UI要素の更新
        const clearedStageElement = document.getElementById('clearedStage');
        const stageClearBonusElement = document.getElementById('stageClearBonus');
        const nextStageNumberElement = document.getElementById('nextStageNumber');
        const nextBossNameElement = document.getElementById('nextBossName');
        const nextStageInfoElement = document.getElementById('nextStageInfo');
        
        if (clearedStageElement) clearedStageElement.textContent = this.currentStage.toString();
        if (stageClearBonusElement) stageClearBonusElement.textContent = stageBonus.toLocaleString();
        
        // 次のステージ情報
        const nextStage = this.currentStage + 1;
        const nextBossConfig = GAME_CONFIG.stages.bosses.find(boss => boss.stage === nextStage);
        
        if (nextStageNumberElement) nextStageNumberElement.textContent = nextStage.toString();
        if (nextBossNameElement && nextBossConfig) {
            nextBossNameElement.textContent = nextBossConfig.name;
        }
        
        // 全ステージクリア時の処理
        const isGameComplete = this.currentStage >= this.totalStages;
        
        if (nextStageInfoElement) {
            if (isGameComplete) {
                nextStageInfoElement.style.display = 'none';
            } else {
                nextStageInfoElement.style.display = 'block';
            }
        }
        
        // ボタンのテキストを変更
        if (isGameComplete) {
            this.nextStageButton.textContent = '🎉 ゲーム終了';
            // ステージクリア画面のタイトルも変更
            const titleElement = this.stageClearScreen.querySelector('h1');
            if (titleElement) {
                titleElement.textContent = '🎉 全ステージクリア！ 🎉';
            }
        } else {
            this.nextStageButton.textContent = '🚀 次のステージへ';
            const titleElement = this.stageClearScreen.querySelector('h1');
            if (titleElement) {
                titleElement.textContent = '🌟 ステージクリア！ 🌟';
            }
        }
        
        this.updateUI();
    }

    private proceedToNextStage(): void {
        this.stageClearScreen.classList.add('hidden');
        
        // 全ステージクリア時はゲーム終了
        if (this.currentStage >= this.totalStages) {
            this.endGame();
            return;
        }
        
        // 次のステージへ進む
        this.gameState = 'playing';
        this.currentStage++;
        this.enemiesKilled = 0;
        this.updateStageUI();
    }



    private showGameClear(): void {
        this.score += 5000; // ボーナススコア
        this.showStageClear(); // ステージクリア画面を表示（全ステージクリア版）
    }

    private updateUI(): void {
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const weaponElement = document.getElementById('weapon');
        const megaBombsElement = document.getElementById('megaBombs');
        const comboElement = document.getElementById('combo');
        
        if (scoreElement) scoreElement.textContent = this.score.toLocaleString();
        if (livesElement) livesElement.textContent = this.lives.toString();
        if (megaBombsElement) megaBombsElement.textContent = this.megaBombs.toString();
        
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



        // メガボムエフェクトの更新
        if (this.megaBombEffect.active) {
            this.megaBombEffect.timer--;
            if (this.megaBombEffect.timer <= 0) {
                this.megaBombEffect.active = false;
            }
        }

        // オブジェクトの更新
        this.player.update();
        
        this.enemies = this.enemies.filter(enemy => {
            enemy.update();
            
            // 敵の反撃処理
            const returnFire = enemy.createReturnFire();
            if (returnFire) {
                this.enemyBullets.push(returnFire);
            }
            
            return enemy.active;
        });
        
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            // 弾丸のトレイルエフェクト
            this.particleSystem.createBulletTrail(bullet.x, bullet.y);
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

        // パーティクルシステムの更新
        this.particleSystem.update();

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
            
            // パーティクルエフェクトの描画
            this.particleSystem.render(this.ctx);
            
            // コンボエフェクトの描画
            this.renderComboEffect();
            
            // メガボムエフェクトの描画
            this.renderMegaBombEffect();
            

        }
    }

    private gameLoop(): void {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    // メニューボタンにクリック＋タッチイベントを追加するヘルパーメソッド
    private addButtonEvents(button: HTMLElement, callback: () => void): void {
        // clickイベント
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🖱️ Button clicked:', button.id || button.textContent);
            callback();
        });
        
        // タッチイベント（モバイル対応）
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('👆 Touch start:', button.id || button.textContent);
            // ボタンが押されたことを視覚的に示す
            button.style.transform = 'scale(0.95)';
            button.style.opacity = '0.8';
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            console.log('👆 Touch end:', button.id || button.textContent);
            // ボタンの押下状態を解除
            button.style.transform = 'scale(1)';
            button.style.opacity = '1';
            callback();
        });
        
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            console.log('👆 Touch cancel:', button.id || button.textContent);
            // ボタンの押下状態を解除
            button.style.transform = 'scale(1)';
            button.style.opacity = '1';
        });
    }

    // モバイル対応メソッド
    private detectMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (!!navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }

    private setupCanvasResize(): void {
        const resizeCanvas = () => {
            if (this.isMobile) {
                const container = document.getElementById('gameContainer');
                if (container) {
                    const rect = container.getBoundingClientRect();
                    this.canvas.style.width = rect.width + 'px';
                    this.canvas.style.height = rect.height + 'px';
                }
            }
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 100);
        });
        
        // 初回実行
        if (this.isMobile) {
            setTimeout(resizeCanvas, 100);
        }
    }

    private setupMobileControls(): void {
        // 方向パッド
        const dpadUp = document.getElementById('dpad-up');
        const dpadDown = document.getElementById('dpad-down');
        const dpadLeft = document.getElementById('dpad-left');
        const dpadRight = document.getElementById('dpad-right');
        
        // アクションボタン
        const shootButton = document.getElementById('shootButton');
        const bombButton = document.getElementById('bombButton');

        // タッチイベントのヘルパー関数
        const addTouchEvents = (element: HTMLElement | null, onStart: () => void, onEnd: () => void) => {
            if (!element) return;
            
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                onStart();
            });
            
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                onEnd();
            });
            
            element.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                onEnd();
            });
        };

        // 方向パッドのイベント設定
        addTouchEvents(dpadUp, 
            () => this.touchControls.up = true, 
            () => this.touchControls.up = false
        );
        
        addTouchEvents(dpadDown, 
            () => this.touchControls.down = true, 
            () => this.touchControls.down = false
        );
        
        addTouchEvents(dpadLeft, 
            () => this.touchControls.left = true, 
            () => this.touchControls.left = false
        );
        
        addTouchEvents(dpadRight, 
            () => this.touchControls.right = true, 
            () => this.touchControls.right = false
        );

        // アクションボタンのイベント設定
        addTouchEvents(shootButton, 
            () => this.touchControls.shoot = true, 
            () => this.touchControls.shoot = false
        );
        
        addTouchEvents(bombButton, 
            () => this.touchControls.bomb = true, 
            () => this.touchControls.bomb = false
        );

        // デフォルトのタッチ動作を無効化
        document.addEventListener('touchstart', (e) => {
            if (e.target && (e.target as Element).closest('#mobileControls')) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (e.target && (e.target as Element).closest('#mobileControls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// ゲーム開始
window.addEventListener('load', () => {
    new Game();
}); 