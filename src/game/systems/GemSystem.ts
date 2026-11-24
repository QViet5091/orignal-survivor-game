import { GameObjects, Scene } from 'phaser';
import { XpGem } from '../entities/XpGem';

export class GemSystem {
    private group: GameObjects.Group;

    constructor(scene: Scene) {
        // Giới hạn 600 viên cùng lúc để không phình bộ nhớ
        this.group = scene.add.group({ classType: XpGem, maxSize: 600 });
    }

    get activeCount(): number {
        return this.group.countActive(true);
    }

    drop(x: number, y: number, value: number): void {
        const gem = this.group.get(x, y, 'gem') as XpGem | null;
        if (!gem) return; // pool đầy
        gem.spawn(x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12, value);
    }
}