"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function ZombieGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    class TowerScene extends Phaser.Scene {
      private readonly worldWidth = 960;
      private readonly worldHeight = 4200;
      private readonly startY = 4064;

      private player!: Phaser.Physics.Arcade.Sprite;
      private platforms!: Phaser.Physics.Arcade.StaticGroup;
      private zombies!: Phaser.Physics.Arcade.Group;
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

      private spaceKey!: Phaser.Input.Keyboard.Key;
      private wKey!: Phaser.Input.Keyboard.Key;
      private aKey!: Phaser.Input.Keyboard.Key;
      private dKey!: Phaser.Input.Keyboard.Key;
      private attackKey!: Phaser.Input.Keyboard.Key;
      private attackKeyAlt!: Phaser.Input.Keyboard.Key;

      private hp = 100;
      private score = 0;
      private climbScore = 0;
      private killScore = 0;
      private highestY = this.startY;
      private lastDamageAt = 0;
      private lastAttackAt = Number.NEGATIVE_INFINITY;
      private isGameOver = false;
      private facingDirection: 1 | -1 = 1;

      private readonly attackCooldownMs = 450;
      private readonly attackRangeX = 94;
      private readonly attackRangeY = 60;

      private hpText!: Phaser.GameObjects.Text;
      private scoreText!: Phaser.GameObjects.Text;
      private floorText!: Phaser.GameObjects.Text;
      private hordeBand!: Phaser.GameObjects.Rectangle;
      private hordeY = 4185;

      private touchLeft = false;
      private touchRight = false;
      private touchJump = false;
      private touchAttack = false;
      private pointersAdded = false;

      constructor() {
        super("TowerScene");
      }

      // Phaser reuses the same Scene instance when scene.restart() is called.
      // Reset every run-specific value here, not only in class field initializers.
      init() {
        this.hp = 100;
        this.score = 0;
        this.climbScore = 0;
        this.killScore = 0;
        this.highestY = this.startY;
        this.lastDamageAt = 0;
        this.lastAttackAt = Number.NEGATIVE_INFINITY;
        this.isGameOver = false;
        this.facingDirection = 1;
        this.hordeY = 4185;

        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchAttack = false;
      }

      create() {
        // A previous run may have paused the Arcade Physics world at Game Over.
        this.physics.resume();
        const width = this.worldWidth;
        const height = this.worldHeight;

        // World and camera
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

        // Platforms: a reachable platform every 82 world pixels
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

        addPlatform(480, 4100, 960);

        const platformXs = [320, 460, 600, 740, 600, 460, 320, 180];
        for (let i = 1; i <= 43; i += 1) {
          const y = 4100 - i * 82;
          const x = platformXs[(i - 1) % platformXs.length];
          addPlatform(x, y, 230);
        }

        // Create a simple visible player texture once.
        if (!this.textures.exists("hero")) {
          const heroGraphics = this.make.graphics({
            x: 0,
            y: 0,
          });

          heroGraphics.fillStyle(0x38bdf8, 1);
          heroGraphics.fillRect(0, 0, 30, 44);
          heroGraphics.generateTexture("hero", 30, 44);
          heroGraphics.destroy();
        }

        // Player: one object for both rendering and physics.
        this.player = this.physics.add.sprite(180, this.startY, "hero");
        this.player.setDisplaySize(30, 44);
        this.player.setSize(30, 44);
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(850);
        this.player.setDepth(10);

        this.physics.add.collider(this.player, this.platforms);

        // Zombies
        this.zombies = this.physics.add.group();
        this.spawnZombie(740, 3740);
        this.spawnZombie(320, 3330);
        this.physics.add.collider(this.zombies, this.platforms);

        // Camera follows the player through the tower.
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Rising horde warning line below the player.
        this.hordeBand = this.add.rectangle(
          width / 2,
          this.hordeY,
          width,
          20,
          0xef4444,
          0.55
        );
        this.hordeBand.setDepth(5);

        // Keyboard controls.
        const keyboard = this.input.keyboard;
        if (!keyboard) {
          throw new Error("Keyboard input is unavailable.");
        }

        this.cursors = keyboard.createCursorKeys();
        this.spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.wKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.attackKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.attackKeyAlt = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Allow simultaneous touch inputs (e.g. move + jump/attack).
        // Do not add pointers again on every scene restart.
        if (!this.pointersAdded) {
          this.input.addPointer(2);
          this.pointersAdded = true;
        }

        // HUD stays fixed while the camera scrolls.
        this.hpText = this.add
          .text(20, 18, "HP: 100", {
            fontSize: "22px",
            color: "#86efac",
            fontStyle: "bold",
          })
          .setScrollFactor(0)
          .setDepth(1000);

        this.scoreText = this.add
          .text(20, 48, "SCORE: 0", {
            fontSize: "18px",
            color: "#ffffff",
          })
          .setScrollFactor(0)
          .setDepth(1000);

        this.floorText = this.add
          .text(20, 74, "FLOOR: 0", {
            fontSize: "18px",
            color: "#fbbf24",
          })
          .setScrollFactor(0)
          .setDepth(1000);

        this.add
          .text(width / 2, 18, "ZOMBIE TOWER", {
            fontSize: "24px",
            color: "#f87171",
            fontStyle: "bold",
          })
          .setOrigin(0.5, 0)
          .setScrollFactor(0)
          .setDepth(1000);

        this.add
          .text(width - 18, 52, "HORDE RISING", {
            fontSize: "14px",
            color: "#fca5a5",
            fontStyle: "bold",
          })
          .setOrigin(1, 0)
          .setScrollFactor(0)
          .setDepth(1000);

        // Mobile touch controls.
        const makeButton = (
          x: number,
          label: string,
          callback: (down: boolean) => void,
          buttonWidth = 80,
          fontSize = "28px"
        ) => {
          const button = this.add
            .rectangle(x, 475, buttonWidth, 62, 0x334155, 0.92)
            .setScrollFactor(0)
            .setDepth(1000)
            .setInteractive();

          this.add
            .text(x, 475, label, {
              fontSize,
              color: "#ffffff",
              fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001);

          button.on("pointerdown", () => callback(true));
          button.on("pointerup", () => callback(false));
          button.on("pointerupoutside", () => callback(false));
          button.on("pointerout", () => callback(false));
        };

        makeButton(90, "◀", (down) => (this.touchLeft = down));
        makeButton(185, "▶", (down) => (this.touchRight = down));
        makeButton(715, "ATTACK", (down) => {
          if (down) this.touchAttack = true;
        }, 118, "16px");
        makeButton(855, "JUMP", (down) => {
          if (down) this.touchJump = true;
        }, 110, "20px");
      }

      private spawnZombie(x: number, y: number) {
        const zombie = this.add.rectangle(x, y, 34, 40, 0x65a30d);
        this.physics.add.existing(zombie);

        const body = zombie.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(true);
        body.setGravityY(850);
        body.setCollideWorldBounds(true);

        // Each zombie takes two successful hits to defeat.
        zombie.setData("hp", 2);
        this.zombies.add(zombie);
      }

      private refreshScore() {
        const totalScore = this.climbScore + this.killScore;
        if (totalScore === this.score) return;

        this.score = totalScore;
        this.scoreText.setText(`SCORE: ${this.score}`);
      }

      private showFloatingText(
        x: number,
        y: number,
        message: string,
        color: string
      ) {
        const popup = this.add
          .text(x, y, message, {
            fontSize: "18px",
            color,
            fontStyle: "bold",
            stroke: "#111827",
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setDepth(30);

        this.tweens.add({
          targets: popup,
          y: y - 34,
          alpha: 0,
          duration: 500,
          ease: "Cubic.easeOut",
          onComplete: () => popup.destroy(),
        });
      }

      private performAttack() {
        if (this.isGameOver) return;

        const now = this.time.now;
        if (now - this.lastAttackAt < this.attackCooldownMs) return;

        this.lastAttackAt = now;

        // Visual melee swing in front of the player.
        const slashX = this.player.x + this.facingDirection * 43;
        const slash = this.add
          .rectangle(slashX, this.player.y + 2, 62, 34, 0xfde68a, 0.48)
          .setAngle(this.facingDirection === 1 ? -18 : 18)
          .setDepth(20);

        this.tweens.add({
          targets: slash,
          alpha: 0,
          scaleX: 0.55,
          duration: 130,
          onComplete: () => slash.destroy(),
        });

        // A single swing can hit every zombie inside the short front arc.
        const targets = [...this.zombies.getChildren()];
        for (const object of targets) {
          const zombie = object as Phaser.GameObjects.Rectangle;
          if (!zombie.active || !zombie.body) continue;

          const dx = zombie.x - this.player.x;
          const dy = zombie.y - this.player.y;
          const inFront = dx * this.facingDirection >= -8;
          const inRange =
            Math.abs(dx) <= this.attackRangeX &&
            Math.abs(dy) <= this.attackRangeY;

          if (inFront && inRange) {
            this.damageZombie(zombie);
          }
        }
      }

      private damageZombie(zombie: Phaser.GameObjects.Rectangle) {
        const remainingHp = Number(zombie.getData("hp") ?? 2) - 1;
        zombie.setData("hp", remainingHp);

        const zombieBody = zombie.body as Phaser.Physics.Arcade.Body;
        zombieBody.setVelocity(this.facingDirection * 250, -115);

        zombie.setFillStyle(remainingHp <= 1 ? 0xef4444 : 0xfacc15);
        this.showFloatingText(zombie.x, zombie.y - 32, "HIT!", "#fde68a");

        if (remainingHp <= 0) {
          const deathX = zombie.x;
          const deathY = zombie.y;

          this.zombies.remove(zombie, true, true);
          this.killScore += 50;
          this.refreshScore();
          this.showFloatingText(deathX, deathY - 30, "+50", "#86efac");
          return;
        }

        this.time.delayedCall(140, () => {
          if (zombie.active) {
            zombie.setFillStyle(0x65a30d);
          }
        });
      }

      private endGame(reason: string) {
        if (this.isGameOver) return;

        this.isGameOver = true;
        this.physics.pause();

        this.add
          .rectangle(480, 250, 440, 205, 0x080d16, 0.94)
          .setScrollFactor(0)
          .setDepth(2000);

        this.add
          .text(480, 190, "GAME OVER", {
            fontSize: "42px",
            color: "#f87171",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(2001);

        this.add
          .text(480, 237, reason, {
            fontSize: "17px",
            color: "#ffffff",
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(2001);

        this.add
          .text(480, 269, `FINAL SCORE: ${this.score}`, {
            fontSize: "18px",
            color: "#fbbf24",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(2001);

        const restart = this.add
          .rectangle(480, 325, 170, 48, 0x991b1b)
          .setScrollFactor(0)
          .setDepth(2001)
          .setInteractive();

        this.add
          .text(480, 325, "TRY AGAIN", {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(2002);

        restart.on("pointerup", () => {
          if (!this.isGameOver) return;
          restart.disableInteractive();
          this.scene.restart();
        });
      }

      update(_time: number, _delta: number) {
        if (!this.player?.body || this.isGameOver) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;

        const left =
          this.cursors.left.isDown || this.aKey.isDown || this.touchLeft;
        const right =
          this.cursors.right.isDown || this.dKey.isDown || this.touchRight;

        const jump =
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
          Phaser.Input.Keyboard.JustDown(this.wKey) ||
          this.touchJump;

        const attack =
          Phaser.Input.Keyboard.JustDown(this.attackKey) ||
          Phaser.Input.Keyboard.JustDown(this.attackKeyAlt) ||
          this.touchAttack;

        // Touch actions are one-shot inputs.
        this.touchJump = false;
        this.touchAttack = false;

        if (left && !right) {
          body.setVelocityX(-220);
          this.facingDirection = -1;
        } else if (right && !left) {
          body.setVelocityX(220);
          this.facingDirection = 1;
        } else {
          body.setVelocityX(0);
        }

        if (jump && body.blocked.down) {
          body.setVelocityY(-440);
        }

        if (attack) {
          this.performAttack();
        }

        // Track the highest point reached.
        if (this.player.y < this.highestY) {
          this.highestY = this.player.y;
        }

        const climbed = Math.max(0, this.startY - this.highestY);
        const nextClimbScore = Math.floor(climbed / 10);
        const floor = Math.floor(climbed / 82);

        if (nextClimbScore !== this.climbScore) {
          this.climbScore = nextClimbScore;
          this.floorText.setText(`FLOOR: ${floor}`);
          this.refreshScore();
        }

        // Zombies move toward the player on their current level.
        this.zombies.getChildren().forEach((object) => {
          const zombie = object as Phaser.GameObjects.Rectangle;
          if (!zombie.active || !zombie.body) return;

          const zombieBody = zombie.body as Phaser.Physics.Arcade.Body;
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

        // Horde slowly rises from below.
        this.hordeY -= (25 * _delta) / 1000;
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
      parent,
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
