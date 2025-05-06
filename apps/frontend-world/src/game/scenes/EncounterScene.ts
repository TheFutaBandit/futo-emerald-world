import axios from "axios";
import { EventBus } from "../EventBus";

const BACKEND_URL = 'http://localhost:3000'


interface prevPosition {
    x: number, 
    y: number
}

interface PokemonSprite extends Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    pokemonData: {
        type: string;
        bounty: number;
        multiplier: number;
        difficulty: number;
    };
}

interface PokemonImage extends Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
    pokemonData: {
        type: string;
        bounty: number;
        multiplier: number;
        difficulty: number;
    };
}

interface PokemonData {
    type: string;
    bounty: number;
    multiplier: number;
    difficulty: number;
}

export class EncounterScene extends Phaser.Scene{
    controls: Phaser.Cameras.Controls.FixedKeyControl
    player: Phaser.Physics.Arcade.Sprite;
    cursors: any;
    socket: WebSocket;
    userId: string;
    prevPosition: prevPosition;
    player2: Phaser.Physics.Arcade.Sprite;
    playerMap: Map<string, Phaser.Physics.Arcade.Sprite>
    playerList: Map<string, {id: string, x: number, y: number}>;
    playerVelocity: Map<string, {vx: number, vy: number}>;
    playerInitialized: boolean;
    interactText: Phaser.GameObjects.Text;
    canInteract: boolean;
    nearbyPokemon: null | PokemonImage;
    pokemon: PokemonImage;
    interactKey: Phaser.Input.Keyboard.Key;
    pokemonData: PokemonData;
    catchButton: Phaser.GameObjects.Text;
    pokeballCount: number;

    constructor () {
        super('EncounterScene');
    }

    init(data : any) {
        this.pokemonData = data.pokemonData;
        this.pokemon = data.pokemon;
    }

    preload() {
        this.load.image('background', 'assets/images/background.jpg');
        this.load.image('pokemon-large', 'assets/images/solgaleoLargeNoBg.png');
        this.load.image('pokeball', 'assets/images/pokeball.png');
    }

    create() {
        this.add.image(400,300, 'background').setOrigin(0.5, 0.5).setScale(1.125);
        const encounterImage = this.add.image(400,300, 'pokemon-large').setOrigin(0.5, 0.5).setScale(0.5);

        this.add.text(encounterImage.x, encounterImage.y - 160, `${this.pokemonData.type}`).setStyle({fontSize: '24px', backgroundColor: "#000", fontFamily: 'Arial', color: '#fff'}).setOrigin(0.5).setPadding({x: 10, y: 5});
        this.add.text(50, 80, `Bounty: ${this.pokemonData.bounty} PokeCoins`).setStyle({fontSize: '18px', backgroundColor: "#000", fontFamily: 'Arial', color: '#fff'});
        this.add.text(50, 110, `Multiplier: ${this.pokemonData.multiplier}x`).setStyle({fontSize: '18px', backgroundColor: "#000", fontFamily: 'Arial', color: '#fff'});

        this.catchButton = this.add.text(400, 350, 'Catch (1 Pokeball)')
        .setStyle({fontSize: '20px', backgroundColor: "#008800", fontFamily: 'Arial', color: '#fff', padding: { x: 10, y: 5 }})
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.attemptCatch());

        this.add.text(400, 400, 'Leave')
        .setStyle({fontSize: '20px', backgroundColor: "#880000", fontFamily: 'Arial', color: '#fff', padding: { x: 10, y: 5 }})
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.leaveMapEncounter());

        this.initGameFunction();

        EventBus.emit('current-scene-ready', this);
    }

    async initGameFunction() {
        this.pokeballCount = 5;
        this.updateCatchButtonState();
    }

    async attemptCatch() {
        this.catchButton.disableInteractive();

        
        this.updateCatchButtonState();

        const pokeball = this.add.image(150, 350, 'pokeball').setScale(0.1);

        this.tweens.add({
            targets: pokeball,
            x: 400,
            y: 200,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => this.processCatchResult(pokeball)
        });
    }

    async processCatchResult(pokeball: Phaser.GameObjects.Image) {
        console.log('Processing catch result...');
        this.catchButton.disableInteractive();

        try {
            // const response = await axios.post(`${BACKEND_URL}/api/v1/solana/catch`, {
            //     pokemonId: this.pokemonData.type,
            //     pokemonDifficulty: this.pokemonData.difficulty,
            //     pokemonBounty: this.pokemonData.bounty,
            //     pokemonMultiplier: this.pokemonData.multiplier,
            //     ball_rate: this.pokeballCount,
            //     userWallet: '7YcM2pScrnZEjoDu2STaS83BtmDujJHZ86Ei9CUnUeCL' 
            // });
    
            
            // console.log('Response:', response.data);
    
            // const data = response.data;

            const data = {
                success: false,
                catch: false
            }
            // Simulate a successful catch
    
            if(data.success) {
                if(data.catch) {
                    console.log('Pokemon caught successfully!');
                    this.tweens.add({
                        targets: this.pokemon,
                        alpha: 0,
                        scale: 0.05,
                        duration: 1000,
                        ease: 'Power2',
                        onComplete: () => {
                            // Show success message with rewards
                            const reward = this.pokemonData.bounty * this.pokemonData.multiplier;
                            this.showResultMessage(true, reward);
                            console.log(`Pokemon caught! You received ${reward} PokeCoins.`);
                            // this.leaveMapEncounter(true);
                        }
                    });
                    
                    // Pokeball capture animation
                    console.log('hey there');
                    this.tweens.add({
                        targets: pokeball,
                        scale: 0.2,
                        yoyo: true,
                        repeat: 3,
                        duration: 200
                    });
                } else {
                    console.log('Failed to catch Pokemon');
                    this.showResultMessage(false, 0);
                    this.catchButton.setInteractive();
                }
            } else {
                this.showResultMessage(false, 0, "transaction error");
                console.log('Server Error');
            }
        } catch (error) {
            console.log("failed");
            console.error('Error during catch attempt:', error);
            this.showResultMessage(false, 0, "Transaction error");
        }
       
    }

    updateCatchButtonState() {
        this.pokeballCount--;
        this.catchButton.setText(`Catch (${this.pokeballCount} Pokeballs left)`);
        if (this.pokeballCount <= 0) {
            this.catchButton.setStyle({ backgroundColor: "#880000" });
            this.catchButton.disableInteractive();
        }
    }

    leaveMapEncounter(pokemonCaught = false) {
        console.log('leaving map encounter');
        this.scene.start('Modular-Scene', {
            pokemonCaught: pokemonCaught,
            pokemon: this.pokemon
        })
    }

    showResultMessage(success: boolean, reward: number, errorMsg : any = null) {
        const panel = this.add.rectangle(400, 250, 400, 200, 0x000000);

        let messageText : any;

        if (errorMsg) {
            messageText = this.add.text(400, 250, errorMsg)
            .setStyle({fontSize: '24px', align: 'center'})
            .setOrigin(0.5)
            .setFill('#ffffff')
        } else if (success) {
            messageText = this.add.text(400, 250, `You caught ${this.pokemonData.type}!\n\nReward: ${reward} PokeCoins`)
            .setStyle({fontSize: '24px', align: 'center'})
            .setOrigin(0.5)
            .setFill('#ffffff')

            this.add.text(400, 320, 'Continue')
            .setStyle({fontSize: '20px', fontFamily: 'Arial', color: '#fff', padding: { x: 10, y: 5 }})
            .setFill('#008800')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.leaveMapEncounter(true);
            });
        } else {
            messageText = this.add.text(400, 250, `${this.pokemonData.type} escaped!`)
            .setStyle({fontSize: '24px', align: 'center'})
            .setOrigin(0.5)
            .setFill('#ffffff')

            this.add.text(400, 300, 'Close')
            .setStyle({fontSize: '20px', fontFamily: 'Arial', color: '#fff', padding: { x: 10, y: 5 }})
            .setFill('#880000')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                panel.destroy();
                messageText.destroy();
                this.children.each((child) => {
                    if (child instanceof Phaser.GameObjects.Text && child.text === 'Close') {
                        child.destroy();
                    }
                })
            })
        }
    }

    
}