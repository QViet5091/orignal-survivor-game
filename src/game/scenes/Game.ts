import { GameObjects, Input, Scene } from 'phaser';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawner';
import { GemSystem } from '../systems/GemSystem';
import { DamageNumbers } from '../systems/DamageNumbers';
import { CombatSystem } from '../systems/CombatSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import type { WeaponId } from '../data/weapons';

// Phím debug 1-4: thêm vũ khí hoặc nâng cấp. Giai đoạn 5 sẽ thay bằng màn hình chọn nâng cấp khi lên cấp.
const WEAPON_KEYS: { key: string; id: WeaponId }[] = [
    { key: 'ONE', id: 'magicBolt' },
    { key: 'TWO', id: 'orbitBlade' },
    { key: 'THREE', id: 'aura' },
    { key: 'FOUR', id: 'axe' },
];

export class Game extends Scene {
    private player!: Player;
    private spawner!: EnemySpawner;
    private gems!: GemSystem;
    private numbers!: DamageNumbers;
    private combat!: CombatSystem;
    private weapons!: WeaponSystem;
    private ground!: GameObjects.TileSprite;
    private debugText!: GameObjects.Text;
    private keyGod!: Input.Keyboard.Key;
    private weaponKeys: { key: Input.Keyboard.Key; id: WeaponId }[] = [];

    constructor() {
        super('Game');
    }

    create() {
        const { width, height } = this.scale;

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
        this.weapons.addOrUpgrade('magicBolt'); // vũ khí khởi đầu

        // Camera đi theo nhân vật, hơi trễ một chút cho mượt
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        const kb = this.input.keyboard!;
        this.keyGod = kb.addKey('G');
        this.weaponKeys = WEAPON_KEYS.map((w) => ({ key: kb.addKey(w.key), id: w.id }));

        this.debugText = this.add
            .text(8, 8, '', {
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
        this.player.updateEffects(time);

        // Cuộn họa tiết nền theo camera để tạo cảm giác nền vô tận
        const cam = this.cameras.main;
        this.ground.tilePositionX = cam.scrollX;
        this.ground.tilePositionY = cam.scrollY;

        // Phím debug (sẽ bỏ khi có màn hình chọn nâng cấp và menu thật)
        if (Input.Keyboard.JustDown(this.keyGod)) {
            this.player.invincible = !this.player.invincible;
        }
        for (const w of this.weaponKeys) {
            if (Input.Keyboard.JustDown(w.key)) this.weapons.addOrUpgrade(w.id);
        }

        // Tạm thời: chết thì chơi lại ngay. Màn hình thua thật làm ở Giai đoạn 6.
        if (this.player.isDead) {
            this.scene.restart();
            return;
        }

        const owned = this.weapons.owned.map((w) => `${w.def.name} Lv${w.level}`).join(', ');
        const fps = Math.round(this.game.loop.actualFps);
        this.debugText.setText(
            `FPS: ${fps}\n` +
                `HP: ${this.player.hp}/${this.player.maxHp}${this.player.invincible ? '  [BẤT TỬ]' : ''}\n` +
                `Quái: ${this.spawner.activeCount}  Giết: ${this.combat.kills}  Gem: ${this.gems.activeCount}\n` +
                `Vũ khí: ${owned}\n` +
                `1-4: thêm/nâng cấp vũ khí  G: bất tử`
        );
    }
}