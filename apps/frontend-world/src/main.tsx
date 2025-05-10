import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthContextProvider from './context/AuthContext.tsx';
import RouterContainer from './RouterContainer.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthContextProvider>
            <RouterContainer />
        </AuthContextProvider>
    </React.StrictMode>
)
