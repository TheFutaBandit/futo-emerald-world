import { useState } from "react";
import App from "../App";
import SolanaContainer from "./SolanaContainer/SolanaContainer.js";
import UserMetadataComponent from "./UserMetadataComponent.js";
import './styles/solanaContainerStyles.css'
import './styles/userMetaDataStyles.css'
import { FileWarning } from "lucide-react";

function StandbyGame({ toggleFlag }: { toggleFlag: () => void }) {
    return (
        <div className = "standby-container">
            <div className = "warning-container">
                <div className = "warning-1">Please connect a wallet before playing.</div>
                
                <button className = "warning-button" onClick={toggleFlag}>PLAY</button>
                
            </div>
        </div>
    )
}

export function Gameboy() {
    const [flag, setFlag] = useState<boolean>(false);

    function toggleFlag() {
       
        setFlag(true);
    }
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
                {flag ? <App /> : <StandbyGame toggleFlag = {toggleFlag}/>}
            </div>
            <div className = "gameboy-solana-container"><SolanaContainer /></div>
        </div>
    )
}