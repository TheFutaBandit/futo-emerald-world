import { useRef } from "react";
import { useLogin } from "../hook/useLogin";
import './styles/LogInStyles.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://futo-emerald-world.onrender.com";

interface loginResponse {
    token: string
}

interface errorResponse {
    message : string
}


export default function LogInCompnent() {

    const { logIn, loading, err } = useLogin()
    
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    async function handleSubmit() {
        await logIn(usernameRef.current?.value!, passwordRef.current?.value!);
    }   

    return (
        <div className="signup-container" style={{
            flexGrow: "1"
        }}>
            {err && <div>That's an error</div>}
            <div className = "title-container">
                <div className = "top-title">POKEVILLE</div>
                <div className = "tag-line">Gambling In Nostalgia</div>
            </div>
            <div className ="sexy_line"></div>
            <div className = "title-form">
                <div className = "title-form-inputs">
                    <div className="username">
                        <input className = "formInput" type = "text" placeholder="Username" ref={usernameRef} disabled = {loading}></input>
                    </div>
                    <div className="password">
                        <input className = "formInput" type = "password" placeholder="Password" ref={passwordRef} disabled = {loading}></input>
                    </div>
                </div>
                <div className = "title-form-submit">
                    <button className="submit-button" onClick={handleSubmit}>Login</button>
                </div>
            </div>
            <div className ="sexy_line"></div>
        </div>
    )

    //add active classes too
}