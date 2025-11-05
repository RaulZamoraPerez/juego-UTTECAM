import MenuScene from './scenes/MenuScene.js';
import IntroScene from './scenes/IntroScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js'; // ✅ IMPORTAR
import Level2Scene from './scenes/Level2Scene.js'; // ✅ IMPORTAR
import Level3Scene from './scenes/Level3Scene.js'; // ✅ IMPORTAR

console.log("🚀 Iniciando Ninja Rescue...");

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, IntroScene, GameScene, Level2Scene, Level3Scene, GameOverScene], // ✅ AGREGAR AL ARRAY
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1000,
        height: 600
    },
    backgroundColor: '#2c3e50'
};

document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }

    // Eliminar cualquier game-container y canvas previos
    const oldContainers = document.querySelectorAll('#game-container');
    oldContainers.forEach(el => el.remove());
    const oldCanvas = document.querySelectorAll('canvas');
    oldCanvas.forEach(el => el.remove());

    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.appendChild(gameContainer);

    const game = new Phaser.Game(config);

    console.log("🎉 Ninja Rescue iniciado correctamente!");
    console.log("🎮 Versión del código: MODULAR-2024-V1");
    console.log("💀 GameOverScene registrado"); // ✅ LOG DE CONFIRMACIÓN

    window.game = game;
});