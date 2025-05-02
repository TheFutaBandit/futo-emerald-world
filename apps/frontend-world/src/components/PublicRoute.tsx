import { Navigate } from "react-router-dom";
import useAuthContext from "../hook/useAuthContext";

export function PublicRoute({children} : any) {
    const { token } = useAuthContext();

    if(token) {
        console.log("user is already authenticated!");
        return (
            <Navigate to = "/"></Navigate>
        )
    }

    return children;
}