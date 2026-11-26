import { Scene } from 'phaser';
import type { UpgradeOption } from '../data/upgrades';

export interface LevelUpData {
    options: UpgradeOption[];
    level: number;
    onPick: (option: UpgradeOption) => void;
}

const KEY_NAMES = ['ONE', 'TWO', 'THREE'];

/** Màn hình chọn nâng cấp. Chạy chồng lên scene Game đang tạm dừng. */
export class LevelUp extends Scene {
    private picked = false;
    private keyHandlers: { event: string; fn: () => void }[] = [];

    constructor() {
        super('LevelUp');
    }

    create(data: LevelUpData) {
        this.picked = false;
        this.keyHandlers = [];
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0);
        this.add
            .text(width / 2, 110, `LÊN CẤP ${data.level}!`, {
                fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color: '#ffd54f',
            })
            .setOrigin(0.5);
        this.add
            .text(width / 2, 160, 'Chọn một nâng cấp (bấm chuột hoặc phím 1, 2, 3)', {
                fontFamily: 'Arial', fontSize: '20px', color: '#cfd8dc',
            })
            .setOrigin(0.5);

        const n = data.options.length;
        const cardW = 280;
        const cardH = 340;
        const gap = 28;
        const startX = (width - (n * cardW + (n - 1) * gap)) / 2 + cardW / 2;
        const cy = height / 2 + 50;

        data.options.forEach((opt, i) => {
            this.makeCard(opt, i, startX + i * (cardW + gap), cy, cardW, cardH, data);
        });

        const kb = this.input.keyboard!;
        data.options.forEach((opt, i) => {
            const event = `keydown-${KEY_NAMES[i]}`;
            const fn = () => this.pick(opt, data);
            kb.on(event, fn);
            this.keyHandlers.push({ event, fn });
        });
    }

    private makeCard(
        opt: UpgradeOption, index: number, x: number, y: number,
        w: number, h: number, data: LevelUpData
    ): void {
        const accent = opt.kind === 'passive' ? 0xffb74d : opt.isNew ? 0x66bb6a : 0x4fc3f7;
        const accentCss = '#' + accent.toString(16).padStart(6, '0');
        const label = opt.kind === 'passive' ? 'CHỈ SỐ' : opt.isNew ? 'VŨ KHÍ MỚI' : 'NÂNG CẤP VŨ KHÍ';
        const top = y - h / 2;

        const bg = this.add.rectangle(x, y, w, h, 0x1e1e3a, 1).setStrokeStyle(3, accent);
        this.add
            .text(x, top + 30, label, { fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: accentCss })
            .setOrigin(0.5);
        this.add
            .text(x, top + 80, opt.title, {
                fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
                align: 'center', wordWrap: { width: w - 30 },
            })
            .setOrigin(0.5);
        this.add
            .text(x, top + 122, `Cấp ${opt.level}`, { fontFamily: 'Arial', fontSize: '20px', color: '#ffd54f' })
            .setOrigin(0.5);
        this.add
            .text(x, top + 160, opt.desc, {
                fontFamily: 'Arial', fontSize: '18px', color: '#cfd8dc',
                align: 'center', wordWrap: { width: w - 40 },
            })
            .setOrigin(0.5, 0);
        this.add
            .text(x, top + h - 28, `[ ${index + 1} ]`, { fontFamily: 'Arial', fontSize: '18px', color: '#78909c' })
            .setOrigin(0.5);

        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(0x2a2a52));
        bg.on('pointerout', () => bg.setFillStyle(0x1e1e3a));
        bg.on('pointerdown', () => this.pick(opt, data));
    }

    private pick(opt: UpgradeOption, data: LevelUpData): void {
        if (this.picked) return;
        this.picked = true;

        const kb = this.input.keyboard!;
        for (const h of this.keyHandlers) kb.off(h.event, h.fn);
        this.keyHandlers = [];

        data.onPick(opt);
        this.scene.resume('Game');
        this.scene.stop();
    }
}