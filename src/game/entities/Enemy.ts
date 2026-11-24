import { GameObjects, Scene } from 'phaser';
import type { EnemyDef } from '../data/enemies';

/**
 * Quái được tạo bởi Group (object pool), nên constructor không gọi
 * scene.add.existing: Group tự thêm vào scene. Dữ liệu thật được gán ở spawn().
 */
export class Enemy extends GameObjects.Sprite {
    hp = 1;
    speed = 0;
    damage = 0;
    xp = 0;
    radius = 10;
    color = 0xffffff; // màu hình, dùng cho hiệu ứng khi chết
    private flashUntil = 0;

    constructor(scene: Scene, x: number, y: number, texture: string = 'enemy_slime') {
        super(scene, x, y, texture);
        this.setDepth(5);
    }

    /** Gán dữ liệu cho một quái lấy từ pool (mới tạo hoặc tái sử dụng). */
    spawn(def: EnemyDef, x: number, y: number): void {
        this.setTexture(`enemy_${def.id}`);
        this.setPosition(x, y);
        this.hp = def.maxHp;
        this.speed = def.speed;
        this.damage = def.damage;
        this.xp = def.xp;
        this.radius = def.radius;
        this.color = def.color;
        this.flashUntil = 0;
        this.clearTint();
        this.setActive(true).setVisible(true);
    }

    /** Đuổi thẳng tới mục tiêu, không dùng pathfinding. */
    chase(targetX: number, targetY: number, dtSec: number): void {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return;
        const step = this.speed * dtSec;
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
    }

    /** Trả về true nếu quái chết. */
    takeDamage(amount: number, now: number): boolean {
        this.hp -= amount;
        this.setTintFill(0xffffff); // nháy trắng
        this.flashUntil = now + 80;
        return this.hp <= 0;
    }

    tickEffects(now: number): void {
        if (this.flashUntil > 0 && now >= this.flashUntil) {
            this.clearTint();
            this.flashUntil = 0;
        }
    }
}