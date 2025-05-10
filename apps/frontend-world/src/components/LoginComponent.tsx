import { useRef } from "react";
import { useLogin } from "../hook/useLogin";
import './styles/LogInStyles.css'

const BACKEND_URL = 'http://localhost:3000'


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
        <div className="login-container">
            {err && <div>That's an error</div>}
            <div className = "title-container">PLACEHOLDER</div>
            <div className = "title-form">
                <div className="username">
                    <input id = "usernameInput" type = "text" placeholder="Username" ref={usernameRef} disabled = {loading}></input>
                </div>
                <div className="password">
                    <input id = "passwordInput" type = "text" placeholder="Password" ref={passwordRef} disabled = {loading}></input>
                </div>
                <button className="submit-button" onClick={handleSubmit}>Log-In</button>
            </div>
        </div>
    )

    //add active classes too
}