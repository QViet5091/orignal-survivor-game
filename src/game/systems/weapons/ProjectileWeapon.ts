import { Weapon } from './Weapon';
import { nearestEnemy } from './targeting';

const SPREAD = 0.18; // góc lệch (radian) giữa các viên khi bắn nhiều viên

/** Kiểu 1: bắn về quái gần nhất (Đạn phép). */
export class ProjectileWeapon extends Weapon {
    update(dtMs: number): void {
        this.tick(dtMs / 1000);
        if (!this.ready) return;

        const { player, spawner, projectiles } = this.ctx;
        const target = nearestEnemy(spawner.activeEnemies, player.x, player.y, this.def.range ?? 450);
        if (!target) return; // chưa có mục tiêu: giữ nguyên trạng thái sẵn sàng

        this.resetCooldown();
        const s = this.stats;
        const base = Math.atan2(target.y - player.y, target.x - player.x);
        for (let i = 0; i < s.count; i++) {
            const a = base + (i - (s.count - 1) / 2) * SPREAD;
            projectiles.fire({
                texture: 'bolt',
                x: player.x,
                y: player.y,
                vx: Math.cos(a) * s.speed,
                vy: Math.sin(a) * s.speed,
                damage: this.damage,
                radius: s.radius,
                pierce: s.pierce,
                lifetime: s.lifetime,
            });
        }
    }
}