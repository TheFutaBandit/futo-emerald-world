import './styles/userMetaDataStyles.css'
import RiveAnimation from './RiveAnimation';
import { Coins } from 'lucide-react';
import { useState } from 'react';

export default function UserMetadataComponent() {
    const username = localStorage.getItem("username");
    return (
        <div className = "user-data-instruction-container">
            <div className = "user-data-container">
                <h1>PROFILE</h1>
                <div className ="sexy_line_profile"></div>
                <div className = "user-profile-picture-container">
                    <RiveAnimation 
                                src="/rive_assets/gurl.riv" 
                                width={300} 
                                height={300}
                                stateMachine="State Machine 1"
                                alwaysTrack={true}
                    />
                </div>
                <div className = "user-profile-information">
                    <div className = "user-greeting">
                        Welcome
                    </div>
                    <div className = "user-greeting-name">
                        {username}
                    </div>
                    <div className = "user-greeting-note">
                        (P.S. Don't poke/click my eyes please!)
                    </div>
                </div>
            </div>
            <div className ="sexy_line_profile"></div>
            <div className = "user-instruction-container">
                <div className = "instruction-header">INSTRUCTIONS</div>
                <div className = "instruction-movement">
                    <img className = "arrow-keys" src = "./assets/arrow-keys.png"></img>
                    <p className = "movement-instruction-data">Move using arrow keys</p>
                </div>
                <div className = "instruction-gambling">
                    <Coins color = "#ECDBBA" size={"32px"}/>
                    <p className = "gamble-instruction-data">Each Pokemon reward is it's Bounty x Multiplier</p>
                </div>
                <div className = "instruction-catch">
                    <div className = "interaction-icon">
                        <div className = "e-icon">E</div>
                    </div>
                    <p className = "catch-instruction-data">'E' to interact with pokemon</p>
                </div>
            </div>
        </div>
    )
}