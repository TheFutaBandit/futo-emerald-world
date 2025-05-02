import { Link, Outlet } from "react-router-dom"
import { useNavigate } from "react-router-dom"

export function PublicDisplay() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Hello There</h1>
            <Link to = "/auth/login">Go to login</Link>
            <Link to = "/auth">Go to Signup</Link>
            <button onClick = {() => navigate('/auth/login')}>Go to login</button>
            <button onClick = {() => navigate('/auth')}>Go to signup</button>
            <Outlet />
        </div>
    )
}