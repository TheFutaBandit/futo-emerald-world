import App from "../App";
import SolanaContainer from "./SolanaContainer/SolanaContainer.js";
import './styles/solanaContainer.css'

export function Gameboy() {
    return (
        <div style ={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            backgroundColor: "#161616"
        }}>
            <div className = "container1">Hello There</div>
            <div className = "gameContainer">
                <App />
            </div>
            <div className = "gameboy-solana-container"><SolanaContainer /></div>
        </div>
    )
}