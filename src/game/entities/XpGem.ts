import { GameObjects, Scene } from 'phaser';

/** Viên kinh nghiệm. Được tạo bởi Group (object pool). GemSystem lo việc hút và nhặt. */
export class XpGem extends GameObjects.Sprite {
    value = 1;
    attracted = false; // đã bị hút: từ lúc này luôn bay về phía người chơi
    pull = 0; // tốc độ bay về phía người chơi (px/s), tăng dần

    constructor(scene: Scene, x: number, y: number, texture: string = 'gem') {
        super(scene, x, y, texture);
        this.setDepth(2);
    }

    spawn(x: number, y: number, value: number): void {
        this.setPosition(x, y);
        this.value = value;
        this.attracted = false;
        this.pull = 0;
        if (value >= 5) this.setTint(0xffd54f);
        else this.clearTint();
        this.setActive(true).setVisible(true);
    }
}