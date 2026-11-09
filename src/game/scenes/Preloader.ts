import { Scene } from 'phaser';
import { createPlaceholderTextures } from '../utils/placeholderTextures';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const { width, height } = this.scale;
        const barW = 400;
        const barH = 24;
        const y = height / 2;

        this.add
            .rectangle(width / 2, y, barW + 4, barH + 4)
            .setStrokeStyle(2, 0xffffff);
        const bar = this.add
            .rectangle((width - barW) / 2, y, 0, barH, 0xffffff)
            .setOrigin(0, 0.5);

        this.load.on('progress', (value: number) => {
            bar.width = barW * value;
        });

        // Các giai đoạn sau sẽ nạp ảnh/âm thanh thật ở đây:
        // this.load.image('key', 'assets/ten-file.png');
    }

    create() {
        createPlaceholderTextures(this);
        this.scene.start('Game');
    }
}