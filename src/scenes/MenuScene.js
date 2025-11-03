export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('menuBg', 'assets/menu/background.png');
        this.load.image('sky', 'assets/fondo.png');
        // Intro splash de Motocle
        this.load.image('motocle_like', 'assets/motocle/motocle_like.png');
        this.load.spritesheet('ninja-idle', 'assets/player/Idle (32x32).png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const { width, height } = this.sys.game.config;
        console.log('🎮 MenuScene iniciado (mostrando intro si está disponible)');

        // Mostrar pantalla de intro primero. Si la imagen no está disponible, inicializar el menú directo.
        try {
            if (this.textures.exists('motocle_like')) {
                this.showIntro();
            } else {
                this.initializeMenu();
            }
        } catch (e) {
            console.log('Error comprobando intro, arrancando menú:', e);
            this.initializeMenu();
        }
    }

    // Inicializa el menú (la lógica que antes estaba en create)
    initializeMenu() {
        const { width, height } = this.sys.game.config;
        this.createAnimatedBackground(width, height);
        this.createFloatingParticles(width, height);
        this.createTitle(width);
        this.createButtons(width);
        this.createFooter(width, height);

        // Teclas rápidas
        this.input.keyboard.on('keydown-ENTER', () => this.startGame());
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    }

    // Mostrar pantalla de intro con la imagen de Motocle
    showIntro() {
        const { width, height } = this.sys.game.config;
        this.introContainer = this.add.container(0, 0).setDepth(4000);

        // Fondo oscuro
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 1).setAlpha(0);
        this.introContainer.add(bg);

        // Imagen centrada
        const img = this.add.image(width/2, height/2 - 30, 'motocle_like').setOrigin(0.5);
        // Escalar la imagen para que quepa si es grande
        const maxW = width * 0.8;
        const maxH = height * 0.6;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        img.setScale(scale);
        this.introContainer.add(img);

        const hint = this.add.text(width/2, height - 80, 'Presiona cualquier tecla o haz clic para continuar', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
        this.introContainer.add(hint);

        // Animación de fade-in
        this.tweens.add({ targets: bg, alpha: 0.6, duration: 450, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: img, alpha: 1, duration: 600, ease: 'Back.easeOut' });

        // Handlers para continuar
        this._introContinueHandler = () => this.hideIntro();
        this.input.once('pointerdown', this._introContinueHandler);
        this.input.keyboard.once('keydown', this._introContinueHandler);
    }

    hideIntro() {
        if (!this.introContainer) return;
        try {
            // Animación de salida
            this.tweens.add({ targets: this.introContainer.getAll(), alpha: 0, scale: 0.98, duration: 300, ease: 'Power2', onComplete: () => {
                try { this.introContainer.destroy(); } catch(e) {}
                this.introContainer = null;
                this.initializeMenu();
            }});
        } catch (e) {
            try { this.introContainer.destroy(); } catch(e) {}
            this.introContainer = null;
            this.initializeMenu();
        }
    }

    // 🔮 Fondo dinámico con neblina y luz pulsante
    createAnimatedBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f172a, 0x1e1b4b, 0x312e81, 0x4c1d95, 1);
        bg.fillRect(0, 0, width, height);

        // Neblina translúcida animada
        for (let i = 0; i < 3; i++) {
            const fog = this.add.graphics();
            fog.fillStyle(0xffffff, 0.03);
            fog.fillCircle(0, 0, Phaser.Math.Between(250, 400));
            fog.setPosition(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height)
            );
            fog.setBlendMode(Phaser.BlendModes.ADD);

            this.tweens.add({
                targets: fog,
                x: `+=${Phaser.Math.Between(-100, 100)}`,
                y: `+=${Phaser.Math.Between(-50, 50)}`,
                alpha: 0.05,
                duration: 8000 + i * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    // ✨ Partículas flotantes lentas
    createFloatingParticles(width, height) {
        for (let i = 0; i < 25; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                2,
                0xffffff,
                0.4
            );
            particle.setBlendMode(Phaser.BlendModes.ADD);

            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(80, 200),
                alpha: 0,
                duration: Phaser.Math.Between(4000, 8000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                ease: 'Sine.easeInOut'
            });
        }
    }

    // 🥷 Título con glow neón y reflejo
    createTitle(width) {
        const mainStyle = {
            fontSize: '80px',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#ffffff',
            stroke: '#a78bfa',
            strokeThickness: 6,
            shadow: { offsetX: 0, offsetY: 0, color: '#8b5cf6', blur: 25, fill: true }
        };

        const title = this.add.text(width / 2, 120, 'Operación Quincena - Motocle', mainStyle).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, 190, 'LA AVENTURA DE MOTOCLE', {
            fontSize: '18px',
            color: '#cbd5e1',
            letterSpacing: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Pulso luminoso del título
        this.tweens.add({
            targets: title,
            scaleX: 1.02,
            scaleY: 1.02,
            alpha: 0.95,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // 🟣 Botones con borde luminoso y reflejo
    createButtons(width) {
        const buttons = [
            { y: 270, text: 'INICIAR JUEGO', color: 0x9333ea, hover: 0xa855f7, action: 'start' },
            { y: 340, text: 'HISTORIA', color: 0x06b6d4, hover: 0x22d3ee, action: 'story' },
            { y: 410, text: 'LOGROS', color: 0xf97316, hover: 0xfb923c, action: 'achievements' },
            { y: 480, text: 'PUNTUACIONES', color: 0x0ea5e9, hover: 0x38bdf8, action: 'scores' },
            { y: 550, text: 'SALIR', color: 0xef4444, hover: 0xf87171, action: 'exit' }
        ];

        buttons.forEach(b =>
            this.createGlowingButton(width / 2, b.y, b.text, b.color, b.hover, b.action)
        );
    }

    createGlowingButton(x, y, text, color, hoverColor, action) {
        const w = 350, h = 55;
        const container = this.add.container(x, y);
        const base = this.add.graphics();

        const drawButton = (col) => {
            base.clear();
            base.lineStyle(2, 0xffffff, 0.1);
            base.fillStyle(col, 1);
            base.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
            base.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
        };
        drawButton(color);

        const textObj = this.add.text(0, 0, text, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#fff'
        }).setOrigin(0.5);

        container.add([base, textObj]);
        container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

        // Eventos
        container.on('pointerover', () => {
            drawButton(hoverColor);
            this.tweens.add({
                targets: container,
                scaleX: 1.06,
                scaleY: 1.06,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });
        container.on('pointerout', () => {
            drawButton(color);
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });
        container.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    if (action === 'start') this.startGame();
                    else if (action === 'story') this.showStory();
                    else if (action === 'achievements') this.showMessage('LOGROS', '¡Próximamente!', '#f97316');
                    else if (action === 'scores') this.showMessage('PUNTUACIONES', '¡Próximamente!', '#0ea5e9');
                    else if (action === 'exit') this.exitGame();
                }
            });
        });
    }

    createFooter(width, height) {
        this.add.text(width / 2, height - 25, 'ENTER o ESPACIO para iniciar  •  WASD/FLECHAS para moverte', {
            fontSize: '12px',
            color: '#94a3b8',
            alpha: 0.8
        }).setOrigin(0.5);
    }

    // 🚀 Transiciones suaves
    startGame() {
        const fade = this.add.rectangle(400, 300, 800, 600, 0x000000, 0).setDepth(999);
        this.tweens.add({
            targets: fade,
            alpha: 1,
            duration: 600,
            ease: 'Power2',
            onComplete: () => this.scene.start('GameScene')
        });
    }

    showStory() {
        const fade = this.add.rectangle(400, 300, 800, 600, 0x000000, 0).setDepth(999);
        this.tweens.add({
            targets: fade,
            alpha: 1,
            duration: 600,
            ease: 'Power2',
            onComplete: () => this.scene.start('IntroScene')
        });
    }

    exitGame() {
        this.showMessage('¡Gracias por jugar!', 'Nos vemos pronto 🥷', '#a78bfa');
    }

    showMessage(title, message, color) {
        const c = this.add.container(400, 300).setDepth(2000);
        const bg = this.add.graphics();
        bg.fillStyle(0x0f172a, 0.9);
        bg.fillRoundedRect(-200, -100, 400, 200, 20);
        bg.lineStyle(3, parseInt(color.replace('#', '0x')), 0.7);
        bg.strokeRoundedRect(-200, -100, 400, 200, 20);

        const t = this.add.text(0, -40, title, { fontSize: '28px', color, fontStyle: 'bold' }).setOrigin(0.5);
        const m = this.add.text(0, 10, message, { fontSize: '18px', color: '#e2e8f0' }).setOrigin(0.5);
        const hint = this.add.text(0, 60, 'Click para cerrar', { fontSize: '12px', color: '#64748b' }).setOrigin(0.5);

        c.add([bg, t, m, hint]);
        c.setAlpha(0).setScale(0.8);
        this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' });

        c.setInteractive(new Phaser.Geom.Rectangle(-200, -100, 400, 200), Phaser.Geom.Rectangle.Contains);
        c.on('pointerdown', () => {
            this.tweens.add({ targets: c, alpha: 0, scale: 0.8, duration: 200, onComplete: () => c.destroy() });
        });
    }
}
