import { GameObjects, Scene } from 'phaser';
import { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import { ENEMIES } from '../data/enemies';
import type { EnemyId } from '../data/enemies';
import { SPAWN } from '../data/spawn';

export class EnemySpawner {
    private scene: Scene;
    private group: GameObjects.Group;
    private elapsedMs = 0;
    private acc = 0;
    private active: Enemy[] = []; // dùng lại mỗi frame để tránh cấp phát mảng mới

    constructor(scene: Scene) {
        this.scene = scene;
        // Object pool: quái chết được killAndHide rồi tái sử dụng bằng get()
        this.group = scene.add.group({ classType: Enemy, maxSize: -1 });
    }

    get activeCount(): number {
        return this.group.countActive(true);
    }

    /** Danh sách quái đang hoạt động, được dựng lại ở đầu mỗi lần update(). Phần tử có thể chết giữa chừng, nên luôn kiểm tra e.active. */
    get activeEnemies(): Enemy[] {
        return this.active;
    }

    /** Đưa quái về pool (ẩn và đánh dấu không hoạt động). */
    kill(enemy: Enemy): void {
        this.group.killAndHide(enemy);
    }

    update(dtMs: number, player: Player, now: number): void {
        this.elapsedMs += dtMs;
        this.spawnTick(dtMs, player);

        // Gom các quái đang hoạt động
        const list = this.group.getChildren() as Enemy[];
        const act = this.active;
        act.length = 0;
        for (let i = 0; i < list.length; i++) {
            if (list[i].active) act.push(list[i]);
        }

        const dtSec = dtMs / 1000;
        for (let i = 0; i < act.length; i++) {
            act[i].chase(player.x, player.y, dtSec);
            act[i].tickEffects(now);
        }

        this.separate(act);
        this.contactPlayer(act, player, now);
    }

    private spawnTick(dtMs: number, player: Player): void {
        const rate = Math.min(
            SPAWN.maxRate,
            SPAWN.baseRate + SPAWN.rateGrowth * (this.elapsedMs / 1000)
        );
        this.acc += rate * (dtMs / 1000);
        let alive = this.group.countActive(true);
        while (this.acc >= 1) {
            this.acc -= 1;
            if (alive < SPAWN.maxAlive) {
                this.spawnOne(player);
                alive++;
            }
        }
    }

    private spawnOne(player: Player): void {
        // Sinh quái trên vòng tròn ngay ngoài màn hình, quanh người chơi
        const cam = this.scene.cameras.main;
        const radius = Math.hypot(cam.width, cam.height) / 2 / cam.zoom + SPAWN.ringMargin;
        const angle = Math.random() * Math.PI * 2;
        const x = player.x + Math.cos(angle) * radius;
        const y = player.y + Math.sin(angle) * radius;

        const def = ENEMIES[this.pickEnemyId()];
        const enemy = this.group.get(x, y, `enemy_${def.id}`) as Enemy;
        enemy.spawn(def, x, y);
    }

    private pickEnemyId(): EnemyId {
        const sec = this.elapsedMs / 1000;
        const table = SPAWN.table;
        let total = 0;
        for (let i = 0; i < table.length; i++) {
            if (table[i].fromSec <= sec) total += table[i].weight;
        }
        let roll = Math.random() * total;
        for (let i = 0; i < table.length; i++) {
            if (table[i].fromSec > sec) continue;
            roll -= table[i].weight;
            if (roll <= 0) return table[i].id;
        }
        return table[0].id;
    }

    /**
     * Đẩy các quái đang chồng lên nhau ra xa. Duyệt mọi cặp (O(n^2)) nên đủ dùng
     * cho vài trăm quái; Giai đoạn 9 sẽ thay bằng spatial hash.
     */
    private separate(act: Enemy[]): void {
        const n = act.length;
        for (let i = 0; i < n; i++) {
            const a = act[i];
            for (let j = i + 1; j < n; j++) {
                const b = act[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const min = a.radius + b.radius;
                const d2 = dx * dx + dy * dy;
                if (d2 >= min * min) continue;

                const d = Math.sqrt(d2);
                const nx = d < 0.001 ? 1 : dx / d;
                const ny = d < 0.001 ? 0 : dy / d;
                const push = (min - d) * 0.5 * SPAWN.separation;
                a.x -= nx * push;
                a.y -= ny * push;
                b.x += nx * push;
                b.y += ny * push;
            }
        }
    }

    private contactPlayer(act: Enemy[], player: Player, now: number): void {
        for (let i = 0; i < act.length; i++) {
            const e = act[i];
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const min = e.radius + player.radius;
            if (dx * dx + dy * dy < min * min) {
                player.takeDamage(e.damage, now);
            }
        }
    }
}