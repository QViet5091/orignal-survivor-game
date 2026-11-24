import { GameObjects, Scene } from 'phaser';
import { Projectile } from '../../entities/Projectile';
import type { FireOptions } from '../../entities/Projectile';
import type { Enemy } from '../../entities/Enemy';
import type { CombatSystem } from '../CombatSystem';

export class ProjectilePool {
    private group: GameObjects.Group;

    constructor(scene: Scene) {
        this.group = scene.add.group({ classType: Projectile, maxSize: -1 });
    }

    fire(o: FireOptions): void {
        const p = this.group.get(o.x, o.y, o.texture) as Projectile;
        p.launch(o);
    }

    update(dtMs: number, enemies: Enemy[], combat: CombatSystem, now: number): void {
        const dt = dtMs / 1000;
        const list = this.group.getChildren() as Projectile[];
        for (let i = 0; i < list.length; i++) {
            const p = list[i];
            if (!p.active) continue;

            p.life -= dt;
            if (p.life <= 0) {
                this.group.killAndHide(p);
                continue;
            }

            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.spin !== 0) p.angle += p.spin * dt;

            for (let j = 0; j < enemies.length; j++) {
                const e = enemies[j];
                if (!e.active) continue;
                const dx = e.x - p.x;
                const dy = e.y - p.y;
                const r = e.radius + p.radius;
                if (dx * dx + dy * dy >= r * r) continue;
                if (p.hits.indexOf(e) !== -1) continue;

                p.hits.push(e);
                combat.dealDamage(e, p.damage, now);
                if (p.hits.length > p.pierce) {
                    this.group.killAndHide(p);
                    break;
                }
            }
        }
    }
}