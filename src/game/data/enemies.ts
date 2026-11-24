export type EnemyId = 'slime' | 'bat' | 'brute';

export interface EnemyDef {
    id: EnemyId;
    maxHp: number;
    speed: number; // pixel mỗi giây
    damage: number; // sát thương khi chạm người chơi
    xp: number; // XP rơi ra (dùng từ Giai đoạn 4)
    radius: number; // bán kính va chạm và bán kính hình tạm
    color: number; // màu hình tạm
}

export const ENEMIES: Record<EnemyId, EnemyDef> = {
    slime: { id: 'slime', maxHp: 20, speed: 70, damage: 8, xp: 1, radius: 12, color: 0x66bb6a },
    bat: { id: 'bat', maxHp: 10, speed: 130, damage: 5, xp: 1, radius: 9, color: 0xab47bc },
    brute: { id: 'brute', maxHp: 80, speed: 45, damage: 15, xp: 5, radius: 20, color: 0xef5350 },
};