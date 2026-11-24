import { GameObjects, Input, Scene } from 'phaser';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawer';

export class Game extends Scene {
    private player!: Player;
    private spawner!: EnemySpawner;
    private ground!: GameObjects.TileSprite;
    private debugText!: GameObjects.Text;
    private keySpace!: Input.Keyboard.Key;
    private keyGod!: Input.Keyboard.Key;

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

        // Camera đi theo nhân vật, hơi trễ một chút cho mượt
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        const kb = this.input.keyboard!;
        this.keySpace = kb.addKey('SPACE');
        this.keyGod = kb.addKey('G');

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
        this.player.updateEffects(time);

        // Cuộn họa tiết nền theo camera để tạo cảm giác nền vô tận
        const cam = this.cameras.main;
        this.ground.tilePositionX = cam.scrollX;
        this.ground.tilePositionY = cam.scrollY;

        // Phím debug (sẽ bỏ khi có vũ khí và menu thật)
        if (Input.Keyboard.JustDown(this.keyGod)) {
            this.player.invincible = !this.player.invincible;
        }
        if (Input.Keyboard.JustDown(this.keySpace)) {
            this.spawner.damageInRadius(this.player.x, this.player.y, 150, 10, time);
        }

        // Tạm thời: chết thì chơi lại ngay. Màn hình thua thật làm ở Giai đoạn 6.
        if (this.player.isDead) {
            this.scene.restart();
            return;
        }

        const fps = Math.round(this.game.loop.actualFps);
        this.debugText.setText(
            `FPS: ${fps}\n` +
                `HP: ${this.player.hp}/${this.player.maxHp}${this.player.invincible ? '  [BẤT TỬ]' : ''}\n` +
                `Quái: ${this.spawner.activeCount}\n` +
                `X: ${Math.round(this.player.x)}  Y: ${Math.round(this.player.y)}\n` +
                `SPACE: đánh quái gần (thử)  G: bất tử`
        );
    }
}