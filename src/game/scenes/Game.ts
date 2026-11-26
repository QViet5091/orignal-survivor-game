import { GameObjects, Input, Scene } from 'phaser';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawner';
import { GemSystem } from '../systems/GemSystem';
import { DamageNumbers } from '../systems/DamageNumbers';
import { CombatSystem } from '../systems/CombatSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import type { UpgradeOption } from '../data/upgrades';
import type { LevelUpData } from './LevelUp';

const OPTIONS_PER_LEVEL = 3;

export class Game extends Scene {
    private player!: Player;
    private spawner!: EnemySpawner;
    private gems!: GemSystem;
    private numbers!: DamageNumbers;
    private combat!: CombatSystem;
    private weapons!: WeaponSystem;
    private progression!: ProgressionSystem;
    private upgrades!: UpgradeSystem;
    private ground!: GameObjects.TileSprite;
    private debugText!: GameObjects.Text;
    private xpBarFill!: GameObjects.Rectangle;
    private levelText!: GameObjects.Text;
    private keyGod!: Input.Keyboard.Key;
    private levelUpOpen = false;

    constructor() {
        super('Game');
    }

    create() {
        const { width, height } = this.scale;
        this.levelUpOpen = false;

        // Nền: TileSprite đứng yên theo màn hình, ta cuộn họa tiết bên trong nó
        this.ground = this.add
            .tileSprite(0, 0, width, height, 'ground')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(-100);

        this.player = new Player(this, 0, 0);
        this.spawner = new EnemySpawner(this);
        this.gems = new GemSystem(this);
        this.numbers = new DamageNumbers(this);
        this.combat = new CombatSystem(this, this.spawner, this.gems, this.numbers);
        this.weapons = new WeaponSystem(this, this.player, this.spawner, this.combat);
        this.progression = new ProgressionSystem();
        this.upgrades = new UpgradeSystem(this.player, this.weapons);
        this.weapons.addOrUpgrade('magicBolt'); // vũ khí khởi đầu

        // Camera đi theo nhân vật, hơi trễ một chút cho mượt
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        this.keyGod = this.input.keyboard!.addKey('G');

        // Thanh XP tạm ở đầu màn hình (Giai đoạn 6 sẽ chuyển vào scene UI)
        this.add.rectangle(0, 0, width, 14, 0x000000, 0.55)
            .setOrigin(0).setScrollFactor(0).setDepth(1000);
        this.xpBarFill = this.add.rectangle(0, 0, 0, 14, 0x4dd0e1)
            .setOrigin(0).setScrollFactor(0).setDepth(1001);
        this.levelText = this.add
            .text(width / 2, 18, 'Lv 1', {
                fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
                color: '#ffffff', stroke: '#000000', strokeThickness: 4,
            })
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(1001);

        this.debugText = this.add
            .text(8, 44, '', {
                fontFamily: 'Consolas, monospace',
                fontSize: '16px',
                color: '#9be15d',
            })
            .setScrollFactor(0)
            .setDepth(1000);
    }

    update(time: number, delta: number) {
        const dt = Math.min(delta, 50); // chặn bước thời gian quá lớn (ví dụ khi đổi tab)

        this.player.move(dt);
        this.spawner.update(dt, this.player, time);
        this.numbers.update(dt);
        this.weapons.update(dt, time);
        this.gems.update(dt, this.player, this.progression);
        this.player.updateEffects(time);

        // Cuộn họa tiết nền theo camera để tạo cảm giác nền vô tận
        const cam = this.cameras.main;
        this.ground.tilePositionX = cam.scrollX;
        this.ground.tilePositionY = cam.scrollY;

        // Phím debug (sẽ bỏ khi có menu thật)
        if (Input.Keyboard.JustDown(this.keyGod)) {
            this.player.invincible = !this.player.invincible;
        }

        // Tạm thời: chết thì chơi lại ngay. Màn hình thua thật làm ở Giai đoạn 6.
        if (this.player.isDead) {
            this.scene.restart();
            return;
        }

        // Thanh XP và cấp độ
        this.xpBarFill.width = this.scale.width * this.progression.ratio;
        this.levelText.setText(`Lv ${this.progression.level}`);

        this.refreshDebugText();
        this.tryLevelUp();
    }

    /** Nếu có lần lên cấp chưa xử lý: tạm dừng game và mở màn hình chọn nâng cấp. */
    private tryLevelUp(): void {
        if (this.levelUpOpen || this.progression.pendingLevelUps <= 0) return;

        const options = this.upgrades.rollOptions(OPTIONS_PER_LEVEL);
        if (options.length === 0) {
            // Đã nâng tối đa mọi thứ: bỏ qua các lần lên cấp còn lại
            this.progression.pendingLevelUps = 0;
            return;
        }

        this.levelUpOpen = true;
        const data: LevelUpData = {
            options,
            level: this.progression.level,
            onPick: (option: UpgradeOption) => {
                this.upgrades.apply(option);
                this.progression.pendingLevelUps--;
                this.levelUpOpen = false;
            },
        };
        this.scene.pause();
        this.scene.launch('LevelUp', data);
    }

    private refreshDebugText(): void {
        const owned = this.weapons.owned.map((w) => `${w.def.name} Lv${w.level}`).join(', ');
        const fps = Math.round(this.game.loop.actualFps);
        const p = this.player;
        this.debugText.setText(
            `FPS: ${fps}\n` +
                `HP: ${Math.round(p.hp)}/${p.maxHp}${p.invincible ? '  [BẤT TỬ]' : ''}\n` +
                `XP: ${this.progression.xp}/${this.progression.xpToNext}\n` +
                `Quái: ${this.spawner.activeCount}  Giết: ${this.combat.kills}  Gem: ${this.gems.activeCount}\n` +
                `Vũ khí: ${owned}\n` +
                `Chỉ số: ${this.upgrades.passiveSummary}\n` +
                `G: bất tử`
        );
    }
}