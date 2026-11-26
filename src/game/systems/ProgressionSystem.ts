import { xpForLevel } from '../data/progression';

/** Cấp độ và kinh nghiệm của người chơi trong một lượt chơi. */
export class ProgressionSystem {
    level = 1;
    xp = 0;
    totalXp = 0;
    pendingLevelUps = 0; // số lần lên cấp chưa được chọn nâng cấp

    get xpToNext(): number {
        return xpForLevel(this.level);
    }

    get ratio(): number {
        return Math.min(1, this.xp / this.xpToNext);
    }

    addXp(amount: number): void {
        this.xp += amount;
        this.totalXp += amount;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.pendingLevelUps++;
        }
    }
}