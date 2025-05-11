import App from "../App";
import SolanaContainer from "./SolanaContainer/SolanaContainer.js";
import UserMetadataComponent from "./UserMetadataComponent.js";
import './styles/solanaContainerStyles.css'
import './styles/userMetaDataStyles.css'

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
            <div className = "user-metadata-container"><UserMetadataComponent /></div>
            <div className = "gameContainer">
                <App />
            </div>
            <div className = "gameboy-solana-container"><SolanaContainer /></div>
        </div>
    )
}