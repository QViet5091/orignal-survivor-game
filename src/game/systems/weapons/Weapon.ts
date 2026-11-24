import type { Scene } from 'phaser';
import type { Player } from '../../entities/Player';
import type { WeaponDef, WeaponLevelStats } from '../../data/weapons';
import type { EnemySpawner } from '../EnemySpawner';
import type { CombatSystem } from '../CombatSystem';
import type { ProjectilePool } from './ProjectilePool';

export interface WeaponContext {
    scene: Scene;
    player: Player;
    spawner: EnemySpawner;
    combat: CombatSystem;
    projectiles: ProjectilePool;
}

export abstract class Weapon {
    level = 1;
    readonly def: WeaponDef;
    protected ctx: WeaponContext;
    private cd = 0; // giây còn lại tới lần kích hoạt kế tiếp

    constructor(ctx: WeaponContext, def: WeaponDef) {
        this.ctx = ctx;
        this.def = def;
    }

    get stats(): WeaponLevelStats {
        return this.def.levels[this.level - 1];
    }

    get maxLevel(): number {
        return this.def.levels.length;
    }

    /** Trả về false nếu đã đạt cấp tối đa. */
    levelUp(): boolean {
        if (this.level >= this.maxLevel) return false;
        this.level++;
        this.onLevelUp();
        return true;
    }

    protected onLevelUp(): void {}

    protected tick(dtSec: number): void {
        if (this.cd > 0) this.cd -= dtSec;
    }

    protected get ready(): boolean {
        return this.cd <= 0;
    }

    protected resetCooldown(): void {
        this.cd = this.stats.cooldown;
    }

    abstract update(dtMs: number, now: number): void;

    destroy(): void {}
}