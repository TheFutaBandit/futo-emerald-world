import  { useRef } from "react";
import { useSignup } from "../hook/useSignup";


export default function SignUpComponent() {

    const { signUp, loading, err } = useSignup()

    
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    async function handleSubmit() {
        await signUp(usernameRef.current?.value!, passwordRef.current?.value!);
    }   

    return (
        <div className="signup-container">
            {err && <div>That's an error</div>}
            <div className = "title-container"><h2>Sign-Up</h2></div>
            <div className = "title-form">
                <div className="username">
                    <div>Username: </div>
                    <input type = "text" placeholder="Enter Username" ref={usernameRef} disabled = {loading}></input>
                </div>
                <div className="password">
                    <div>Password: </div>
                    <input type = "text" placeholder="Enter Password" ref={passwordRef} disabled = {loading}></input>
                </div>
                <button className="submit-button" onClick={handleSubmit}>Sign-Up</button>
            </div>
        </div>
    )

    //add active classes too
}