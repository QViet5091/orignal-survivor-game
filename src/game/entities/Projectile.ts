import { GameObjects, Scene } from 'phaser';
import type { Enemy } from './Enemy';

export interface FireOptions {
    texture: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    radius: number;
    pierce: number;
    lifetime: number;
    gravity?: number;
    spin?: number; // độ/giây. Có spin thì xoay tròn, không thì hướng theo vận tốc
}

/** Đạn dùng chung cho Đạn phép và Rìu ném. Được tạo bởi Group (object pool). */
export class Projectile extends GameObjects.Sprite {
    vx = 0;
    vy = 0;
    gravity = 0;
    spin = 0;
    damage = 0;
    radius = 6;
    pierce = 0;
    life = 0;
    hits: Enemy[] = []; // các quái đã trúng, để không trúng lại cùng một quái

    constructor(scene: Scene, x: number, y: number, texture: string = 'bolt') {
        super(scene, x, y, texture);
        this.setDepth(8);
    }

    launch(o: FireOptions): void {
        this.setTexture(o.texture);
        this.setPosition(o.x, o.y);
        this.vx = o.vx;
        this.vy = o.vy;
        this.gravity = o.gravity ?? 0;
        this.spin = o.spin ?? 0;
        this.damage = o.damage;
        this.radius = o.radius;
        this.pierce = o.pierce;
        this.life = o.lifetime;
        this.hits.length = 0;
        this.setRotation(this.spin !== 0 ? Math.random() * Math.PI * 2 : Math.atan2(o.vy, o.vx));
        this.setActive(true).setVisible(true);
    }
}