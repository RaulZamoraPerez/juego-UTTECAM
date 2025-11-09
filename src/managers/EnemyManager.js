/**
 *  EnemyManager.js
 * - Crea y controla todos los enemigos (gallinas, rinocerontes)
 * - Maneja su IA, movimiento, ataques y comportamiento
 * - Gestiona el daño a enemigos y colisiones con el jugador
 */

export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;
    }

    // ✅ MÉTODO HELPER PARA REPRODUCIR ANIMACIONES DE FORMA SEGURA
    safePlayAnimation(enemy, animKey, repeat = false) {
        if (!enemy || !enemy.active || !enemy.anims) {
            return false;
        }
        
        try {
            if (this.scene.anims.exists(animKey)) {
                enemy.anims.play(animKey, repeat);
                return true;
            } else {
                console.warn(`⚠️ Animación '${animKey}' no existe para ${enemy.enemyType || 'enemy'}`);
                return false;
            }
        } catch (e) {
            console.error(`❌ Error reproduciendo animación '${animKey}':`, e);
            return false;
        }
    }

    createEnemies() {
        this.scene.enemies = this.scene.physics.add.group();
        
        const gallinaTexture = this.scene.textures.exists('gallina-run') ? 'gallina-run' : 'gallinaFallback';
        const rinoTexture = this.scene.textures.exists('rino-idle') ? 'rino-idle' : 'gallinaFallback';
        
        const enemyPositions = [
            { x: 800, y: 400, type: 'gallina' },
            { x: 1200, y: 350, type: 'rino' },
            { x: 1600, y: 250, type: 'gallina' },
            { x: 2000, y: 300, type: 'rino' },
        ];

        enemyPositions.forEach((pos, index) => {
            let enemy;
            
            if (pos.type === 'gallina') {
                enemy = this.scene.enemies.create(pos.x, pos.y, gallinaTexture);
                enemy.setBounce(0.1); // Rebote muy bajo para que no brinque
                enemy.setCollideWorldBounds(true);
                enemy.setVelocity(Phaser.Math.Between(-100, 100), 0); // Sin impulso vertical
                enemy.health = 30;
                enemy.damage = 10;
                enemy.enemyType = 'gallina';
                
                if (this.scene.anims.exists('gallina-run')) {
                    enemy.anims.play('gallina-run', true);
                }
                
            } else if (pos.type === 'rino') {
                enemy = this.scene.enemies.create(pos.x, pos.y, rinoTexture);
                enemy.setBounce(0.3);
                enemy.setCollideWorldBounds(true);
                enemy.setVelocity(Phaser.Math.Between(-60, 60), 20);
                enemy.health = 80;
                enemy.damage = 20;
                enemy.enemyType = 'rino';
                enemy.setScale(1.3);
                enemy.setTint(0x8B4513);
                
                if (this.scene.anims.exists('rino-idle')) {
                    enemy.anims.play('rino-idle', true);
                }
            }
        });
        
        console.log(`✅ ${enemyPositions.length} enemigos creados`);
    }

    updateEnemies() {
        if (!this.scene.enemies || !this.scene.enemies.children) return;
        
        this.scene.enemies.children.entries.forEach(enemy => {
            if (!enemy || !enemy.active) return;
            
            if (enemy.enemyType === 'rino') {
                this.updateRino(enemy);
            } else if (enemy.enemyType === 'bluebird') {
                this.updateBlueBird(enemy);
            } else if (enemy.enemyType === 'skull') {
                this.updateSkull(enemy);
            } else if (enemy.enemyType === 'skeleton') {
                // ✅ Skeleton - ya tiene su propio sistema de patrulla en Level3Scene
                // No necesita actualización adicional aquí
                return;
            } else if (enemy.enemyType === 'angrypig') {
                this.updateAngryPig(enemy);
            } else if (enemy.enemyType === 'gallina') {
                // Comportamiento de gallina (mantenido para nivel 1)
                if (Math.random() < 0.005) {
                    enemy.setVelocityX(Phaser.Math.Between(-100, 100));
                }
                enemy.setFlipX(enemy.body.velocity.x > 0);
                if (this.scene.anims.exists('gallina-run')) {
                    enemy.anims.play('gallina-run', true);
                }
            }
        });
    }

    // ✅ AGREGAR MÉTODO FALTANTE
    updateBlueBird(bluebird) {
        if (!bluebird || !bluebird.active) return;

        // Encontrar objetivo (jugador or compañero)
        let target = null;
        if (this.scene.player && this.scene.player.active) {
            target = this.scene.player;
        } else if (this.scene.companion && this.scene.companion.active) {
            target = this.scene.companion;
        }

        const currentTime = this.scene.time.now;
        
        if (target) {
            const distance = Phaser.Math.Distance.Between(
                bluebird.x, bluebird.y, target.x, target.y
            );

            // Comportamiento de vuelo agresivo
            if (distance < 250) {
                // Fase de ataque directo
                if (distance < 80 && !bluebird.isAttacking && currentTime > bluebird.attackCooldown) {
                    bluebird.isAttacking = true;
                    bluebird.attackCooldown = currentTime + 3000;
                    
                    console.log(`🐦 BlueBird atacando en picada!`);
                    
                    // Ataque en picada hacia el objetivo
                    const angle = Phaser.Math.Angle.Between(bluebird.x, bluebird.y, target.x, target.y);
                    const attackSpeed = 200;
                    bluebird.setVelocity(
                        Math.cos(angle) * attackSpeed,
                        Math.sin(angle) * attackSpeed
                    );
                    
                    // ✅ MODO ESPEJO CORREGIDO: Orientación durante ataque INVERTIDA
                    bluebird.setFlipX(target.x > bluebird.x); // Si target está a la derecha, flipX = true
                    
                    this.scene.time.delayedCall(1500, () => {
                        if (bluebird && bluebird.active) {
                            bluebird.isAttacking = false;
                        }
                    });
                    
                } else if (!bluebird.isAttacking) {
                    // Vuelo de persecución circular
                    if (!bluebird.angle) bluebird.angle = 0;
                    
                    bluebird.angle += 0.05;
                    const radius = 120;
                    const speed = 80;
                    
                    // Calcular posición en círculo alrededor del objetivo
                    const targetX = target.x + Math.cos(bluebird.angle) * radius;
                    const targetY = target.y + Math.sin(bluebird.angle) * radius;
                    
                    // Moverse hacia esa posición
                    const angleToTarget = Phaser.Math.Angle.Between(bluebird.x, bluebird.y, targetX, targetY);
                    bluebird.setVelocity(
                        Math.cos(angleToTarget) * speed,
                        Math.sin(angleToTarget) * speed
                    );
                    
                    // ✅ MODO ESPEJO CORREGIDO: Orientación durante persecución circular INVERTIDA
                    bluebird.setFlipX(target.x > bluebird.x); // Si target está a la derecha, flipX = true
                }
                
            } else {
                // Patrullaje cuando el objetivo está lejos
                if (!bluebird.patrolTimer || currentTime > bluebird.patrolTimer) {
                    const newVelX = Phaser.Math.Between(-80, 80);
                    const newVelY = Phaser.Math.Between(-50, 50);
                    
                    bluebird.setVelocity(newVelX, newVelY);
                    bluebird.patrolTimer = currentTime + Phaser.Math.Between(2000, 4000);
                    
                    // ✅ MODO ESPEJO CORREGIDO: Orientación durante patrullaje INVERTIDA
                    bluebird.setFlipX(newVelX > 0); // Si va hacia la derecha, flipX = true
                }
            }
            
        } else {
            // Sin objetivo: vuelo errático
            if (!bluebird.randomMoveTimer || currentTime > bluebird.randomMoveTimer) {
                const newVelX = Phaser.Math.Between(-100, 100);
                const newVelY = Phaser.Math.Between(-80, 80);
                
                bluebird.setVelocity(newVelX, newVelY);
                bluebird.randomMoveTimer = currentTime + Phaser.Math.Between(1500, 3000);
                
                // ✅ MODO ESPEJO CORREGIDO: Orientación durante vuelo errático INVERTIDA
                bluebird.setFlipX(newVelX > 0); // Si va hacia la derecha, flipX = true
            }
        }

        // Mantener animación de vuelo
        if (this.scene.anims.exists('bluebird-flying')) {
            bluebird.anims.play('bluebird-flying', true);
        }

        // Mantener dentro de límites razonables
        if (bluebird.x < -100) {
            bluebird.setVelocityX(Math.abs(bluebird.body.velocity.x));
            // ✅ MODO ESPEJO CORREGIDO: Mirar hacia donde rebota INVERTIDO
            bluebird.setFlipX(true); // Yendo hacia la derecha después del rebote
        }
        if (bluebird.x > 4100) {
            bluebird.setVelocityX(-Math.abs(bluebird.body.velocity.x));
            // ✅ MODO ESPEJO CORREGIDO: Mirar hacia donde rebota INVERTIDO
            bluebird.setFlipX(false); // Yendo hacia la izquierda después del rebote
        }
        if (bluebird.y < 50) bluebird.setVelocityY(Math.abs(bluebird.body.velocity.y));
        if (bluebird.y > 550) bluebird.setVelocityY(-Math.abs(bluebird.body.velocity.y));
    }

    updateRino(rino) {
        if (!rino || !rino.active) return;

        // Elegir objetivo: jugador si está vivo, si no el compañero
        let target = null;
        if (this.scene.player && this.scene.player.active) {
            target = this.scene.player;
        } else if (this.scene.companion && this.scene.companion.active) {
            target = this.scene.companion;
        } else {
            // Sin objetivo, patrullaje
            if (!rino.patrolTimer) {
                rino.patrolTimer = this.scene.time.now;
                rino.patrolDirection = Math.random() > 0.5 ? 1 : -1;
            }
            if (this.scene.time.now - rino.patrolTimer > 3000) {
                rino.patrolDirection *= -1;
                rino.setFlipX(rino.patrolDirection < 0 ? false : true);
                rino.patrolTimer = this.scene.time.now;
            }
            rino.setVelocityX(rino.patrolDirection * 30);
            rino.turnTimer = null;
            if (this.scene.anims.exists('rino-idle')) {
                rino.anims.play('rino-idle', true);
            }
            return;
        }

        const distance = Phaser.Math.Distance.Between(
            rino.x, rino.y, target.x, target.y
        );

        if (distance < 200) {
            const targetIsToTheLeft = target.x < rino.x;
            // El rino siempre debe mirar hacia donde camina
            const speed = 80;
            if (targetIsToTheLeft) {
                rino.setVelocityX(-speed);
                rino.setFlipX(false);  // Mirar izquierda (flipX=false)
            } else {
                rino.setVelocityX(speed);
                rino.setFlipX(true); // Mirar derecha (flipX=true)
            }
            // Salto si el objetivo está arriba
            if (rino.body.touching.down && target.y < rino.y - 50) {
                rino.setVelocityY(-250);
            }
            // Animación de correr
            if (this.scene.anims.exists('rino-run')) {
                rino.anims.play('rino-run', true);
            }
            // Si el objetivo está detrás, detener y girar después de un tiempo
            const rinoMiraObjetivo = (targetIsToTheLeft && !rino.flipX) || (!targetIsToTheLeft && rino.flipX);
            if (!rinoMiraObjetivo) {
                rino.setVelocityX(0);
                if (!rino.turnTimer) {
                    rino.turnTimer = this.scene.time.now;
                }
                if (this.scene.time.now - rino.turnTimer > 1500) {
                    rino.setFlipX(!targetIsToTheLeft);
                    rino.turnTimer = null;
                    // Animación de topar (hit wall)
                    if (this.scene.anims.exists('rino-hit-wall')) {
                        rino.anims.play('rino-hit-wall');
                        this.scene.time.delayedCall(600, () => {
                            if (rino && rino.active && this.scene.anims.exists('rino-idle')) {
                                rino.anims.play('rino-idle', true);
                            }
                        });
                    }
                } else {
                    if (this.scene.anims.exists('rino-idle')) {
                        rino.anims.play('rino-idle', true);
                    }
                }
            } else {
                rino.turnTimer = null;
            }
        } else {
            // Patrullaje lento fuera de rango
            if (!rino.patrolTimer) {
                rino.patrolTimer = this.scene.time.now;
                rino.patrolDirection = Math.random() > 0.5 ? 1 : -1;
            }
            if (this.scene.time.now - rino.patrolTimer > 3000) {
                rino.patrolDirection *= -1;
                rino.setFlipX(rino.patrolDirection < 0 ? false : true);
                rino.patrolTimer = this.scene.time.now;
            }
            rino.setVelocityX(rino.patrolDirection * 30);
            rino.turnTimer = null;
            if (this.scene.anims.exists('rino-idle')) {
                rino.anims.play('rino-idle', true);
            }
        }
    }

    // ✅ AGREGAR MÉTODO PARA ANGRY PIG
    updateAngryPig(pig) {
        if (!pig || !pig.active) return;

        // Encontrar objetivo (jugador o compañero)
        let target = null;
        if (this.scene.player && this.scene.player.active) {
            target = this.scene.player;
        } else if (this.scene.companion && this.scene.companion.active) {
            target = this.scene.companion;
        }

        const currentTime = this.scene.time.now;
        
        if (target) {
            const distance = Phaser.Math.Distance.Between(
                pig.x, pig.y, target.x, target.y
            );

            // Comportamiento basado en distancia
            if (distance < 150) {
                // ¡MODO FURIA! - Correr hacia el target
                if (!pig.isAngry) {
                    pig.isAngry = true;
                    pig.angryStartTime = currentTime;
                    console.log(`🐷 AngryPig entrando en MODO FURIA!`);
                }
                
                // Correr agresivamente hacia el target
                const direction = target.x > pig.x ? 1 : -1;
                const runSpeed = pig.isLevel2 ? 120 : 90; // Más rápido en nivel 2
                
                pig.setVelocityX(direction * runSpeed);
                
                // ✅ MODO ESPEJO CORREGIDO: Orientación precisa INVERTIDA
                pig.setFlipX(direction > 0); // Si va hacia la derecha (direction=1), flipX = true
                
                // Animación de correr cuando está furioso
                if (this.scene.anims.exists('angrypig-run')) {
                    pig.anims.play('angrypig-run', true);
                }
                
                // Saltar si hay obstáculos
                if (pig.body.blocked.down && Math.random() < 0.3) {
                    pig.setVelocityY(-250);
                }
                
                // Cambiar a rojo cuando está furioso
                if (!pig.hasAngryTint) {
                    pig.setTint(0xFF4444);
                    pig.hasAngryTint = true;
                }
                
            } else if (distance < 300) {
                // Caminar hacia el target (modo cauto)
                pig.isAngry = false;
                pig.hasAngryTint = false;
                pig.clearTint();
                
                const direction = target.x > pig.x ? 1 : -1;
                const walkSpeed = pig.isLevel2 ? 60 : 45;
                
                pig.setVelocityX(direction * walkSpeed);
                
                // ✅ MODO ESPEJO CORREGIDO: Orientación durante caminata INVERTIDA
                pig.setFlipX(direction > 0); // Si va hacia la derecha (direction=1), flipX = true
                
                // Animación de caminar
                if (this.scene.anims.exists('angrypig-walk')) {
                    pig.anims.play('angrypig-walk', true);
                }
                
            } else {
                // Patrullaje cuando está lejos
                pig.isAngry = false;
                pig.hasAngryTint = false;
                pig.clearTint();
                
                if (!pig.patrolTimer || currentTime > pig.patrolTimer) {
                    const patrolSpeed = pig.isLevel2 ? 40 : 30;
                    const newVelX = Phaser.Math.Between(-patrolSpeed, patrolSpeed);
                    
                    pig.setVelocityX(newVelX);
                    pig.patrolTimer = currentTime + Phaser.Math.Between(2000, 4000);
                    
                    // ✅ MODO ESPEJO CORREGIDO: Orientación durante patrullaje INVERTIDA
                    pig.setFlipX(newVelX > 0); // Si va hacia la derecha, flipX = true
                }
                
                // Animación idle cuando patrulla lentamente
                if (Math.abs(pig.body.velocity.x) < 10) {
                    if (this.scene.anims.exists('angrypig-idle')) {
                        pig.anims.play('angrypig-idle', true);
                    }
                } else {
                    if (this.scene.anims.exists('angrypig-walk')) {
                        pig.anims.play('angrypig-walk', true);
                    }
                }
            }
            
        } else {
            // Sin objetivo: comportamiento errático
            pig.isAngry = false;
            pig.hasAngryTint = false;
            pig.clearTint();
            
            if (!pig.randomMoveTimer || currentTime > pig.randomMoveTimer) {
                const randomSpeed = pig.isLevel2 ? 50 : 35;
                const newVelX = Phaser.Math.Between(-randomSpeed, randomSpeed);
                
                pig.setVelocityX(newVelX);
                pig.randomMoveTimer = currentTime + Phaser.Math.Between(1500, 3000);
                
                // ✅ MODO ESPEJO CORREGIDO: Orientación durante movimiento errático INVERTIDA
                pig.setFlipX(newVelX > 0); // Si va hacia la derecha, flipX = true
            }
            
            // Animación idle o walk según velocidad
            if (Math.abs(pig.body.velocity.x) < 10) {
                if (this.scene.anims.exists('angrypig-idle')) {
                    pig.anims.play('angrypig-idle', true);
                }
            } else {
                if (this.scene.anims.exists('angrypig-walk')) {
                    pig.anims.play('angrypig-walk', true);
                }
            }
        }

        // Mantener dentro de límites del mundo
        if (pig.x < 50) {
            pig.setVelocityX(Math.abs(pig.body.velocity.x));
            // ✅ MODO ESPEJO CORREGIDO: Mirar hacia donde rebota INVERTIDO
            pig.setFlipX(true); // Yendo hacia la derecha después del rebote
        }
        if (pig.x > (pig.isLevel2 ? 3950 : 2350)) {
            pig.setVelocityX(-Math.abs(pig.body.velocity.x));
            // ✅ MODO ESPEJO CORREGIDO: Mirar hacia donde rebota INVERTIDO
            pig.setFlipX(false); // Yendo hacia la izquierda después del rebote
        }
    }

    damageEnemy(enemy, damage) {
        if (!enemy || !enemy.active || !enemy.setTint) {
            console.log("❌ Enemigo inválido, no se puede dañar");
            return;
        }
        
        enemy.health -= damage;
        enemy.setTint(0xffffff);
        
        this.scene.time.delayedCall(200, () => {
            if (enemy && enemy.active && enemy.clearTint) {
                enemy.clearTint();
            }
        });

        if (enemy.enemyType === 'rino' && this.scene.anims.exists('rino-hit')) {
            this.safePlayAnimation(enemy, 'rino-hit');
            this.scene.time.delayedCall(400, () => {
                this.safePlayAnimation(enemy, 'rino-idle');
            });
        } else if (enemy.enemyType === 'bluebird' && this.scene.anims.exists('bluebird-hit')) {
            this.safePlayAnimation(enemy, 'bluebird-hit');
            // El pájaro se tambalea al ser golpeado
            const knockbackX = enemy.body.velocity.x * -0.5;
            const knockbackY = enemy.body.velocity.y + Phaser.Math.Between(-50, 50);
            
            enemy.setVelocity(knockbackX, knockbackY);
            
            // ✅ MODO ESPEJO CORREGIDO: Mantener orientación durante el golpe INVERTIDA
            if (knockbackX !== 0) {
                enemy.setFlipX(knockbackX > 0); // Si retrocede hacia la derecha, flipX = true
            }
            
            this.scene.time.delayedCall(300, () => {
                this.safePlayAnimation(enemy, 'bluebird-flying');
            });
        } else if (enemy.enemyType === 'skull' && this.scene.anims.exists('skull-hit')) {
            this.safePlayAnimation(enemy, 'skull-hit');
            // El skull retrocede y se tambalea
            enemy.setVelocity(
                enemy.body.velocity.x * -0.7,
                enemy.body.velocity.y + Phaser.Math.Between(-40, 40)
            );
            
            // Crear efecto de partículas rojas al ser golpeado
            this.createSkullAttackEffect(enemy, 'red');
            
            this.scene.time.delayedCall(400, () => {
                this.safePlayAnimation(enemy, 'skull-idle1');
            });
        } else if (enemy.enemyType === 'skeleton') {
            // ✅ SKELETON - Solo efectos visuales, sin animaciones de hit
            console.log('💀 Skeleton golpeado');
            
            // Retrocede al ser golpeado
            const knockbackX = enemy.body.velocity.x * -1;
            const knockbackY = -80;
            enemy.setVelocity(knockbackX, knockbackY);
            
            // Flip según dirección del retroceso
            if (knockbackX !== 0) {
                enemy.setFlipX(knockbackX > 0);
            }
            
            // Continuar con la animación de caminar si existe
            this.scene.time.delayedCall(300, () => {
                this.safePlayAnimation(enemy, 'skeleton_walk_anim', true);
            });
        } else if (enemy.enemyType === 'angrypig') {
            // AngryPig tiene dos animaciones de hit diferentes
            const hitAnim = Math.random() < 0.5 ? 'angrypig-hit1' : 'angrypig-hit2';
            
            this.safePlayAnimation(enemy, hitAnim);
            
            // El cerdo se vuelve MÁS agresivo cuando es golpeado
            enemy.isAngry = true;
            enemy.hasAngryTint = true;
            enemy.setTint(0xFF0000);
            
            // Retrocede pero luego contraataca
            const knockbackX = enemy.body.velocity.x * -0.5;
            const knockbackY = -100;
            
            enemy.setVelocity(knockbackX, knockbackY);
            
            // ✅ MODO ESPEJO CORREGIDO: Mantener orientación durante el golpe INVERTIDA
            if (knockbackX !== 0) {
                enemy.setFlipX(knockbackX > 0); // Si retrocede hacia la derecha, flipX = true
            }
            
            // Efecto de partículas de tierra (simulando que escarba furioso)
            this.createPigDustEffect(enemy);
            
            console.log(`🐷💢 AngryPig golpeado - ¡Ahora está MÁS furioso!`);
            
            this.scene.time.delayedCall(500, () => {
                if (enemy && enemy.active) {
                    // Volver a animación normal pero mantener furia
                    if (this.scene.anims.exists('angrypig-run')) {
                        enemy.anims.play('angrypig-run');
                    }
                }
            });
        }

        if (enemy.health <= 0) {
            const points = enemy.enemyType === 'rino' ? 100 : 
                          enemy.enemyType === 'bluebird' ? 150 : 
                          enemy.enemyType === 'skull' ? 200 : 
                          enemy.enemyType === 'angrypig' ? 80 : 50; // AngryPig da puntos medios
            // Animación de muerte suave
            enemy.setTint(0xff0000);
            this.scene.tweens.add({
                targets: enemy,
                scale: 1.5,
                alpha: 0,
                duration: 500,
                ease: 'Cubic.easeIn',
                onComplete: () => {
                    if (enemy && enemy.destroy) {
                        enemy.destroy();
                    }
                    this.scene.gameState.score += points;
                    this.scene.gameState.enemiesKilled++;
                    this.scene.uiManager.updateScore();
                    console.log(`💀 ${enemy.enemyType} eliminado (+${points} puntos)`);
                    if (this.scene.enemies && this.scene.enemies.children && this.scene.enemies.children.size === 0) {
                        this.spawnMoreEnemies();
                    }
                }
            });
        }
    }

    spawnMoreEnemies() {
        if (!this.scene.enemies) {
            this.scene.enemies = this.scene.physics.add.group();
        }
        
        // Determinar qué tipos de enemigos spawner según el nivel
        const isLevel2 = this.scene.scene.key === 'Level2Scene';
        
        // ✅ DEFINIR TEXTURAS ANTES DE USARLAS
        const gallinaTexture = this.scene.textures.exists('gallina-run') ? 'gallina-run' : 'gallinaFallback';
        const angryPigTexture = this.scene.textures.exists('angrypig-idle') ? 'angrypig-idle' : 'gallinaFallback';
        const bluebirdTexture = this.scene.textures.exists('bluebird-flying') ? 'bluebird-flying' : 'gallinaFallback';
        const skullTexture = this.scene.textures.exists('skull-idle1') ? 'skull-idle1' : 'gallinaFallback';
        
        if (isLevel2) {
            // Nivel 2: Skulls, BlueBirds y AngryPigs mejorados
            const spawnPoints = [
                { x: 1500, y: 300, type: 'angrypig' },
                { x: 1700, y: 150, type: 'bluebird' },
                { x: 1800, y: 400, type: 'skull' },
                { x: 2000, y: 180, type: 'bluebird' },
                { x: 2200, y: 350, type: 'angrypig' }
            ];
            
            spawnPoints.forEach(pos => {
                let enemy;
                
                if (pos.type === 'angrypig') {
                    enemy = this.scene.enemies.create(pos.x, pos.y, angryPigTexture);
                    enemy.setBounce(0.1);
                    enemy.setCollideWorldBounds(true);
                    
                    const initialVelX = Phaser.Math.Between(-80, 80);
                    enemy.setVelocity(initialVelX, 0);
                    
                    // ✅ MODO ESPEJO CORREGIDO: Orientación inicial
                    enemy.setFlipX(initialVelX > 0);
                    
                    enemy.health = 75;
                    enemy.damage = 25;
                    enemy.enemyType = 'angrypig';
                    enemy.setScale(1.3);
                    enemy.setTint(0xFF6B6B);
                    enemy.isLevel2 = true;
                    
                    // Propiedades específicas del AngryPig
                    enemy.isAngry = false;
                    enemy.hasAngryTint = false;
                    enemy.patrolTimer = 0;
                    enemy.randomMoveTimer = 0;
                    enemy.angryStartTime = 0;
                    
                    if (this.scene.anims.exists('angrypig-idle')) {
                        enemy.anims.play('angrypig-idle', true);
                    }
                    
                    console.log(`🐷 AngryPig spawneado en (${pos.x}, ${pos.y})`);
                    
                } else if (pos.type === 'bluebird') {
                    enemy = this.scene.enemies.create(pos.x, pos.y, bluebirdTexture);
                    enemy.setBounce(0);
                    enemy.setCollideWorldBounds(false);
                    enemy.body.setGravityY(-300);
                    
                    const initialVelX = Phaser.Math.Between(-100, 100);
                    const initialVelY = Phaser.Math.Between(-60, 60);
                    enemy.setVelocity(initialVelX, initialVelY);
                    
                    // ✅ MODO ESPEJO CORREGIDO: Orientación inicial
                    enemy.setFlipX(initialVelX > 0);
                    
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
                    
                    if (this.scene.anims.exists('bluebird-flying')) {
                        enemy.anims.play('bluebird-flying', true);
                    }
                    
                    console.log(`🐦 BlueBird spawneado en (${pos.x}, ${pos.y})`);
                    
                } else if (pos.type === 'skull') {
                    enemy = this.scene.enemies.create(pos.x, pos.y, skullTexture);
                    enemy.setBounce(0);
                    enemy.setCollideWorldBounds(false);
                    enemy.body.setGravityY(-200);
                    enemy.setVelocity(Phaser.Math.Between(-80, 80), Phaser.Math.Between(-60, 60));
                    enemy.health = 70;
                    enemy.damage = 25;
                    enemy.enemyType = 'skull';
                    enemy.setScale(1.1);
                    enemy.setTint(0x9A4444);
                    
                    // Propiedades específicas del skull
                    enemy.attackCooldown = 0;
                    enemy.isAttacking = false;
                    enemy.patrolTimer = 0;
                    enemy.ghostMoveTimer = 0;
                    
                    if (this.scene.anims.exists('skull-idle1')) {
                        enemy.anims.play('skull-idle1', true);
                    }
                    
                    console.log(`💀 Skull spawneado en (${pos.x}, ${pos.y})`);
                }
            });
            
            console.log(`✅ ${spawnPoints.length} enemigos de Nivel 2 spawneados`);
            
        } else {
            // Nivel 1: Gallinas y AngryPigs básicos
            const spawnPoints = [
                { x: 1500, y: 300, type: 'angrypig' }, 
                { x: 1800, y: 250, type: 'gallina' }, 
                { x: 2000, y: 200, type: 'angrypig' }
            ];
            
            spawnPoints.forEach(pos => {
                let enemy;
                
                if (pos.type === 'angrypig') {
                    enemy = this.scene.enemies.create(pos.x, pos.y, angryPigTexture);
                    enemy.setBounce(0.1);
                    enemy.setCollideWorldBounds(true);
                    
                    const initialVelX = Phaser.Math.Between(-60, 60);
                    enemy.setVelocity(initialVelX, 0);
                    
                    // ✅ MODO ESPEJO: Orientación inicial
                    enemy.setFlipX(initialVelX > 0);
                    
                    enemy.health = 50;
                    enemy.damage = 15;
                    enemy.enemyType = 'angrypig';
                    enemy.setScale(1.2);
                    enemy.isLevel2 = false;
                    
                    // Propiedades específicas del AngryPig
                    enemy.isAngry = false;
                    enemy.hasAngryTint = false;
                    enemy.patrolTimer = 0;
                    enemy.randomMoveTimer = 0;
                    
                    if (this.scene.anims.exists('angrypig-idle')) {
                        enemy.anims.play('angrypig-idle', true);
                    }
                    
                    console.log(`🐷 AngryPig Nivel 1 spawneado en (${pos.x}, ${pos.y})`);
                    
                } else if (pos.type === 'gallina') {
                    // ✅ USAR LA TEXTURA DEFINIDA
                    enemy = this.scene.enemies.create(pos.x, pos.y, gallinaTexture);
                    enemy.setBounce(0.1);
                    enemy.setCollideWorldBounds(true);
                    enemy.setVelocity(Phaser.Math.Between(-50, 50), 0);
                    enemy.health = 20; // ✅ REDUCIR VIDA
                    enemy.damage = 6;  // ✅ REDUCIR DAÑO
                    enemy.enemyType = 'gallina';
                    enemy.setScale(0.8);
                    
                    if (this.scene.anims.exists('gallina-run')) {
                        enemy.anims.play('gallina-run', true);
                    }
                    
                    console.log(`🐔 Gallina spawneada en (${pos.x}, ${pos.y})`);
                }
            });
            
            console.log(`✅ ${spawnPoints.length} enemigos de Nivel 1 spawneados`);
        }
        
        console.log(`🎯 SpawnMoreEnemies completado para ${isLevel2 ? 'Nivel 2' : 'Nivel 1'}`);
    }

    hitEnemy(player, enemy) {
        // ✅ VERIFICAR INVULNERABILIDAD Y SI ESTÁ VIVO
        if (!player.isInvulnerable && player.health > 0) {
            const damage = enemy.damage || 10;
            console.log(`💔 NINJA HERIDO por ${enemy.enemyType}! Vida: ${player.health} → ${player.health - damage}`);
            
            player.health -= damage;
            this.scene.gameState.health = player.health;
            this.scene.uiManager.updateHealth();
            
            // ✅ AGREGAR INVULNERABILIDAD TEMPORAL (IGUAL QUE EL COMPAÑERO)
            player.isInvulnerable = true;
            player.setTint(0xff0000); // Color rojo al recibir daño
            
            // ✅ EMPUJAR AL JUGADOR (RETROALIMENTACIÓN VISUAL)
            const pushForce = player.x < enemy.x ? -150 : 150;
            player.setVelocityX(pushForce);
            player.setVelocityY(-80);
            
            // ✅ SHAKE DE CÁMARA
            this.scene.cameras.main.shake(150, 0.01);
            
            // ✅ EFECTO VISUAL EN EL ENEMIGO (solo si tiene animación)
            if (enemy.anims && enemy.texture && enemy.texture.key) {
                try {
                    // Hacer que el enemigo parpadee
                    enemy.setTint(0xffff00); // Amarillo por 100ms
                    this.scene.time.delayedCall(100, () => {
                        if (enemy && enemy.active) {
                            enemy.clearTint();
                        }
                    });
                } catch (e) {
                    // Ignorar error si no se puede aplicar tint
                }
            }
            
            // ✅ QUITAR INVULNERABILIDAD DESPUÉS DE 1.5 SEGUNDOS
            this.scene.time.delayedCall(1500, () => {
                if (player && player.active && player.health > 0) {
                    player.clearTint();
                    player.isInvulnerable = false;
                }
            });
            
            // ✅ VERIFICAR MUERTE CORRECTAMENTE
            if (player.health <= 0) {
                player.health = 0; // ✅ EVITAR VIDA NEGATIVA
                console.log("💀 NINJA MUERTO!");
                player.setActive(false).setVisible(false);
                
                // Solo terminar el juego si el compañero también está muerto
                if (!this.scene.companion || !this.scene.companion.active || this.scene.companion.health <= 0) {
                    this.scene.gameOver();
                }
            }
        } else if (player.isInvulnerable) {
            console.log("🛡️ Ninja invulnerable - sin daño");
        }
    }

    createPigDustEffect(pig) {
        // Crear efecto de polvo cuando el cerdo está furioso
        for (let i = 0; i < 5; i++) {
            const dust = this.scene.add.circle(
                pig.x + Phaser.Math.Between(-20, 20), 
                pig.y + 10, 
                Phaser.Math.Between(2, 6), 
                0x8B4513, 
                0.6
            );
            
            dust.setDepth(pig.depth - 1);
            
            this.scene.tweens.add({
                targets: dust,
                x: dust.x + Phaser.Math.Between(-30, 30),
                y: dust.y - Phaser.Math.Between(10, 30),
                alpha: 0,
                scale: 0.2,
                duration: 600,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    dust.destroy();
                }
            });
        }
    }

    updateSkull(skull) {
        if (!skull || !skull.active) return;

        // Encontrar objetivo (jugador o compañero)
        let target = null;
        if (this.scene.player && this.scene.player.active) {
            target = this.scene.player;
        } else if (this.scene.companion && this.scene.companion.active) {
            target = this.scene.companion;
        }

        const currentTime = this.scene.time.now;
        
        if (target) {
            const distance = Phaser.Math.Distance.Between(
                skull.x, skull.y, target.x, target.y
            );

            // Comportamiento agresivo: perseguir al objetivo
            if (distance < 300) {
                // Fase de ataque intenso
                if (distance < 100 && !skull.isAttacking && currentTime > skull.attackCooldown) {
                    skull.isAttacking = true;
                    skull.attackCooldown = currentTime + 4000; // Cooldown de 4 segundos
                    
                    // Cambiar a animación de ataque más agresiva
                    if (this.scene.anims.exists('skull-idle2')) {
                        skull.anims.play('skull-idle2', true);
                    }
                    
                    // Crear efecto de partículas rojas (ataque)
                    this.createSkullAttackEffect(skull, 'red');
                    
                    // Movimiento errático y rápido
                    const attackSpeed = 150;
                    const angle = Phaser.Math.Angle.Between(skull.x, skull.y, target.x, target.y);
                    skull.setVelocity(
                        Math.cos(angle) * attackSpeed + Phaser.Math.Between(-50, 50),
                        Math.sin(angle) * attackSpeed + Phaser.Math.Between(-30, 30)
                    );
                    
                    console.log(`💀 Skull atacando ferozmente!`);
                    
                    // Terminar ataque después de 2 segundos
                    this.scene.time.delayedCall(2000, () => {
                        if (skull && skull.active) {
                            skull.isAttacking = false;
                            if (this.scene.anims.exists('skull-idle1')) {
                                skull.anims.play('skull-idle1', true);
                            }
                        }
                    });
                    
                } else if (!skull.isAttacking) {
                    // Persecución normal con partículas naranjas
                    const pursuitSpeed = 80;
                    const angle = Phaser.Math.Angle.Between(skull.x, skull.y, target.x, target.y);
                    skull.setVelocity(
                        Math.cos(angle) * pursuitSpeed,
                        Math.sin(angle) * pursuitSpeed
                    );
                    
                    // Crear efecto de partículas naranjas (persecución)
                    if (Math.random() < 0.1) { // 10% de probabilidad cada frame
                        this.createSkullAttackEffect(skull, 'orange');
                    }
                    
                    // ✅ ORIENTACIÓN CORREGIDA: Skull mira hacia el target INVERTIDA
                    skull.setFlipX(target.x > skull.x); // Si target está a la derecha, flipX = true
                    
                    // Animación idle normal
                    if (this.scene.anims.exists('skull-idle1')) {
                        skull.anims.play('skull-idle1', true);
                    }
                }
                
            } else {
                // Patrullaje cuando el objetivo está lejos
                if (!skull.patrolTimer || currentTime > skull.patrolTimer) {
                    skull.setVelocity(
                        Phaser.Math.Between(-60, 60),
                        Phaser.Math.Between(-40, 40)
                    );
                    skull.patrolTimer = currentTime + Phaser.Math.Between(2000, 3000);
                }
                
                // Animación idle calmada
                if (this.scene.anims.exists('skull-idle1')) {
                    skull.anims.play('skull-idle1', true);
                }
            }
            
        } else {
            // Sin objetivo: movimiento fantasmal
            if (!skull.ghostMoveTimer || currentTime > skull.ghostMoveTimer) {
                skull.setVelocity(
                    Phaser.Math.Between(-80, 80),
                    Phaser.Math.Between(-60, 60)
                );
                skull.ghostMoveTimer = currentTime + Phaser.Math.Between(1500, 2500);
            }
            
            if (this.scene.anims.exists('skull-idle1')) {
                skull.anims.play('skull-idle1', true);
            }
        }

        // Mantener dentro de los límites del mundo
        if (skull.x < 50) skull.setVelocityX(Math.abs(skull.body.velocity.x));
        if (skull.x > 3950) skull.setVelocityX(-Math.abs(skull.body.velocity.x));
        if (skull.y < 50) skull.setVelocityY(Math.abs(skull.body.velocity.y));
        if (skull.y > 550) skull.setVelocityY(-Math.abs(skull.body.velocity.y));
    }

    createSkullAttackEffect(skull, type) {
        const particleTexture = type === 'red' ? 'skull-red-particle' : 'skull-orange-particle';
        
        if (this.scene.textures.exists(particleTexture)) {
            // Crear partícula temporal
            const particle = this.scene.add.image(skull.x, skull.y, particleTexture);
            particle.setScale(0.5);
            particle.setAlpha(0.8);
            particle.setDepth(skull.depth - 1);
            
            // Animación de la partícula
            this.scene.tweens.add({
                targets: particle,
                x: skull.x + Phaser.Math.Between(-30, 30),
                y: skull.y + Phaser.Math.Between(-30, 30),
                alpha: 0,
                scale: 0.2,
                duration: 800,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        } else {
            // Crear efecto de partícula alternativo si no existe la textura
            const particle = this.scene.add.circle(
                skull.x + Phaser.Math.Between(-10, 10), 
                skull.y + Phaser.Math.Between(-10, 10), 
                Phaser.Math.Between(3, 8), 
                type === 'red' ? 0xFF0000 : 0xFF8800, 
                0.8
            );
            
            particle.setDepth(skull.depth - 1);
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-30, 30),
                y: particle.y + Phaser.Math.Between(-30, 30),
                alpha: 0,
                scale: 0.2,
                duration: 800,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
}