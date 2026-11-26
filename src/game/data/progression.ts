/** XP cần để lên từ cấp `level` lên cấp `level + 1`. Chỉnh ba hằng số để đổi nhịp lên cấp. */
const BASE = 5;
const LINEAR = 5;
const QUADRATIC = 1;

export function xpForLevel(level: number): number {
    const n = level - 1;
    return Math.round(BASE + LINEAR * n + QUADRATIC * n * n);
}