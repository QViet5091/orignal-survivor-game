import type { EnemyId } from './enemies';

export interface SpawnEntry {
    id: EnemyId;
    fromSec: number; // xuất hiện từ giây thứ mấy
    weight: number; // trọng số chọn ngẫu nhiên
}

// Tạm thời cho Giai đoạn 3. Giai đoạn 7 sẽ thay bằng data/waves.ts.
export const SPAWN = {
    baseRate: 3, // quái mỗi giây lúc bắt đầu
    rateGrowth: 0.2, // mỗi giây trôi qua, tốc độ sinh tăng thêm bấy nhiêu
    maxRate: 30, // trần tốc độ sinh
    maxAlive: 400, // trần số quái cùng lúc
    ringMargin: 80, // sinh quái cách mép màn hình bấy nhiêu pixel
    separation: 0.4, // độ mạnh đẩy các quái ra khỏi nhau (0 đến 1)
    table: [
        { id: 'slime', fromSec: 0, weight: 10 },
        { id: 'bat', fromSec: 20, weight: 5 },
        { id: 'brute', fromSec: 45, weight: 2 },
    ] as SpawnEntry[],
};