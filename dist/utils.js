export class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}
export class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
    }
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
    getBounds() {
        return {
            left: this.position.x,
            right: this.position.x + this.width,
            top: this.position.y,
            bottom: this.position.y + this.height
        };
    }
    checkCollision(other) {
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
    mobile: {
        speedMultiplier: 2.0 // モバイルデバイスでのゲーム速度倍率
    },
    stages: {
        total: 3,
        enemiesNeededForBoss: 15,
        bosses: [
            {
                stage: 1,
                name: "🚁 アーマードヘリ",
                emoji: "🚁",
                description: "重装甲のヘリコプター型ボス",
                hp: 150,
                color: '#8B4513',
                fireRate: 60,
                attackPattern: 'single',
                movePattern: 'vertical'
            },
            {
                stage: 2,
                name: "🛸 エイリアンクルーザー",
                emoji: "🛸",
                description: "3方向攻撃の円盤型ボス",
                hp: 200,
                color: '#800080',
                fireRate: 40,
                attackPattern: 'triple',
                movePattern: 'circle'
            },
            {
                stage: 3,
                name: "🐲 メカドラゴン",
                emoji: "🐲",
                description: "5方向拡散攻撃の龍型ボス",
                hp: 250,
                color: '#B22222',
                fireRate: 30,
                attackPattern: 'spread',
                movePattern: 'complex'
            }
        ]
    },
    ranking: {
        maxEntries: 10
    },
    combo: {
        timeWindow: 180, // 3秒（60fps基準）でコンボが途切れる
        maxMultiplier: 5.0, // 最大5倍のスコア倍率
        displayDuration: 120, // 2秒間コンボ表示
        breakOnDamage: true // 被弾時にコンボリセット
    },
    enemies: {
        stage1: {
            type: 'basic',
            name: '🛩️ 偵察機',
            emoji: '🛩️',
            hp: 1,
            speed: { min: 1, max: 2 },
            size: { width: 40, height: 30 },
            color: '#E74C3C',
            score: 100,
            movePattern: 'straight'
        },
        stage2: {
            type: 'fighter',
            name: '🚁 戦闘ヘリ',
            emoji: '🚁',
            hp: 2,
            speed: { min: 0.5, max: 1.5 },
            size: { width: 45, height: 35 },
            color: '#FF6B35',
            score: 150,
            movePattern: 'wave',
            special: {
                shootsBack: true
            }
        },
        stage3: {
            type: 'bomber',
            name: '💣 重爆撃機',
            emoji: '💣',
            hp: 3,
            speed: { min: 0.8, max: 1.2 },
            size: { width: 60, height: 40 },
            color: '#8B4513',
            score: 200,
            movePattern: 'zigzag',
            special: {
                toughArmor: true
            }
        }
    }
};
//# sourceMappingURL=utils.js.map