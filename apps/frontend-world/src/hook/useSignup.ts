import { useState } from "react";
import axios, { AxiosError } from "axios";

import useAuthContext from "./useAuthContext";

const BACKEND_URL = "http://143.110.188.87";

interface signupResponse {
    token: string
}

interface errorResponse {
    message: string
}

interface useSignupResponse {
    signUp: (username: string, password: string) => Promise<void>,
    loading: boolean,
    err: string | null
}

export const useSignup = () : useSignupResponse => {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const { dispatch } = useAuthContext();

    const signUp = async (username: string, password: string) => {
        setLoading(true);
        setErr(null);

        try {
            const response = await axios.post<signupResponse>(`${BACKEND_URL}/api/v1/auth/signup`, {
                username,
                password,
                type: "User",
            })
            const responseData = await response.data;
            dispatch({
                type: 'sign-up',
                payload: {
                    token: responseData.token
                }
            })
            
        } catch(error) {
            const err = error as AxiosError<errorResponse>
            setErr(err.response?.data?.message || 'Invalid Submission');
        } finally {
            setLoading(false);
        }  
    }

    return {
        signUp, 
        loading,
        err
    }
}