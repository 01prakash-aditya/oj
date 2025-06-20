import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../src/components/Header";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Compiler from "./pages/Compiler";
import ProblemSet from "./pages/ProblemSet";
import Contribute from "./pages/Contribute";
import Community from "./pages/Community";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
    {/* header */}  
    <Header/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/sign-in" element={<SignIn/>} />
        <Route path="/sign-up" element={<SignUp/>} />
        <Route path="/compiler" element={<Compiler/>} />
        <Route path="/problemset" element={<ProblemSet/>} />
        <Route path="/contribute" element={<Contribute/>} />
        <Route path="/community" element={<Community/>} />
        <Route element = {<PrivateRoute/>}>
          <Route path="/profile" element={<Profile/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}