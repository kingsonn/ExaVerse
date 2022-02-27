import Phaser from "phaser";
import hotDogPath from './vendor/assets/images/hotdog.png'
import shipPath from './vendor/assets/images/car90.png'
import bgPath from './vendor/assets/images/concrete2.jpeg'


const playerNgSpeed = 30
const playerSpeed = 80

class SpaceStretch2Game extends Phaser.Scene {
    constructor() {
        super({ key: 'space-stretch-2' });
    }

    preload() {
        this.load.image('hotdog', hotDogPath);
        this.load.image('ship', shipPath);
        this.load.image('bg', bgPath);
    }

    create() {
        // background
        this.bg = this.add.image(config.width / 2, config.height / 2, 'bg');
        this.bg.setDisplaySize(config.width, config.height);

        const playerScale = 1.4
        const hotDogScale = 0.3

        this.score = 0
        this.cursors = this.input.keyboard.createCursorKeys();
        const textSytle = {
            fontFamily: 'Orbitron',
            fontSize: '25px',
            fill: '#F2B307'
        }
        // openingText
        this.add.text(
            5,
            5,
            'GET HOTDOGS 🌭',
            textSytle
        );

        //Add the scoreboard in
        this.scoreBoard = this.add.text(
            this.physics.world.bounds.width - 150,
            0,
            "SCORE: 0", textSytle);

        this.physics.world.setBoundsCollision(true, true, true, true)

        this.player = this.physics.add.sprite(
            this.physics.world.bounds.width / 2,
            this.physics.world.bounds.height / 2,
            'ship',
        );

        this.player.setScale(playerScale)
        this.player.setCollideWorldBounds(true);

        const hotdogsGroup = this.physics.add.group({
            key: 'hotdog',
            quantity: 15,
            collideWorldBounds: true,
        })
        hotdogsGroup.getChildren().forEach(dog => dog.setScale(hotDogScale))
        Phaser.Actions.RandomRectangle(hotdogsGroup.getChildren(), this.physics.world.bounds)

        this.physics.add.overlap(this.player, hotdogsGroup, collectBalls, null, this)
        function collectBalls(avatar, ball) {
            ball.destroy()
            this.score += 1
            this.scoreBoard.setText(`SCORE: ${this.score}`)
        }
    }

    update(time, delta) {
        this.handlePlayerMoves()
    }

    handlePlayerMoves() {
        this.player.body.setAngularVelocity(0);
        this.player.body.setVelocity(0, 0);
        this.player.body.setAcceleration(0)

        if (window.gameUpMove() || this.cursors.up.isDown) {
            const ng = this.player.angle
            const vec = this.physics.velocityFromAngle(ng, playerSpeed)
            this.player.body.setVelocity(vec.x, vec.y);
        } else if (window.gameLeftMove() || this.cursors.left.isDown) {
            this.player.body.setAngularVelocity(playerNgSpeed * -1);
        } else if (window.gameRightMove() || this.cursors.right.isDown) {
            this.player.body.setAngularVelocity(playerNgSpeed);
        }
    }
}

const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
    scene: [SpaceStretch2Game],
    audio: {
        noAudio: true
    },
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    },
    fps: 30
}

const game = new Phaser.Game(config)

