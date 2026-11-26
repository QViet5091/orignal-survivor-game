import type { Player } from '../entities/Player';
import { PLAYER_BASE } from '../data/player';
import { WEAPONS } from '../data/weapons';
import type { WeaponId } from '../data/weapons';
import {
    MAX_WEAPONS,
    PASSIVES,
    WEAPON_INTRO,
    WEIGHT_WEAPON_NEW,
    WEIGHT_WEAPON_UPGRADE,
    describeWeaponUpgrade,
} from '../data/upgrades';
import type { PassiveId, UpgradeOption } from '../data/upgrades';
import type { WeaponSystem } from './WeaponSystem';

interface Candidate {
    option: UpgradeOption;
    weight: number;
}

export class UpgradeSystem {
    private player: Player;
    private weapons: WeaponSystem;
    private passiveLevels: Record<PassiveId, number> = {
        might: 0,
        haste: 0,
        vitality: 0,
        swiftness: 0,
        magnet: 0,
    };

    constructor(player: Player, weapons: WeaponSystem) {
        this.player = player;
        this.weapons = weapons;
    }

    /** Tóm tắt các chỉ số đã nâng, dùng cho dòng debug. */
    get passiveSummary(): string {
        const parts: string[] = [];
        for (const id of Object.keys(PASSIVES) as PassiveId[]) {
            if (this.passiveLevels[id] > 0) parts.push(`${PASSIVES[id].name} Lv${this.passiveLevels[id]}`);
        }
        return parts.length > 0 ? parts.join(', ') : '(chưa có)';
    }

    /** Chọn ngẫu nhiên (theo trọng số) tối đa `count` nâng cấp khác nhau. Trả về mảng rỗng nếu không còn gì để nâng. */
    rollOptions(count: number): UpgradeOption[] {
        const pool = this.candidates();
        const out: UpgradeOption[] = [];
        while (out.length < count && pool.length > 0) {
            let total = 0;
            for (let i = 0; i < pool.length; i++) total += pool[i].weight;
            let roll = Math.random() * total;
            let idx = pool.length - 1;
            for (let i = 0; i < pool.length; i++) {
                roll -= pool[i].weight;
                if (roll <= 0) {
                    idx = i;
                    break;
                }
            }
            out.push(pool[idx].option);
            pool.splice(idx, 1); // không chọn trùng trong cùng một lần
        }
        return out;
    }

    apply(option: UpgradeOption): void {
        if (option.kind === 'weapon') {
            this.weapons.addOrUpgrade(option.id);
        } else {
            this.passiveLevels[option.id]++;
            this.recomputeStats();
        }
    }

    private candidates(): Candidate[] {
        const list: Candidate[] = [];
        const owned = this.weapons.owned;

        for (const id of Object.keys(WEAPONS) as WeaponId[]) {
            const def = WEAPONS[id];
            const w = owned.find((x) => x.def.id === id);
            if (w) {
                if (w.level >= w.maxLevel) continue; // đã tối đa: loại
                list.push({
                    weight: WEIGHT_WEAPON_UPGRADE,
                    option: {
                        kind: 'weapon', id, isNew: false, level: w.level + 1,
                        title: def.name, desc: describeWeaponUpgrade(def, w.level),
                    },
                });
            } else if (owned.length < MAX_WEAPONS) {
                list.push({
                    weight: WEIGHT_WEAPON_NEW,
                    option: {
                        kind: 'weapon', id, isNew: true, level: 1,
                        title: def.name, desc: WEAPON_INTRO[id],
                    },
                });
            }
        }

        for (const id of Object.keys(PASSIVES) as PassiveId[]) {
            const def = PASSIVES[id];
            const lv = this.passiveLevels[id];
            if (lv >= def.maxLevel) continue;
            list.push({
                weight: def.weight,
                option: {
                    kind: 'passive', id, isNew: lv === 0, level: lv + 1,
                    title: def.name, desc: def.describe(def.perLevel),
                },
            });
        }
        return list;
    }

    /** Tính lại chỉ số người chơi từ chỉ số gốc cộng các nâng cấp đã chọn. */
    private recomputeStats(): void {
        const p = this.player;
        const L = this.passiveLevels;

        const oldMax = p.maxHp;
        p.maxHp = PLAYER_BASE.maxHp + PASSIVES.vitality.perLevel * L.vitality;
        p.hp = Math.min(p.maxHp, p.hp + (p.maxHp - oldMax)); // tăng máu tối đa thì hồi bằng đó

        p.speed = PLAYER_BASE.speed * (1 + PASSIVES.swiftness.perLevel * L.swiftness);
        p.damageMult = 1 + PASSIVES.might.perLevel * L.might;
        p.cooldownMult = Math.max(0.4, 1 - PASSIVES.haste.perLevel * L.haste); // sàn 40% để không hồi chiêu về 0
        p.pickupRadius = PLAYER_BASE.pickupRadius + PASSIVES.magnet.perLevel * L.magnet;
    }
}