export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('menuBg', 'assets/menu/background.png');
        this.load.image('sky', 'assets/fondo.png');
        // Intro splash de Motocle
        this.load.image('motocle_like', 'assets/motocle/motocle_like.png');
        
        // ✅ AGREGAR NUEVO FONDO
        this.load.image('menu-background', 'assets/image1.png');
        
        // ✅ SPRITES PARA PERSONAJES CORRIENDO
        this.load.spritesheet('ninja-idle', 'assets/player/Idle (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('ninja-run', 'assets/player/Run (32x32).png', { frameWidth: 32, frameHeight: 32 });
        
        // Amigo/Compañero
        this.load.spritesheet('amigo-idle', 'assets/amigo/Idle (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('amigo-run', 'assets/amigo/Run (32x32).png', { frameWidth: 32, frameHeight: 32 });
        
        // ✅ MOTOCLE - USAR LOS MISMOS SPRITES QUE GAMESCENE
        this.load.spritesheet('motocle_run', 'assets/motocle/Motocle.png', { frameWidth: 290, frameHeight: 262 });
        this.load.spritesheet('motocle_quieto2', 'assets/motocle/motocle_quieto2.png', { frameWidth: 255, frameHeight: 270 });
        
        console.log("📦 Sprites de personajes cargados para el menú");
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
        
        // ✅ CREAR ANIMACIONES PRIMERO
        this.createCharacterAnimations();
        
        this.createAnimatedBackground(width, height);
        this.createFloatingParticles(width, height);
        
        // ✅ AGREGAR PERSONAJES CORRIENDO
        this.createRunningCharacters(width, height);
        
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

    // 🔮 Fondo dinámico con la imagen image1.png
    createAnimatedBackground(width, height) {
        // ✅ USAR LA NUEVA IMAGEN COMO FONDO BASE
        if (this.textures.exists('menu-background')) {
            const bg = this.add.image(width / 2, height / 2, 'menu-background');
            
            // ✅ ESCALAR LA IMAGEN PARA QUE CUBRA TODA LA PANTALLA
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            
            bg.setScale(scale);
            bg.setDepth(-100); // ✅ Fondo completamente atrás
            
            console.log("✅ Fondo image1.png aplicado");
        } else {
            // ✅ FALLBACK: Fondo degradado original
            const bg = this.add.graphics();
            bg.fillGradientStyle(0x0f172a, 0x1e1b4b, 0x312e81, 0x4c1d95, 1);
            bg.fillRect(0, 0, width, height);
            bg.setDepth(-100);
            
            console.log("⚠️ Usando fondo degradado como fallback");
        }
        
        // ✅ OVERLAY SUTIL PARA MEJOR CONTRASTE CON EL TEXTO
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.2); // Negro semi-transparente más sutil
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(-90);

        // Neblina translúcida animada (más sutil)
        for (let i = 0; i < 2; i++) {
            const fog = this.add.graphics();
            fog.fillStyle(0xffffff, 0.02);
            fog.fillCircle(0, 0, Phaser.Math.Between(250, 350));
            fog.setPosition(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height)
            );
            fog.setBlendMode(Phaser.BlendModes.ADD);
            fog.setDepth(-80);

            this.tweens.add({
                targets: fog,
                x: `+=${Phaser.Math.Between(-80, 80)}`,
                y: `+=${Phaser.Math.Between(-40, 40)}`,
                alpha: 0.04,
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

    // ✅ NUEVO MÉTODO: Crear animaciones de personajes
    createCharacterAnimations() {
        console.log("🎬 Creando animaciones de personajes...");
        
        // Ninja animations
        if (this.textures.exists('ninja-idle')) {
            this.anims.create({
                key: 'ninja-idle',
                frames: this.anims.generateFrameNumbers('ninja-idle', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (this.textures.exists('ninja-run')) {
            this.anims.create({
                key: 'ninja-run',
                frames: this.anims.generateFrameNumbers('ninja-run', { start: 0, end: 7 }),
                frameRate: 12,
                repeat: -1
            });
        }
        
        // Amigo animations
        if (this.textures.exists('amigo-idle')) {
            this.anims.create({
                key: 'amigo-idle',
                frames: this.anims.generateFrameNumbers('amigo-idle', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (this.textures.exists('amigo-run')) {
            this.anims.create({
                key: 'amigo-run',
                frames: this.anims.generateFrameNumbers('amigo-run', { start: 0, end: 7 }),
                frameRate: 12,
                repeat: -1
            });
        }
        
        // ✅ MOTOCLE - EXACTAMENTE IGUAL QUE EN GAMESCENE
        if (this.textures.exists('motocle_run')) {
            this.anims.create({
                key: 'motocle_run_anim',
                frames: this.anims.generateFrameNumbers('motocle_run', { start: 0, end: 2 }),
                frameRate: 6,
                repeat: -1
            });
        }
        
        if (this.textures.exists('motocle_quieto2')) {
            this.anims.create({
                key: 'motocle_quieto2_anim',
                frames: [ { key: 'motocle_quieto2', frame: 0 } ],
                frameRate: 1,
                repeat: -1
            });
        }
        
        console.log("✅ Animaciones de personajes creadas");
    }

    // ✅ NUEVO MÉTODO: Crear personajes corriendo
    createRunningCharacters(width, height) {
        console.log("🏃‍♂️ Creando personajes corriendo...");
        
        // ✅ NINJA BLANCO
        let ninja;
        if (this.textures.exists('ninja-run')) {
            ninja = this.add.sprite(-100, height - 80, 'ninja-run'); // ✅ Más arriba para no tapar botones
            if (this.anims.exists('ninja-run')) {
                ninja.play('ninja-run', true);
                console.log("✅ Ninja corriendo con ninja-run");
            }
        } else if (this.textures.exists('ninja-idle')) {
            ninja = this.add.sprite(-100, height - 80, 'ninja-idle');
            if (this.anims.exists('ninja-idle')) {
                ninja.play('ninja-idle', true);
            }
        }
        
        if (ninja) {
            ninja.setScale(2.5);
            ninja.setTint(0xFFFFFF); // Blanco
            ninja.setDepth(-10); // ✅ DETRÁS de los botones
            
            this.tweens.add({
                targets: ninja,
                x: width + 100,
                duration: 8000,
                repeat: -1,
                ease: 'None',
                delay: 0
            });
            
            console.log("✅ Ninja creado y animado");
        }
        
        // ✅ AMIGO
        let amigo;
        if (this.textures.exists('amigo-run')) {
            amigo = this.add.sprite(-150, height - 80, 'amigo-run');
            if (this.anims.exists('amigo-run')) {
                amigo.play('amigo-run', true);
                console.log("✅ Amigo corriendo con amigo-run");
            }
        } else if (this.textures.exists('amigo-idle')) {
            amigo = this.add.sprite(-150, height - 80, 'amigo-idle');
            if (this.anims.exists('amigo-idle')) {
                amigo.play('amigo-idle', true);
            }
        } else if (ninja) {
            // Fallback usando ninja
            amigo = this.add.sprite(-150, height - 80, 'ninja-idle');
            if (this.anims.exists('ninja-idle')) {
                amigo.play('ninja-idle', true);
            }
        }
        
        if (amigo) {
            amigo.setScale(2.2);
            amigo.setTint(0x00AAFF); // Azul
            amigo.setDepth(-9); // ✅ DETRÁS de los botones
            
            this.tweens.add({
                targets: amigo,
                x: width + 100,
                duration: 8500,
                repeat: -1,
                ease: 'None',
                delay: 1000
            });
            
            console.log("✅ Amigo creado y animado");
        }
        
        // ✅ MOTOCLE - USAR LOS MISMOS NOMBRES QUE GAMESCENE
        let motocle;
        console.log("🔍 Verificando Motocle...");
        console.log("¿Existe motocle_run?", this.textures.exists('motocle_run'));
        console.log("¿Existe motocle_quieto2?", this.textures.exists('motocle_quieto2'));
        
        if (this.textures.exists('motocle_run')) {
            motocle = this.add.sprite(-250, height - 100, 'motocle_run'); // ✅ Más arriba
            if (this.anims.exists('motocle_run_anim')) {
                motocle.play('motocle_run_anim', true);
                console.log("✅ Motocle corriendo con motocle_run_anim");
            }
        } else if (this.textures.exists('motocle_quieto2')) {
            motocle = this.add.sprite(-250, height - 100, 'motocle_quieto2');
            if (this.anims.exists('motocle_quieto2_anim')) {
                motocle.play('motocle_quieto2_anim', true);
            }
        }
        
        if (motocle) {
            motocle.setScale(0.16); // ✅ USAR LA MISMA ESCALA QUE GAMESCENE
            motocle.setTint(0xFFDD00); // Dorado
            motocle.setDepth(-8); // ✅ DETRÁS de los botones
            
            this.tweens.add({
                targets: motocle,
                x: width + 100,
                duration: 9000,
                repeat: -1,
                ease: 'None',
                delay: 2000
            });
            
            console.log("✅ Motocle creado y animado");
        } else {
            console.log("❌ No se pudo crear Motocle");
        }
        
        // ✅ LABELS IDENTIFICATIVOS
        this.createMovingLabels(width, height);
        
        console.log("🏃‍♂️ Todos los personajes están corriendo en el menú");
    }

    // ✅ NUEVO MÉTODO: Labels que se mueven
    createMovingLabels(width, height) {
        // Label ninja
        const ninjaLabel = this.add.text(-100, height - 50, 'NINJA', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(-5);
        
        this.tweens.add({
            targets: ninjaLabel,
            x: width + 100,
            duration: 8000,
            repeat: -1,
            ease: 'None',
            delay: 0
        });
        
        // Label amigo
        const amigoLabel = this.add.text(-150, height - 50, 'AMIGO', {
            fontSize: '12px',
            color: '#00AAFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(-4);
        
        this.tweens.add({
            targets: amigoLabel,
            x: width + 100,
            duration: 8500,
            repeat: -1,
            ease: 'None',
            delay: 1000
        });
        
        // Label motocle
        const motocleLabel = this.add.text(-250, height - 70, 'MOTOCLE', {
            fontSize: '14px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(-3);
        
        this.tweens.add({
            targets: motocleLabel,
            x: width + 100,
            duration: 9000,
            repeat: -1,
            ease: 'None',
            delay: 2000
        });
        
        console.log("🏷️ Labels móviles creados");
    }
}
