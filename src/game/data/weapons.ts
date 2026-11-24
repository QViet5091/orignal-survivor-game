export type WeaponId = 'magicBolt' | 'orbitBlade' | 'aura' | 'axe';
export type WeaponKind = 'projectile' | 'orbit' | 'aura' | 'lob';

/** Chỉ số của một vũ khí ở một cấp. Trường nào không dùng cho loại đó thì để 0. */
export interface WeaponLevelStats {
    damage: number; // sát thương mỗi lần trúng
    cooldown: number; // giây. projectile/lob/aura: giữa hai lần kích hoạt. orbit: giữa hai lần một lưỡi chém cùng một quái
    count: number; // số đạn / số lưỡi quay / số rìu mỗi lần
    speed: number; // projectile: px/s. lob: vận tốc ném lên (px/s). orbit: độ/giây
    pierce: number; // số quái xuyên được thêm (projectile, lob)
    lifetime: number; // giây tồn tại (projectile, lob)
    radius: number; // bán kính va chạm. aura: bán kính cả vùng
}

export interface WeaponDef {
    id: WeaponId;
    kind: WeaponKind;
    name: string;
    range?: number; // projectile: chỉ nhắm quái trong tầm này (px)
    orbitRadius?: number; // orbit: khoảng cách từ người chơi tới lưỡi (px)
    gravity?: number; // lob: gia tốc rơi (px/s^2)
    levels: WeaponLevelStats[]; // phần tử 0 là cấp 1
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
    magicBolt: {
        id: 'magicBolt',
        kind: 'projectile',
        name: 'Đạn phép',
        range: 450,
        levels: [
            { damage: 10, cooldown: 1.0, count: 1, speed: 420, pierce: 0, lifetime: 1.5, radius: 7 },
            { damage: 12, cooldown: 0.9, count: 1, speed: 420, pierce: 0, lifetime: 1.5, radius: 7 },
            { damage: 14, cooldown: 0.8, count: 2, speed: 440, pierce: 1, lifetime: 1.5, radius: 7 },
            { damage: 16, cooldown: 0.7, count: 2, speed: 440, pierce: 1, lifetime: 1.5, radius: 8 },
            { damage: 20, cooldown: 0.6, count: 3, speed: 460, pierce: 2, lifetime: 1.5, radius: 8 },
        ],
    },
    orbitBlade: {
        id: 'orbitBlade',
        kind: 'orbit',
        name: 'Lưỡi quay',
        orbitRadius: 70,
        levels: [
            { damage: 8, cooldown: 0.5, count: 1, speed: 140, pierce: 0, lifetime: 0, radius: 10 },
            { damage: 10, cooldown: 0.5, count: 2, speed: 150, pierce: 0, lifetime: 0, radius: 10 },
            { damage: 12, cooldown: 0.45, count: 2, speed: 160, pierce: 0, lifetime: 0, radius: 11 },
            { damage: 14, cooldown: 0.4, count: 3, speed: 180, pierce: 0, lifetime: 0, radius: 11 },
            { damage: 18, cooldown: 0.35, count: 4, speed: 200, pierce: 0, lifetime: 0, radius: 12 },
        ],
    },
    aura: {
        id: 'aura',
        kind: 'aura',
        name: 'Vòng sát thương',
        levels: [
            { damage: 4, cooldown: 0.6, count: 1, speed: 0, pierce: 0, lifetime: 0, radius: 70 },
            { damage: 5, cooldown: 0.55, count: 1, speed: 0, pierce: 0, lifetime: 0, radius: 80 },
            { damage: 6, cooldown: 0.5, count: 1, speed: 0, pierce: 0, lifetime: 0, radius: 90 },
            { damage: 8, cooldown: 0.45, count: 1, speed: 0, pierce: 0, lifetime: 0, radius: 100 },
            { damage: 10, cooldown: 0.4, count: 1, speed: 0, pierce: 0, lifetime: 0, radius: 115 },
        ],
    },
    axe: {
        id: 'axe',
        kind: 'lob',
        name: 'Rìu ném',
        gravity: 900,
        levels: [
            { damage: 18, cooldown: 2.2, count: 1, speed: 480, pierce: 3, lifetime: 2.0, radius: 14 },
            { damage: 22, cooldown: 2.0, count: 1, speed: 480, pierce: 3, lifetime: 2.0, radius: 14 },
            { damage: 26, cooldown: 1.8, count: 2, speed: 480, pierce: 4, lifetime: 2.0, radius: 15 },
            { damage: 30, cooldown: 1.6, count: 2, speed: 500, pierce: 4, lifetime: 2.0, radius: 15 },
            { damage: 36, cooldown: 1.4, count: 3, speed: 500, pierce: 6, lifetime: 2.0, radius: 16 },
        ],
    },
};