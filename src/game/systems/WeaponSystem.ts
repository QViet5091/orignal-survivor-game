import type { Scene } from 'phaser';
import type { Player } from '../entities/Player';
import { WEAPONS } from '../data/weapons';
import type { WeaponId } from '../data/weapons';
import type { EnemySpawner } from './EnemySpawner';
import type { CombatSystem } from './CombatSystem';
import { ProjectilePool } from './weapons/ProjectilePool';
import type { Weapon, WeaponContext } from './weapons/Weapon';
import { ProjectileWeapon } from './weapons/ProjectileWeapon';
import { OrbitWeapon } from './weapons/OrbitWeapon';
import { AuraWeapon } from './weapons/AuraWeapon';
import { LobWeapon } from './weapons/LobWeapon';

export type AddResult = 'added' | 'upgraded' | 'maxed';

export class WeaponSystem {
    private weapons: Weapon[] = [];
    private ctx: WeaponContext;

    constructor(scene: Scene, player: Player, spawner: EnemySpawner, combat: CombatSystem) {
        this.ctx = { scene, player, spawner, combat, projectiles: new ProjectilePool(scene) };
    }

    get owned(): readonly Weapon[] {
        return this.weapons;
    }

    /** Chưa có thì thêm ở cấp 1, có rồi thì nâng cấp. Giai đoạn 5 sẽ gọi hàm này khi người chơi chọn nâng cấp. */
    addOrUpgrade(id: WeaponId): AddResult {
        const existing = this.weapons.find((w) => w.def.id === id);
        if (existing) return existing.levelUp() ? 'upgraded' : 'maxed';
        this.weapons.push(this.create(id));
        return 'added';
    }

    update(dtMs: number, now: number): void {
        for (let i = 0; i < this.weapons.length; i++) {
            this.weapons[i].update(dtMs, now);
        }
        this.ctx.projectiles.update(dtMs, this.ctx.spawner.activeEnemies, this.ctx.combat, now);
    }

    private create(id: WeaponId): Weapon {
        const def = WEAPONS[id];
        switch (def.kind) {
            case 'projectile':
                return new ProjectileWeapon(this.ctx, def);
            case 'orbit':
                return new OrbitWeapon(this.ctx, def);
            case 'aura':
                return new AuraWeapon(this.ctx, def);
            case 'lob':
                return new LobWeapon(this.ctx, def);
        }
    }
}