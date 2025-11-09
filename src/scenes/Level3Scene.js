/**
 * Level3Scene.js - CORREGIDO
 * - Tercer nivel: La Fortaleza de los Cañones
 * - Fondo: Newfondo.jpg 
 * - Enemigos principales: Cañones que disparan balas de cañón
 * - Dificultad: Alta con proyectiles y explosiones
 */

import AssetManager from '../managers/AssetManager.js'; // ✅ AGREGAR
import PlayerManager from '../managers/PlayerManager.js';
import EnemyManager from '../managers/EnemyManager.js';
import UIManager from '../managers/UIManager.js';
import { createFireEffect } from '../utils/fireEffect.js'; // ✅ AGREGAR

class Level3Scene extends Phaser.Scene {
    constructor() {
        super('Level3Scene');
        this.gameState = {
            score: 0,
            health: 100,
            maxHealth: 100,
            coinsCollected: 0,
            totalCoins: 0,
            enemiesKilled: 0,
            level: 3
        };
        this.companionMaxHealth = 100;
        this.companionHealth = 100;
        this.isGamePaused = false;
        
        // Variables específicas del nivel 3
        this.cannons = null;
        this.cannonBalls = null;
        this.explosions = null;
        this.cannonFireRate = 3000;
    }

    init(data) {
        if (data) {
            this.gameState = { ...this.gameState, ...data };
            this.companionHealth = data.companionHealth || 100;
            console.log("🎮 Level 3 iniciado con datos:", this.gameState);
        }
    }

    preload() {
        // ✅ AGREGAR AssetManager como Level2
        this.assetManager = new AssetManager(this);
        this.assetManager.preloadAssets();
        
        console.log("📥 Cargando assets del Nivel 3...");
        
        // Cargar fondo específico del nivel 3
        this.load.image('level3-bg', 'assets/Newfondo.jpg');
        
        // ✅ Usar mismas texturas base que Level2
        if (!this.textures.exists('sky')) {
            this.load.image('sky', 'assets/fondo.png'); // Fallback
        }
        
        try {
            // Cargar sprites de cañones
            this.load.image('cannonIdle', 'assets/Items/mas/Treasure Hunters/Cannon/Cannon Idle/1.png');
            this.load.image('cannonFire', 'assets/Items/mas/Treasure Hunters/Cannon/Cannon Fire/1.png');
            this.load.image('cannonDestroyed', 'assets/Items/mas/Treasure Hunters/Cannon/Cannon Destroyed/1.png');
            
            // Cargar balas y efectos
            this.load.image('cannonBall', 'assets/Items/mas/Treasure Hunters/Cannon/Cannon Ball Idle/1.png');
            this.load.image('cannonExplosion', 'assets/Items/mas/Treasure Hunters/Cannon/Cannon Ball Explosion/1.png');
            
            // Cargar spritesheet del esqueleto (10 frames, 960px de ancho total)
            this.load.spritesheet('skeleton_walk', 
                'assets/Skeleton_White/Skeleton_With_VFX/Skeleton_01_White_Walk.png', 
                { 
                    frameWidth: 96,    // 960/10 = 96 pixels por frame
                    frameHeight: 64,    // altura real del sprite
                    margin: 0,
                    spacing: 0
                });
            
        } catch (error) {
            console.log("⚠️ Error cargando assets del Nivel 3:", error);
        }
        
        console.log("📥 Cargando assets para Nivel 3...");
    }

    create() {
        console.log('🏰 Creando Nivel 3...');
        
        // ✅ CONFIGURAR CONTROLES PRIMERO como Level2
        this.setupControls();

        // ✅ INICIALIZAR MANAGERS como Level2
        this.playerManager = new PlayerManager(this);
        this.enemyManager = new EnemyManager(this);
        this.uiManager = new UIManager(this);

        // ✅ CONFIGURAR MUNDO MÁS GRANDE como Level2
        const { width, height } = this.sys.game.config;
        const worldWidth = 4000; // Mismo que Level2
        this.levelWorldWidth = worldWidth;
        this.physics.world.setBounds(0, 0, worldWidth, height);

        console.log(`🌍 Mundo Nivel 3 configurado: ${worldWidth}x${height}`);

        // ✅ CREAR FALLBACKS Y ANIMACIONES como Level2
        this.assetManager.createFallbackTextures();
        this.createLevel3Background();
        this.createLevel3Platforms();
        this.assetManager.createAnimations();

        // ✅ CREAR ENTIDADES como Level2
        this.playerManager.createPlayer();
        this.player.health = this.gameState.health || 100;
        this.player.isInvulnerable = false;
        this.player.clearTint();
    
        this.playerManager.createCompanion();
        this.companion.health = this.companionHealth;
        
        // ✅ CREAR ELEMENTOS DEL NIVEL
        this.createLevel3Coins();
        this.createLevel3Cannons(); // ✅ Cañones corregidos
        this.createLevel3Enemies(); // ✅ AGREGAR ENEMIGOS TRADICIONALES
        this.createLevel3Items();

        // ✅ SETUP FÍSICAS como Level2
        this.setupLevel3Physics();
        
        // ✅ CREAR CÁMARA UI SEPARADA como Level2
        this.uiCamera = this.cameras.add(0, 0, width, height, false, 'UICam');
        this.uiCamera.setScroll(0, 0);
        this.uiCamera.setZoom(1);
        this.uiCamera.ignore([]);

        this.uiManager.createUI();
        
        // ✅ CONFIGURAR CÁMARA UI como Level2
        try {
            if (this.uiManager.uiContainer) {
                this.uiCamera.ignore(this.children.list.filter(obj => !this.uiManager.uiContainer.list.includes(obj)));
            }
        } catch (e) {}

        this.setupCamera();

        // ✅ EFECTOS DE FUEGO como Level2 pero temático
        this.createLevel3FireEffects();

        // ✅ MOSTRAR MENSAJE
        this.showLevel3Message();

        console.log("✅ Nivel 3 creado exitosamente");
    }

    createLevel3Background() {
        const { width, height } = this.sys.game.config;
        const worldWidth = 4000;
        
        console.log(`🔍 Dimensiones Nivel 3: ${width}x${height}`);
        console.log(`🌍 Ancho del mundo: ${worldWidth}`);
        console.log(`📂 level3-bg existe: ${this.textures.exists('level3-bg')}`);
        console.log(`📂 sky existe: ${this.textures.exists('sky')}`);
        
        if (this.textures.exists('level3-bg')) {
            console.log(`✅ Usando textura level3-bg`);
            
            // Obtener dimensiones reales de la imagen
            const bgTexture = this.textures.get('level3-bg');
            const bgOriginalWidth = bgTexture.source[0].width;
            const bgOriginalHeight = bgTexture.source[0].height;
            
            console.log(`📐 Imagen original Nivel 3: ${bgOriginalWidth}x${bgOriginalHeight}`);
            
            // Escalar basado en altura
            const scale = height / bgOriginalHeight;
            const scaledWidth = bgOriginalWidth * scale;
            
            // Calcular repeticiones
            const numBackgrounds = Math.ceil(worldWidth / scaledWidth) + 1;
            
            console.log(`📐 Escala aplicada: ${scale.toFixed(2)}`);
            console.log(`📐 Ancho tras escalar: ${scaledWidth.toFixed(2)}`);
            console.log(`📐 Repeticiones necesarias: ${numBackgrounds}`);
            
            for (let i = 0; i < numBackgrounds; i++) {
                const x = i * scaledWidth;
                const bg = this.add.image(x + scaledWidth/2, height/2, 'level3-bg');
                bg.setScale(scale);
                bg.setDepth(-1);
                bg.setTint(0xAAAAAA); // Tinte más oscuro para nivel 3
                console.log(`🏰 Fondo Nivel 3 ${i + 1} colocado en x: ${(x + scaledWidth/2).toFixed(2)}`);
            }
            
            console.log(`✅ Fondo Level 3 completado con ${numBackgrounds} imágenes`);
            
        } else if (this.textures.exists('sky')) {
            console.log(`⚠️ level3-bg no encontrado, usando fallback 'sky'`);
            
            const skyTexture = this.textures.get('sky');
            const bgOriginalWidth = skyTexture.source[0].width;
            const bgOriginalHeight = skyTexture.source[0].height;
            
            const scale = height / bgOriginalHeight;
            const scaledWidth = bgOriginalWidth * scale;
            const numBackgrounds = Math.ceil(worldWidth / scaledWidth) + 1;
            
            console.log(`📐 Sky Nivel 3: ${bgOriginalWidth}x${bgOriginalHeight}`);
            
            for (let i = 0; i < numBackgrounds; i++) {
                const x = i * scaledWidth;
                const bg = this.add.image(x + scaledWidth/2, height/2, 'sky');
                bg.setScale(scale);
                bg.setTint(0x666699); // Tinte púrpura oscuro para nivel 3
                bg.setDepth(-1);
                console.log(`🏰 Sky Nivel 3 ${i + 1} colocado en x: ${(x + scaledWidth/2).toFixed(2)}`);
            }
            
            console.log(`✅ Fallback sky Nivel 3 aplicado con tinte púrpura`);
            
        } else {
            console.log(`❌ Sin texturas disponibles, creando fondo de color Nivel 3`);
            
            const sectionWidth = 1000;
            const numSections = Math.ceil(worldWidth / sectionWidth) + 1;
            
            for (let i = 0; i < numSections; i++) {
                const x = i * sectionWidth;
                // Color más oscuro y dramático para nivel 3
                const rect = this.add.rectangle(x + sectionWidth/2, height/2, sectionWidth, height, 0x2d1b69);
                rect.setDepth(-1);
                console.log(`🏰 Sección Nivel 3 ${i + 1} creada en x: ${x + sectionWidth/2}`);
            }
            
            console.log(`✅ Fondo de color Nivel 3 creado con ${numSections} secciones`);
        }
    }

    createLevel3Platforms() {
        this.platforms = this.physics.add.staticGroup();
        const groundTexture = this.textures.exists('ground') ? 'ground' : null;
        
        const tileWidth = 32;
        const tileHeight = 8;
        
        if (groundTexture) {
            // ✅ PLATAFORMAS SIMILARES A LEVEL2 pero adaptadas para cañones
            const platformConfigs = [
                { x: 400, y: 568, tilesX: 25, tilesY: 4 },   // Plataforma base
                { x: 600, y: 450, tilesX: 4, tilesY: 2 },    // Plataforma pequeña
                { x: 900, y: 380, tilesX: 5, tilesY: 3 },    // Plataforma media
                { x: 1300, y: 320, tilesX: 6, tilesY: 3 },   // Plataforma alta
                { x: 1700, y: 480, tilesX: 4, tilesY: 2 },   // Plataforma flotante
                
                // ✅ PLATAFORMAS ESPECIALES PARA CAÑONES
                { x: 400, y: 300, tilesX: 4, tilesY: 2 },    // Base cañón 1
                { x: 800, y: 250, tilesX: 4, tilesY: 2 },    // Base cañón 2
                { x: 1200, y: 200, tilesX: 4, tilesY: 2 },   // Base cañón 3
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
                        tile.setTint(0x654321); // Tinte más oscuro para nivel 3
                        tile.refreshBody();
                    }
                }
            });
        } else {
            // ✅ FALLBACK con rectángulos como antes pero mejorado
            const platformPositions = [
                { x: 500, y: 580, width: 1000, height: 40 },
                { x: 200, y: 500, width: 200, height: 32 },
                { x: 600, y: 450, width: 200, height: 32 },
                { x: 900, y: 400, width: 200, height: 32 },
                { x: 1300, y: 350, width: 200, height: 32 },
                { x: 400, y: 300, width: 120, height: 32 },
                { x: 800, y: 250, width: 120, height: 32 },
                { x: 1200, y: 200, width: 120, height: 32 }
            ];
            
            platformPositions.forEach(pos => {
                const platform = this.add.rectangle(pos.x, pos.y, pos.width, pos.height, 0x654321);
                platform.setStrokeStyle(2, 0x4A2C17);
                this.physics.add.existing(platform, true);
                this.platforms.add(platform);
            });
        }
        
        console.log("✅ Plataformas Nivel 3 creadas");
    }

    createLevel3Coins() {
        this.coins = this.physics.add.group();
        const coinTexture = this.textures.exists('coin') ? 'coin' : 'coinFallback';
        
        // ✅ MÁS MONEDAS Y EN POSICIONES MÁS DESAFIANTES
        const coinPositions = [
            { x: 200, y: 450 }, { x: 250, y: 450 }, { x: 300, y: 450 },
            { x: 600, y: 400 }, { x: 650, y: 400 }, { x: 700, y: 400 },
            { x: 900, y: 350 }, { x: 950, y: 350 }, { x: 1000, y: 350 },
            { x: 400, y: 250 }, { x: 800, y: 200 }, { x: 1200, y: 150 },
            { x: 1300, y: 300 }, { x: 1350, y: 300 }, { x: 1400, y: 300 },
            { x: 1700, y: 430 }, { x: 2000, y: 200 }, { x: 2400, y: 350 },
            { x: 2600, y: 150 }, { x: 2800, y: 300 }
        ];
        
        coinPositions.forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, coinTexture);
            coin.setBounce(0.4);
            coin.setScale(2);
            coin.setTint(0xFFD700); // Monedas doradas
            if (this.anims.exists('coin-spin')) {
                coin.anims.play('coin-spin');
            }
        });
        
        this.gameState.totalCoins = coinPositions.length;
        console.log(`✅ ${coinPositions.length} monedas creadas en Nivel 3`);
    }

  // ...existing code...

createLevel3Cannons() {
    // ✅ CREAR COMO GRUPO ESTÁTICO PARA QUE NO CAIGAN
    this.cannons = this.physics.add.staticGroup();
    this.cannonBalls = this.physics.add.group();
    
    // ✅ CAÑONES PERFECTAMENTE ALINEADOS CON LAS PLATAFORMAS EXACTAS
    const cannonPositions = [
        // ✅ BASADO EN LAS COORDENADAS DE TUS PLATAFORMAS
        { x: 400, y: 268, direction: 'right', platform: 'Base cañón 1' },    // y: 300-32 = 268
        { x: 800, y: 218, direction: 'left', platform: 'Base cañón 2' },     // y: 250-32 = 218
        { x: 1200, y: 168, direction: 'right', platform: 'Base cañón 3' },   // y: 200-32 = 168
        
        // ✅ EN PLATAFORMAS PRINCIPALES
        { x: 600, y: 418, direction: 'left', platform: 'Plataforma pequeña' },   // y: 450-32 = 418
        { x: 1300, y: 288, direction: 'right', platform: 'Plataforma alta' },    // y: 320-32 = 288
        { x: 2000, y: 218, direction: 'left', platform: 'Plataforma muy alta' }, // y: 250-32 = 218
        { x: 2800, y: 318, direction: 'right', platform: 'Plataforma final' }    // y: 350-32 = 318
    ];
    
    cannonPositions.forEach((pos, index) => {
        const cannonTexture = this.textures.exists('cannonIdle') ? 'cannonIdle' : 'coinFallback';
        const cannon = this.cannons.create(pos.x, pos.y, cannonTexture);
        
        cannon.setScale(1.5); // ✅ TAMAÑO AJUSTADO PARA QUE QUEPA EN PLATAFORMA
        cannon.setTint(0x444444);
        cannon.setOrigin(0.5, 1); // ✅ ORIGEN EN LA BASE
        
        // ✅ PROPIEDADES
        cannon.health = 80;
        cannon.maxHealth = 80;
        cannon.damage = 35;
        cannon.direction = pos.direction;
        cannon.lastFire = 0;
        cannon.fireRate = 2500 + (index * 400);
        cannon.enemyType = 'cannon';
        cannon.isDestroyed = false;
        cannon.platformName = pos.platform;
        
        // ✅ FLIP CORREGIDO - ASEGURAR CONSISTENCIA VISUAL
        if (pos.direction === 'left') {
            cannon.setFlipX(true);  // ✅ FLIP PARA APUNTAR IZQUIERDA
        } else {
            cannon.setFlipX(false); // ✅ NORMAL PARA APUNTAR DERECHA
        }
        
        // ✅ REFRESHBODY PARA APLICAR CAMBIOS
        cannon.refreshBody();
        
        console.log(`🔫 Cañón en ${pos.platform} (${pos.x}, ${pos.y}) → ${pos.direction}, flip: ${cannon.flipX}`);
    });
    
    this.startCannonFiring();
    
    console.log(`✅ ${this.cannons.children.size} cañones correctamente posicionados`);
}

// ...existing code...

    // ✅ NUEVO MÉTODO: Crear enemigos tradicionales junto con cañones
    createLevel3Enemies() {
        this.enemies = this.physics.add.group();
        
        // Crear animación del esqueleto
        this.anims.create({
            key: 'skeleton_walk_anim',
            frames: this.anims.generateFrameNumbers('skeleton_walk', { 
                start: 1, 
                end: 10  // 10 frames en total
            }),
            frameRate: 10,
            repeat: -1
        });
        
        // Crear un esqueleto
        const skeleton = this.enemies.create(300, 500, 'skeleton_walk');
        skeleton.setScale(1);  // Tamaño original
        skeleton.setBounce(0.1);
        skeleton.setCollideWorldBounds(true);
        skeleton.setVelocityX(60);
        skeleton.health = 120;
        skeleton.damage = 40;
        skeleton.enemyType = 'skeleton';
        skeleton.setOrigin(0.5, 1); // Alinear con el suelo
        
        // Iniciar la animación de caminar
        skeleton.play('skeleton_walk_anim', true);
        
        // Añadir comportamiento de patrulla
        skeleton.patrolPoints = [
            { x: 300, y: 500 },
            { x: 600, y: 500 }
        ];
        skeleton.currentPoint = 0;
        skeleton.direction = 1;
        
        // Actualizar el movimiento del esqueleto
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (!skeleton.active) return;
                
                const targetX = skeleton.patrolPoints[skeleton.currentPoint].x;
                
                if (Math.abs(skeleton.x - targetX) < 10) {
                    skeleton.currentPoint = (skeleton.currentPoint + 1) % skeleton.patrolPoints.length;
                    skeleton.direction *= -1;
                    skeleton.setVelocityX(60 * skeleton.direction);
                    skeleton.setFlipX(skeleton.direction < 0);
                    
                    // Asegurar que la animación sigue corriendo
                    if (!skeleton.anims.isPlaying) {
                        skeleton.play('skeleton_walk_anim');
                    }
                }
            },
            loop: true
        });
        
        // ✅ TEXTURAS DE ENEMIGOS
        const rinoTexture = this.textures.exists('rino-idle') ? 'rino-idle' : 'gallinaFallback';
        const bluebirdTexture = this.textures.exists('bluebird-flying') ? 'bluebird-flying' : 'gallinaFallback';
        const angryPigTexture = this.textures.exists('angrypig-idle') ? 'angrypig-idle' : 'gallinaFallback';
        
        // ✅ ENEMIGOS ESTRATÉGICAMENTE COLOCADOS ENTRE CAÑONES
        const enemyPositions = [
            // Zona inicial - cerca del primer cañón
            { x: 300, y: 500, type: 'angrypig' },   // Cerdo patrullando
            { x: 550, y: 350, type: 'bluebird' },  // Pájaro volando
            
            // Zona media - entre cañones 2 y 3
            { x: 750, y: 180, type: 'bluebird' },  // Pájaro alto
            { x: 950, y: 340, type: 'rino' },      // Rino tanque
            { x: 1100, y: 130, type: 'bluebird' }, // Pájaro muy alto
            
            // Zona alta - cerca del cañón 3
            { x: 1250, y: 130, type: 'angrypig' }, // Cerdo en plataforma alta
            { x: 1400, y: 270, type: 'rino' },     // Rino defensor
            
            // Zona intermedia
            { x: 1600, y: 100, type: 'bluebird' }, // Pájaro patrol aéreo
            { x: 1850, y: 180, type: 'angrypig' }, // Cerdo avanzado
            
            // Zona final - antes del último cañón
            { x: 2200, y: 440, type: 'rino' },     // Rino guardian
            { x: 2400, y: 120, type: 'bluebird' }, // Pájaro final
            { x: 2650, y: 280, type: 'angrypig' }, // Cerdo boss
            
            // Extra challenge
            { x: 3000, y: 150, type: 'bluebird' }, // Pájaro final boss
            { x: 3200, y: 280, type: 'rino' }      // Rino final boss
        ];

        enemyPositions.forEach((pos, index) => {
            let enemy;
            
            if (pos.type === 'angrypig') {
                enemy = this.enemies.create(pos.x, pos.y, angryPigTexture);
                enemy.setBounce(0.1);
                enemy.setCollideWorldBounds(true);
                enemy.setVelocity(Phaser.Math.Between(-60, 60), 0);
                enemy.health = 100; // ✅ MÁS VIDA EN NIVEL 3
                enemy.damage = 35;  // ✅ MÁS DAÑO
                enemy.enemyType = 'angrypig';
                enemy.setScale(1.5); // Más grande
                enemy.setTint(0xFF3333); // Rojo intenso
                enemy.isLevel3 = true;
                
                // Propiedades específicas
                enemy.isAngry = false;
                enemy.hasAngryTint = false;
                enemy.patrolTimer = 0;
                enemy.randomMoveTimer = 0;
                enemy.angryStartTime = 0;
                
                if (this.anims.exists('angrypig-idle')) {
                    enemy.anims.play('angrypig-idle', true);
                }
                
                console.log(`🐷 AngryPig Nivel 3 en (${pos.x}, ${pos.y})`);
                
            } else if (pos.type === 'rino') {
                enemy = this.enemies.create(pos.x, pos.y, rinoTexture);
                enemy.setBounce(0.1);
                enemy.setCollideWorldBounds(true);
                enemy.setVelocity(0, 0);
                enemy.health = 140; // ✅ TANQUE MÁXIMO
                enemy.damage = 50;  // ✅ DAÑO DEVASTADOR
                enemy.enemyType = 'rino';
                enemy.setScale(1.4); // Más grande
                enemy.setTint(0x8B4513); // Marrón metálico
                
                if (this.anims.exists('rino-idle')) {
                    enemy.anims.play('rino-idle', true);
                }
                
                console.log(`🦏 Rino tanque Nivel 3 en (${pos.x}, ${pos.y})`);
                
            } else if (pos.type === 'bluebird') {
                enemy = this.enemies.create(pos.x, pos.y, bluebirdTexture);
                enemy.setBounce(0);
                enemy.setCollideWorldBounds(false);
                enemy.body.setGravityY(-250); // Más flotante
                enemy.setVelocity(Phaser.Math.Between(-90, 90), Phaser.Math.Between(-70, 70));
                enemy.health = 80;
                enemy.damage = 40; // ✅ MÁS DAÑO AÉREO
                enemy.enemyType = 'bluebird';
                enemy.setScale(1.5); // Más grande
                enemy.setTint(0x0055FF); // Azul más intenso
                
                enemy.flightPattern = 'figure8';
                enemy.centerX = pos.x;
                enemy.centerY = pos.y;
                enemy.angle = 0;
                enemy.attackCooldown = 0;
                enemy.isAttacking = false;
                
                if (this.anims.exists('bluebird-flying')) {
                    enemy.anims.play('bluebird-flying', true);
                }
                
                console.log(`🐦 Bluebird Nivel 3 en (${pos.x}, ${pos.y})`);
            }
        });
        
        console.log(`✅ ${enemyPositions.length} enemigos tradicionales creados en Nivel 3`);
    }

    createLevel3Items() {
        this.items = this.physics.add.group();
        const potionTexture = this.textures.exists('health-potion') ? 'health-potion' : 'coinFallback';
        
        // ✅ MÁS POCIONES debido a la mayor dificultad
        const itemPositions = [
            { x: 1000, y: 200 }, { x: 1500, y: 150 }, 
            { x: 2100, y: 100 }, { x: 2600, y: 250 },
            { x: 800, y: 180 }, { x: 1300, y: 250 }
        ];
        
        itemPositions.forEach(pos => {
            const item = this.items.create(pos.x, pos.y, potionTexture);
            item.setBounce(0.2);
            item.setScale(2);
            item.setTint(0x00FF00); // Verde brillante
            item.itemType = 'health';
        });
        
        console.log(`✅ ${itemPositions.length} pociones creadas en Nivel 3`);
    }

    createLevel3FireEffects() {
        // ✅ EFECTOS DE FUEGO ESPECÍFICOS DEL NIVEL 3 (más intensos)
        const firePositions = [
            { x: 300, y: 520, color: 0xff1100, particles: 30 },
            { x: 700, y: 500, color: 0xff4400, particles: 28 },
            { x: 1100, y: 540, color: 0xff6600, particles: 32 },
            { x: 1500, y: 520, color: 0xff1100, particles: 35 },
            { x: 1900, y: 530, color: 0xff4400, particles: 30 },
            { x: 2300, y: 510, color: 0xff6600, particles: 33 },
            { x: 2700, y: 540, color: 0xff1100, particles: 38 }
        ];
        
        firePositions.forEach(fire => {
            createFireEffect(this, fire.x, fire.y, { 
                color: fire.color, 
                numParticles: fire.particles, 
                radius: 18 // Más grande que Level2
            });
        });
    }

    setupLevel3Physics() {
        if (!this.platforms || !this.coins || !this.cannons || !this.enemies || !this.items) {
            console.error("❌ Objetos de física no inicializados correctamente en Nivel 3");
            return;
        }

        if (this.player && this.player.active) {
            this.physics.add.collider(this.player, this.platforms);
            this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
            this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
            
            // ✅ COLISIONES CON CAÑONES
            this.physics.add.overlap(this.player, this.cannons, this.hitPlayerWithCannon, null, this);
            this.physics.add.overlap(this.player, this.cannonBalls, this.hitPlayerWithCannonBall, null, this);
            
            // ✅ COLISIONES CON ENEMIGOS TRADICIONALES
            this.physics.add.overlap(this.player, this.enemies, this.enemyManager.hitEnemy.bind(this.enemyManager), null, this);
        }
        
        if (this.companion && this.companion.active) {
            this.physics.add.collider(this.companion, this.platforms);
            this.physics.add.overlap(this.companion, this.coins, this.collectCoin, null, this);
            
            // ✅ COLISIONES CON CAÑONES
            this.physics.add.overlap(this.companion, this.cannons, this.hitCompanionWithCannon, null, this);
            this.physics.add.overlap(this.companion, this.cannonBalls, this.hitCompanionWithCannonBall, null, this);
            
            // ✅ COLISIONES CON ENEMIGOS TRADICIONALES
            this.physics.add.overlap(this.companion, this.enemies, this.hitCompanion, null, this);
        }
        
        // ✅ COLISIONES DE OBJETOS CON PLATAFORMAS
        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms); // ✅ ENEMIGOS CON PLATAFORMAS
        this.physics.add.collider(this.items, this.platforms);
        this.physics.add.collider(this.cannonBalls, this.platforms, this.cannonBallHitPlatform, null, this);
        
        console.log("✅ Físicas Nivel 3 configuradas: Cañones + Enemigos tradicionales");
    }

    setupControls() {
        // ✅ CONTROLES IDÉNTICOS A LEVEL2
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,I,ENTER,ESC,LEFT,RIGHT,UP,DOWN,Z,X');
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        console.log("✅ Controles Nivel 3 configurados");
    }

    setupCamera() {
        // ✅ CÁMARA SIMILAR A LEVEL2
        const worldWidth = this.levelWorldWidth || 4000;
        this.cameras.main.setBounds(0, 0, worldWidth, this.sys.game.config.height);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1);
        this.cameras.main.setZoom(1.5); // Mismo zoom que Level2
    }

    // ✅ RESTO DE MÉTODOS IGUALES PERO CON ALGUNOS AJUSTES...
    // [Incluir todos los métodos de colisión, disparo de cañones, etc.]

    // ✅ MÉTODO COLLECTCOIN IGUAL A LEVEL2
    collectCoin(player, coin) {
        coin.destroy();
        this.gameState.score += 200; // Más puntos en nivel 3
        this.gameState.coinsCollected++;
        
        this.uiManager.updateScore();
        this.uiManager.updateCoins();
        
        console.log(`🪙 Moneda Nivel 3: ${this.gameState.coinsCollected}/${this.gameState.totalCoins}`);
        
        // ✅ VERIFICAR COMPLETACIÓN IGUAL A LEVEL2
        this.checkLevelCompletion();
    }

    collectItem(player, item) {
        if (item.itemType === 'health') {
            item.destroy();
            player.health = Math.min(player.health + 80, this.gameState.maxHealth); // Más curación
            this.gameState.health = player.health;
            this.uiManager.updateHealth();
            console.log("💚 Vida restaurada en Nivel 3!");
        }
    }

    checkLevelCompletion() {
        if (this.gameState.coinsCollected >= this.gameState.totalCoins) {
            console.log("🏆 ¡Nivel 3 completado!");
            this.levelComplete();
        }
    }

    // ✅ UPDATE MÉTODO IGUAL A LEVEL2
    update() {
        if (this.isGamePaused) return;

        // Control de cámara para personajes
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

        // Controles de jugadores
        if (this.player && this.player.active && this.playerManager) {
            try {
                this.playerManager.handleMovement(this.keys);
                this.playerManager.handleAnimations();
            } catch(e) {
                console.log("⚠️ Error jugador Nivel 3:", e);
            }
        }
        
        if (this.companion && this.companion.active && this.playerManager) {
            try {
                this.playerManager.handleCompanionMovement();
            } catch(e) {}
        }
        
        // Actualizar managers
        if (this.enemyManager) {
            try {
                this.enemyManager.updateEnemies();
            } catch(e) {}
        }
        
        // Ataques
        if (this.player && this.keys.I && Phaser.Input.Keyboard.JustDown(this.keys.I)) {
            try {
                this.playerManager.performAttack();
            } catch(e) {}
        }
        
        if (this.companion && this.keys.ENTER && Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
            try {
                this.playerManager.performCompanionAttack();
            } catch(e) {}
        }
        
        // ESC para salir
        if (this.keys.ESC && Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            this.scene.start('GameScene');
        }
        
        // Zoom
        if (this.keys.Z && Phaser.Input.Keyboard.JustDown(this.keys.Z)) {
            this.cameras.main.setZoom(Math.min(2.5, this.cameras.main.zoom + 0.1));
        }
        if (this.keys.X && Phaser.Input.Keyboard.JustDown(this.keys.X)) {
            this.cameras.main.setZoom(Math.max(0.5, this.cameras.main.zoom - 0.1));
        }
    }

    // [Mantener todos los métodos de cañones: startCannonFiring, updateCannons, etc.]

    // ✅ FUNCIÓN PARA MOSTRAR MENSAJE DEL NIVEL 3
    showLevel3Message() {
        const { width, height } = this.sys.game.config;
        
        const levelText = this.add.text(width/2, height/2, 
            '🏰 NIVEL 3: LA FORTALEZA 🏰\n\n💣 ¡Cuidado con los cañones! 💣', 
            {
                fontSize: '32px',
                color: '#FFD700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(1000).setScrollFactor(0);

        this.tweens.add({
            targets: levelText,
            alpha: 0,
            duration: 3000,
            delay: 2000,
            onComplete: () => levelText.destroy()
        });
    }

    // ✅ FUNCIÓN LEVEL COMPLETE CON BOTÓN SPACE
    levelComplete() {
        console.log("🎉 ¡Nivel 3 completado! La Fortaleza ha sido conquistada!");
        
        this.physics.pause();
        this.isGamePaused = true;
        
        const { width, height } = this.sys.game.config;
        
        // ✅ MENSAJE DE VICTORIA
        const victoryText = this.add.text(width/2, height/2 - 50, 
            '🏰 ¡FORTALEZA CONQUISTADA! 🏰', 
            {
                fontSize: '36px',
                color: '#FFD700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

        const completedText = this.add.text(width/2, height/2 + 20, 
            '🎊 ¡JUEGO COMPLETADO! 🎊\n\n✨ ¡Eres un verdadero ninja! ✨', 
            {
                fontSize: '24px',
                color: '#00ff00',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

        // ✅ TEXTO DE INSTRUCCIONES CON ESPACIO
        const continueText = this.add.text(width/2, height/2 + 120, 
            '🎮 Presiona ESPACIO para Menú Principal 🎮', 
            {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

        // ✅ ANIMACIONES
        this.tweens.add({
            targets: [victoryText, completedText],
            alpha: { from: 0, to: 1 },
            y: '-=20',
            duration: 800,
            ease: 'Back.easeOut'
        });

        // ✅ ANIMACIÓN PARPADEANTE PARA SPACE
        this.tweens.add({
            targets: continueText,
            alpha: { from: 0, to: 1 },
            duration: 1000,
            delay: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ✅ FUNCIÓN PARA IR AL MENÚ
        const goToMenu = () => {
            // Remover listener para evitar múltiples activaciones
            this.input.keyboard.off('keydown-SPACE', spaceHandler);
            this.input.off('pointerdown', clickHandler);
            
            console.log("🚀 Regresando al menú principal...");
            
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        };

        // ✅ HANDLER PARA ESPACIO
        const spaceHandler = (event) => {
            if (event.code === 'Space') {
                goToMenu();
            }
        };

        // ✅ HANDLER PARA CLICK
        const clickHandler = () => {
            goToMenu();
        };

        // ✅ AGREGAR LISTENERS
        this.input.keyboard.on('keydown-SPACE', spaceHandler);
        this.input.on('pointerdown', clickHandler);

        // ✅ TRANSICIÓN AUTOMÁTICA DESPUÉS DE 10 SEGUNDOS
        this.time.delayedCall(10000, () => {
            console.log("⏰ Tiempo agotado - regresando automáticamente al menú...");
            goToMenu();
        });
    }

    // ✅ FUNCIONES DEL SISTEMA DE CAÑONES
    startCannonFiring() {
        this.cannonTimer = this.time.addEvent({
            delay: 1000, // Verificar cada segundo
            callback: this.updateCannons,
            callbackScope: this,
            loop: true
        });
    }

    updateCannons() {
        if (this.isGamePaused) return;
        
        const currentTime = this.time.now;
        
        this.cannons.children.entries.forEach(cannon => {
            if (cannon.isDestroyed || !cannon.active) return;
            
            // ✅ VERIFICAR SI DEBE DISPARAR
            if (currentTime - cannon.lastFire > cannon.fireRate) {
                if (this.isPlayerInCannonRange(cannon)) {
                    this.fireCannon(cannon);
                    cannon.lastFire = currentTime;
                }
            }
        });
        
        // ✅ ACTUALIZAR BALAS DE CAÑÓN
        this.updateCannonBalls();
    }

    isPlayerInCannonRange(cannon) {
        const range = 500; // Rango de detección
        
        // Verificar jugador
        if (this.player && this.player.active) {
            const distance = Phaser.Math.Distance.Between(
                cannon.x, cannon.y, this.player.x, this.player.y
            );
            
            // ✅ DEBUG: Verificar si está en el lado correcto
            const playerSide = this.player.x < cannon.x ? 'left' : 'right';
            
            if (distance < range) {
                console.log(`🎯 Jugador detectado: está al ${playerSide} del cañón que apunta hacia ${cannon.direction}`);
                
                // ✅ OPCIONAL: Solo disparar si el jugador está en la dirección correcta
                // if (cannon.direction === playerSide) {
                    return true;
                // }
            }
        }
        
        // Verificar compañero
        if (this.companion && this.companion.active) {
            const distance = Phaser.Math.Distance.Between(
                cannon.x, cannon.y, this.companion.x, this.companion.y
            );
            
            const companionSide = this.companion.x < cannon.x ? 'left' : 'right';
            
            if (distance < range) {
                console.log(`🎯 Compañero detectado: está al ${companionSide} del cañón que apunta hacia ${cannon.direction}`);
                return true;
            }
        }
        
        return false;
    }
// ...existing code...

fireCannon(cannon) {
    if (cannon.isDestroyed) return;
    
    console.log(`💥 Cañón disparando desde (${cannon.x}, ${cannon.y}) hacia ${cannon.direction}`);
    
    const fireTexture = this.textures.exists('cannonFire') ? 'cannonFire' : 'coinFallback';
    const originalTexture = cannon.texture.key;
    const originalFlip = cannon.flipX;
    
    cannon.setTexture(fireTexture);
    
    // ✅ CREAR BALA DE CAÑÓN
    const ballTexture = this.textures.exists('cannonBall') ? 'cannonBall' : 'coinFallback';
    
    // ✅ CALCULAR POSICIÓN DE SALIDA CORRECTA BASADA EN LA ORIENTACIÓN REAL
    let ballStartX = cannon.x;
    let ballStartY = cannon.y - 15; // Ligeramente arriba del cañón
    
    // ✅ AJUSTAR POSICIÓN SEGÚN LA DIRECCIÓN Y FLIP
    if (cannon.flipX) {
        // Si está flippeado, la boca del cañón está a la izquierda
        ballStartX = cannon.x - 40; // Bala sale del lado izquierdo
        console.log(`🔫 Cañón flippeado - bala sale por la IZQUIERDA desde x: ${ballStartX}`);
    } else {
        // Si NO está flippeado, la boca del cañón está a la derecha
        ballStartX = cannon.x + 40; // Bala sale del lado derecho  
        console.log(`🔫 Cañón normal - bala sale por la DERECHA desde x: ${ballStartX}`);
    }
    
    const ball = this.cannonBalls.create(ballStartX, ballStartY, ballTexture);
    
    ball.setScale(1.5);
    ball.setBounce(0.2);
    ball.setTint(0x333333);
    
    // ✅ VELOCIDAD DEBE COINCIDIR CON LA ORIENTACIÓN VISUAL
    const speed = 300;
    
    if (cannon.flipX) {
        // Si está flippeado, dispara hacia la izquierda
        ball.setVelocityX(-speed); 
        console.log(`🔫 Bala → IZQUIERDA (-${speed})`);
    } else {
        // Si NO está flippeado, dispara hacia la derecha
        ball.setVelocityX(speed);  
        console.log(`🔫 Bala → DERECHA (+${speed})`);
    }
    
    ball.setVelocityY(-50); // Arco parabólico
    
    // ✅ PROPIEDADES DE LA BALA
    ball.damage = cannon.damage;
    ball.lifespan = 5000;
    ball.birthTime = this.time.now;
    ball.cannonDirection = cannon.flipX ? 'left' : 'right'; // ✅ Basado en flipX real
    
    // ✅ SHAKE DE CÁMARA
    this.cameras.main.shake(100, 0.015);
    
    // ✅ VOLVER A IDLE
    this.time.delayedCall(300, () => {
        if (cannon && cannon.active && !cannon.isDestroyed) {
            const idleTexture = this.textures.exists('cannonIdle') ? 'cannonIdle' : 'coinFallback';
            cannon.setTexture(idleTexture);
            cannon.setFlipX(originalFlip);
        }
    });
}


    updateCannonBalls() {
        const currentTime = this.time.now;
        
        this.cannonBalls.children.entries.forEach(ball => {
            if (!ball.active) return;
            
            // ✅ DESTRUIR BALAS VIEJAS
            if (currentTime - ball.birthTime > ball.lifespan) {
                this.explodeCannonBall(ball);
                return;
            }
            
            // ✅ DESTRUIR BALAS FUERA DE PANTALLA
            if (ball.x < -100 || ball.x > 4100) {
                ball.destroy();
            }
        });
    }

    explodeCannonBall(ball) {
        if (!ball.active) return;
        
        console.log(`💥 Explosión de bala en (${ball.x}, ${ball.y})`);
        
        // ✅ CREAR EXPLOSIÓN VISUAL
        const explosionTexture = this.textures.exists('cannonExplosion') ? 'cannonExplosion' : 'coinFallback';
        const explosion = this.add.image(ball.x, ball.y, explosionTexture);
        explosion.setScale(2.5);
        explosion.setTint(0xFF4500);
        
        // ✅ ANIMACIÓN DE EXPLOSIÓN
        this.tweens.add({
            targets: explosion,
            scale: 0.8,
            alpha: 0,
            duration: 700,
            onComplete: () => explosion.destroy()
        });
        
        // ✅ SHAKE DE CÁMARA MÁS FUERTE
        this.cameras.main.shake(200, 0.025);
        
        // ✅ DESTRUIR BALA
        ball.destroy();
    }

    // ✅ FUNCIONES DE COLISIÓN CON CAÑONES
    hitPlayerWithCannon(player, cannon) {
        if (cannon.isDestroyed) return;
        if (this.enemyManager) {
            this.enemyManager.hitEnemy(player, cannon);
        }
    }

    hitCompanionWithCannon(companion, cannon) {
        if (cannon.isDestroyed) return;
        this.hitCompanion(companion, cannon);
    }

    hitPlayerWithCannonBall(player, ball) {
        console.log("💥 ¡Jugador impactado por bala de cañón!");
        this.explodeCannonBall(ball);
        
        if (this.enemyManager) {
            const ballEnemy = { 
                damage: ball.damage, 
                enemyType: 'cannonball' 
            };
            this.enemyManager.hitEnemy(player, ballEnemy);
        }
    }

    hitCompanionWithCannonBall(companion, ball) {
        console.log("💥 ¡Compañero impactado por bala de cañón!");
        this.explodeCannonBall(ball);
        
        const ballEnemy = { 
            damage: ball.damage, 
            enemyType: 'cannonball' 
        };
        this.hitCompanion(companion, ballEnemy);
    }

    cannonBallHitPlatform(ball, platform) {
        this.explodeCannonBall(ball);
    }

    // ✅ FUNCIÓN HITCOMPANION
    hitCompanion(companion, enemy) {
        if (companion.isInvulnerable) return;
        
        const damage = enemy.damage || 20;
        this.companionHealth -= damage;
        
        console.log(`💔 Compañero recibió ${damage} de daño. Vida: ${this.companionHealth}`);
        
        // ✅ EFECTOS VISUALES
        companion.setTint(0xff0000);
        companion.isInvulnerable = true;
        
        this.time.delayedCall(600, () => {
            if (companion && companion.active) {
                companion.clearTint();
                companion.isInvulnerable = false;
            }
        });
        
        // ✅ VERIFICAR SI MURIÓ
        if (this.companionHealth <= 0) {
            console.log("💀 Compañero eliminado en Nivel 3");
            companion.setActive(false);
            companion.setVisible(false);
            
            // Si ambos están muertos, game over
            if (!this.player.active) {
                this.gameOver();
            }
        }
        
        // ✅ ACTUALIZAR UI
        if (this.uiManager) {
            this.uiManager.updateCompanionHealth(this.companionHealth);
        }
    }

    // ✅ FUNCIÓN GAMEOVER
    gameOver() {
        console.log("💀 GAME OVER - Nivel 3");
        
        this.physics.pause();
        
        const gameData = {
            score: this.gameState.score,
            coins: this.gameState.coinsCollected,
            enemies: this.gameState.enemiesKilled || 0,
            health: this.gameState.health,
            level: 3
        };
        
        this.scene.start('GameOverScene', gameData);
    }
}

export default Level3Scene;