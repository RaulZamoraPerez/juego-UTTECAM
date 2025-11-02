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
    
        this.playerManager.createCompanion();
        this.companionMaxHealth = 100;  // ✅ CAMBIAR A 100 PARA CONSISTENCIA
        this.companionHealth = 100;     // ✅ CAMBIAR A 100 PARA CONSISTENCIA
        // Crear Motocle como tercer personaje (player, amigo, motocle)
        try {
            this.createMotocle();
        } catch (e) { console.log('Error creando Motocle en Level2:', e); }
        
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

    // ✅ VERIFICAR QUE LOS OBJETOS EXISTEN ANTES DE USARLOS
    
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
    
    // Colisiones de Motocle (solo si existe y está activo)
    if (this.motocle && this.motocle.active && this.motocle.body) {
        try {
            this.physics.add.collider(this.motocle, this.platforms);
            this.physics.add.overlap(this.motocle, this.coins, this.collectCoin, null, this);
            this.physics.add.overlap(this.motocle, this.enemies, this.hitMotocle, null, this);
        } catch(e) {
            console.log("⚠️ Error configurando física de Motocle:", e);
        }
    }
    
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
    createMotocle() {
        // Si no hay assets, no crear Motocle
        if (!this.textures.exists('motocle_run') && !this.textures.exists('motocle_quieto2')) {
            console.log('Motocle sprites no encontrados — no se creará Motocle en Nivel 2');
            return;
        }

        // Crear animaciones si no existen
        try {
            if (!this.anims.exists('motocle_run_anim') && this.anims.exists('motocle_run')) {
                this.anims.create({ key: 'motocle_run_anim', frames: this.anims.generateFrameNumbers('motocle_run', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });
            }
            if (!this.anims.exists('motocle_quieto2_anim') && this.anims.exists('motocle_quieto2')) {
                this.anims.create({ key: 'motocle_quieto2_anim', frames: [{ key: 'motocle_quieto2', frame: 0 }], frameRate: 1, repeat: -1 });
            }
        } catch (e) { console.log('Error creando anims motocle:', e); }

        const PLAYER_BASE_Y = 450;
        const startX = -220;
        const scale = 0.16;

        this.motocle = this.physics.add.sprite(startX, PLAYER_BASE_Y, this.textures.exists('motocle_run') ? 'motocle_run' : 'motocle_quieto2', 0).setDepth(100);
        this.motocle.setScale(scale);
        this.motocle.setBounce(0.2);
        this.motocle.setCollideWorldBounds(true);
        this.motocle.setOrigin(0.5, 1);
        try { this.motocle.body.setOffset(0, this.motocle.height * (1 - this.motocle.originY)); } catch(e) {}

        // entrada corriendo (si existe animación de correr)
        try { if (this.anims.exists('motocle_run_anim')) this.motocle.play('motocle_run_anim'); } catch(e) {}

        // Tween de entrada (llega a la posición cercana al objetivo actual)
        const initialTarget = this.getMotocleTarget();
        const initialTargetX = (initialTarget && initialTarget.x) ? Math.max(120, initialTarget.x - 120) : 320;
        this.tweens.add({ targets: this.motocle, x: initialTargetX, duration: 2200, ease: 'Power1', onComplete: () => {
            try { if (this.anims.exists('motocle_quieto2_anim')) this.motocle.play('motocle_quieto2_anim'); } catch(e) {}
            console.log('Motocle ha entrado en Nivel 2 como compañero bot');
        }});

        // Vida sencilla para Motocle (se puede ampliar luego)
        this.motocle.health = 200;
        this.motocle.isInvulnerable = false;
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

        // Seguir al objetivo seleccionado
        const followDistance = 80;
        const maxSpeed = 140;
        const targetX = target.x - followDistance;
        const dx = targetX - this.motocle.x;
        const desiredVx = Phaser.Math.Clamp(dx * 2, -maxSpeed, maxSpeed);
        const currentVx = this.motocle.body.velocity.x || 0;
        const newVx = Phaser.Math.Linear(currentVx, desiredVx, 0.12);
        this.motocle.setVelocityX(newVx);

        // animaciones
        try {
            if (Math.abs(newVx) > 10) {
                if (this.anims.exists('motocle_run_anim')) this.motocle.play('motocle_run_anim', true);
            } else {
                if (this.anims.exists('motocle_quieto2_anim')) this.motocle.play('motocle_quieto2_anim', true);
            }
        } catch (e) {}

        // Flip según la dirección hacia el objetivo
        try { if (newVx < -10) this.motocle.setFlipX(true); else if (newVx > 10) this.motocle.setFlipX(false); } catch(e) {}

        // Saltos: si el objetivo salta y está cerca, motocle salta
        try {
            const targetJumping = target.body && target.body.velocity && target.body.velocity.y < -50;
            const closeEnough = Math.abs(target.x - this.motocle.x) < 140;
            if (targetJumping && closeEnough && this.motocle.body.touching.down) {
                this.motocle.setVelocityY(-330);
            }
            if ((this.motocle.body.blocked.left || this.motocle.body.blocked.right) && this.motocle.body.touching.down) {
                this.motocle.setVelocityY(-300);
            }
        } catch (e) {}
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
        
        if (this.gameState.coinsCollected >= this.gameState.totalCoins) {
            this.showVictoryLevel2();
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
}

export default Level2Scene;