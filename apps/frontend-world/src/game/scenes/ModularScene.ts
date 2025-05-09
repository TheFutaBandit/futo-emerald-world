import { Scene, Time } from "phaser";
import { EventBus } from "../EventBus";
import { NetworkManager } from "../NetworkManager";

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

export class ModularScene extends Scene {
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
    networkManager: NetworkManager;
    world_layer: Phaser.Tilemaps.TilemapLayer | null;
    camera: Phaser.Cameras.Scene2D.Camera;
    pokemonToRemove: any;


    constructor() {
        super('Modular-Scene');
        this.prevPosition = {
            x: -1,
            y: -1
        }
        this.playerMap = new Map();
        this.playerList = new Map();
        this.playerVelocity = new Map();
        this.playerInitialized = false;

        this.networkManager = NetworkManager.getInstance();
    }

    init(data: any) {
        if (data && data.pokemonCaught && data.pokemonId) {
            this.pokemonToRemove = data.pokemonId;
        }
    }

    preload() {
        this.load.image("tiles", "../assets/tilesets/tuxmon-sample-32px-extruded.png");
        this.load.tilemapTiledJSON("map", '../assets/tilemaps/tuxemon-town.json');
        this.load.atlas("atlas", "../assets/atlas/atlas.png", "../assets/atlas/atlas.json");
        this.load.image("pokemon", "../assets/images/solgaleo.png");
    }

    async create() {
        const map = this.make.tilemap({key: "map"});

        const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles")

        const below_layer = map.createLayer("Below Player", tileset!, 0, 0);
        this.world_layer = map.createLayer("World", tileset!, 0, 0);
        const above_layer = map.createLayer("Above Player", tileset!,0, 0);

        above_layer?.setDepth(10);

        this.world_layer?.setCollisionByProperty({collides: true});

        //camera setup
        this.camera = this.cameras.main;

        this.cursors = this.input.keyboard?.createCursorKeys();

        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: this.camera,
            down: this.cursors?.down,
            up: this.cursors?.up,
            left: this.cursors?.left,
            right: this.cursors?.right,
            speed: 0.5,
        })

        this.camera.setBounds(0,0,map.widthInPixels, map.heightInPixels);

        //animation
        const anims = this.anims;
        anims.create({
          key: "misa-left-walk",
          frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
          frameRate: 10,
          repeat: -1
        });
        anims.create({
          key: "misa-right-walk",
          frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
          frameRate: 10,
          repeat: -1
        });
        anims.create({
          key: "misa-front-walk",
          frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
          frameRate: 10,
          repeat: -1
        });
        anims.create({
          key: "misa-back-walk",
          frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
          frameRate: 10,
          repeat: -1
        });      

        if(!this.networkManager.isConnected) {
            this.networkManager.connect();
        }
 
        this.initNetworkHandlers();

        this.events.on('shutdownn', this.handleSceneShutdown, this);
        
        // const debugGraphics = this.add.graphics().setAlpha(0.75);

        // world_layer?.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        // })

       
        const obj_layer = map.getObjectLayer('Objects');
        const obj = obj_layer?.objects.find(ob => ob.name === 'Spawn Point');

        const spawn_obj_layer = map.getObjectLayer('PlayerSpawns');
        const spawn_points = spawn_obj_layer?.objects.map((object) => {return {
            x: object.x,
            y: object.y
        }});

        // this.interactText = this.add.text(0,0,"Press E to interact", {
        //     fontSize: '20px',
        //     color: '#fff',
        //     backgroundColor: '#000',
        //     padding: {x: 5, y: 2}
        // })
        // this.interactText.setVisible(true);


        //pokemon logic
        this.spawnPokemon();

        //e to interact
        if (this.input.keyboard) {
            this.interactKey = this.input.keyboard.addKey('e');
        }


        //text box for interaction
        this.interactText = this.add.text(10, 10, 'Press E to interact', {
            padding: { x: 10, y: 10 },
        })
        .setScale(1)
        .setOrigin(0)
        .setStyle({fontStyle: 'bold', backgroundColor: "#000", fontFamily: 'Arial', color: '#fff'});
        this.interactText.setVisible(false);

        this.canInteract = false;
        this.nearbyPokemon = null;
    }

    setMove(x: number, y: number, velocityX: number, velocityY: number) {
        if(this.prevPosition) {
            if(this.prevPosition.x === x && this.prevPosition.y === y) return;
        }
        // console.log(`The velocity is ${velocityX} and ${velocityY}`);
        this.networkManager.sendMessage("user-move", ({
                x,
                y,
                velocity: {
                    vx: velocityX,
                    vy: velocityY 
                }
        }))

        this.prevPosition.x = x;
        this.prevPosition.y = y;
    }

    spawnPokemon() {
        const pokemonType = {
            type: 'Solgaleo',
            spriteIndex: 0,
            bounty: 50,
            multiplier: 1.5,
            difficulty: 7
        }

        this.pokemon = this.physics.add.image(590, 912, 'pokemon').setScale(1.2) as PokemonImage;

        this.pokemon.pokemonData = {
            type: pokemonType.type,
            bounty: pokemonType.bounty,
            multiplier: pokemonType.multiplier,
            difficulty: pokemonType.difficulty
        }
    }

    checkPokemonProximity() {
        this.canInteract = false;
        this.nearbyPokemon = null;
        this.interactText.setVisible(false);

        const PLAYERX = Math.floor(this.player.x/32);
        const PLAYERY = Math.floor(this.player.y/32);

        const pokemonX = Math.floor(this.pokemon.x/32);
        const pokemonY = Math.floor(this.pokemon.y/32);

        if(Math.abs(PLAYERX - pokemonX) < 2 && Math.abs(PLAYERY - pokemonY) < 2) {
            this.canInteract = true;
            this.nearbyPokemon = this.pokemon;
            this.interactText.setVisible(true);
            this.interactText.setPosition(this.player.x, this.player.y - 50);
        }

        EventBus.emit('current-scene-ready', this);
    }

    
    initNetworkHandlers() {
        this.networkManager.on('init', (payload: any) => {
            this.userId = payload.player.id;
            console.log("does the control reach here?");
            if(!this.playerInitialized) {
                    console.log("does the control reach here?");
                    const serverX = payload.player.x;
                    const serverY = payload.player.y;

                    this.player = this.physics.add.sprite(serverX,serverY, "atlas", "misa-front");

                    this.physics.add.collider(this.player, this.world_layer!);

                    this.camera.startFollow(this.player);
                    this.playerInitialized = true;
            }
            payload.players.map((obj : {id: string, x: number, y: number}) => {
                if(this.userId != obj.id) {
                    this.playerList.set(obj.id, obj);
                    this.playerVelocity.set(obj.id, {vx: 0, vy: 0});
                    this.playerMap.set(obj.id, this.physics.add.sprite(obj.x,obj.y, "atlas", "misa-front"));
                }
            })
        });

        this.networkManager.on('player-joined', (payload: any) => {
                const new_player = this.physics.add.sprite(payload.x,payload.y, "atlas", "misa-front")
                this.playerList.set(payload.id, payload);
                this.playerMap.set(payload.id, new_player);

                this.playerMap.forEach((sprite, clientId) => {
                    if(clientId != payload.id && sprite != new_player) {
                        this.physics.add.collider(sprite, new_player);
                    }
                })
        })

        this.networkManager.on('player-movement', (payload: any) => {
            this.playerList.get(payload.id)!.x = payload.x;
            this.playerList.get(payload.id)!.y = payload.y;
            this.playerVelocity.get(payload.id)!.vx = payload.velocity.x;
            this.playerVelocity.get(payload.id)!.vy = payload.velocity.y;
        })

        this.networkManager.on('player-left', (payload: any) => {
            this.playerList.delete(payload.id);
            this.playerVelocity.delete(payload.id);
            const getSprite = this.playerMap.get(payload.id);
            this.playerMap.delete(payload.id);
            getSprite?.destroy();
        })

        this.networkManager.markHandlersRegistered();
    }

    handleSceneShutdown() {
        console.log('Scene is shutting down, cleaning up network handlers');
        this.networkManager.off('init', this.initNetworkHandlers);
        this.networkManager.off('player-joined', this.initNetworkHandlers);
        this.networkManager.off('player-movement', this.initNetworkHandlers);
        this.networkManager.off('player-left', this.initNetworkHandlers);

        this.events.off('shutdown', this.handleSceneShutdown, this);

    }

    update(time : any, delta : any) {
        this.controls.update(delta);

        if(!this.playerInitialized || !this.player) return;

        const speed = 175;
        const prevVelocity = this.player.body?.velocity.clone();

        this.player.setVelocity(0);

        if(this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.setMove(this.player.x, this.player.y, this.player.body?.velocity.x!, this.player.body?.velocity.y!)
        }else if(this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.setMove(this.player.x, this.player.y, this.player.body?.velocity.x!, this.player.body?.velocity.y!)
        }

        if(this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.setMove(this.player.x, this.player.y, this.player.body?.velocity.x!, this.player.body?.velocity.y!)
        }else if(this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.setMove(this.player.x, this.player.y, this.player.body?.velocity.x!, this.player.body?.velocity.y!)
        } 


        this.player.body?.velocity.normalize().scale(speed);

        if(this.cursors.right.isDown) {
            this.player.anims.play("misa-right-walk", true);
        } else if(this.cursors.left.isDown) {
            this.player.anims.play("misa-left-walk", true);
        } else if(this.cursors.up.isDown) {
            this.player.anims.play("misa-back-walk", true);
        }else if(this.cursors.down.isDown) {
            this.player.anims.play("misa-front-walk", true);
        } else {
            this.player.anims.stop();
            if (prevVelocity!.x < 0) this.player.setTexture("atlas", "misa-left");
            else if (prevVelocity!.x > 0) this.player.setTexture("atlas", "misa-right");
            else if (prevVelocity!.y < 0) this.player.setTexture("atlas", "misa-back");
            else if (prevVelocity!.y > 0) this.player.setTexture("atlas", "misa-front");
        }

        this.playerMap.forEach((sprite, clientId) => {
            if(sprite != this.player) {

                const playerEntity = this.playerList.get(clientId);

                if(!playerEntity) return;

                const prevX = sprite.x;
                const prevY = sprite.y;

                const playerVelocityObj = this.playerVelocity.get(clientId);

                const target_x = playerEntity?.x!;
                const target_y = playerEntity?.y!;

                const current_x = sprite.x;
                const current_y = sprite.y;

                const dist_x = (target_x - current_x);
                const dist_y = (target_y - current_y);

                const lerpFactor = 0.2;

                const new_x = Phaser.Math.Linear(prevX, target_x, lerpFactor);
                const new_y = Phaser.Math.Linear(prevY, target_y, lerpFactor);

                const deltaX = new_x - prevX;
                const deltaY = new_y - prevY;

                // sprite.setVelocity(moveX*10, moveY*10);

                sprite.setPosition(new_x, new_y);

                const moving = Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5;

                if(moving) {
                    if(Math.abs(deltaX) > Math.abs(deltaY)) {
                        if(deltaX > 0) sprite.anims.play('misa-right-walk', true);
                        else sprite.anims.play('misa-left-walk', true);
                    } else {
                        if(deltaY > 0) sprite.anims.play('misa-front-walk', true);
                        else sprite.anims.play('misa-back-walk', true);
                    }
                } else {
                    sprite.anims.stop();
                    const vel = this.playerVelocity.get(clientId);
                    if(vel) {
                        if (vel!.vx < 0) sprite.setTexture("atlas", "misa-left");
                        else if (vel!.vx > 0) sprite.setTexture("atlas", "misa-right");
                        else if (vel!.vy < 0) sprite.setTexture("atlas", "misa-back");
                        else if (vel!.vy > 0) sprite.setTexture("atlas", "misa-front");
                    }
                }

                // if(Math.abs(moveX) > Math.abs(moveY)) {
                //     if(moveX > 0) {
                //         sprite.anims.play('misa-right-walk', true);
                //     } else {
                //         sprite.anims.play('misa-left-walk', true);
                //     }
                // } else {
                //     if(moveY > 0) {
                //         sprite.anims.play('misa-front-walk', true);
                //     } else {
                //         sprite.anims.play('misa-back-walk', true);
                //     }
                // }

                // if (Math.abs(moveX) <0.1 && Math.abs(moveY) <0.1 ) {
                //     sprite.anims.stop();
                //     // Use the last direction to determine idle frame
                //     if(playerVelocityObj) {
                //         if(playerVelocityObj.vx  && playerVelocityObj.vy) {
                //             if (playerVelocityObj!.vx < 0) sprite.setTexture("atlas", "misa-left");
                //             else if (playerVelocityObj!.vx > 0) sprite.setTexture("atlas", "misa-right");
                //             else if (playerVelocityObj!.vy < 0) sprite.setTexture("atlas", "misa-back");
                //             else if (playerVelocityObj!.vy > 0) sprite.setTexture("atlas", "misa-front");
                //             }
                //         }
                        
                // }
                

                // if(playerVeclocityObj?.vx! > 0) {
                //     sprite.anims.play("misa-right-walk", true);
                // } else if(playerVeclocityObj?.vx! < 0) {
                //     sprite.anims.play("misa-left-walk", true);
                // } else if(playerVeclocityObj?.vy! > 0) {
                //     sprite.anims.play("misa-back-walk", true);
                // }else if(playerVeclocityObj?.vy! < 0) {
                //     sprite.anims.play("misa-front-walk", true);
                // } else {
                //     sprite.anims.stop();
                //     if (playerVeclocityObj?.vx! < 0) this.player.setTexture("atlas", "misa-left");
                //     else if (playerVeclocityObj?.vx! > 0) this.player.setTexture("atlas", "misa-right");
                //     else if (playerVeclocityObj?.vy! < 0) this.player.setTexture("atlas", "misa-back");
                //     else if (playerVeclocityObj?.vy! > 0) this.player.setTexture("atlas", "misa-front");
                // }
            }

        })

        
        // If we were moving, pick and idle frame to use

        this.checkPokemonProximity();

        if(this.canInteract && this.interactKey.isDown) {
            this.startPokemonEncounter(this.nearbyPokemon!);
            // if(this.nearbyPokemon) {
            //     EventBus.emit('pokemon-interact', this.nearbyPokemon);
            //     this.interactText.setVisible(false);
            // }
        }  
    }

    async startPokemonEncounter(pokemon: PokemonImage) {
        const inventory = {
            
        }
        this.scene.sleep();



        this.scene.launch('EncounterScene', {
            pokemonData: pokemon.pokemonData,
            pokemon: pokemon
        })


    }
}