import { Scene } from 'phaser';
import { ENEMIES } from '../data/enemies';
import type { EnemyId } from '../data/enemies';

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
    g.clear();

    // Quái: hình tròn theo màu và bán kính trong data/enemies.ts, có hai mắt
    (Object.keys(ENEMIES) as EnemyId[]).forEach((id) => {
        const d = ENEMIES[id];
        const r = d.radius;
        g.fillStyle(d.color, 1).fillCircle(r, r, r);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(r * 0.65, r * 0.8, r * 0.18);
        g.fillCircle(r * 1.35, r * 0.8, r * 0.18);
        g.generateTexture(`enemy_${id}`, r * 2, r * 2);
        g.clear();
    });

    // Đạn phép 16x16: quầng vàng, lõi trắng
    g.fillStyle(0xfff59d, 1).fillCircle(8, 8, 7);
    g.fillStyle(0xffffff, 1).fillCircle(8, 8, 3.5);
    g.generateTexture('bolt', 16, 16);
    g.clear();

    // Rìu 32x32: cán nâu, lưỡi xám
    g.fillStyle(0x8d6e63, 1).fillRect(14, 4, 4, 24);
    g.fillStyle(0xcfd8dc, 1).fillTriangle(18, 4, 31, 12, 18, 20);
    g.fillStyle(0xcfd8dc, 1).fillTriangle(14, 4, 1, 12, 14, 20);
    g.generateTexture('axe', 32, 32);
    g.clear();

    // Lưỡi quay 28x12: hình thoi
    g.fillStyle(0xe0f7fa, 1).fillTriangle(0, 6, 14, 0, 28, 6);
    g.fillStyle(0x80deea, 1).fillTriangle(0, 6, 14, 12, 28, 6);
    g.generateTexture('blade', 28, 12);
    g.clear();

    // Vòng sát thương 128x128: nền mờ và viền sáng
    g.fillStyle(0xffcc66, 0.35).fillCircle(64, 64, 63);
    g.lineStyle(2, 0xffe08a, 0.9).strokeCircle(64, 64, 62);
    g.generateTexture('aura', 128, 128);
    g.clear();

    // Viên kinh nghiệm 12x12: hình thoi xanh
    g.fillStyle(0x4dd0e1, 1).fillTriangle(6, 0, 12, 6, 6, 12);
    g.fillStyle(0x80deea, 1).fillTriangle(6, 0, 0, 6, 6, 12);
    g.generateTexture('gem', 12, 12);
    g.clear();

    // Hạt nhỏ cho hiệu ứng nổ khi quái chết
    g.fillStyle(0xffffff, 1).fillCircle(3, 3, 3);
    g.generateTexture('spark', 6, 6);

    g.destroy();
}