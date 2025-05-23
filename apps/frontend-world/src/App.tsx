import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';


function App()
{
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const changeScene = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as any;
            
            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const moveSprite = () => {

       console.log("wow");

    }

    const addSprite = () => {

        console.log("add things");
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        // setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <div id="app" style={{boxShadow: "0px 0px 46px -17px rgba(236, 219, 186, 0.37)", border: "1px solid rgba(236, 219, 186, 0.2)"}}>
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        </div>
    )
}

export default App
