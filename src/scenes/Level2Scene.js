import AssetManager from '../managers/AssetManager.js';
import PlayerManager from '../managers/PlayerManager.js';
import EnemyManager from '../managers/EnemyManager.js';
import UIManager from '../managers/UIManager.js';
import { createFireEffect } from '../utils/fireEffect.js';

/**
 * Level2Scene.js
 * - Segundo nivel del juego con fondo diferente
 * - Enemigos más difíciles y plataformas más complejas
 */

class Level2Scene extends Phaser.Scene {
    constructor() {
        super('Level2Scene');
        this.gameState = {
            score: 0,
            health: 100,        // ✅ CAMBIAR A 100
            maxHealth: 100,     // ✅ CAMBIAR A 100
            coinsCollected: 0,
            totalCoins: 0,
            enemiesKilled: 0,
            level: 2
        };
        // ✅ IGUALAR LA VIDA DEL COMPAÑERO A 100
        this.companionMaxHealth = 100;  // ✅ CAMBIAR A 100
        this.companionHealth = 100;     // ✅ CAMBIAR A 100
        this.isGamePaused = false;
        // ✅ BANDERAS PARA EVITAR DUPLICADOS DE MENSAJES
        this.levelMessageShown = false;
        this.levelCompleteShown = false;
    }

    init(data) {
        // Recibir datos del nivel anterior
        if (data) {
            this.gameState.score = data.score || 0;
            this.gameState.health = data.health || 200;
            this.gameState.coinsCollected = data.coinsCollected || 0;
            this.gameState.enemiesKilled = data.enemiesKilled || 0;
        }
        console.log("🎮 Iniciando Nivel 2 con datos:", this.gameState);
    }

    preload() {
        this.assetManager = new AssetManager(this);
        this.assetManager.preloadAssets();
        
        // Cargar fondo específico del nivel 2 (opcional)
        this.load.image('level2-bg', 'assets/image.png');
        // Cargar sprites de Motocle para Nivel 2 (mismo set que en GameScene)
        this.load.spritesheet('motocle_run', 'assets/motocle/Motocle.png', { frameWidth: 290, frameHeight: 262 });
        this.load.spritesheet('motocle_quieto2', 'assets/motocle/motocle_quieto2.png', { frameWidth: 255, frameHeight: 270 });
        
        // Asegurar que tenemos el fondo del nivel 1 como fallback
        if (!this.textures.exists('sky')) {
            this.load.image('sky', 'assets/fondo.png');
        }
        
        console.log("📥 Cargando assets para Nivel 2...");
    }

    create() {
        console.log('🎮 Creando Nivel 2...');
        
        // ✅ LIMPIAR COMPLETAMENTE CUALQUIER MOTOCLE PREVIO
        console.log("🧹 Limpiando Motocles residuales...");
        this._motocleLevel2DialogActive = false;
        
        // Limpiar diálogos
        if (this.motocleDialogBubble) {
            try {
                if (this.motocleDialogBubble.floatTween) {
                    this.motocleDialogBubble.floatTween.stop();
                    this.motocleDialogBubble.floatTween.remove();
                }
                if (this.motocleDialogBubble.container) this.motocleDialogBubble.container.destroy();
                if (this.motocleDialogBubble.pointer) this.motocleDialogBubble.pointer.destroy();
            } catch(e) {}
            this.motocleDialogBubble = null;
        }
        
        // ✅ DESTRUIR CUALQUIER MOTOCLE EXISTENTE (de esta escena o anterior)
        if (this.motocle) {
            try {
                console.log("🧹 Destruyendo Motocle existente");
                this.motocle.destroy();
            } catch(e) {
                console.log("⚠️ Error destruyendo motocle:", e);
            }
            this.motocle = null;
        }
        
        // ✅ BUSCAR Y DESTRUIR TODOS LOS SPRITES DE MOTOCLE EN LA ESCENA
        try {
            const motocleSprites = this.children.list.filter(child => {
                return child && child.texture && 
                       (child.texture.key === 'motocle_run' || child.texture.key === 'motocle_quieto2');
            });
            
            if (motocleSprites.length > 0) {
                console.log(`🧹 Encontrados ${motocleSprites.length} sprites de Motocle - destruyendo...`);
                motocleSprites.forEach(sprite => {
                    try {
                        sprite.destroy();
                    } catch(e) {
                        console.log("⚠️ Error destruyendo sprite de Motocle:", e);
                    }
                });
            }
        } catch(e) {
            console.log("⚠️ Error buscando sprites de Motocle:", e);
        }
        
        // Configurar controles
        this.setupControls();

        // Inicializar managers
        this.playerManager = new PlayerManager(this);
        this.enemyManager = new EnemyManager(this);
        this.uiManager = new UIManager(this);

        // ✅ CONFIGURAR MUNDO MÁS GRANDE PARA 1000x600
    const { width, height } = this.sys.game.config;
    const worldWidth = 4000; // Más grande para pantalla de 1000px
    this.levelWorldWidth = worldWidth;
    this.physics.world.setBounds(0, 0, worldWidth, height);

        console.log(`🌍 Mundo configurado: ${worldWidth}x${height}`);

        // Crear mundo
        this.assetManager.createFallbackTextures();
        this.createLevel2Background(); // ✅ ESTO DEBERÍA MOSTRAR LOGS
        this.createLevel2Platforms();
        this.assetManager.createAnimations();

        // Crear entidades
        this.playerManager.createPlayer();
        // ✅ FALTA RESETEAR VIDA Y SINCRONIZAR
        this.player.health = this.gameState.maxHealth; // Vida completa al iniciar nivel 2
        this.gameState.health = this.player.health;   // Sincronizar
        this.player.isInvulnerable = false;          // Quitar invulnerabilidad
        this.player.clearTint();                     // Quitar efectos visuales
        
        console.log(`👤 Jugador creado - Textura: ${this.player.texture.key}, Pos: (${this.player.x}, ${this.player.y})`);
    
        this.playerManager.createCompanion();
        this.companionMaxHealth = 100;  // ✅ CAMBIAR A 100 PARA CONSISTENCIA
        this.companionHealth = 100;     // ✅ CAMBIAR A 100 PARA CONSISTENCIA
        
        console.log(`👥 Compañero creado - Textura: ${this.companion.texture.key}, Pos: (${this.companion.x}, ${this.companion.y})`);
        
        // ✅ CREAR MOTOCLE IGUAL QUE EN GAMESCENE
        this.createMotocleLevel2();
        
        this.createLevel2Coins();
        this.createLevel2Enemies();
        this.createLevel2Items();

        // Setup final
        this.setupPhysics();
        
        // Crear cámara fija para la UI
        this.uiCamera = this.cameras.add(0, 0, width, height, false, 'UICam');
        this.uiCamera.setScroll(0, 0);
        this.uiCamera.setZoom(1);
        this.uiCamera.ignore([]);

        this.uiManager.createUI();
        // Asegurar que la cámara de UI ignore los elementos del mundo (como en GameScene)
        try {
            if (this.uiManager.uiContainer) {
                this.uiCamera.ignore(this.children.list.filter(obj => !this.uiManager.uiContainer.list.includes(obj)));
            }
        } catch (e) {}

        this.setupCamera();

        // Efectos de fuego más intensos para nivel 2
        this.createLevel2FireEffects();

        // Mostrar mensaje de nivel 2
        this.showLevelMessage();

        console.log("✅ Nivel 2 creado exitosamente");
    }

    createLevel2Background() {
        const { width, height } = this.sys.game.config;
        const worldWidth = 4000;
        
        console.log(`🔍 Dimensiones del juego: ${width}x${height}`);
        console.log(`🌍 Ancho del mundo: ${worldWidth}`);
        console.log(`📂 level2-bg existe: ${this.textures.exists('level2-bg')}`);
        console.log(`📂 sky existe: ${this.textures.exists('sky')}`);
        
        if (this.textures.exists('level2-bg')) {
            console.log(`✅ Usando textura level2-bg`);
            
            // ✅ DIMENSIONES CORRECTAS DE LA IMAGEN: 1024x490
            const bgOriginalWidth = 1024;
            const bgOriginalHeight = 490;
            
            // ⚠️ PROBLEMA: La imagen es 490px alta pero el juego es 600px alto
            // Vamos a escalar para que quepa bien sin deformarse demasiado
            
            // Opción 1: Escalar basado en altura (recomendado)
            const scaleY = height / bgOriginalHeight; // 600/490 = 1.22
            
            // Opción 2: Escalar basado en ancho si prefieres
            // const scaleX = width / bgOriginalWidth; // 1000/1024 = 0.98
            
            // Usar la escala Y para mantener proporción vertical
            const scale = scaleY;
            const scaledWidth = bgOriginalWidth * scale; // 1024 * 1.22 = 1249
            
            // Calcular repeticiones para cubrir 4000px de ancho
            const numBackgrounds = Math.ceil(worldWidth / scaledWidth) + 1; // 4000/1249 = 4 imágenes
            
            console.log(`📐 Imagen original: ${bgOriginalWidth}x${bgOriginalHeight}`);
            console.log(`📐 Escala aplicada: ${scale.toFixed(2)}`);
            console.log(`📐 Ancho tras escalar: ${scaledWidth.toFixed(2)}`);
            console.log(`📐 Repeticiones necesarias: ${numBackgrounds}`);
            
            for (let i = 0; i < numBackgrounds; i++) {
                const x = i * scaledWidth;
                const bg = this.add.image(x + scaledWidth/2, height/2, 'level2-bg');
                bg.setScale(scale);
                bg.setDepth(-1);
                console.log(`🖼️ Fondo ${i + 1} colocado en x: ${(x + scaledWidth/2).toFixed(2)}`);
            }
            
            console.log(`✅ Fondo Level 2 completado con ${numBackgrounds} imágenes`);
            
        } else if (this.textures.exists('sky')) {
            console.log(`⚠️ level2-bg no encontrado, usando fallback 'sky'`);
            
            // Usar dimensiones reales de 'sky'
            const skyTexture = this.textures.get('sky');
            const bgOriginalWidth = skyTexture.source[0].width;
            const bgOriginalHeight = skyTexture.source[0].height;
            
            const scale = height / bgOriginalHeight;
            const scaledWidth = bgOriginalWidth * scale;
            const numBackgrounds = Math.ceil(worldWidth / scaledWidth) + 1;
            
            console.log(`📐 Sky original: ${bgOriginalWidth}x${bgOriginalHeight}`);
            console.log(`📐 Sky escala: ${scale.toFixed(2)}, repeticiones: ${numBackgrounds}`);
            
            for (let i = 0; i < numBackgrounds; i++) {
                const x = i * scaledWidth;
                const bg = this.add.image(x + scaledWidth/2, height/2, 'sky');
                bg.setScale(scale);
                bg.setTint(0x9999CC);
                bg.setDepth(-1);
                console.log(`🖼️ Sky ${i + 1} colocado en x: ${(x + scaledWidth/2).toFixed(2)}`);
            }
            
            console.log(`✅ Fallback sky aplicado con tinte azul`);
            
        } else {
            console.log(`❌ Sin texturas disponibles, creando fondo de color`);
            
            const sectionWidth = 1000;
            const numSections = Math.ceil(worldWidth / sectionWidth) + 1;
            
            for (let i = 0; i < numSections; i++) {
                const x = i * sectionWidth;
                const rect = this.add.rectangle(x + sectionWidth/2, height/2, sectionWidth, height, 0x1a237e);
                rect.setDepth(-1);
                console.log(`📦 Sección ${i + 1} creada en x: ${x + sectionWidth/2}`);
            }
            
            console.log(`✅ Fondo de color creado con ${numSections} secciones`);
        }
    }

    createLevel2Platforms() {
        this.platforms = this.physics.add.staticGroup();
        const groundTexture = this.textures.exists('ground') ? 'ground' : null;
        
        const tileWidth = 32;
        const tileHeight = 8;
        
        if (groundTexture) {
            // Plataformas más complejas para nivel 2
            const platformConfigs = [
                { x: 400, y: 568, tilesX: 25, tilesY: 4 },   // Plataforma base
                { x: 600, y: 450, tilesX: 3, tilesY: 2 },    // Plataforma pequeña
                { x: 900, y: 380, tilesX: 4, tilesY: 3 },    // Plataforma media
                { x: 1300, y: 320, tilesX: 5, tilesY: 3 },   // Plataforma alta
                { x: 1700, y: 480, tilesX: 3, tilesY: 2 },   // Plataforma flotante
                { x: 2000, y: 250, tilesX: 6, tilesY: 3 },   // Plataforma muy alta
                { x: 2400, y: 400, tilesX: 4, tilesY: 3 },   // Plataforma intermedia
                { x: 2800, y: 350, tilesX: 8, tilesY: 4 }    // Plataforma final
            ];
            
            platformConfigs.forEach(config => {
                for (let row = 0; row < config.tilesY; row++) {
                    for (let col = 0; col < config.tilesX; col++) {
                        const tileX = config.x - (config.tilesX * tileWidth / 2) + (col * tileWidth) + (tileWidth / 2);
                        const tileY = config.y + (row * tileHeight);
                        
                        const tile = this.platforms.create(tileX, tileY, groundTexture);
                        tile.setScale(1, 2);
                        tile.setTint(0x8B4513); // Tinte más oscuro para nivel 2
                        tile.refreshBody();
                    }
                }
            });
        }
        
        console.log("✅ Plataformas Nivel 2 creadas");
    }

    createLevel2Coins() {
        this.coins = this.physics.add.group();
        const coinTexture = this.textures.exists('coin') ? 'coin' : 'coinFallback';
        
        // Más monedas en posiciones más difíciles
        const coinPositions = [
            { x: 600, y: 400 }, { x: 900, y: 330 }, { x: 1300, y: 270 },
            { x: 1700, y: 430 }, { x: 2000, y: 200 }, { x: 2400, y: 350 },
            { x: 2600, y: 150 }, { x: 2800, y: 300 }
        ];
        
        coinPositions.forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, coinTexture);
            coin.setBounce(0.4);
            coin.setScale(2);
            coin.setTint(0xFFD700); // Monedas doradas para nivel 2
            if (this.anims.exists('coin-spin')) {
                coin.anims.play('coin-spin');
            }
        });
        
        this.gameState.totalCoins = coinPositions.length;
        console.log(`✅ ${coinPositions.length} monedas creadas en Nivel 2`);
    }

    createLevel2Enemies() {
        this.enemies = this.physics.add.group();
        
        // ✅ CORREGIR: Usar this.textures en lugar de this.scene.textures
        const rinoTexture = this.textures.exists('rino-idle') ? 'rino-idle' : 'gallinaFallback';
        const bluebirdTexture = this.textures.exists('bluebird-flying') ? 'bluebird-flying' : 'gallinaFallback';
        const skullTexture = this.textures.exists('skull-idle1') ? 'skull-idle1' : 'gallinaFallback';
        const angryPigTexture = this.textures.exists('angrypig-idle') ? 'angrypig-idle' : 'gallinaFallback';
        
        // ✅ INCLUIR ANGRY PIGS EN NIVEL 2 - MÁS AGRESIVOS
        const enemyPositions = [
            { x: 700, y: 400, type: 'angrypig' },   // AngryPig inicial
            { x: 800, y: 400, type: 'skull' },     
            { x: 1100, y: 150, type: 'bluebird' },
            { x: 1300, y: 350, type: 'angrypig' }, // AngryPig medio
            { x: 1400, y: 350, type: 'rino' },
            { x: 1600, y: 120, type: 'bluebird' },
            { x: 1900, y: 300, type: 'skull' },    
            { x: 2100, y: 450, type: 'angrypig' }, // AngryPig avanzado
            { x: 2200, y: 180, type: 'bluebird' },
            { x: 2500, y: 420, type: 'rino' },
            { x: 2700, y: 100, type: 'bluebird' },
            { x: 2900, y: 380, type: 'angrypig' }, // AngryPig final
            { x: 3000, y: 450, type: 'skull' }     
        ];

        enemyPositions.forEach((pos, index) => {
            let enemy;
            
            if (pos.type === 'angrypig') {
                enemy = this.enemies.create(pos.x, pos.y, angryPigTexture);
                enemy.setBounce(0.1);
                enemy.setCollideWorldBounds(true);
                enemy.setVelocity(Phaser.Math.Between(-80, 80), 0);
                enemy.health = 75; // Más vida en nivel 2
                enemy.damage = 25; // Más daño en nivel 2
                enemy.enemyType = 'angrypig';
                enemy.setScale(1.3); // Más grande en nivel 2
                enemy.setTint(0xFF6B6B); // Tinte rojizo para nivel 2
                enemy.isLevel2 = true; // Marcar como nivel 2
                
                // Propiedades específicas del AngryPig Nivel 2
                enemy.isAngry = false;
                enemy.hasAngryTint = false;
                enemy.patrolTimer = 0;
                enemy.randomMoveTimer = 0;
                enemy.angryStartTime = 0;
                
                if (this.anims.exists('angrypig-idle')) {
                    enemy.anims.play('angrypig-idle', true);
                }
                
                console.log(`🐷💪 AngryPig Nivel 2 creado en (${pos.x}, ${pos.y})`);
                
            } else if (pos.type === 'skull') {
                enemy = this.enemies.create(pos.x, pos.y, skullTexture);
                enemy.setBounce(0);
                enemy.setCollideWorldBounds(false); // Puede atravesar límites como fantasma
                enemy.body.setGravityY(-200); // Gravedad reducida (flotante)
                enemy.setVelocity(Phaser.Math.Between(-80, 80), Phaser.Math.Between(-60, 60));
                enemy.health = 70; // Más vida que gallina pero menos que rino
                enemy.damage = 25; // Daño considerable
                enemy.enemyType = 'skull';
                enemy.setScale(1.1); // Ligeramente más grande
                enemy.setTint(0x9A4444); // Tinte rojo oscuro para aspecto siniestro
                
                // Propiedades específicas del skull
                enemy.attackCooldown = 0;
                enemy.isAttacking = false;
                enemy.patrolTimer = 0;
                enemy.ghostMoveTimer = 0;
                
                if (this.anims.exists('skull-idle1')) {
                    enemy.anims.play('skull-idle1', true);
                }
                
                console.log(`💀 Skull creado en (${pos.x}, ${pos.y})`);
                
            } else if (pos.type === 'rino') {
                enemy = this.enemies.create(pos.x, pos.y, rinoTexture);
                enemy.setBounce(0.1);
                enemy.setCollideWorldBounds(true);
                enemy.setVelocity(0, 0);
                enemy.health = 80;
                enemy.damage = 30;
                enemy.enemyType = 'rino';
                enemy.setScale(1.2);
                enemy.setTint(0x8B4513);
                
                if (this.anims.exists('rino-idle')) {
                    enemy.anims.play('rino-idle', true);
                }
                
            } else if (pos.type === 'bluebird') {
                enemy = this.enemies.create(pos.x, pos.y, bluebirdTexture);
                enemy.setBounce(0);
                enemy.setCollideWorldBounds(false);
                enemy.body.setGravityY(-300);
                enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-60, 60));
                enemy.health = 60;
                enemy.damage = 30;
                enemy.enemyType = 'bluebird';
                enemy.setScale(1.3);
                enemy.setTint(0x1E90FF);
                
                enemy.flightPattern = 'circle';
                enemy.centerX = pos.x;
                enemy.centerY = pos.y;
                enemy.angle = 0;
                enemy.attackCooldown = 0;
                enemy.isAttacking = false;
                
                if (this.anims.exists('bluebird-flying')) {
                    enemy.anims.play('bluebird-flying', true);
                }
            }
        });
        
        console.log(`✅ ${enemyPositions.length} enemigos creados en Nivel 2 (incluyendo AngryPigs mejorados)`);
    }

    createLevel2Items() {
        this.items = this.physics.add.group();
        const potionTexture = this.textures.exists('health-potion') ? 'health-potion' : 'coinFallback';
        
        // Más pociones debido a la mayor dificultad
        const itemPositions = [
            { x: 1000, y: 200 }, { x: 1500, y: 150 }, 
            { x: 2100, y: 100 }, { x: 2600, y: 250 }
        ];
        
        itemPositions.forEach(pos => {
            const item = this.items.create(pos.x, pos.y, potionTexture);
            item.setBounce(0.2);
            item.setScale(2); // Más grandes
            item.setTint(0x00FF00); // Verde brillante
            item.itemType = 'health';
        });
        
        console.log(`✅ ${itemPositions.length} pociones creadas en Nivel 2`);
    }

    createLevel2FireEffects() {
        // Efectos de fuego más intensos y numerosos
        const firePositions = [
            { x: 300, y: 520, color: 0xff3300, particles: 25 },
            { x: 700, y: 500, color: 0xff6600, particles: 20 },
            { x: 1100, y: 540, color: 0xffcc00, particles: 22 },
            { x: 1500, y: 520, color: 0xff3300, particles: 28 },
            { x: 1900, y: 530, color: 0xff6600, particles: 24 },
            { x: 2300, y: 510, color: 0xffcc00, particles: 26 },
            { x: 2700, y: 540, color: 0xff3300, particles: 30 }
        ];
        
        firePositions.forEach(fire => {
            createFireEffect(this, fire.x, fire.y, { 
                color: fire.color, 
                numParticles: fire.particles, 
                radius: 15 
            });
        });
    }

    showLevelMessage() {
        // ✅ EVITAR DUPLICADOS - Solo mostrar una vez
        if (this.levelMessageShown) {
            console.log("⚠️ Mensaje de nivel ya mostrado - ignorando duplicado");
            return;
        }
        this.levelMessageShown = true;
        
        const levelText = this.add.text(400, 200, 'NIVEL 2', {
            font: '48px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        
        const subText = this.add.text(400, 250, '¡Mayor Dificultad!', {
            font: '24px Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        
        // ✅ ASEGURAR QUE LOS TEXTOS SE IGNOREN EN LA CÁMARA DE UI
        if (this.uiCamera) {
            this.uiCamera.ignore([levelText, subText]);
        }
        
        // Animación de entrada
        this.tweens.add({
            targets: [levelText, subText],
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1 },
            duration: 1000,
            ease: 'Back.easeOut'
        });
        
        // Desaparecer después de 3 segundos
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [levelText, subText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    levelText.destroy();
                    subText.destroy();
                }
            });
        });
    }

    setupControls() {
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,I,ENTER,ESC,LEFT,RIGHT,UP,DOWN,Z,X');
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        console.log("✅ Controles Nivel 2 configurados");
    }

  // ...existing code...
update() {
    if (this.isGamePaused) return;
    
    // ✅ DEBUG: Contar cuántos Motocles hay en la escena CADA 2 SEGUNDOS
    if (!this._lastMotocleCountTime) this._lastMotocleCountTime = 0;
    if (this.time.now - this._lastMotocleCountTime > 2000) {
        this._lastMotocleCountTime = this.time.now;
        try {
            const allMotocles = this.children.list.filter(child => 
                child && child.texture && 
                (child.texture.key === 'motocle_run' || child.texture.key === 'motocle_quieto2')
            );
            console.log(`🔍 DEBUG: Total de Motocles en la escena: ${allMotocles.length}`);
            allMotocles.forEach((m, i) => {
                console.log(`  Motocle ${i+1}: Oficial=${m.isOfficialMotocle}, Dueño=${m.sceneOwner}, Pos=(${Math.round(m.x)}, ${Math.round(m.y)}), Activo=${m.active}, Escala=${m.scaleX}`);
            });
        } catch(e) {
            console.log("⚠️ Error contando Motocles:", e);
        }
    }

    // Control de cámara para personajes muertos
    if (this.player && this.player.active && this.cameras.main) {
        if (this.cameras.main._follow !== this.player) {
            this.cameras.main.startFollow(this.player);
        }
    } else if (this.companion && this.companion.active && this.cameras.main) {
        if (this.cameras.main._follow !== this.companion) {
            this.cameras.main.startFollow(this.companion);
        }
    } else if (this.cameras.main) {
        this.cameras.main.stopFollow();
    }
    
    // ❌ COMENTADO: Esto causaba globos duplicados porque interfería con el floatTween
    // El globo ya sigue a Motocle con setScrollFactor(1) y se mueve con el mundo
    /*
    if (this.motocleDialogBubble && this.motocle && this.motocle.active) {
        try {
            const container = this.motocleDialogBubble.container;
            const pointer = this.motocleDialogBubble.pointer;
            const boxH = this.motocleDialogBubble.boxHeight || 0;
            const mx = this.motocle.x;
            const my = this.motocle.y - (this.motocle.displayHeight || 24);
            const boxY = my - boxH - 15;
            if (container) {
                container.x = mx;
                container.y = boxY;
            }
            if (pointer) {
                pointer.x = mx;
                pointer.y = boxY + boxH / 2;
            }
        } catch (e) {}
    }
    */

    // Controles de jugadores
    if (this.player && this.player.active && this.playerManager) {
        try {
            this.playerManager.handleMovement(this.keys);
        } catch(e) {
            console.log("⚠️ Error en movimiento del jugador:", e);
        }
    }
    
    if (this.companion && this.companion.active && this.playerManager) {
        try {
            this.playerManager.handleCompanionMovement && this.playerManager.handleCompanionMovement();
        } catch(e) {
            console.log("⚠️ Error en movimiento del compañero:", e);
        }
    }

    // Actualizar Motocle si existe
    if (this.motocle && this.motocle.active && this.motocle.body) {
        try { 
            this.updateMotocleFollow(); 
        } catch (e) { 
            console.log("⚠️ Error actualizando Motocle:", e);
        }
    }
    
    // Actualizar managers
    if (this.playerManager) {
        try {
            this.playerManager.handleAnimations();
        } catch(e) {
            console.log("⚠️ Error en animaciones:", e);
        }
    }
    
    if (this.enemyManager) {
        try {
            this.enemyManager.updateEnemies();
        } catch(e) {
            console.log("⚠️ Error actualizando enemigos:", e);
        }
    }
    
    this.autoHeal();
    
    // Ataques
    if (this.player && this.player.active && this.keys.I && Phaser.Input.Keyboard.JustDown(this.keys.I) && this.playerManager) {
        try {
            this.playerManager.performAttack();
        } catch(e) {
            console.log("⚠️ Error en ataque del jugador:", e);
        }
    }
    
    if (this.companion && this.companion.active && this.keys.ENTER && Phaser.Input.Keyboard.JustDown(this.keys.ENTER) && this.playerManager) {
        try {
            this.playerManager.performCompanionAttack();
        } catch(e) {
            console.log("⚠️ Error en ataque del compañero:", e);
        }
    }
    
    // ESC para menú
    if (this.keys.ESC && Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
        try {
            this.scene.start('MenuScene');
        } catch(e) {
            console.log("⚠️ Error cambiando a MenuScene:", e);
            this.scene.start('GameScene');
        }
    }
    
    // Zoom
    if (this.cameras && this.cameras.main) {
        let cam = this.cameras.main;
        if (this.keys.Z && Phaser.Input.Keyboard.JustDown(this.keys.Z)) {
            cam.setZoom(Math.min(2.5, cam.zoom + 0.1));
        }
        if (this.keys.X && Phaser.Input.Keyboard.JustDown(this.keys.X)) {
            cam.setZoom(Math.max(0.5, cam.zoom - 0.1));
        }
    }

    // ✅ ESTA ES LA LÍNEA CRÍTICA QUE FALTABA:
    this.checkLevelCompletion();
}
// ...existing code...

    // Métodos idénticos al GameScene original
    hitCompanion(companion, enemy) {
        // ✅ VERIFICAR CORRECTAMENTE LA INVULNERABILIDAD Y VIDA
        if (companion.isInvulnerable) {
            console.log("🛡️ Compañero invulnerable - sin daño");
            return;
        }
        
        if (companion.health <= 0) {
            console.log("💀 Compañero ya está muerto");
            return;
        }
        
        console.log(`💔 COMPAÑERO HERIDO por ${enemy.enemyType}!`);
        
        // ✅ ASEGURAR QUE TIENE VIDA INICIAL
        if (companion.health === undefined) companion.health = 100;
        
        // ✅ APLICAR DAÑO
        const damage = enemy.damage || 10;
        companion.health -= damage;
        this.companionHealth = companion.health;
        
        console.log(`🩸 Compañero: ${companion.health + damage} → ${companion.health} HP`);
        
        this.uiManager.updateCompanionHealth && this.uiManager.updateCompanionHealth();
        
        // ✅ EFECTOS VISUALES
        companion.isInvulnerable = true;
        companion.setTint(0xff0000);
        const pushForce = companion.x < enemy.x ? -200 : 200;
        companion.setVelocityX(pushForce);
        companion.setVelocityY(-100);
        this.cameras.main.shake(200, 0.01);
        
        // ✅ QUITAR INVULNERABILIDAD DESPUÉS DE 1 SEGUNDO
        this.time.delayedCall(1000, () => {
            if (companion && companion.active) {
                companion.clearTint();
                companion.isInvulnerable = false;
                console.log("🛡️ Compañero ya no es invulnerable");
            }
        });
        
        // ✅ VERIFICAR MUERTE
        if (companion.health <= 0) {
            companion.health = 0;
            companion.setActive(false).setVisible(false);
            this.uiManager.updateCompanionHealth && this.uiManager.updateCompanionHealth();
            console.log('💀 Compañero eliminado');
            
            // ✅ CORREGIR: Verificar si AMBOS jugadores principales están muertos
            const ninjaIsDead = !this.player || !this.player.active || this.player.health <= 0;
            const companionIsDead = !this.companion || !this.companion.active || this.companion.health <= 0;
            
            console.log(`🔍 Estado muerte - Ninja: ${ninjaIsDead}, Compañero: ${companionIsDead}`);
            
            // Game over si los DOS jugadores principales están muertos (Motocle es opcional)
            if (ninjaIsDead && companionIsDead) {
                console.log("💀 AMBOS JUGADORES MUERTOS - Activando Game Over");
                this.time.delayedCall(1000, () => {
                    this.gameOver();
                });
            }
        }
    }

    autoHeal() {
        if (!this.lastHeal) this.lastHeal = 0;
        
        const currentTime = this.time.now;
        
        // ✅ VERIFICAR QUE EL NINJA ESTÉ VIVO Y ACTIVO ANTES DE CURAR
        if (currentTime - this.lastHeal > 2000 && 
            this.player && 
            this.player.active && 
            this.player.health > 0 && 
            this.player.health < this.gameState.maxHealth) {
            
            this.player.health += 2;
            this.gameState.health = this.player.health;
            this.uiManager.updateHealth();
            this.lastHeal = currentTime;
            
            console.log(`💚 Ninja curado Nivel 2: ${this.player.health}/${this.gameState.maxHealth} HP`);
        }
    }

   // ...existing code...
setupPhysics() {
    // ✅ VERIFICAR QUE TODOS LOS OBJETOS EXISTEN ANTES DE CONFIGURAR COLISIONES
    if (!this.platforms || !this.coins || !this.enemies || !this.items) {
        console.error("❌ Objetos de física no inicializados correctamente");
        return;
    }

    // Colisiones básicas (solo si los objetos existen)
    if (this.player && this.player.active) {
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.enemyManager.hitEnemy.bind(this.enemyManager), null, this);
    }
    
    if (this.companion && this.companion.active) {
        this.physics.add.collider(this.companion, this.platforms);
        this.physics.add.overlap(this.companion, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.companion, this.enemies, this.hitCompanion, null, this);
    }
    
    // ✅ Colisiones de Motocle ya se configuran en createMotocleLevel2()
    // (El collider se agrega inmediatamente después de crear el sprite)
    
    // Colisiones de objetos con plataformas
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.items, this.platforms);
    
    console.log("✅ Físicas Nivel 2 configuradas correctamente");
}
// ...existing code...

    setupCamera() {
        const worldWidth = this.levelWorldWidth || 4000;
        this.cameras.main.setBounds(0, 0, worldWidth, this.sys.game.config.height);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1);
        // Usar mismo zoom que GameScene para consistencia
        this.cameras.main.setZoom(1.5);
    }

    // --- Motocle helper methods (Level 2 companion bot) ---
    // Método auxiliar para limpiar el diálogo de Motocle actual
    clearAllMotocleDialogs() {
        console.log("🧹 Limpiando diálogo de Motocle...");
        
        // Limpiar el diálogo actual si existe
        if (this.motocleDialogBubble) {
            try {
                if (this.motocleDialogBubble.floatTween) {
                    this.motocleDialogBubble.floatTween.stop();
                    this.motocleDialogBubble.floatTween.remove();
                }
                if (this.motocleDialogBubble.container) {
                    this.motocleDialogBubble.container.destroy();
                }
                if (this.motocleDialogBubble.pointer) {
                    this.motocleDialogBubble.pointer.destroy();
                }
            } catch(e) {
                console.log("⚠️ Error limpiando diálogo actual:", e);
            }
            this.motocleDialogBubble = null;
        }
    }

    // ✅ CREAR MOTOCLE IGUAL QUE EN GAMESCENE
    createMotocleLevel2() {
        console.log("🏍️ Creando Motocle en Nivel 2 (estilo GameScene)...");
        
        // Limpiar cualquier residuo de Motocle anterior
        this.destroyMotocleDialog();
        if (this.motocle && this.motocle.destroy) {
            this.motocle.destroy();
            this.motocle = null;
        }
        
        // Banderas para evitar múltiples ejecuciones
        this.motocleHasEntered = false;
        this.motocleGreetingShown = false;
        this.motocleTweenCompleted = false;
        this.motocleEntryTimer = null;
        this.motocleEntryTween = null;
        
        const MOTOCLE_SCALE = 0.16;
        const PLAYER_BASE_Y = 450;
        
        // Eliminar cualquier Motocle existente
        this.children.list.filter(child => child.texture && (child.texture.key === 'motocle_run' || child.texture.key === 'motocle_quieto2')).forEach(motocle => {
            console.log('Destruyendo Motocle existente:', motocle);
            motocle.destroy();
        });
        
        // Crear Motocle (igual que GameScene)
        this.motocle = this.physics.add.sprite(-200, PLAYER_BASE_Y, 'motocle_run', 0).setDepth(100);
        this.motocle.setScale(MOTOCLE_SCALE);
        this.motocle.setBounce(0.2);
        this.motocle.setCollideWorldBounds(true);
        this.motocle.setOrigin(0.5, 1);
        this.motocle.body.setOffset(0, this.motocle.height * (1 - this.motocle.originY));
        
        // ✅ CONFIGURAR GRAVEDAD (igual que el jugador)
        this.motocle.body.setGravityY(300);
        
        this.motocle.setVisible(false);  // ✅ Invisible al inicio
        this.motocle.setActive(false);   // ✅ Inactivo al inicio
        
        // ✅ AGREGAR COLISIONES Y OVERLAPS INMEDIATAMENTE
        if (this.platforms) {
            this.physics.add.collider(this.motocle, this.platforms);
            console.log('✅ Collider Motocle-Plataformas agregado');
        }
        if (this.coins) {
            this.physics.add.overlap(this.motocle, this.coins, this.collectCoin, null, this);
            console.log('✅ Overlap Motocle-Monedas agregado');
        }
        if (this.enemies) {
            this.physics.add.overlap(this.motocle, this.enemies, this.hitMotocle, null, this);
            console.log('✅ Overlap Motocle-Enemigos agregado');
        }
        
        console.log('Motocle creado en Nivel 2 at:', this.motocle.x, this.motocle.y, 'visible:', this.motocle.visible);
        
        // Eliminar cualquier Motocle extra
        this.children.list.filter(child => child !== this.motocle && child.texture && (child.texture.key === 'motocle_run' || child.texture.key === 'motocle_quieto2')).forEach(extra => {
            console.log('Destruyendo Motocle extra:', extra);
            extra.destroy();
        });
        
        this.motocleDialogBubble = null;
        
        // Crear animaciones si no existen
        if (!this.anims.exists('motocle_run_anim')) {
            this.anims.create({
                key: 'motocle_run_anim',
                frames: this.anims.generateFrameNumbers('motocle_run', { start: 0, end: 2 }),
                frameRate: 6,
                repeat: -1
            });
        }
        if (!this.anims.exists('motocle_quieto2_anim')) {
            this.anims.create({
                key: 'motocle_quieto2_anim',
                frames: [ { key: 'motocle_quieto2', frame: 0 } ],
                frameRate: 1,
                repeat: -1
            });
        }
        
        // ✅ ENTRADA DE MOTOCLE CON DELAY (igual que GameScene)
        this.motocleEntryTimer = this.time.delayedCall(2000, () => {
            if (!this.scene.isActive()) return;
            console.log('Motocle Level2: DelayedCall ejecutado');
            if (!this.motocleHasEntered) {
                console.log('Motocle Level2: Entrando');
                this.motocleHasEntered = true;
                this.motocle.setVisible(true);
                this.motocle.setActive(true);
                this.motocle.x = -200;
                this.motocle.play('motocle_run_anim');
                
                // Tween de entrada
                if (!this.motocleEntryTween) {
                    this.motocleEntryTween = this.tweens.add({
                        targets: this.motocle,
                        x: 320,
                        duration: 3000,
                        ease: 'Power1',
                        onComplete: () => {
                            if (!this.scene.isActive()) return;
                            if (!this.motocleTweenCompleted) {
                                this.motocleTweenCompleted = true;
                                console.log('Motocle Level2: Tween completado');
                                this.motocle.play('motocle_quieto2_anim');
                                this.motocle.setScale(MOTOCLE_SCALE);
                                
                                // Mostrar secuencia de mensajes
                                if (!this.motocleGreetingShown) {
                                    this.motocleGreetingShown = true;
                                    try { 
                                        this.showMotocleSequence(() => {
                                            console.log('Secuencia de Motocle Nivel 2 completada');
                                            // ✅ YA NO HAY CONVERSACIÓN ADICIONAL
                                        }); 
                                    } catch (e) { 
                                        console.log('Error mostrando secuencia de Motocle Nivel2:', e); 
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
    }
    
    // ✅ MÉTODO PARA DESTRUIR DIÁLOGOS DE MOTOCLE
    destroyMotocleDialog() {
        if (this.motocleDialogBubble) {
            if (this.motocleDialogBubble.floatTween) {
                this.motocleDialogBubble.floatTween.stop();
                this.motocleDialogBubble.floatTween.remove();
            }
            if (this.motocleDialogBubble.container) {
                this.motocleDialogBubble.container.destroy();
            }
            if (this.motocleDialogBubble.pointer) {
                this.motocleDialogBubble.pointer.destroy();
            }
            this.motocleDialogBubble = null;
        }
    }
    
    // ✅ MÉTODO SHOWMOTOCLESEQUENCE IGUAL QUE GAMESCENE
    showMotocleSequence(doneCallback) {
        if (!this.motocle || !this.motocle.active) return;
        
        const messages = [
            { text: 'Tengan cuidado chavos, hay mucho reprobado por aqui', duration: 3800 },
            { text: 'Terminando esto vamos por pizza', duration: 3000 },
            { text: '¡Vamos equipo!', duration: 2500 }
        ];
        
        let idx = 0;
        
        const showNext = () => {
            if (!this.scene.isActive()) return;
            if (idx >= messages.length) {
                // Secuencia terminada
                try { if (typeof doneCallback === 'function') doneCallback(); } catch (e) {}
                return;
            }
            
            const msg = messages[idx];
            
            // Destruir el cuadro de diálogo anterior
            if (this.motocleDialogBubble) {
                if (this.motocleDialogBubble.floatTween) {
                    this.motocleDialogBubble.floatTween.stop();
                    this.motocleDialogBubble.floatTween.remove();
                }
                if (this.motocleDialogBubble.container) {
                    this.motocleDialogBubble.container.destroy();
                }
                if (this.motocleDialogBubble.pointer) {
                    this.motocleDialogBubble.pointer.destroy();
                }
                this.motocleDialogBubble = null;
            }
            
            const mx = this.motocle.x;
            const my = this.motocle.y - this.motocle.displayHeight;
            
            // ✅ MEJORAR DISEÑO DEL GLOBO
            const padding = 22;  // Más padding para mejor apariencia
            const maxWidth = 320;  // Un poco más ancho
            
            const tempText = this.add.text(0, 0, msg.text, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',  // ✅ Texto más grande
                color: '#1a1a1a',  // ✅ Color más oscuro para mejor contraste
                align: 'center',
                fontStyle: 'bold',  // ✅ Texto en negrita
                wordWrap: { width: maxWidth - padding * 2 },
                lineSpacing: 6  // ✅ Más espacio entre líneas
            }).setOrigin(0.5);
            
            const bounds = tempText.getBounds();
            const textWidth = bounds.width;
            const textHeight = bounds.height;
            tempText.destroy();
            
            const boxWidth = Math.min(textWidth + padding * 2, maxWidth);
            const boxHeight = textHeight + padding * 2;
            const boxY = my - boxHeight - 25;  // ✅ Más separación del personaje
            
            const container = this.add.container(mx, boxY).setDepth(2000);
            
            // ✅ Fondo del cuadro mejorado con sombra más visible
            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.3);  // ✅ Sombra más oscura
            bg.fillRoundedRect(-boxWidth/2 + 4, -boxHeight/2 + 4, boxWidth, boxHeight, 15);  // ✅ Bordes más redondeados
            bg.fillStyle(0xffffff, 1);
            bg.fillRoundedRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 15);
            
            // ✅ Borde más grueso y visible
            const border = this.add.graphics();
            border.lineStyle(4, 0x3b82f6, 1);  // ✅ Azul más moderno y más grueso
            border.strokeRoundedRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 15);
            
            const text = this.add.text(0, 0, msg.text, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',  // ✅ Texto más grande
                color: '#1a1a1a',  // ✅ Color más oscuro
                align: 'center',
                fontStyle: 'bold',  // ✅ Texto en negrita
                wordWrap: { width: maxWidth - padding * 2 },
                lineSpacing: 6  // ✅ Más espacio entre líneas
            }).setOrigin(0.5);
            
            container.add([bg, border, text]);
            
            // ✅ Pointer (triángulo) mejorado y más visible
            const pointer = this.add.graphics();
            pointer.setPosition(mx, boxY + boxHeight/2);
            pointer.fillStyle(0x000000, 0.3);  // ✅ Sombra más oscura
            pointer.fillTriangle(-12, 2, 12, 2, 0, 16);  // ✅ Triángulo más grande
            pointer.fillStyle(0xffffff, 1);
            pointer.fillTriangle(-12, 0, 12, 0, 0, 14);  // ✅ Triángulo más grande
            pointer.lineStyle(4, 0x3b82f6, 1);  // ✅ Borde más grueso
            pointer.beginPath();
            pointer.moveTo(-12, 0);
            pointer.lineTo(0, 14);
            pointer.lineTo(12, 0);
            pointer.strokePath();
            pointer.setDepth(2000);
            
            // Animación de entrada
            container.setAlpha(0).setScale(0.85);
            pointer.setAlpha(0).setScale(0.85);
            
            this.tweens.add({
                targets: [container, pointer],
                alpha: 1,
                scale: 1,
                duration: 350,
                ease: 'Back.easeOut'
            });
            
            // Animación de flotación
            const floatTween = this.tweens.add({
                targets: [container, pointer],
                y: '+=2',
                duration: 1800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            // ✅ Guardar información del globo
            this.motocleDialogBubble = { container, pointer, floatTween, boxHeight };
            
            // Configurar scroll
            try {
                container.setScrollFactor(1);
                pointer.setScrollFactor(1);
                if (this.uiCamera && this.uiCamera.ignore) {
                    this.uiCamera.ignore([container, pointer]);
                }
            } catch (e) {}
            
            idx++;
            
            // Programar el siguiente mensaje
            this.time.delayedCall(msg.duration, () => {
                if (!this.scene.isActive()) return;
                
                // Detener flotación
                if (floatTween) {
                    floatTween.stop();
                    floatTween.remove();
                }
                
                // Animación de salida
                this.tweens.add({
                    targets: [container, pointer],
                    alpha: 0,
                    scale: 0.85,
                    duration: 250,
                    ease: 'Power2',
                    onComplete: () => {
                        container.destroy();
                        pointer.destroy();
                        this.motocleDialogBubble = null;
                        
                        // Mostrar el siguiente mensaje o finalizar
                        if (idx < messages.length) {
                            showNext();
                        } else {
                            try { if (typeof doneCallback === 'function') doneCallback(); } catch (e) {}
                        }
                    }
                });
            });
        };
        
        showNext();
    }

    // ❌ YA NO SE USA - Conversación eliminada (solo Motocle habla en showMotocleSequence)
    // showPlayerMotocleConversation() { ... } - ELIMINADO

    // ELIMINAR LOS MÉTODOS ANTIGUOS createMotocle, createMotocleActual, showMotocleLevel2Sequence
    // Ya no son necesarios
    
    // ❌ MÉTODO OBSOLETO - Ahora usamos createMotocleLevel2()
    createMotocle() {
        console.log("⚠️ createMotocle() obsoleto - usar createMotocleLevel2()");
        return; // No hacer nada
    }
    
    // ❌ MÉTODO OBSOLETO - Ahora usamos createMotocleLevel2()
    // ❌ MÉTODO OBSOLETO - Ahora usamos createMotocleLevel2()
    createMotocle() {
        console.log("⚠️ createMotocle() obsoleto - usar createMotocleLevel2()");
        return; // No hacer nada
    }
    
    // ❌ MÉTODO OBSOLETO - Ahora usamos createMotocleLevel2()  
    createMotocleActual() {
        console.log("⚠️ createMotocleActual() obsoleto - usar createMotocleLevel2()");
        return; // No hacer nada
    }

    // Devuelve la entidad objetivo actual para Motocle según prioridad: player > companion
    getMotocleTarget() {
        if (this.player && this.player.active) return this.player;
        if (this.companion && this.companion.active) return this.companion;
        return null;
    }

    updateMotocleFollow() {
        if (!this.motocle || !this.motocle.body) return;
        const target = this.getMotocleTarget();
        if (!target) {
            // No hay objetivo vivo: detenerse
            this.motocle.setVelocityX(0);
            try { if (this.anims.exists('motocle_quieto2_anim')) this.motocle.play('motocle_quieto2_anim', true); } catch(e) {}
            return;
        }

        // Parámetros ajustables para comportamiento
        const followDistance = 70; // distancia objetivo
        const baseMaxSpeed = 160; // velocidad normal
        const sprintMultiplier = 1.6; // si está lejos, corre más
        const accelLerp = 0.20; // suavizado (mayor = más responsivo)

        // Distancia al objetivo
        const dxFull = target.x - this.motocle.x;
        const absDist = Math.abs(dxFull);

        // Determinar velocidad objetivo
        let desiredSpeed = Phaser.Math.Clamp((dxFull - (dxFull > 0 ? followDistance : -followDistance)) * 2.4, -baseMaxSpeed, baseMaxSpeed);

        // Si está muy lejos, sprint
        if (absDist > 300) {
            desiredSpeed = Phaser.Math.Clamp(desiredSpeed * sprintMultiplier, -baseMaxSpeed * sprintMultiplier, baseMaxSpeed * sprintMultiplier);
        }

        const currentVx = this.motocle.body.velocity.x || 0;
        const newVx = Phaser.Math.Linear(currentVx, desiredSpeed, accelLerp);
        this.motocle.setVelocityX(newVx);

        // Animaciones más coherentes: correr cuando se mueve lo suficiente
        try {
            if (Math.abs(newVx) > 15) {
                if (this.anims.exists('motocle_run_anim')) this.motocle.play('motocle_run_anim', true);
            } else {
                if (this.anims.exists('motocle_quieto2_anim')) this.motocle.play('motocle_quieto2_anim', true);
            }
        } catch (e) {}

        // Flip según la dirección hacia el objetivo
        try {
            if (newVx < -12) this.motocle.setFlipX(true);
            else if (newVx > 12) this.motocle.setFlipX(false);
        } catch(e) {}

        // Saltos inteligentes: si encuentra un obstáculo frontal o hay un gap, saltar
        try {
            const onGround = this.motocle.body.blocked.down || this.motocle.body.touching.down;
            const blockedSide = this.motocle.body.blocked.left || this.motocle.body.blocked.right;
            const closeEnoughToJump = Math.abs(target.x - this.motocle.x) < 180;

            // Saltar si el objetivo está en y más alto o si chocó con pared
            const needJumpToReachTarget = target.y + 20 < this.motocle.y;
            if (onGround && (blockedSide || needJumpToReachTarget) && closeEnoughToJump) {
                this.motocle.setVelocityY(-340);
            }

            // Si se queda atascado lateralmente, dar un pequeño impulso horizontal
            if (blockedSide && onGround) {
                const push = (this.motocle.x < target.x) ? 60 : -60;
                this.motocle.setVelocityX(newVx + push);
            }
        } catch (e) {}
    }

    // Mostrar secuencia simple de mensajes sobre Motocle en Nivel 2
    showMotocleLevel2Sequence() {
        if (!this.motocle || !this.motocle.active) return;
        
        // Evitar ejecutar la misma secuencia múltiples veces
        if (this._motocleLevel2DialogActive) {
            console.log("🗨️ Ya hay una secuencia de diálogo activa, ignorando nueva solicitud");
            return;
        }
        
        this._motocleLevel2DialogActive = true;
        
        // Reducir la duración entre mensajes para que sea más dinámico
        const messages = [
            { text: 'Tengan cuidado chavos, hay mucho reprobado por aqui', duration: 3000 },
            { text: 'Terminando esto vamos por pizza', duration: 2500 }
        ];

        let idx = 0;

        const showNext = () => {
            if (!this.scene.isActive()) { 
                this._motocleLevel2DialogActive = false; 
                return; 
            }
            if (idx >= messages.length) { 
                this._motocleLevel2DialogActive = false; 
                console.log("✅ Secuencia de diálogos de Motocle completada");
                return; 
            }
            
            // ✅ VERIFICAR QUE MOTOCLE SIGUE EXISTIENDO
            if (!this.motocle || !this.motocle.active) {
                console.log("⚠️ Motocle ya no existe - cancelando diálogos");
                this._motocleLevel2DialogActive = false;
                return;
            }
            
            console.log(`💬 Mostrando mensaje ${idx + 1}/${messages.length}: "${messages[idx].text}"`);

            // Destruir el cuadro de diálogo anterior (igual que GameScene)
            if (this.motocleDialogBubble) {
                console.log("🧹 Destruyendo globo anterior antes de crear nuevo");
                if (this.motocleDialogBubble.floatTween) {
                    this.motocleDialogBubble.floatTween.stop();
                    this.motocleDialogBubble.floatTween.remove();
                }
                if (this.motocleDialogBubble.container) {
                    this.motocleDialogBubble.container.destroy();
                }
                if (this.motocleDialogBubble.pointer) {
                    this.motocleDialogBubble.pointer.destroy();
                }
                this.motocleDialogBubble = null;
            }

            const msg = messages[idx];
            const mx = this.motocle.x;
            const my = this.motocle.y - (this.motocle.displayHeight || 24);

            const padding = 18;
            const maxWidth = 300;
            const tempText = this.add.text(0, 0, msg.text, { fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#2c3e50', align: 'center', wordWrap: { width: maxWidth - padding * 2 }, lineSpacing: 4 }).setOrigin(0.5);
            const bounds = tempText.getBounds();
            const textWidth = bounds.width;
            const textHeight = bounds.height;
            tempText.destroy();

            const boxWidth = Math.min(textWidth + padding * 2, maxWidth);
            const boxHeight = textHeight + padding * 2;
            const boxY = my - boxHeight - 15;

            // Calculamos una mejor posición para el globo, más cercana a Motocle
            const adjustedY = boxY + (this.motocle.displayHeight * 0.3); // Ajustamos para que esté más cerca
            const container = this.add.container(mx, adjustedY).setDepth(2000);
            
            // Fondo y borde mejorados
            const bg = this.add.graphics();
            // Sombra más suave
            bg.fillStyle(0x000000, 0.12);
            bg.fillRoundedRect(-boxWidth/2 + 3, -boxHeight/2 + 3, boxWidth, boxHeight, 12);
            // Fondo más claro
            bg.fillStyle(0xffffff, 0.95);
            bg.fillRoundedRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 12);
            const border = this.add.graphics();
            // Borde más delgado y suave
            border.lineStyle(2, 0x4a90e2, 0.8);
            border.strokeRoundedRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 12);

            const text = this.add.text(0, 0, msg.text, { fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#2c3e50', align: 'center', wordWrap: { width: maxWidth - padding * 2 }, lineSpacing: 4 }).setOrigin(0.5, 0.5);

            container.add([bg, border, text]);

            // Puntero mejorado con mejor posicionamiento
            const pointer = this.add.graphics();
            pointer.setPosition(mx, adjustedY + boxHeight/2);
            // Sombra del puntero más suave
            pointer.fillStyle(0x000000, 0.12);
            pointer.fillTriangle(-8, 2, 8, 2, 0, 10);
            // Puntero más pequeño y delicado
            pointer.fillStyle(0xffffff, 0.95);
            pointer.fillTriangle(-8, 0, 8, 0, 0, 8);
            // Borde más fino
            pointer.lineStyle(2, 0x4a90e2, 0.8);
            pointer.beginPath();
            pointer.moveTo(-8, 0);
            pointer.lineTo(0, 8);
            pointer.lineTo(8, 0);
            pointer.strokePath();
            pointer.setDepth(2000);

            // Asegurar que se muevan con el mundo (no con UI)
            try { container.setScrollFactor(1); pointer.setScrollFactor(1); } catch(e) {}

            // animaciones
            container.setAlpha(0).setScale(0.85);
            pointer.setAlpha(0).setScale(0.85);
            this.tweens.add({ targets: [container, pointer], alpha: 1, scale: 1, duration: 350, ease: 'Back.easeOut' });
            const floatTween = this.tweens.add({ targets: [container, pointer], y: '+=2', duration: 1800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });

            this.motocleDialogBubble = { container, pointer, floatTween, text, boxHeight };

            // programar siguiente mensaje
            idx++;
            this.time.delayedCall(msg.duration, () => {
                if (!this.scene.isActive()) { 
                    console.log("⚠️ Escena ya no activa - cancelando animación de salida");
                    this._motocleLevel2DialogActive = false; 
                    return; 
                }
                
                console.log(`🎭 Animando salida del mensaje ${idx}/${messages.length}`);
                
                try { floatTween.stop(); floatTween.remove(); } catch(e) {}
                this.tweens.add({ targets: [container, pointer], alpha: 0, scale: 0.85, duration: 250, ease: 'Power2', onComplete: () => {
                    console.log(`🗑️ Destruyendo elementos del mensaje ${idx}/${messages.length}`);
                    try { container.destroy(); pointer.destroy(); } catch(e) {}
                    this.motocleDialogBubble = null;
                    if (idx < messages.length) {
                        console.log(`➡️ Avanzando al siguiente mensaje (${idx + 1}/${messages.length})`);
                        showNext();
                    } else {
                        // Secuencia terminada
                        console.log("✅ Todos los mensajes mostrados - secuencia finalizada");
                        this._motocleLevel2DialogActive = false;
                    }
                } });
            });
        };

        showNext();
    }

    hitMotocle(motocle, enemy) {
        if (!motocle || !enemy) return;
        if (!motocle.isInvulnerable) {
            motocle.health = motocle.health === undefined ? 200 : motocle.health;
            motocle.health -= enemy.damage || 10;
            motocle.isInvulnerable = true;
            motocle.setTint(0xff0000);
            const pushForce = motocle.x < enemy.x ? -200 : 200;
            motocle.setVelocityX(pushForce);
            motocle.setVelocityY(-100);
            this.time.delayedCall(1200, () => { 
                if (motocle && motocle.active) { 
                    motocle.clearTint(); 
                    motocle.isInvulnerable = false; 
                } 
            });
            
            if (motocle.health <= 0) {
                motocle.setActive(false).setVisible(false);
                console.log('💀 Motocle eliminado');
                
                // ✅ CORREGIR: Solo game over si los jugadores PRINCIPALES están muertos
                const ninjaIsDead = !this.player || !this.player.active || this.player.health <= 0;
                const companionIsDead = !this.companion || !this.companion.active || this.companion.health <= 0;
                
                console.log(`🔍 Estado muerte - Ninja: ${ninjaIsDead}, Compañero: ${companionIsDead}`);
                
                if (ninjaIsDead && companionIsDead) {
                    console.log("💀 JUGADORES PRINCIPALES MUERTOS - Activando Game Over");
                    this.time.delayedCall(1000, () => {
                        this.gameOver();
                    });
                }
            }
        }
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.gameState.score += 150; // Más puntos en nivel 2
        this.gameState.coinsCollected++;
        
        this.uiManager.updateScore();
        this.uiManager.updateCoins();
        
        console.log(`🪙 Moneda Nivel 2: ${this.gameState.coinsCollected}/${this.gameState.totalCoins}`);
        
        // ✅ CAMBIAR ESTO:
        // if (this.gameState.coinsCollected >= this.gameState.totalCoins) {
        //     this.showVictoryLevel2(); // ❌ ESTO TE MANDA AL MENÚ
        // }
        
        // ✅ POR ESTO:
        if (this.gameState.coinsCollected >= this.gameState.totalCoins) {
            console.log("🏆 ¡Todas las monedas recolectadas! Llamando levelComplete()");
            this.levelComplete(); // ✅ ESTO TE MANDA AL NIVEL 3
        }
    }

    collectItem(player, item) {
        if (item.itemType === 'health') {
            item.destroy();
            player.health = Math.min(player.health + 60, this.gameState.maxHealth); // Más curación
            this.gameState.health = player.health;
            this.uiManager.updateHealth();
            console.log("💚 Vida restaurada en Nivel 2!");
        }
    }

    showVictoryLevel2() {
        console.log("🏆 NIVEL 2 COMPLETADO!");
        
        const victoryText = this.add.text(400, 200, '¡NIVEL 2 COMPLETADO!', {
            font: '36px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        
        const continueText = this.add.text(400, 250, 'Felicidades, eres un verdadero ninja!', {
            font: '18px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        
        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
    }

    gameOver() {
        console.log("💀 GAME OVER - Nivel 2 EJECUTÁNDOSE");
        
        this.physics.pause();
        
        const gameData = {
            score: this.gameState.score,
            coins: this.gameState.coinsCollected,
            enemies: this.gameState.enemiesKilled || 0,
            health: this.gameState.health,
            level: 2
        };
        
        console.log("🎮 Cambiando a GameOverScene con datos:", gameData);
        this.scene.start('GameOverScene', gameData);
    }

    // En Level2Scene.js - modificar el método levelComplete()
levelComplete() {
    // ✅ EVITAR DUPLICADOS - Solo ejecutar una vez
    if (this.levelCompleteShown) {
        console.log("⚠️ Mensaje de completado ya mostrado - ignorando duplicado");
        return;
    }
    this.levelCompleteShown = true;
    
    console.log("🎉 ¡Nivel 2 completado! Avanzando al Nivel 3...");
    
    this.physics.pause();
    this.isGamePaused = true;
    
    const { width, height } = this.sys.game.config;
    
    // ✅ MENSAJE DE TRANSICIÓN AL NIVEL 3
    const completionText = this.add.text(width/2, height/2 - 50, 
        '🌙 ¡NIVEL 2 COMPLETADO! 🌙', 
        {
            fontSize: '36px',
            color: '#4a90e2',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }
    ).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

    const nextLevelText = this.add.text(width/2, height/2 + 20, 
        '🏰 Avanzando a: LA FORTALEZA 🏰\n\n💣 ¡Prepárate para los cañones! 💣', 
        {
            fontSize: '24px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
            lineSpacing: 8
        }
    ).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

    // ✅ NUEVO: TEXTO DE INSTRUCCIÓN PARA CONTINUAR
    const continueText = this.add.text(width/2, height/2 + 120, 
        '🎮 Presiona ESPACIO para continuar 🎮', 
        {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }
    ).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

    // ✅ ASEGURAR QUE LOS TEXTOS SE IGNOREN EN LA CÁMARA DE UI
    if (this.uiCamera) {
        this.uiCamera.ignore([completionText, nextLevelText, continueText]);
    }

    // ✅ ANIMACIÓN DEL TEXTO
    this.tweens.add({
        targets: [completionText, nextLevelText],
        alpha: { from: 0, to: 1 },
        y: '-=20',
        duration: 800,
        ease: 'Back.easeOut'
    });

    // ✅ ANIMACIÓN PARPADEANTE PARA EL TEXTO DE CONTINUAR
    this.tweens.add({
        targets: continueText,
        alpha: { from: 0, to: 1 },
        duration: 1000,
        delay: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // ✅ FUNCIÓN PARA AVANZAR AL NIVEL 3 (CON PROTECCIÓN CONTRA MÚLTIPLES LLAMADAS)
    const goToLevel3 = () => {
        if (this._advancingToLevel3) {
            console.log("⚠️ Ya se está avanzando al nivel 3 - ignorando");
            return;
        }
        this._advancingToLevel3 = true;
        
        // Remover los listeners para evitar múltiples activaciones
        this.input.keyboard.off('keydown-SPACE', spaceHandler);
        this.input.off('pointerdown', clickHandler);
        
        // Cancelar timer automático si existe
        if (this.autoAdvanceTimer) {
            this.autoAdvanceTimer.remove();
        }
        
        console.log("🚀 Avanzando al Nivel 3...");
        
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // ✅ PREPARAR DATOS PARA EL NIVEL 3
            const level3Data = {
                score: this.gameState.score + 750, // ✅ BONUS POR COMPLETAR NIVEL 2
                coins: this.gameState.coinsCollected,
                enemies: this.gameState.enemiesKilled,
                health: Math.min(100, this.gameState.health + 25), // ✅ BONUS DE VIDA
                maxHealth: 100,
                level: 3,
                previousLevel: 2 // ✅ INDICAR DE DÓNDE VIENE
            };
            
            console.log("🚀 Iniciando Level3Scene con datos:", level3Data);
            
            // ✅ INICIAR NIVEL 3
            this.scene.start('Level3Scene', level3Data);
        });
    };

    // ✅ HANDLER PARA TECLA ESPACIO
    const spaceHandler = (event) => {
        if (event.code === 'Space') {
            goToLevel3();
        }
    };

    // ✅ HANDLER PARA CLICK
    const clickHandler = () => {
        goToLevel3();
    };

    // ✅ AGREGAR LISTENERS DE ESPACIO Y CLICK (USAR .once PARA MAYOR SEGURIDAD)
    this.input.keyboard.once('keydown-SPACE', spaceHandler);
    this.input.once('pointerdown', clickHandler);

    // ✅ TRANSICIÓN AUTOMÁTICA DESPUÉS DE 8 SEGUNDOS (SI NO SE PRESIONA ESPACIO)
    this.autoAdvanceTimer = this.time.delayedCall(8000, () => {
        console.log("⏰ Tiempo agotado - avanzando automáticamente...");
        goToLevel3();
    });
}

// ✅ ASEGUR que este método existe en Level2Scene.js
checkLevelCompletion() {
    // Verificar si se recolectaron todas las monedas
    if (this.gameState.coinsCollected >= this.gameState.totalCoins) {
        console.log("💰 ¡Todas las monedas recolectadas en Nivel 2!");
        this.levelComplete();
        return;
    }
    
    // O si se eliminaron todos los enemigos Y se recolectaron todas las monedas
    const activeEnemies = this.enemies.children.entries.filter(enemy => enemy.active);
    if (activeEnemies.length === 0 && this.gameState.coinsCollected >= this.gameState.totalCoins) {
        console.log("👹 ¡Todos los enemigos eliminados y monedas recolectadas en Nivel 2!");
        this.levelComplete();
    }
}

// ✅ LLAMAR checkLevelCompletion() EN EL UPDATE
update() {
    if (this.isGamePaused) return;

    // Control de cámara para personajes muertos
    if (this.player && this.player.active && this.cameras.main) {
        // El ninja está vivo, seguirlo si no se está siguiendo ya
        if (this.cameras.main._follow !== this.player) {
            this.cameras.main.startFollow(this.player);
        }
    } else if (this.companion && this.companion.active && this.cameras.main) {
        // Solo el compañero está vivo, seguirlo
        if (this.cameras.main._follow !== this.companion) {
            this.cameras.main.startFollow(this.companion);
        }
    } else if (this.cameras.main) {
        // Ambos muertos, detener seguimiento
        this.cameras.main.stopFollow();
    }
    
    // Mantener el globo de Motocle siguiendo su posición si existe
    if (this.motocleDialogBubble && this.motocle && this.motocle.active) {
        try {
            const container = this.motocleDialogBubble.container;
            const pointer = this.motocleDialogBubble.pointer;
            const boxH = this.motocleDialogBubble.boxHeight || 0;
            const mx = this.motocle.x;
            const my = this.motocle.y - (this.motocle.displayHeight || 24);
            const boxY = my - boxH - 15;
            if (container) {
                container.x = mx;
                container.y = boxY;
            }
            if (pointer) {
                pointer.x = mx;
                pointer.y = boxY + boxH / 2;
            }
        } catch (e) {
            // no bloquear el update por errores menores
        }
    }

    // Controles de jugadores (solo si existen y están activos)
    if (this.player && this.player.active && this.playerManager) {
        try {
            this.playerManager.handleMovement(this.keys);
        } catch(e) {
            console.log("⚠️ Error en movimiento del jugador:", e);
        }
    }
    
    if (this.companion && this.companion.active && this.playerManager) {
        try {
            this.playerManager.handleCompanionMovement && this.playerManager.handleCompanionMovement();
        } catch(e) {
            console.log("⚠️ Error en movimiento del compañero:", e);
        }
    }

    // Actualizar Motocle (IA local) si existe
    if (this.motocle && this.motocle.active && this.motocle.body) {
        try { 
            this.updateMotocleFollow(); 
        } catch (e) { 
            console.log("⚠️ Error actualizando Motocle:", e);
        }
    }
    
    // Actualizar managers (solo si existen)
    if (this.playerManager) {
        try {
            this.playerManager.handleAnimations();
        } catch(e) {
            console.log("⚠️ Error en animaciones:", e);
        }
    }
    
    if (this.enemyManager) {
        try {
            this.enemyManager.updateEnemies();
        } catch(e) {
            console.log("⚠️ Error actualizando enemigos:", e);
        }
    }
    
    this.autoHeal();
    
    // Ataques (solo si los objetos existen)
    if (this.player && this.player.active && this.keys.I && Phaser.Input.Keyboard.JustDown(this.keys.I) && this.playerManager) {
        try {
            this.playerManager.performAttack();
        } catch(e) {
            console.log("⚠️ Error en ataque del jugador:", e);
        }
    }
    
    if (this.companion && this.companion.active && this.keys.ENTER && Phaser.Input.Keyboard.JustDown(this.keys.ENTER) && this.playerManager) {
        try {
            this.playerManager.performCompanionAttack();
        } catch(e) {
            console.log("⚠️ Error en ataque del compañero:", e);
        }
    }
    
    // ESC para menú
    if (this.keys.ESC && Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
        try {
            this.scene.start('MenuScene');
        } catch(e) {
            console.log("⚠️ Error cambiando a MenuScene:", e);
            this.scene.start('GameScene'); // Fallback
        }
    }
    
    // Zoom (solo si la cámara existe)
    if (this.cameras && this.cameras.main) {
        let cam = this.cameras.main;
        if (this.keys.Z && Phaser.Input.Keyboard.JustDown(this.keys.Z)) {
            cam.setZoom(Math.min(2.5, cam.zoom + 0.1));
        }
        if (this.keys.X && Phaser.Input.Keyboard.JustDown(this.keys.X)) {
            cam.setZoom(Math.max(0.5, cam.zoom - 0.1));
        }
    }

    // ✅ VERIFICAR COMPLETACIÓN DEL NIVEL
    this.checkLevelCompletion();
}
// ...existing code...
}

export default Level2Scene;