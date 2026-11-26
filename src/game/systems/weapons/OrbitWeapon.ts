import type { GameObjects } from 'phaser';
import { Weapon } from './Weapon';
import type { WeaponContext } from './Weapon';
import type { WeaponDef } from '../../data/weapons';
import type { Enemy } from '../../entities/Enemy';

/** Kiểu 2: các lưỡi quay quanh người (Lưỡi quay). */
export class OrbitWeapon extends Weapon {
    private blades: GameObjects.Sprite[] = [];
    private nextHit: Map<Enemy, number>[] = []; // mỗi lưỡi có thời điểm chém kế tiếp riêng cho từng quái
    private angle = 0; // radian

    constructor(ctx: WeaponContext, def: WeaponDef) {
        super(ctx, def);
        this.syncBlades();
    }

    protected onLevelUp(): void {
        this.syncBlades();
    }

    private syncBlades(): void {
        while (this.blades.length < this.stats.count) {
            const blade = this.ctx.scene.add.sprite(0, 0, 'blade').setDepth(8);
            this.blades.push(blade);
            this.nextHit.push(new Map());
        }
    }

    update(dtMs: number, now: number): void {
        const { player, spawner, combat } = this.ctx;
        const s = this.stats;
        const n = s.count;
        const orbitR = this.def.orbitRadius ?? 70;
        const enemies = spawner.activeEnemies;

        this.angle += ((s.speed * Math.PI) / 180) * (dtMs / 1000);

        for (let i = 0; i < n; i++) {
            const a = this.angle + (i * Math.PI * 2) / n;
            const blade = this.blades[i];
            blade.setPosition(player.x + Math.cos(a) * orbitR, player.y + Math.sin(a) * orbitR);
            blade.setRotation(a + Math.PI / 2);

            const hitTimes = this.nextHit[i];
            for (let j = 0; j < enemies.length; j++) {
                const e = enemies[j];
                if (!e.active) continue;
                const dx = e.x - blade.x;
                const dy = e.y - blade.y;
                const r = e.radius + s.radius;
                if (dx * dx + dy * dy >= r * r) continue;

                if (now >= (hitTimes.get(e) ?? 0)) {
                    hitTimes.set(e, now + s.cooldown * player.cooldownMult * 1000);
                    combat.dealDamage(e, this.damage, now);
                }
            }
        }
    }

    destroy(): void {
        for (const b of this.blades) b.destroy();
        this.blades.length = 0;
    }
}