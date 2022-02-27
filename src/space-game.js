import Phaser from "phaser";
import shipPath from './vendor/assets/images/ship.png'
import bgPath from './vendor/assets/images/space.jpeg'
import asteroidsPath from './vendor/assets/images/asteroids.png'
import GameOver from "./game-over";


class SpaceStretchGame extends Phaser.Scene {
    constructor() {
        super({ key: 'space-stretch' });
    }

    init(data) { }

    preload() {
        this.load.image('asteroids', asteroidsPath);
        this.load.image('ship', shipPath);
        this.load.image('bg', bgPath);
    }

    create() {
        this.lastMovetime = Date.now()
        this.score = 0
        this.cursors = this.input.keyboard.createCursorKeys()
        this.landingAcceleration = 2
        const asteroidScale = 1
        const playerScale = 1.25

        // background
        this.bg = this.add.image(config.width / 2, config.height / 2, 'bg');
        // this.bg.setDisplaySize(config.width, config.height);

        // openingText
        const textStyle = {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Orbitron'
        }
        this.add.text(
            5,
            5,
            '🚀 Land on asteroids 🪨 and crush them 💥',
            textStyle);

        // Add the scoreboard in
        this.scoreBoard = this.add.text(
            this.physics.world.bounds.width - 145,
            5,
            "👨‍🚀 SCORE: 0",
            textStyle);

        const asteroidGroupProps = {
            immovable: true,
            allowGravity: false,
        }
        const asteroids = this.physics.add.group(asteroidGroupProps)
        const worldWidth = this.physics.world.bounds.width
        const worldHeight = this.physics.world.bounds.height
        this.placedAsteroidPlatforms = 0
        const placeAsteroids = () => {
            const yOffset = 32 * 1.5
            const xOffset = worldWidth * .1
            const step = 100
            let asteroidYPos = yOffset + 45
            for (let i = 0; i < maxAsteroidPlatformsCnt; i++) {
                if (asteroidYPos < worldHeight - (yOffset + 10)) {
                    // add biased randomnes to keep some tiles on left some on right
                    let x = 0
                    if (i % 2 == 0) {
                        // bias towards left
                        x = Phaser.Math.Between(xOffset, worldWidth / 2.3)
                    } else {
                        // bias towards right
                        x = Phaser.Math.Between(worldWidth / 1.3, worldWidth - xOffset)
                    }
                    const asteroidTile = asteroids.create(x, asteroidYPos, 'asteroids')
                    asteroidTile.setScale(asteroidScale)
                    asteroidYPos += step
                    this.placedAsteroidPlatforms += 1
                }
            }
        }

        placeAsteroids()

        const player = this.player = this.physics.add.sprite(
            Phaser.Math.Between(0, this.physics.world.bounds.width - 80),
            this.physics.world.bounds.height,
            'ship',
        );
        player.setScale(playerScale)
        player.setCollideWorldBounds(true);

        const onCollide = (avatar, asteroids) => {
            if (avatar.body.onFloor()) {
                this.score += 1
                asteroids.setTint("0x33dd33")
                asteroids.setImmovable(false)
                asteroids.setVelocityY(600)
                this.scoreBoard.setText(`👨‍🚀 Score: ${this.score}`)
                this.scoreBoard.setStyle(textStyle)
            }
        }

        this.physics.add.collider(player, asteroids, onCollide, null, this);
    }

    update(time, delta) {
        // manage events for neck stretches
        const player = this.player
        this.handlePlayerMoves(player)
    }

    handlePlayerMoves() {
        // check if won
        const player = this.player
        if (this.score == this.placedAsteroidPlatforms) {
            this.scene.start('you-won')
            return
        }
        player.body.setVelocityX(0);
        player.body.setVelocityY(0);
        const now = Date.now()
        const timeDiff = (now - this.lastMovetime) / 1000
        // deffer gravity from in move state
        if (timeDiff > 0.8) {
            if (!window.gameInMove()) {
                player.body.setAllowGravity(true)
                player.body.setVelocityY(playerSpeed)
            }
        }
        // if not in move for longer start accelerating gravity
        if (timeDiff > 3) {
            if (!window.gameInMove()) {
                player.body.setVelocityY(playerSpeed + this.landingAcceleration)
                this.landingAcceleration += 1.2
            }
        }
        if (window.gameLeftMove() || this.cursors.left.isDown) {
            player.body.setVelocityX((playerSpeed * 0.8) * -1);
            player.body.setAllowGravity(false)
            this.lastMovetime = now
        } else if (window.gameRightMove() || this.cursors.right.isDown) {
            player.body.setVelocityX(playerSpeed * 0.8);
            player.body.setAllowGravity(false)
            this.lastMovetime = now
        } else if (window.gameUpMove() || this.cursors.up.isDown) {
            player.body.setVelocityY((playerSpeed) * -1);
            player.body.setAllowGravity(false)
            this.lastMovetime = now
        }
    }
}


const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile
const gravity = 750
const maxAsteroidPlatformsCnt = 7
const playerSpeed = 100

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
    scene: [SpaceStretchGame, GameOver],
    audio: {
        noAudio: true
    },
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
        }
    },
    fps: 30
}

const game = new Phaser.Game(config)
