import { Scene } from 'phaser';

export function createPlaceholderTextures(scene: Scene): void {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    // Ô nền 64x64, lặp lại thành mặt đất vô hạn
    g.fillStyle(0x1a1a2e, 1).fillRect(0, 0, 64, 64);
    g.lineStyle(1, 0x25254a, 1).strokeRect(0, 0, 64, 64);
    g.fillStyle(0x2f2f5a, 1);
    g.fillRect(10, 14, 2, 2);
    g.fillRect(40, 8, 2, 2);
    g.fillRect(24, 44, 2, 2);
    g.fillRect(52, 52, 2, 2);
    g.generateTexture('ground', 64, 64);
    g.clear();

    // Nhân vật 32x32: hình tròn xanh có một chấm mắt
    g.fillStyle(0x4fc3f7, 1).fillCircle(16, 16, 14);
    g.fillStyle(0xffffff, 1).fillCircle(21, 12, 3);
    g.generateTexture('player', 32, 32);

    g.destroy();
}