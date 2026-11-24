import { GameObjects, Scene } from 'phaser';
import type { Enemy } from '../entities/Enemy';
import type { EnemySpawner } from './EnemySpawner';
import type { GemSystem } from './GemSystem';
import type { DamageNumbers } from './DamageNumbers';

/** Nơi duy nhất xử lý sát thương lên quái: số nổi, nháy trắng, chết, rơi XP, hiệu ứng. */
export class CombatSystem {
    kills = 0;
    private spawner: EnemySpawner;
    private gems: GemSystem;
    private numbers: DamageNumbers;
    private burst: GameObjects.Particles.ParticleEmitter;

    constructor(scene: Scene, spawner: EnemySpawner, gems: GemSystem, numbers: DamageNumbers) {
        this.spawner = spawner;
        this.gems = gems;
        this.numbers = numbers;
        this.burst = scene.add.particles(0, 0, 'spark', {
            speed: { min: 50, max: 160 },
            lifespan: 300,
            scale: { start: 1.2, end: 0 },
            emitting: false,
        });
        this.burst.setDepth(6);
    }

    dealDamage(enemy: Enemy, amount: number, now: number): void {
        if (!enemy.active) return;
        const dead = enemy.takeDamage(amount, now);
        this.numbers.show(enemy.x, enemy.y - enemy.radius, amount);
        if (dead) this.kill(enemy);
    }

    private kill(enemy: Enemy): void {
        this.kills++;
        this.gems.drop(enemy.x, enemy.y, enemy.xp);
        this.burst.setParticleTint(enemy.color);
        this.burst.explode(6, enemy.x, enemy.y);
        this.spawner.kill(enemy);
    }
}