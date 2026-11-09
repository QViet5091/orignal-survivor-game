import { GameObjects, Scene } from 'phaser';
import { Player } from '../entities/Player';

export class Game extends Scene {
    private player!: Player;
    private ground!: GameObjects.TileSprite;
    private debugText!: GameObjects.Text;

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

        // Camera đi theo nhân vật, hơi trễ một chút cho mượt
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        this.debugText = this.add
            .text(8, 8, '', {
                fontFamily: 'Consolas, monospace',
                fontSize: '16px',
                color: '#9be15d',
            })
            .setScrollFactor(0)
            .setDepth(1000);
    }

    update(_time: number, delta: number) {
        this.player.move(delta);

        // Cuộn họa tiết nền theo camera để tạo cảm giác nền vô tận
        const cam = this.cameras.main;
        this.ground.tilePositionX = cam.scrollX;
        this.ground.tilePositionY = cam.scrollY;

        const fps = Math.round(this.game.loop.actualFps);
        this.debugText.setText(
            `FPS: ${fps}\nX: ${Math.round(this.player.x)}  Y: ${Math.round(this.player.y)}`
        );
    }
}