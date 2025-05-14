import axios from "axios";
import { EventBus } from "../EventBus";
import { Wallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

const BACKEND_URL = "https://futoisland.com";
interface prevPosition {
    x: number, 
    y: number
}

interface Inventory {
    standardPokeball: number;
    greatPokeball: number;
    ultraPokeball: number;
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
    encounterImage: Phaser.GameObjects.Image;
    pokeballTypes: {
        [key: string]: {
            name: string,
            sprite: string,
            rate: number,
            count: number
        }
    };
    selectedPokeball: string;
    pokeballButtons: {[key: string]: Phaser.GameObjects.Text};
    userWallet: PublicKey | null;


    constructor () {
        super('EncounterScene');
    }

    init(data : any) {
        this.pokemonData = data.pokemonData;
        this.pokemon = data.pokemon;

       

        this.pokeballTypes = {
            standard: {
                name: "Pokeball",
                sprite: "pokeball",
                rate: 100,
                count: 5 // This would come from inventory
            },
            great: {
                name: "Great Ball",
                sprite: "greatball",
                rate: 50,
                count: 3 // This would come from inventory
            },
            ultra: {
                name: "Ultra Ball",
                sprite: "ultraball",
                rate: 1,
                count: 5 // This would come from inventory
            }
        };

        this.selectedPokeball = "standard";
        this.pokeballButtons = {};

        if (EventBus.hasData('inventory')) {
            const cachedInventory = EventBus.getData('inventory');
            console.log("Using cached inventory:", cachedInventory);
            if (cachedInventory) {
                this.pokeballTypes.standard.count = cachedInventory.standardPokeball;
                this.pokeballTypes.great.count = cachedInventory.greatPokeball;
                this.pokeballTypes.ultra.count = cachedInventory.ultraPokeball;
            }
        }

        if (EventBus.hasData('user-wallet')) {
            const cachedWallet = EventBus.getData('user-wallet');
            console.log("Using cached wallet:", cachedWallet.publicKey);
            this.userWallet = cachedWallet.publicKey;
        }

        console.log("hey so am I even running")
        EventBus.emit('get-inventory-for-scene');
        EventBus.on('receive-inventory', (inventory: Inventory) => {
            console.log("current-inventory", inventory);
            if(inventory) {
                this.pokeballTypes.standard.count = inventory.standardPokeball;
                this.pokeballTypes.great.count = inventory.greatPokeball;
                this.pokeballTypes.ultra.count = inventory.ultraPokeball;
                
                if (this.pokeballButtons) {
                    this.updatePokeballButtonStates();
                }
            }
        });

        EventBus.on('inventory-updated', (inventory: Inventory) => {
            console.log("Inventory updated, refreshing pokeball counts:", inventory);
            if (inventory) {
                this.pokeballTypes.standard.count = inventory.standardPokeball;
                this.pokeballTypes.great.count = inventory.greatPokeball;
                this.pokeballTypes.ultra.count = inventory.ultraPokeball;
                
                if (this.pokeballButtons) {
                    this.updatePokeballButtonStates();
                }
            }
        });

        

        EventBus.on('user-wallet', (data: { publicKey: PublicKey }) => {
            console.log("Received wallet update:", data.publicKey);
            this.userWallet = data.publicKey;
        });
    }

    preload() {
        this.load.image('background', 'assets/images/background.jpg');
        this.load.image('pokemon-large', 'assets/images/solgaleoLargeNoBg.png');
        this.load.image('pokeball', 'assets/images/new_pokeball.png');
        this.load.image('greatball', 'assets/images/greatball.png')
        this.load.image('ultraball', 'assets/images/ultraball.png')
    }

    create() {
        console.log("scene bus: ", EventBus);
        console.log("THE USER WALLET IS: ", this.userWallet);

        this.add.image(400,300, 'background').setOrigin(0.5, 0.5).setScale(1.125);
        this.encounterImage = this.add.image(400,300, 'pokemon-large').setOrigin(0.5, 0.5).setScale(0.5);

        this.add.text(this.encounterImage.x, this.encounterImage.y - 160, `${this.pokemonData.type}`).setStyle({fontSize: '24px', backgroundColor: "#000", fontFamily: 'Arial', color: '#fff'}).setOrigin(0.5).setPadding({x: 10, y: 5});
        this.add.text(50, 80, `Bounty: ${this.pokemonData.bounty} PokeCoins`).setStyle({fontSize: '18px', backgroundColor: "#000", fontFamily: 'Arial', color: '#fff'});
        this.add.text(50, 110, `Multiplier: ${this.pokemonData.multiplier}x`).setStyle({fontSize: '18px', backgroundColor: "#000", fontFamily: 'Arial', color: '#fff'});

        // this.catchButton = this.add.text(400, 350, 'Catch (1 Pokeball)')
        // .setStyle({fontSize: '20px', backgroundColor: "#008800", fontFamily: 'Arial', color: '#fff', padding: { x: 10, y: 5 }})
        // .setOrigin(0.5)
        // .setInteractive({ useHandCursor: true })
        // .on('pointerdown', () => this.attemptCatch());
        this.createPokeballSelectors();
        this.updatePokeballButtonStates();
        this.initGameFunction();

        this.add.text(400, 550, 'Leave')
        .setStyle({fontSize: '20px', backgroundColor: "#880000", fontFamily: 'Arial', color: '#fff', padding: { x: 10, y: 5 }})
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.leaveMapEncounter());



        
        EventBus.emit('current-scene-ready', this);
    }

    createPokeballSelectors() {
        const yPosition = 475;
        let xPosition = 250;
        const spacing = 150;

        Object.keys(this.pokeballTypes).forEach((type, index) => {
            const pokeballData = this.pokeballTypes[type];

            const pokeballImage = this.add.image(xPosition, yPosition - 40, pokeballData.sprite).setScale(0.1);

            const buttonText = this.add.text(xPosition, yPosition, 
                `${pokeballData.name} (${pokeballData.count})`)
                .setStyle({
                    fontSize: '16px', 
                    backgroundColor: type === this.selectedPokeball ? "#008800" : "#444444", 
                    fontFamily: 'Arial', 
                    color: '#fff', 
                    padding: { x: 10, y: 5 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.selectPokeball(type));

            this.pokeballButtons[type] = buttonText;

            this.add.text(xPosition, yPosition + 20, `Catch Rate: ${pokeballData.rate}x`)
                .setStyle({fontSize: '12px', fontFamily: 'Arial', color: '#fff'})
                .setOrigin(0.5);

                xPosition += spacing;

            });

            this.catchButton = this.add.text(400, 525, `Throw ${this.pokeballTypes[this.selectedPokeball].name}`)
            .setStyle({fontSize: '20px', backgroundColor: "#008800", fontFamily: 'Arial', color: '#fff', padding: { x: 15, y: 8 }})
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.attemptCatch());
    }

    selectPokeball(type: string) {
        if (this.pokeballTypes[type].count <= 0) {
            return;
        }

        this.selectedPokeball = type;
        this.updatePokeballButtonStates();

        this.catchButton.setText(`Throw ${this.pokeballTypes[type].name}`);
    }

    updatePokeballButtonStates() {
        // Update all button styles based on selection and availability
        Object.keys(this.pokeballButtons).forEach(type => {
            const button = this.pokeballButtons[type];
            const count = this.pokeballTypes[type].count;
            
            // Update button text to show current count
            button.setText(`${this.pokeballTypes[type].name} (${count})`);
            
            if (count <= 0) {
                // Disable appearance if no pokeballs of this type
                button.setStyle({
                    fontSize: '16px',
                    backgroundColor: "#666666",
                    color: "#aaaaaa",
                    padding: { x: 10, y: 5 }
                });
                button.disableInteractive();
            } else if (type === this.selectedPokeball) {
                // Selected style
                button.setStyle({
                    fontSize: '16px',
                    backgroundColor: "#008800",
                    color: "#ffffff",
                    padding: { x: 10, y: 5 }
                });
            } else {
                // Available but not selected style
                button.setStyle({
                    fontSize: '16px',
                    backgroundColor: "#444444",
                    color: "#ffffff",
                    padding: { x: 10, y: 5 }
                });
                button.setInteractive({ useHandCursor: true });
            }
        });
    }

    async initGameFunction() {
        this.pokeballCount = 5;
        this.updateCatchButtonState();
    }

    async attemptCatch() {
        if (this.pokeballTypes[this.selectedPokeball].count <= 0) {
            return;
        }

        this.catchButton.disableInteractive();

        const pokeballType = this.selectedPokeball;

        // EventBus.emit('catch-attempt', { pokeballType: this.selectedPokeball });
        EventBus.emit('pokeball-used', { 
            pokeballType: pokeballType 
        });

        this.pokeballTypes[this.selectedPokeball].count--;
        this.updatePokeballButtonStates();
  
        // this.updateCatchButtonState();

        if (this.pokeballTypes[this.selectedPokeball].count <= 0) {
            const availableType = Object.keys(this.pokeballTypes).find(type => 
                this.pokeballTypes[type].count > 0);
                
            if (availableType) {
                this.selectedPokeball = availableType;
                this.updatePokeballButtonStates();
            }
        }

        const pokeballSprite = this.pokeballTypes[this.selectedPokeball].sprite;

        const pokeball = this.add.image(150, 350, pokeballSprite).setScale(0.1);

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
            if(!this.userWallet) {throw new Error("no user wallet available")};

            const response = await axios.post(`${BACKEND_URL}/api/v1/solana/catch`, {
                pokemonId: this.pokemonData.type,
                pokemonDifficulty: this.pokemonData.difficulty,
                pokemonBounty: this.pokemonData.bounty,
                pokemonMultiplier: this.pokemonData.multiplier,
                ball_rate: this.pokeballTypes[this.selectedPokeball].rate,
                userWallet: this.userWallet //bring the wallet here too
            });
    
            
            console.log('Response:', response.data);
    
            const data = response.data;

            // const data = {
            //     success: true,
            //     catch: true
            // }
            // Simulate a successful catch
    
            if(data.success) {
                if(data.catch) {
                    console.log('Pokemon caught successfully!');
                    this.tweens.add({
                        targets: this.encounterImage,
                        x: pokeball.x,
                        y: pokeball.y,
                        scale: 0.1,
                        alpha: 0.7,
                        duration: 800,
                        ease: 'Power2',
                        onComplete: () => {
                            // Show success message with rewards
                            const reward = this.pokemonData.bounty * this.pokemonData.multiplier;
                            this.encounterImage.setVisible(false);
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
                    this.tweens.add({
                        targets: pokeball,
                        y: pokeball.y + 20,
                        angle: { from: -15, to: 15 },
                        scale: 0.12,
                        duration: 500,
                        ease: 'Bounce',
                        onComplete: () => {
                            // Fade out pokeball
                            this.tweens.add({
                                targets: pokeball,
                                alpha: 0,
                                duration: 300,
                                onComplete: () => {
                                    pokeball.destroy();
                                    this.showResultMessage(false, 0);
                                    
                                    // Re-enable catch button if player still has pokeballs
                                    const hasAnyPokeballs = Object.values(this.pokeballTypes).some(ball => ball.count > 0);
                                    if (hasAnyPokeballs) {
                                        this.catchButton.setInteractive({ useHandCursor: true });
                                    } else {
                                        this.showNoPokeballs();
                                    }
                                }
                            });
                        }
                    });
                }
            } else {
                this.showResultMessage(false, 0, "transaction error");
                this.catchButton.setInteractive({ useHandCursor: true });
                console.log('Server Error');
            }
        } catch (error) {
            console.log("failed");
            console.error('Error during catch attempt:', error);
            
        }
    }

    showNoPokeballs() {
        this.catchButton.setStyle({ 
            backgroundColor: "#666666",
            color: "#aaaaaa"
        });
        this.catchButton.disableInteractive();

        const hintText = this.add.text(400, 460, "No more Pokeballs left. Press 'Leave' to exit.")
        .setOrigin(0.5)
        .setStyle({
            fontSize: '14px',
            backgroundColor: "#000000",
            padding: { x: 8, y: 4 },
            color: '#ffffff'
        });

        this.tweens.add({
            targets: hintText,
            alpha: { from: 1, to: 0.5 },
            yoyo: true,
            repeat: 3,
            duration: 300
        });
    }

    updateCatchButtonState() {
        this.pokeballCount--;
        // this.catchButton.setText(`Catch (${this.pokeballCount} Pokeballs left)`);

        if(this.pokeballCount <= 0) {
            this.catchButton.setStyle({ 
                backgroundColor: "#666666",
                color: "#aaaaaa"
            });
            this.catchButton.disableInteractive();

            const hintText = this.add.text(400, 380, "No more Pokeballs left. Press 'Leave' to exit.")
            .setOrigin(0.5)
            .setStyle({
                fontSize: '14px',
                backgroundColor: "#000000",
                padding: { x: 8, y: 4 },
                color: '#ffffff'
            });

            this.tweens.add({
                targets: hintText,
                alpha: { from: 1, to: 0.5 },
                yoyo: true,
                repeat: 3,
                duration: 300
            });
        }
    }

    leaveMapEncounter(pokemonCaught = false) {
        console.log('leaving map encounter');
        if(pokemonCaught && this.pokemon) {
            this.scene.wake('Modular-Scene', {
                pokemonCaught: true,
                pokemonId: this.pokemonData.type,
            })
        } else {
            this.scene.wake('Modular-Scene');
        }
        EventBus.removeListener('inventory-updated');
        EventBus.removeListener('receive-inventory');
        this.scene.stop();

        // if(pokemonCaught && this.pokemon) {
        //     this.scene.start('Modular-Scene', {
        //         pokemonCaught: true,
        //         pokemonId: this.pokemonData.type,
        //     })
        // } else {
        //     this.scene.start('Modular-Scene');
        // }
        
    }

    showResultMessage(success: boolean, reward: number, errorMsg : any = null) {
        const panel = this.add.rectangle(400, 250, 400, 200, 0x000000);

        let messageText : any;

        if (errorMsg) {
            messageText = this.add.text(400, 250, errorMsg)
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
            messageText = this.add.text(400, 250, `Couldn't catch ${this.pokemonData.type}!`)
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