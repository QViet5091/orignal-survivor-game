import { GameObjects, Input, Scene } from 'phaser';
import { PLAYER_BASE } from '../data/player';

type KeyMap = Record<
    'W' | 'A' | 'S' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
    Input.Keyboard.Key
>;

export class Player extends GameObjects.Sprite {
    maxHp: number = PLAYER_BASE.maxHp;
    hp: number = PLAYER_BASE.maxHp;
    speed: number = PLAYER_BASE.speed;
    radius: number = PLAYER_BASE.radius;
    invincible = false; // dùng để debug (phím G)
    private invulnUntil = 0;
    private keys: KeyMap;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        this.setDepth(10);
        this.keys = scene.input.keyboard!.addKeys(
            'W,A,S,D,UP,DOWN,LEFT,RIGHT'
        ) as KeyMap;
    }

    get isDead(): boolean {
        return this.hp <= 0;
    }

    /** Gọi mỗi frame. delta là số mili giây kể từ frame trước. */
    move(delta: number): void {
        const k = this.keys;
        let dx = 0;
        let dy = 0;
        if (k.A.isDown || k.LEFT.isDown) dx -= 1;
        if (k.D.isDown || k.RIGHT.isDown) dx += 1;
        if (k.W.isDown || k.UP.isDown) dy -= 1;
        if (k.S.isDown || k.DOWN.isDown) dy += 1;

        if (dx === 0 && dy === 0) return;

        // Chuẩn hóa vector để đi chéo không nhanh hơn đi thẳng
        const len = Math.hypot(dx, dy);
        const step = this.speed * (delta / 1000);
        this.x += (dx / len) * step;
        this.y += (dy / len) * step;

        if (dx !== 0) this.setFlipX(dx < 0);
    }

    /** Trả về true nếu thực sự bị trừ máu (không đang miễn thương). */
    takeDamage(amount: number, now: number): boolean {
        if (this.invincible || this.isDead || now < this.invulnUntil) return false;
        this.hp = Math.max(0, this.hp - amount);
        this.invulnUntil = now + PLAYER_BASE.invulnMs;
        return true;
    }

    /** Nhấp nháy khi đang miễn thương. */
    updateEffects(now: number): void {
        if (now < this.invulnUntil) {
            this.setAlpha(Math.floor(now / 80) % 2 === 0 ? 0.35 : 1);
        } else {
            this.setAlpha(1);
        }
    }
}