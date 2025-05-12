import React, { useState, useRef } from "react";
import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import useAuthContext from "./useAuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://futo-emerald-world.onrender.com";

interface loginReponse {
    token: string
}

interface errorResponse {
    message : string
}

interface useLoginResponse {
    logIn : (username : string, password : string) => Promise<void>,
    loading: boolean,
    err: string | null
}

export const useLogin = () : useLoginResponse => {
    const [loading, setLoading] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);
    
    const { dispatch } = useAuthContext();

    const logIn = async (username : string, password : string) => {
        setLoading(true);
        setErr(null);
        console.log({
            username: username,
            password: password
        })

        try {
            const response = await axios.post<loginReponse>(`${BACKEND_URL}/api/v1/auth/login`, {
                username,
                password,
            })
            const responseData = await response.data;
            dispatch({
                type: 'log-in',
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
        logIn, 
        loading,
        err
    }
}