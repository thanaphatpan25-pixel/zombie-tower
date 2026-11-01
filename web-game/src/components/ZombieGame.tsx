"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function ZombieGame() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        class TowerScene extends Phaser.Scene {
            private player!: Phaser.Physics.Arcade.Sprite;
            private platforms!: Phaser.Physics.Arcade.StaticGroup;
            private zombies!: Phaser.Physics.Arcade.Group;
            private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
            private hp = 100;
            private score = 0;
            private hpText!: Phaser.GameObjects.Text;
            private scoreText!: Phaser.GameObjects.Text;
            private touchLeft = false;
            private touchRight = false;
            private touchJump = false;

            constructor() {
                super("TowerScene");
            }

            create() {
                const width = 960;
                const height = 540;

                this.cameras.main.setBackgroundColor("#111827");

                // อาคารร้าง
                const graphics = this.add.graphics();
                graphics.fillStyle(0x202c3b, 1);
                graphics.fillRect(0, 0, width, height);

                graphics.fillStyle(0x354152, 1);
                for (let x = 30; x < width; x += 120) {
                    graphics.fillRect(x, 80, 65, 18);
                    graphics.fillRect(x, 180, 65, 18);
                }

                // แพลตฟอร์ม
                this.platforms = this.physics.add.staticGroup();

                const addPlatform = (x: number, y: number, w: number) => {
                    const platform = this.add.rectangle(
                        x, y, w, 24, 0x657184
                    );
                    this.physics.add.existing(platform, true);
                    this.platforms.add(platform);
                };

                addPlatform(480, 520, 960);
                addPlatform(180, 420, 250);
                addPlatform(520, 330, 250);
                addPlatform(790, 235, 220);
                addPlatform(380, 145, 230);


                // Player: สร้างภาพตัวละครและผูกเข้ากับ Physics Sprite
                const heroGraphics = this.make.graphics({
                    x: 0,
                    y: 0,
                    add: false,
                });

                heroGraphics.fillStyle(0x38bdf8, 1);
                heroGraphics.fillRect(0, 0, 30, 44);
                heroGraphics.generateTexture("hero", 30, 44);
                heroGraphics.destroy();

                // ตัวละครจริงที่มองเห็นและควบคุมได้
                this.player = this.physics.add.sprite(
                    100,
                    450,
                    "hero"
                );

                this.player.setDisplaySize(30, 44);
                this.player.setSize(30, 44);
                this.player.setCollideWorldBounds(true);
                this.player.setGravityY(850);
                this.player.setDepth(10);


                // ซอมบี้
                this.zombies = this.physics.add.group();
                this.spawnZombie(650, 180);
                this.spawnZombie(800, 180);

                this.physics.add.collider(this.player, this.platforms);
                this.physics.add.collider(this.zombies, this.platforms);

                this.cursors = this.input.keyboard!.createCursorKeys();

                this.hpText = this.add.text(20, 18, "HP: 100", {
                    fontSize: "22px",
                    color: "#86efac",
                    fontStyle: "bold",
                }).setScrollFactor(0);

                this.scoreText = this.add.text(20, 48, "SCORE: 0", {
                    fontSize: "18px",
                    color: "#ffffff",
                }).setScrollFactor(0);

                this.add.text(480, 20, "ZOMBIE TOWER", {
                    fontSize: "24px",
                    color: "#f87171",
                    fontStyle: "bold",
                }).setOrigin(0.5, 0);

                // ปุ่มสัมผัสสำหรับมือถือ: ซ้าย ขวา และกระโดด
                const makeButton = (
                    x: number,
                    label: string,
                    callback: (down: boolean) => void
                ) => {
                    const button = this.add.rectangle(
                        x, 475, 80, 62, 0x334155, 0.9
                    ).setScrollFactor(0).setInteractive();

                    this.add.text(x, 475, label, {
                        fontSize: "28px",
                        color: "#ffffff",
                    }).setOrigin(0.5).setScrollFactor(0);

                    button.on("pointerdown", () => callback(true));
                    button.on("pointerup", () => callback(false));
                    button.on("pointerout", () => callback(false));
                };

                makeButton(90, "◀", (v) => this.touchLeft = v);
                makeButton(185, "▶", (v) => this.touchRight = v);
                makeButton(850, "JUMP", (v) => this.touchJump = v);

                this.physics.world.setBounds(0, 0, width, height);
                this.cameras.main.setBounds(0, 0, width, height);
            }

            private spawnZombie(x: number, y: number) {
                const zombie = this.add.rectangle(
                    x, y, 34, 40, 0x65a30d
                );
                this.physics.add.existing(zombie);
                const body = zombie.body as Phaser.Physics.Arcade.Body;
                body.setAllowGravity(true);
                body.setGravityY(850);
                body.setCollideWorldBounds(true);
                this.zombies.add(zombie);
            }

            update() {
                if (!this.player?.body) return;

                const body = this.player.body as Phaser.Physics.Arcade.Body;
                const left = this.cursors.left.isDown || this.touchLeft;
                const right = this.cursors.right.isDown || this.touchRight;
                const jump = Phaser.Input.Keyboard.JustDown(
                    this.cursors.up
                ) || this.cursors.space.isDown || this.touchJump;

                if (left) body.setVelocityX(-220);
                else if (right) body.setVelocityX(220);
                else body.setVelocityX(0);

                if (jump && body.blocked.down) {
                    body.setVelocityY(-440);
                }

                this.zombies.getChildren().forEach((object) => {
                    const zombie = object as Phaser.GameObjects.Rectangle;
                    const zombieBody = zombie.body as Phaser.Physics.Arcade.Body;
                    if (!zombieBody) return;

                    const direction = this.player.x < zombie.x ? -1 : 1;
                    zombieBody.setVelocityX(direction * 55);

                    if (
                        Phaser.Math.Distance.Between(
                            this.player.x, this.player.y, zombie.x, zombie.y
                        ) < 36
                    ) {
                        this.hp = Math.max(0, this.hp - 0.1);
                        this.hpText.setText(`HP: ${Math.ceil(this.hp)}`);
                    }
                });

                if (this.player.x > 900) {
                    this.score += 10;
                    this.scoreText.setText(`SCORE: ${this.score}`);
                    this.player.setX(50);
                }

                if (this.hp <= 0) {
                    this.physics.pause();
                    this.add.text(480, 250, "GAME OVER", {
                        fontSize: "48px",
                        color: "#f87171",
                        fontStyle: "bold",
                    }).setOrigin(0.5);
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