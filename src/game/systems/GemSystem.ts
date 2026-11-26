import { GameObjects, Scene } from 'phaser';
import { XpGem } from '../entities/XpGem';
import type { Player } from '../entities/Player';
import type { ProgressionSystem } from './ProgressionSystem';

const PULL_START = 200; // px/s lúc bắt đầu bị hút
const PULL_ACCEL = 1800; // px/s mỗi giây
const PULL_MAX = 750; // nhanh hơn người chơi để luôn đuổi kịp

export class GemSystem {
    private group: GameObjects.Group;

    constructor(scene: Scene) {
        // Giới hạn 600 viên cùng lúc để không phình bộ nhớ
        this.group = scene.add.group({ classType: XpGem, maxSize: 600 });
    }

    get activeCount(): number {
        return this.group.countActive(true);
    }

    drop(x: number, y: number, value: number): void {
        const gem = this.group.get(x, y, 'gem') as XpGem | null;
        if (!gem) return; // pool đầy
        gem.spawn(x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12, value);
    }

    /** Hút các viên trong bán kính nhặt về phía người chơi, và cộng XP khi chạm. */
    update(dtMs: number, player: Player, progression: ProgressionSystem): void {
        const dt = dtMs / 1000;
        const pickup2 = player.pickupRadius * player.pickupRadius;
        const collectR = player.radius + 8;
        const list = this.group.getChildren() as XpGem[];

        for (let i = 0; i < list.length; i++) {
            const gem = list[i];
            if (!gem.active) continue;

            const dx = player.x - gem.x;
            const dy = player.y - gem.y;
            const d2 = dx * dx + dy * dy;

            if (!gem.attracted && d2 <= pickup2) {
                gem.attracted = true;
                gem.pull = PULL_START;
            }
            if (!gem.attracted) continue;

            const d = Math.sqrt(d2);
            if (d <= collectR) {
                progression.addXp(gem.value);
                this.group.killAndHide(gem);
                continue;
            }
            gem.pull = Math.min(gem.pull + PULL_ACCEL * dt, PULL_MAX);
            const step = Math.min(gem.pull * dt, d);
            gem.x += (dx / d) * step;
            gem.y += (dy / d) * step;
        }
    }
}