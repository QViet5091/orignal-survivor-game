import { GameObjects, Scene } from 'phaser';

/** Viên kinh nghiệm. Được tạo bởi Group (object pool). Giai đoạn 5 thêm việc hút và nhặt. */
export class XpGem extends GameObjects.Sprite {
    value = 1;

    constructor(scene: Scene, x: number, y: number, texture: string = 'gem') {
        super(scene, x, y, texture);
        this.setDepth(2);
    }

    spawn(x: number, y: number, value: number): void {
        this.setPosition(x, y);
        this.value = value;
        if (value >= 5) this.setTint(0xffd54f);
        else this.clearTint();
        this.setActive(true).setVisible(true);
    }
}