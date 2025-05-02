import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import SignupComponent from "./components/SignupComponent";
import { PublicRoute } from "./components/PublicRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginComponent from "./components/LoginComponent";
import { PublicDisplay } from "./components/PublicDisplay";
import { Gameboy } from "./components/Gameboy";



export default function RouterContainer() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <ProtectedRoute><Gameboy /></ProtectedRoute>
        },
        {
            path: "/auth",
            element: <PublicRoute><PublicDisplay /></PublicRoute>,
            children: [
                {index: true, element: <SignupComponent />},
                {path: "/auth/login", element: <LoginComponent />},
            ]
        },
    ])

    return (
        <RouterProvider router = {router} />
    )
}