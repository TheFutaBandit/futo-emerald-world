import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useMemo } from "react";
import SignUpComponent from "./components/SignupComponent";
import App from "./App";
import useAuthContext from "./hook/useAuthContext";
import { PublicRoute } from "./components/PublicRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LogInCompnent from "./components/LoginComponent";



export default function RouterContainer() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <ProtectedRoute><App /></ProtectedRoute>
        },
        {
            path: "/signup",
            element: <PublicRoute><SignUpComponent /></PublicRoute>
        },
        {
            path: "/login",
            element: <PublicRoute><LogInCompnent /></PublicRoute>
        }
    ])

    return (
        <RouterProvider router = {router} />
    );
}