import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginStart, loginSuccess, loginFailure } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth.jsx";
const API_URL = import.meta.env.VITE_URL || 'http://localhost:3000';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const {loading, error} = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{

    dispatch(loginStart());

    const res = await fetch(`${API_URL}/api/auth/signin`,{
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const data = await res.json();
    if(data.success === false){
      dispatch(loginFailure(data.message
      ));
      return;
    }
    dispatch(loginSuccess(data));
    navigate("/");

  } catch (err) {
    dispatch(loginFailure(error));
  }
};
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-5">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 ">
        <label htmlFor="email" className="text-sm text-gray-500">
          Email :
        </label>
        <input
          type="email"
          placeholder="eg. abc@yahoo.com"
          id="email"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
        />
        <label htmlFor="password" className="text-sm text-gray-500">
          Password :
        </label>
        <input
          type="password"
          placeholder="Enter your password here"
          id="password"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
        />
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-75 disabled:opacity-55 ">
          {loading ? 'Loading...' : 'Sign In' }
        </button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Don't have an account?</p>
        <Link to="/sign-up">
          <span className="text-blue-500">Sign up</span>
        </Link>
      </div>
      <p className='text-red-500 mt-5'>{ error ? error || "Something went wrong!" : ""}</p>
    </div>
  );
}
