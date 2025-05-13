import { createContext, ReactNode, useEffect, useReducer } from "react";
import { jwtDecode } from "jwt-decode";

interface propType {
    children: ReactNode;
}

enum SignLog {
    SignUp = 'sign-up',
    LogIn = 'log-in'
} //check this afterwards

interface state {
    token: string | null
}

interface action {
    type: 'sign-up' | 'log-in'
    payload: any
}

type AuthContextType = state & {
    dispatch: React.Dispatch<action>
}

export const AuthContext = createContext<AuthContextType>({
    token: null,
    dispatch: ()=> {}
});

interface jwt_payload {
    userId: string,
    userRole: string,
    username: string
}

function reducer(state : state, action : action) {
    switch (action.type) {
        case(SignLog.LogIn) : {
            const { token } = action.payload;
            if (typeof token !== 'string') {
                console.warn("Invalid token passed to reducer", token);
                return state;
            }
            const jwt_payload = jwtDecode(token) as jwt_payload;
            const userId = jwt_payload.userId;
            const username = jwt_payload.username;
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("username", username);
            return {...state, token};   
        };
        case(SignLog.SignUp) : {
            const { token } = action.payload;
            if (typeof token !== 'string') {
                console.warn("Invalid token passed to reducer", token);
                return state;
              }
              try {
                const jwt_payload = jwtDecode(token) as jwt_payload;
                const userId = jwt_payload.userId;
                const username = jwt_payload.username;
                localStorage.setItem("token", token);
                localStorage.setItem("userId", userId);
                localStorage.setItem("username", username);
                return { ...state, token };
              } catch (err) {
                console.error("Failed to decode token in reducer:", err);
                return state;
              } 
        };  
        default : {
            return state;
        }
    }
}

export default function AuthContextProvider({children} : propType) {
    const [state, dispatch] = useReducer(reducer, {
        token: null
    })

    useEffect(() => {
        const token = localStorage.getItem("token");
if (typeof token === 'string') {
  dispatch({ type: SignLog.LogIn, payload: { token } });
} else {
  console.warn("No valid token found at init");
}
    }, [])

    return (
        <AuthContext.Provider value = {{...state, dispatch}}>
            {children}  
        </AuthContext.Provider>
    )
}