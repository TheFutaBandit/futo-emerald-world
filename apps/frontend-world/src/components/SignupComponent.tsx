import  { useRef } from "react";
import { useSignup } from "../hook/useSignup";

import './styles/SignupStyles.css'



export default function SignUpComponent() {

    const { signUp, loading, err } = useSignup()

    
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    async function handleSubmit() {
        await signUp(usernameRef.current?.value!, passwordRef.current?.value!);
    }   

    return (
        <div className="signup-container" style={{
            flexGrow: "1",
            display: "flex",
            flexDirection: "column",
        }}>
            {err && <div>That's an error</div>}
            <div className = "title-container">
                <div className = "top-title">FUTAVILLE</div>
                <div className = "tag-line">Gambling In Nostalgia</div>
            </div>
            <div className ="sexy_line"></div>
            <div className = "title-form">
                <div className = "title-form-inputs">
                    <div className="username">
                        <input className = "formInput" type = "text" placeholder="Username" ref={usernameRef} disabled = {loading}></input>
                    </div>
                    <div className="password">
                        <input className = "formInput" type = "text" placeholder="Password" ref={passwordRef} disabled = {loading}></input>
                    </div>
                </div>
                <div className = "title-form-submit">
                    <button className="submit-button" onClick={handleSubmit}>Sign Up</button>
                </div>
            </div>
            <div className ="sexy_line"></div>
        </div>
    )

    //add active classes too
}