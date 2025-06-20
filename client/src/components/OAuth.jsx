import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../assets/firebase';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_URL || 'http://localhost:3000';
    
    const handleGoogleClick = async () => {
        try {   
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const username = user.email?.split('@')[0].toLowerCase()+
        Math.random().toString(36).slice(-6) || 'google_user';
            
            const res = await fetch(`${API_URL}/api/auth/google`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include', // This is the key addition!
                body: JSON.stringify({
                    username: username,
                    fullName: user.displayName || 'Google User',
                    email: user.email,
                    dob: new Date().toISOString(), // Today's date as fallback
                    profilePicture: user.photoURL,
                }),
            });
            
            if (!res.ok) {
                throw new Error('Google authentication failed');
            }
            
            const data = await res.json();
            dispatch(loginSuccess(data));
            navigate('/'); 
        } catch (error) {
            console.error('Could not sign in with Google', error);
        }
    };
    
    return (
        <button 
            type='button' 
            onClick={handleGoogleClick} 
            className='bg-red-700 text-white rounded-lg p-3 uppercase hover:opacity-75'
        >
            Continue with Google
        </button>
    );
}