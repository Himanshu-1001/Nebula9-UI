import React from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom';

export default function GoogleLogin() {

    const navigate = useNavigate();

    const handleLogin = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        onSuccess: (tokenResponse) => {
            console.log(tokenResponse);
            sessionStorage.setItem('accessToken', tokenResponse.access_token);
            navigate('/emails');
        },
        onError: (error) => {
            console.error('Login failed:', error);
        }
    });

    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-6">OAUTH2 Google Sign In</h1>
        <button 
            onClick={handleLogin} 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
            Login
        </button>
    </div>
    )
}
