import { Link, Outlet } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import './styles/SignupStyles.css'
import { useRef, useState } from "react";
import RiveAnimation from './RiveAnimation';

export function PublicDisplay() {
    const navigate = useNavigate();
    const [log, setLog] = useState('signup');
    const cardRef = useRef<HTMLDivElement>(null);

    function triggerAnimation() {
        const el = cardRef.current;

        el?.classList.remove('open');

        void el?.offsetWidth;

        el?.classList.add('open')
    }



    return (
        <div className = "authPage" style ={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#161616",
            position: "relative"
            // marginTop: "50px"
        }}>
            <div className="inner" style = {{
                position: "relative",
                marginTop: "100px"
            }}>
                    <div style={{ 
                        position: 'absolute',
                        top: "-50px",
                        left: '50%',
                        transform: 'translate(-50%, -100%)', // horizontally center & shift above
                        height: '200px',
                        width: '400px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        
                    }}>
                        <RiveAnimation 
                            src="/rive_assets/cat_without_butterfly.riv" 
                            width={400} 
                            height={300}
                            stateMachine="State Machine 1"
                            alwaysTrack={true}
                        />
                    </div>
                    <Outlet />
                    <div className = "authButtonRouteContainer" style = {{
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        {log === 'signup' 
                         ? 
                            <div className = "bottom-navigator">Already have an account? <Link to ="/auth/login" className = "navigate-link" onClick = {() => {setLog('login')}}>Log in</Link></div>
                         :
                            <div className = "bottom-navigator">Don't have an account? <Link to ="/auth" className = "navigate-link" onClick = {() => {setLog('signup')}}>Sign up</Link></div>
                        }
                        {/* <button onClick = {() => navigate('/auth/login')}>Go to login</button>
                        <button onClick = {() => navigate('/auth')}>Go to signup</button> */}
                    </div>
            </div> 
        <div className = "credit-thing">Multiplayer Pokemon-Based Gambling Game <br /> Developed by FutoBandit</div>
        </div>
    )
}