import { useRef } from "react";
import { useLogin } from "../hook/useLogin";

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
            <div className = "title-container"><h2>Log-In</h2></div>
            <div className = "title-form">
                <div className="username">
                    <div>Username: </div>
                    <input type = "text" placeholder="Enter Username" ref={usernameRef} disabled = {loading}></input>
                </div>
                <div className="password">
                    <div>Password: </div>
                    <input type = "text" placeholder="Enter Password" ref={passwordRef} disabled = {loading}></input>
                </div>
                <button className="submit-button" onClick={handleSubmit}>Log-In</button>
            </div>
        </div>
    )

    //add active classes too
}