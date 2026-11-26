import type { WeaponDef, WeaponId, WeaponLevelStats } from './weapons';

export type PassiveId = 'might' | 'haste' | 'vitality' | 'swiftness' | 'magnet';

export interface PassiveDef {
    id: PassiveId;
    name: string;
    maxLevel: number;
    weight: number; // trọng số xuất hiện trong ba lựa chọn
    perLevel: number; // hiệu quả mỗi cấp (ý nghĩa tùy từng loại, xem UpgradeSystem.recomputeStats)
    describe: (perLevel: number) => string;
}

export const MAX_WEAPONS = 4; // số vũ khí tối đa cầm cùng lúc (kế hoạch gợi ý 4 đến 6)
export const WEIGHT_WEAPON_NEW = 8;
export const WEIGHT_WEAPON_UPGRADE = 10;

export const PASSIVES: Record<PassiveId, PassiveDef> = {
    might: {
        id: 'might', name: 'Sức mạnh', maxLevel: 5, weight: 8, perLevel: 0.1,
        describe: (v) => `+${Math.round(v * 100)}% sát thương mọi vũ khí`,
    },
    haste: {
        id: 'haste', name: 'Hồi chiêu nhanh', maxLevel: 5, weight: 8, perLevel: 0.08,
        describe: (v) => `-${Math.round(v * 100)}% thời gian hồi vũ khí`,
    },
    vitality: {
        id: 'vitality', name: 'Sinh lực', maxLevel: 5, weight: 8, perLevel: 20,
        describe: (v) => `+${v} máu tối đa (và hồi bằng đó)`,
    },
    swiftness: {
        id: 'swiftness', name: 'Bước chân nhanh', maxLevel: 5, weight: 6, perLevel: 0.08,
        describe: (v) => `+${Math.round(v * 100)}% tốc độ chạy`,
    },
    magnet: {
        id: 'magnet', name: 'Nam châm', maxLevel: 5, weight: 6, perLevel: 35,
        describe: (v) => `+${v} bán kính hút viên XP`,
    },
};

export const WEAPON_INTRO: Record<WeaponId, string> = {
    magicBolt: 'Bắn về phía quái gần nhất.',
    orbitBlade: 'Các lưỡi quay quanh người và chém quái chạm vào.',
    aura: 'Vòng quanh người gây sát thương định kỳ cho mọi quái bên trong.',
    axe: 'Ném rìu theo vòng cung, xuyên qua nhiều quái.',
};

interface OptionBase {
    title: string;
    desc: string;
    level: number; // cấp sau khi chọn
    isNew: boolean; // vũ khí mới / chỉ số chưa có
}

export type UpgradeOption =
    | (OptionBase & { kind: 'weapon'; id: WeaponId })
    | (OptionBase & { kind: 'passive'; id: PassiveId });

const STAT_LABELS: [keyof WeaponLevelStats, string][] = [
    ['damage', 'Sát thương'],
    ['cooldown', 'Hồi chiêu'],
    ['count', 'Số lượng'],
    ['speed', 'Tốc độ'],
    ['pierce', 'Xuyên thêm'],
    ['radius', 'Phạm vi'],
    ['lifetime', 'Thời gian bay'],
];

function fmt(n: number): string {
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

/** Mô tả những chỉ số thay đổi khi nâng vũ khí từ cấp `currentLevel` lên cấp kế tiếp. */
export function describeWeaponUpgrade(def: WeaponDef, currentLevel: number): string {
    const a = def.levels[currentLevel - 1];
    const b = def.levels[currentLevel];
    const lines: string[] = [];
    for (const [key, label] of STAT_LABELS) {
        if (a[key] !== b[key]) lines.push(`${label}: ${fmt(a[key])} → ${fmt(b[key])}`);
    }
    return lines.join('\n');
}