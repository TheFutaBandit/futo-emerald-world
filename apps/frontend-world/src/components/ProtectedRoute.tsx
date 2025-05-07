import { Navigate } from "react-router-dom";
import useAuthContext from "../hook/useAuthContext";

export function ProtectedRoute({children} : any) {
    const { token } = useAuthContext();

    

    if(!token && localStorage.getItem("token") === null) {
        console.log("user not authenticated!");
        return (
            <Navigate to = "/auth"></Navigate>
        )
    }

    return children;
}