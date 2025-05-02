import App from "../App";


export function Gameboy() {
    return (
        <div>
            <div className = "container1">Hello There</div>
            <div className = "gameContainer">
                <div>I will be the game container</div>
                <App />
            </div>
            <div className = "container2">I will be the solana container</div>
        </div>
    )
}