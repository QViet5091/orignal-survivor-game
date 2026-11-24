import type { GameObjects } from 'phaser';
import { Weapon } from './Weapon';
import type { WeaponContext } from './Weapon';
import type { WeaponDef } from '../../data/weapons';

const TEXTURE_SIZE = 128; // phải khớp với texture 'aura' trong placeholderTextures.ts

/** Kiểu 3: vùng sát thương quanh người, gây sát thương định kỳ cho mọi quái bên trong (Vòng sát thương). */
export class AuraWeapon extends Weapon {
    private ring: GameObjects.Sprite;
    private flash = 0; // 1 ngay khi gây sát thương, mờ dần về 0

    constructor(ctx: WeaponContext, def: WeaponDef) {
        super(ctx, def);
        this.ring = ctx.scene.add.sprite(ctx.player.x, ctx.player.y, 'aura').setDepth(1);
    }

    update(dtMs: number, now: number): void {
        const { player, spawner, combat } = this.ctx;
        const s = this.stats;
        const dt = dtMs / 1000;

        this.ring.setPosition(player.x, player.y);
        this.ring.setScale((s.radius * 2) / TEXTURE_SIZE);
        this.flash = Math.max(0, this.flash - dt * 3);
        this.ring.setAlpha(0.2 + this.flash * 0.5);

        this.tick(dt);
        if (!this.ready) return;
        this.resetCooldown();
        this.flash = 1;

        const enemies = spawner.activeEnemies;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.active) continue;
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const r = s.radius + e.radius;
            if (dx * dx + dy * dy <= r * r) {
                combat.dealDamage(e, s.damage, now);
            }
        }
    }

    destroy(): void {
        this.ring.destroy();
    }
}