import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserSuccess, updateUserStart, updateUserFailure, deleteUserFailure, deleteUserSuccess, deleteUserStart, SignOut } from '../redux/user/userSlice.js';

export default function Profile() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: currentUser.email || '',
    password: '',
    fullName: currentUser.fullName || '',
    dob: currentUser.dob ? new Date(currentUser.dob).toISOString().split('T')[0] : '',
    bio: currentUser.bio || '',
    profilePicture: currentUser.profilePicture || 'https://tableconvert.com/images/avatar.png',
    showProfilePictureInput: false
  });
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_URL || 'http://localhost:3000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      dispatch(updateUserStart());
      const res = await fetch(`${API_URL}/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        setError(data.message);
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setError(null);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try{
        dispatch(deleteUserStart());
        const res = await fetch(`${API_URL}/api/user/delete/${currentUser._id}`, {
          method: 'DELETE',
          credentials: 'include', 
        });
        const data = await res.json();
        if (data.success === false) {
          return;
        }
        dispatch(deleteUserSuccess());
      } catch (error) {
        dispatch(deleteUserFailure(error));
      } 
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${API_URL}/api/auth/signout`, {
        credentials: 'include' 
      });
      dispatch(SignOut());
      window.location.href = '/sign-in';
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      
      {/* User Stats Section */}
      <div className="mb-6 bg-blue-100 rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-3 text-slate-800">User Statistics</h2>
        <div className="flex flex-col md:flex-row md:justify-around gap-4">
          <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-sm text-gray-500">Rating</span>
            <span className="text-2xl font-bold text-blue-600">{currentUser.rating || 0}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-sm text-gray-500">Problems Solved</span>
            <span className="text-2xl font-bold text-green-600">
              {currentUser.questionCount || 0}
            </span>
          </div>
        </div>
      </div>
      
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center">
          <img
            src={formData.profilePicture}
            alt="profile"
            className="h-24 w-24 rounded-full object-cover mt-2"
          />
          <button 
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
            onClick={() => setFormData({
              ...formData,
              showProfilePictureInput: !formData.showProfilePictureInput
            })}
          >
            {formData.showProfilePictureInput ? 'Cancel' : 'Change Profile Picture'}
          </button>
          
          {formData.showProfilePictureInput && (
            <input
              type="text"
              id="profilePicture"
              placeholder="Enter new profile picture URL"
              className="bg-slate-100 rounded-lg p-3 mt-2 w-full"
              value={formData.profilePicture}
              onChange={handleChange}
            />
          )}
        </div>
        
        {/* Username (read-only) */}
        <div className="flex flex-col">
          <label htmlFor="username" className="text-sm text-gray-600 mb-1">Username</label>
          <input
            value={currentUser.username}
            type="text"
            id="username"
            className="bg-slate-200 rounded-lg p-3 cursor-not-allowed"
            disabled
          />
        </div>
        
        {/* Full Name */}
        <div className="flex flex-col">
          <label htmlFor="fullName" className="text-sm text-gray-600 mb-1">Full Name</label>
          <input
            value={formData.fullName}
            onChange={handleChange}
            type="text"
            id="fullName"
            placeholder="Full Name"
            className="bg-slate-100 rounded-lg p-3"
          />
        </div>
        
        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm text-gray-600 mb-1">Email</label>
          <input
            value={formData.email}
            onChange={handleChange}
            type="email"
            id="email"
            placeholder="Email"
            className="bg-slate-100 rounded-lg p-3"
          />
        </div>
        
        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm text-gray-600 mb-1">Password (leave empty to keep current)</label>
          <input
            value={formData.password}
            onChange={handleChange}
            type="password"
            id="password"
            placeholder="New Password"
            className="bg-slate-100 rounded-lg p-3"
          />
        </div>
        
        {/* Date of Birth */}
        <div className="flex flex-col">
          <label htmlFor="dob" className="text-sm text-gray-600 mb-1">Date of Birth</label>
          <input
            value={formData.dob}
            onChange={handleChange}
            type="date"
            id="dob"
            className="bg-slate-100 rounded-lg p-3"
          />
        </div>
        
        {/* Bio */}
        <div className="flex flex-col">
          <label htmlFor="bio" className="text-sm text-gray-600 mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={handleChange}
            id="bio"
            placeholder="Tell us about yourself"
            rows="3"
            className="bg-slate-100 rounded-lg p-3 resize-none"
          />
        </div>
        
        {/* Success and Error messages */}
        {updateSuccess && (
          <div className="bg-green-100 text-green-700 p-2 rounded-lg text-center">
            Profile updated successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded-lg text-center">
            {error}
          </div>
        )}
        
        {/* Update button */}
        <button 
          type="submit"
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      
      {/* Account actions */}
      <div className="flex justify-between mt-5">
        <span 
          className="text-red-700 cursor-pointer hover:underline"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </span>
        <span 
          className="text-red-700 cursor-pointer hover:underline"
          onClick={handleSignOut}
        >
          Sign out
        </span>
      </div>
    </div>
  );
}