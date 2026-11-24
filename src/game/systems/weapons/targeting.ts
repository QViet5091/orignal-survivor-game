import type { Enemy } from '../../entities/Enemy';

/** Quái đang hoạt động gần nhất trong maxDist, hoặc null. Giai đoạn 9 sẽ tối ưu bằng spatial hash. */
export function nearestEnemy(list: Enemy[], x: number, y: number, maxDist: number): Enemy | null {
    let best: Enemy | null = null;
    let bestD2 = maxDist * maxDist;
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!e.active) continue;
        const dx = e.x - x;
        const dy = e.y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
            bestD2 = d2;
            best = e;
        }
    }
    return best;
}