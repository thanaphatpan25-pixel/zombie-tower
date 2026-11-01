"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function ZombieGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    class TowerScene extends Phaser.Scene {
      private readonly worldWidth = 960;
      private readonly worldHeight = 4200;
      private readonly startY = 4064;

      private player!: Phaser.Physics.Arcade.Sprite;
      private platforms!: Phaser.Physics.Arcade.StaticGroup;
      private zombies!: Phaser.Physics.Arcade.Group;
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      private spaceKey!: Phaser.Input.Keyboard.Key;

      private hp = 100;
      private score = 0;
      private highestY = this.startY;
      private lastDamageAt = 0;
      private isGameOver = false;

      private hpText!: Phaser.GameObjects.Text;
      private scoreText!: Phaser.GameObjects.Text;
      private floorText!: Phaser.GameObjects.Text;
      private hordeBand!: Phaser.GameObjects.Rectangle;
      private hordeY = 4185;

      private touchLeft = false;
      private touchRight = false;
      private touchJump = false;

      constructor() {
        super("TowerScene");
      }

      create() {
        const width = this.worldWidth;
        const height = this.worldHeight;

        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.setBackgroundColor("#111827");

        // Background: tall abandoned tower
        const background = this.add.graphics();
        background.fillStyle(0x111827, 1);
        background.fillRect(0, 0, width, height);
        background.fillStyle(0x202c3b, 1);
        background.fillRect(28, 0, 904, height);
        background.fillStyle(0x354152, 1);

        for (let y = 55; y < height; y += 150) {
          for (let x = 65; x < width - 70; x += 145) {
            background.fillRect(x, y, 62, 48);
          }
          background.fillStyle(0x263445, 1);
          background.fillRect(28, y + 105, 904, 5);
          background.fillStyle(0x354152, 1);
        }

        // Platforms: one reachable platform every 82 world pixels
        this.platforms = this.physics.add.staticGroup();

        const addPlatform = (x: number, y: number, platformWidth: number) => {
          const platform = this.add.rectangle(
            x,
            y,
            platformWidth,
            24,
            0x657184
          );
          this.physics.add.existing(platform, true);
          this.platforms.add(platform);
        };

        // Ground floor
        addPlatform(480, 4100, 960);

        // Stagger platforms to create a vertical climbing route
        const platformXs = [320, 460, 600, 740, 600, 460, 320, 180];
        for (let i = 1; i <= 43; i++) {
          const y = 4100 - i * 82;
          const x = platformXs[(i - 1) % platformXs.length];
          addPlatform(x, y, 230);
        }

        // Create a simple visible player texture only once
        if (!this.textures.exists("hero")) {
          const heroGraphics = this.make.graphics({
            x: 0,
            y: 0,
            add: false,
          });
          heroGraphics.fillStyle(0x38bdf8, 1);
          heroGraphics.fillRect(0, 0, 30, 44);
          heroGraphics.generateTexture("hero", 30, 44);
          heroGraphics.destroy();
        }

        // Player: one object for both rendering and physics
        this.player = this.physics.add.sprite(180, this.startY, "hero");
        this.player.setDisplaySize(30, 44);
        this.player.setSize(30, 44);
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(850);
        this.player.setDepth(10);

        this.physics.add.collider(this.player, this.platforms);

        // Zombies placed on higher floors; they chase horizontally
        this.zombies = this.physics.add.group();
        this.spawnZombie(740, 3740);
        this.spawnZombie(320, 3330);
        this.physics.add.collider(this.zombies, this.platforms);

        // Camera follows the player through the tower
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Rising horde warning line below the player
        this.hordeBand = this.add.rectangle(
          width / 2,
          this.hordeY,
          width,
          20,
          0xef4444,
          0.55
        );
        this.hordeBand.setDepth(5);

        // Keyboard controls
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.input.keyboard!.addKey(
          Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // HUD stays fixed while the camera scrolls
        this.hpText = this.add.text(20, 18, "HP: 100", {
          fontSize: "22px",
          color: "#86efac",
          fontStyle: "bold",
        }).setScrollFactor(0).setDepth(1000);

        this.scoreText = this.add.text(20, 48, "SCORE: 0", {
          fontSize: "18px",
          color: "#ffffff",
        }).setScrollFactor(0).setDepth(1000);

        this.floorText = this.add.text(20, 74, "FLOOR: 0", {
          fontSize: "18px",
          color: "#fbbf24",
        }).setScrollFactor(0).setDepth(1000);

        this.add.text(width / 2, 18, "ZOMBIE TOWER", {
          fontSize: "24px",
          color: "#f87171",
          fontStyle: "bold",
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

        this.add.text(width - 18, 52, "HORDE RISING", {
          fontSize: "14px",
          color: "#fca5a5",
          fontStyle: "bold",
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

        // Mobile touch controls
        const makeButton = (
          x: number,
          label: string,
          callback: (down: boolean) => void,
          buttonWidth = 80
        ) => {
          const button = this.add.rectangle(
            x,
            475,
            buttonWidth,
            62,
            0x334155,
            0.92
          );
          button.setScrollFactor(0).setDepth(1000).setInteractive();

          this.add.text(x, 475, label, {
            fontSize: label === "JUMP" ? "20px" : "28px",
            color: "#ffffff",
            fontStyle: "bold",
          }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

          button.on("pointerdown", () => callback(true));
          button.on("pointerup", () => callback(false));
          button.on("pointerupoutside", () => callback(false));
          button.on("pointerout", () => callback(false));
        };

        makeButton(90, "◀", (down) => (this.touchLeft = down));
        makeButton(185, "▶", (down) => (this.touchRight = down));
        makeButton(850, "JUMP", (down) => (this.touchJump = down), 110);
      }

      private spawnZombie(x: number, y: number) {
        const zombie = this.add.rectangle(x, y, 34, 40, 0x65a30d);
        this.physics.add.existing(zombie);

        const body = zombie.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(true);
        body.setGravityY(850);
        body.setCollideWorldBounds(true);

        this.zombies.add(zombie);
      }

      private endGame(reason: string) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.physics.pause();

        this.add.rectangle(480, 250, 420, 190, 0x080d16, 0.92)
          .setScrollFactor(0)
          .setDepth(2000);

        this.add.text(480, 205, "GAME OVER", {
          fontSize: "42px",
          color: "#f87171",
          fontStyle: "bold",
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

        this.add.text(480, 250, reason, {
          fontSize: "18px",
          color: "#ffffff",
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

        const restart = this.add.rectangle(480, 310, 170, 48, 0x991b1b)
          .setScrollFactor(0)
          .setDepth(2001)
          .setInteractive();

        this.add.text(480, 310, "TRY AGAIN", {
          fontSize: "20px",
          color: "#ffffff",
          fontStyle: "bold",
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);

        restart.on("pointerdown", () => this.scene.restart());
      }

      update(_time: number, delta: number) {
        if (!this.player?.body || this.isGameOver) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const left = this.cursors.left.isDown || this.touchLeft;
        const right = this.cursors.right.isDown || this.touchRight;

        const jump =
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
          this.touchJump;

        // Mobile jump is a one-shot action, not auto-jump while held
        this.touchJump = false;

        if (left && !right) {
          body.setVelocityX(-220);
        } else if (right && !left) {
          body.setVelocityX(220);
        } else {
          body.setVelocityX(0);
        }

        if (jump && body.blocked.down) {
          body.setVelocityY(-440);
        }

        // Track the highest point reached
        if (this.player.y < this.highestY) {
          this.highestY = this.player.y;
        }

        const climbed = Math.max(0, this.startY - this.highestY);
        const newScore = Math.floor(climbed / 10);
        const floor = Math.floor(climbed / 82);

        if (newScore !== this.score) {
          this.score = newScore;
          this.scoreText.setText(`SCORE: ${this.score}`);
          this.floorText.setText(`FLOOR: ${floor}`);
        }

        // Zombies move toward the player on their current level
        this.zombies.getChildren().forEach((object) => {
          const zombie = object as Phaser.GameObjects.Rectangle;
          const zombieBody = zombie.body as Phaser.Physics.Arcade.Body;
          if (!zombieBody) return;

          const direction = Math.sign(this.player.x - zombie.x);
          zombieBody.setVelocityX(direction * 55);

          const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            zombie.x,
            zombie.y
          );

          if (distance < 36 && this.time.now - this.lastDamageAt > 800) {
            this.hp = Math.max(0, this.hp - 10);
            this.lastDamageAt = this.time.now;
            this.hpText.setText(`HP: ${this.hp}`);
          }
        });

        // Horde slowly rises from below
        this.hordeY -= (25 * delta) / 1000;
        this.hordeBand.setY(this.hordeY);

        if (this.hp <= 0) {
          this.endGame("The zombies got you.");
          return;
        }

        if (this.player.y + 22 >= this.hordeY) {
          this.endGame("The horde caught up with you.");
        }
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      parent: containerRef.current,
      backgroundColor: "#111827",
      physics: {
        default: "arcade",
        arcade: { debug: false },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: TowerScene,
    });

    return () => game.destroy(true);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        touchAction: "none",
      }}
    />
  );
}
