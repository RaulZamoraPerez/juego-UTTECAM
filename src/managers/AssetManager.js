/**
 *  AssetManager.js
 * - Carga todas las imágenes y sprites del juego
 * - Crea las animaciones de personajes y enemigos
 * - Genera texturas de respaldo si faltan archivos
 */

export default class AssetManager {
    constructor(scene) {
        this.scene = scene;
    }

    preloadAssets() {
        console.log("📥 Cargando todos los assets...");
        
        // === JUGADOR ===
        this.scene.load.spritesheet('ninja-idle', 'assets/player/Idle (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.scene.load.spritesheet('ninja-run', 'assets/player/Run (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.scene.load.spritesheet('ninja-jump', 'assets/player/Jump (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.scene.load.spritesheet('ninja-fall', 'assets/player/Fall (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.scene.load.spritesheet('ninja-hit', 'assets/player/Hit (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.scene.load.spritesheet('ninja-double-jump', 'assets/player/Double Jump (32x32).png', { frameWidth: 32, frameHeight: 32 });
        
        // === COMPAÑERO ===
        this.scene.load.spritesheet('amigo-idle', 'assets/amigo/Idle (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.scene.load.spritesheet('amigo-run', 'assets/amigo/Run (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.scene.load.spritesheet('amigo-attack', 'assets/amigo/Double Jump (32x32).png', { frameWidth: 32, frameHeight: 32 });
        
    // === ENEMIGOS ===
        this.scene.load.spritesheet('gallina-run', 'assets/animales/gallina/Run (32x34).png', { frameWidth: 32, frameHeight: 34 });
        this.scene.load.spritesheet('rino-idle', 'assets/animales/Rino/Idle (52x34).png', { frameWidth: 52, frameHeight: 34 });
        this.scene.load.spritesheet('rino-run', 'assets/animales/Rino/Run (52x34).png', { frameWidth: 52, frameHeight: 34 });
        this.scene.load.spritesheet('rino-hit', 'assets/animales/Rino/Hit (52x34).png', { frameWidth: 52, frameHeight: 34 });
        this.scene.load.spritesheet('rino-hit-wall', 'assets/animales/Rino/Hit Wall (52x34).png', { frameWidth: 52, frameHeight: 34 });
        
        // === BLUEBIRD (NUEVO ENEMIGO DIFÍCIL) ===
        this.scene.load.spritesheet('bluebird-flying', 'assets/animales/BlueBird/Flying (32x32).png', { frameWidth: 32, frameHeight: 32 });
        this.scene.load.spritesheet('bluebird-hit', 'assets/animales/BlueBird/Hit (32x32).png', { frameWidth: 32, frameHeight: 32 });
        
        // === SKULL (ENEMIGO NIVEL 2) ===
        this.scene.load.spritesheet('skull-idle1', 'assets/animales/Skull/Idle 1 (52x54).png', { frameWidth: 52, frameHeight: 54 });
        this.scene.load.spritesheet('skull-idle2', 'assets/animales/Skull/Idle 2 (52x54).png', { frameWidth: 52, frameHeight: 54 });
        this.scene.load.spritesheet('skull-hit', 'assets/animales/Skull/Hit (52x54).png', { frameWidth: 52, frameHeight: 54 });
        this.scene.load.spritesheet('skull-hit-wall1', 'assets/animales/Skull/Hit Wall 1 (52x54).png', { frameWidth: 52, frameHeight: 54 });
        this.scene.load.spritesheet('skull-hit-wall2', 'assets/animales/Skull/Hit Wall 2 (52x54).png', { frameWidth: 52, frameHeight: 54 });
        this.scene.load.image('skull-orange-particle', 'assets/animales/Skull/Orange Particle.png');
        this.scene.load.image('skull-red-particle', 'assets/animales/Skull/Red Particle.png');
        
        // === ANGRY PIG (ENEMIGO AMBOS NIVELES) ===
        this.scene.load.spritesheet('angrypig-idle', 'assets/animales/AngryPig/Idle (36x30).png', { frameWidth: 36, frameHeight: 30 });
        this.scene.load.spritesheet('angrypig-walk', 'assets/animales/AngryPig/Walk (36x30).png', { frameWidth: 36, frameHeight: 30 });
        this.scene.load.spritesheet('angrypig-run', 'assets/animales/AngryPig/Run (36x30).png', { frameWidth: 36, frameHeight: 30 });
        this.scene.load.spritesheet('angrypig-hit1', 'assets/animales/AngryPig/Hit 1 (36x30).png', { frameWidth: 36, frameHeight: 30 });
        this.scene.load.spritesheet('angrypig-hit2', 'assets/animales/AngryPig/Hit 2 (36x30).png', { frameWidth: 36, frameHeight: 30 });
        
        // === GATO (ANIMAL NEUTRAL QUE SOLO CAMINA) ===
        this.scene.load.spritesheet('cat-walk', 'assets/animales/cat/WALK.png', { frameWidth: 80, frameHeight: 64 });
        this.scene.load.spritesheet('cat-idle', 'assets/animales/cat/IDLE.png', { frameWidth: 80, frameHeight: 64 });
        
        // === MOTOCLE ===
    // La carga de Motocle se realiza en GameScene.js para evitar duplicados
        
        // === ITEMS Y MUNDO ===
        this.scene.load.spritesheet('coin', 'assets/dinero/coin.png', { frameWidth: 16, frameHeight: 16 });
        this.scene.load.image('sky', 'assets/fondo.png');
        this.scene.load.image('ground', 'assets/Brown On (32x8).png');
        this.scene.load.image('health-potion', 'assets/dinero/coin.png'); // Temporal

        // === FONDO NIVEL 2 ===
        this.scene.load.image('level2-bg', 'assets/image.png');
    }

    createFallbackTextures() {
        // Crear texturas de respaldo si faltan assets
        this.scene.add.graphics()
            .fillStyle(0x0099ff)
            .fillRect(0, 0, 32, 32)
            .generateTexture('ninjaFallback', 32, 32);

        this.scene.add.graphics()
            .fillStyle(0xff9900)
            .fillRect(0, 0, 32, 32)
            .generateTexture('companionFallback', 32, 32);

        this.scene.add.graphics()
            .fillStyle(0xffffff)
            .fillCircle(16, 16, 8)
            .generateTexture('gallinaFallback', 32, 32);

        console.log("✅ Texturas de respaldo creadas");
    }

    createAnimations() {
        const anims = this.scene.anims;
        
        try {
            // === NINJA ANIMATIONS ===
            if (this.scene.textures.exists('ninja-idle')) {
            // === MOTOCLE ANIMATIONS ===
            // Animaciones de Motocle se crean en GameScene.js
                anims.create({
                    key: 'ninja-idle',
                    frames: anims.generateFrameNumbers('ninja-idle', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('ninja-run')) {
                anims.create({
                    key: 'ninja-run',
                    frames: anims.generateFrameNumbers('ninja-run', { start: 0, end: 7 }),
                    frameRate: 12,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('ninja-jump')) {
                anims.create({
                    key: 'ninja-jump',
                    frames: anims.generateFrameNumbers('ninja-jump', { start: 0, end: 0 }),
                    frameRate: 8,
                    repeat: 0
                });
            }

            if (this.scene.textures.exists('ninja-fall')) {
                anims.create({
                    key: 'ninja-fall',
                    frames: anims.generateFrameNumbers('ninja-fall', { start: 0, end: 0 }),
                    frameRate: 8,
                    repeat: 0
                });
            }

            if (this.scene.textures.exists('ninja-hit')) {
                anims.create({
                    key: 'ninja-hit',
                    frames: anims.generateFrameNumbers('ninja-hit', { start: 0, end: 3 }),
                    frameRate: 10,
                    repeat: 0
                });
            }

            if (this.scene.textures.exists('ninja-double-jump')) {
                anims.create({
                    key: 'ninja-attack',
                    frames: anims.generateFrameNumbers('ninja-double-jump', { start: 0, end: 5 }),
                    frameRate: 15,
                    repeat: 0
                });
            }
            
            // === COMPAÑERO ANIMATIONS ===
            if (this.scene.textures.exists('amigo-idle')) {
                anims.create({
                    key: 'amigo-idle',
                    frames: anims.generateFrameNumbers('amigo-idle', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('amigo-run')) {
                anims.create({
                    key: 'amigo-run',
                    frames: anims.generateFrameNumbers('amigo-run', { start: 0, end: 7 }),
                    frameRate: 12,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('amigo-attack')) {
                anims.create({
                    key: 'amigo-attack',
                    frames: anims.generateFrameNumbers('amigo-attack', { start: 0, end: 5 }),
                    frameRate: 16,
                    repeat: 0
                });
            }
            
            // === ENEMY ANIMATIONS ===
            if (this.scene.textures.exists('gallina-run')) {
                anims.create({
                    key: 'gallina-run',
                    frames: anims.generateFrameNumbers('gallina-run', { start: 0, end: 7 }),
                    frameRate: 12,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('rino-idle')) {
                anims.create({
                    key: 'rino-idle',
                    frames: anims.generateFrameNumbers('rino-idle', { start: 0, end: 3 }),
                    frameRate: 6,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('rino-run')) {
                anims.create({
                    key: 'rino-run',
                    frames: anims.generateFrameNumbers('rino-run', { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('rino-hit')) {
                anims.create({
                    key: 'rino-hit',
                    frames: anims.generateFrameNumbers('rino-hit', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: 0
                });
            }

            // Nueva animación Hit Wall para el Rino
            if (this.scene.textures.exists('rino-hit-wall')) {
                anims.create({
                    key: 'rino-hit-wall',
                    frames: anims.generateFrameNumbers('rino-hit-wall', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: 0
                });
            }
            
            // === BLUEBIRD ANIMATIONS ===
            if (this.scene.textures.exists('bluebird-flying')) {
                anims.create({
                    key: 'bluebird-flying',
                    frames: anims.generateFrameNumbers('bluebird-flying', { start: 0, end: 8 }),
                    frameRate: 12,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('bluebird-hit')) {
                anims.create({
                    key: 'bluebird-hit',
                    frames: anims.generateFrameNumbers('bluebird-hit', { start: 0, end: 4 }),
                    frameRate: 10,
                    repeat: 0
                });
            }
            
            // === SKULL ANIMATIONS ===
            if (this.scene.textures.exists('skull-idle1')) {
                anims.create({
                    key: 'skull-idle1',
                    frames: anims.generateFrameNumbers('skull-idle1', { start: 0, end: 7 }),
                    frameRate: 8,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('skull-idle2')) {
                anims.create({
                    key: 'skull-idle2',
                    frames: anims.generateFrameNumbers('skull-idle2', { start: 0, end: 7 }),
                    frameRate: 10,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('skull-hit')) {
                anims.create({
                    key: 'skull-hit',
                    frames: anims.generateFrameNumbers('skull-hit', { start: 0, end: 4 }),
                    frameRate: 12,
                    repeat: 0
                });
            }

            if (this.scene.textures.exists('skull-hit-wall1')) {
                anims.create({
                    key: 'skull-hit-wall1',
                    frames: anims.generateFrameNumbers('skull-hit-wall1', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: 0
                });
            }

            if (this.scene.textures.exists('skull-hit-wall2')) {
                anims.create({
                    key: 'skull-hit-wall2',
                    frames: anims.generateFrameNumbers('skull-hit-wall2', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: 0
                });
            }
            
            // === ANGRY PIG ANIMATIONS ===
            if (this.scene.textures.exists('angrypig-idle')) {
                anims.create({
                    key: 'angrypig-idle',
                    frames: anims.generateFrameNumbers('angrypig-idle', { start: 0, end: 10 }),
                    frameRate: 8,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('angrypig-walk')) {
                anims.create({
                    key: 'angrypig-walk',
                    frames: anims.generateFrameNumbers('angrypig-walk', { start: 0, end: 15 }),
                    frameRate: 10,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('angrypig-run')) {
                anims.create({
                    key: 'angrypig-run',
                    frames: anims.generateFrameNumbers('angrypig-run', { start: 0, end: 11 }),
                    frameRate: 14,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('angrypig-hit1')) {
                anims.create({
                    key: 'angrypig-hit1',
                    frames: anims.generateFrameNumbers('angrypig-hit1', { start: 0, end: 4 }),
                    frameRate: 12,
                    repeat: 0
                });
            }

            if (this.scene.textures.exists('angrypig-hit2')) {
                anims.create({
                    key: 'angrypig-hit2',
                    frames: anims.generateFrameNumbers('angrypig-hit2', { start: 0, end: 4 }),
                    frameRate: 12,
                    repeat: 0
                });
            }
            
            // === CAT ANIMATIONS (ANIMAL NEUTRAL) ===
            if (this.scene.textures.exists('cat-walk')) {
                anims.create({
                    key: 'cat-walk',
                    frames: anims.generateFrameNumbers('cat-walk', { start: 0, end: 7 }),
                    frameRate: 8,
                    repeat: -1
                });
            }

            if (this.scene.textures.exists('cat-idle')) {
                anims.create({
                    key: 'cat-idle',
                    frames: anims.generateFrameNumbers('cat-idle', { start: 0, end: 7 }),
                    frameRate: 6,
                    repeat: -1
                });
            }
            
            // === COIN ANIMATION ===
            if (this.scene.textures.exists('coin')) {
                anims.create({
                    key: 'coin-spin',
                    frames: anims.generateFrameNumbers('coin', { start: 0, end: 7 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            
            console.log("✅ Todas las animaciones creadas exitosamente");
            
        } catch (error) {
            console.log("❌ Error creando animaciones:", error);
        }
    }
}