import { AUTO, Game } from 'phaser';
import { ModularScene } from './scenes/ModularScene.js';
import { NetworkManager } from './NetworkManager.js';


import { useEffect } from 'react';
import { EncounterScene } from './scenes/EncounterScene';


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: "arcade", 
        arcade: {
            gravity: {x: 0, y: 0},
        }
    },
    scene: [
        ModularScene,
        EncounterScene
    ]
};

const networkManager = NetworkManager.getInstance();
networkManager.connect();

const StartGame = (parent: string) => {
    
    return new Game({ ...config, parent });

}

export default StartGame;
