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
    private keys: KeyMap;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        this.keys = scene.input.keyboard!.addKeys(
            'W,A,S,D,UP,DOWN,LEFT,RIGHT'
        ) as KeyMap;
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
}