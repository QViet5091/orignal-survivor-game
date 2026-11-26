import { Weapon } from './Weapon';

/** Kiểu 4: ném theo vòng cung (Rìu): bay lên rồi rơi xuống, xuyên nhiều quái. */
export class LobWeapon extends Weapon {
    update(dtMs: number): void {
        this.tick(dtMs / 1000);
        if (!this.ready) return;

        const { player, spawner, projectiles } = this.ctx;
        if (spawner.activeEnemies.length === 0) return; // không ném khi chưa có quái

        this.resetCooldown();
        const s = this.stats;
        for (let i = 0; i < s.count; i++) {
            const vx = (i - (s.count - 1) / 2) * 110 + (Math.random() - 0.5) * 60;
            projectiles.fire({
                texture: 'axe',
                x: player.x,
                y: player.y,
                vx,
                vy: -s.speed,
                gravity: this.def.gravity ?? 900,
                spin: 600,
                damage: this.damage,
                radius: s.radius,
                pierce: s.pierce,
                lifetime: s.lifetime,
            });
        }
    }
}