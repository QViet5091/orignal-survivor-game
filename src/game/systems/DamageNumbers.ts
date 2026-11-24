import { GameObjects, Scene } from 'phaser';

const LIFE_SEC = 0.7;
const RISE_PX_PER_SEC = 40;
const MAX_PER_FRAME = 8; // giới hạn để vòng sát thương không tạo hàng chục số cùng lúc

export class DamageNumbers {
    private items: GameObjects.Text[] = [];
    private age: number[] = [];
    private next = 0;
    private shownThisFrame = 0;

    constructor(scene: Scene, poolSize: number = 50) {
        for (let i = 0; i < poolSize; i++) {
            const t = scene.add
                .text(0, 0, '', {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fontStyle: 'bold',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3,
                })
                .setOrigin(0.5)
                .setDepth(900)
                .setActive(false)
                .setVisible(false);
            this.items.push(t);
            this.age.push(0);
        }
    }

    show(x: number, y: number, amount: number): void {
        if (this.shownThisFrame >= MAX_PER_FRAME) return;
        this.shownThisFrame++;

        const i = this.next;
        this.next = (this.next + 1) % this.items.length; // ghi đè số cũ nhất nếu hết chỗ
        this.age[i] = 0;
        this.items[i]
            .setText(String(Math.round(amount)))
            .setPosition(x + (Math.random() - 0.5) * 16, y)
            .setAlpha(1)
            .setActive(true)
            .setVisible(true);
    }

    /** Gọi một lần mỗi frame, trước khi vũ khí gây sát thương. */
    update(dtMs: number): void {
        this.shownThisFrame = 0;
        const dt = dtMs / 1000;
        for (let i = 0; i < this.items.length; i++) {
            const t = this.items[i];
            if (!t.active) continue;
            this.age[i] += dt;
            if (this.age[i] >= LIFE_SEC) {
                t.setActive(false).setVisible(false);
            } else {
                t.y -= RISE_PX_PER_SEC * dt;
                t.setAlpha(1 - this.age[i] / LIFE_SEC);
            }
        }
    }
}