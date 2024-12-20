import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Adminview from "./components/AdminView";
import Testscheduled from "./components/Testscheduled";
import Questionpage from "./Questionpage";
import Assigntest from "./components/Assigntest";
import Checkoutques from "./components/Checkoutques";
import Testnotscheduled from "./components/Testnotscheduled";
import Uploadquestions from "./components/Uploadquestions";
import Login from "./components1/Login";
import Leaderboard from "../src/Leaderboard";
// import Choice from './components1/Choice';
// import Select from './components1/Select';
// import Fillups from './components1/Fillups';
import { dashContext } from "./userContext";
import { useState } from "react";
import Instructions from "./Instruction";
import Userprofile from "./Userprofile";
import AdminPanel from "./AdminPanel";
import Liveleaderboard from "./Liveleaderboard";
import SetExam from "./setExam";
import Gugugaga from "./components1/Gugugaga";
import ImgUploader from "./components1/ImgUploader";
import GateQuesFormat from "./components1/GateQuesFormat";

import "./bootstrap.css";
import GateQuestions from "./components1/GateQuestions";

function App() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [userstate, setUserstate] = useState({
    email: storedUser ? storedUser.email : "",
    loggedin: storedUser ? true : false,
    admin: storedUser ? storedUser.admin : false,
  });
  console.log(userstate);
  return (
    <BrowserRouter>
      <dashContext.Provider value={{ userstate, setUserstate }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="admin" element={<Adminview />} />
          <Route path="schedule" element={<Testscheduled />} />
          <Route path="notschedule" element={<Testnotscheduled />} />
          <Route path="assign" element={<Assigntest />} />
          <Route path="checkout" element={<Checkoutques />} />
          <Route path="uploadquestion" element={<Uploadquestions />} />
          <Route path="login" element={<Login />} />
          <Route path="instruction/:id" element={<Instructions />} />
          <Route path="questions/:id" element={<Questionpage />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="userprofile" element={<Userprofile />} />
          <Route path="admin1" element={<AdminPanel />} />
          <Route path="llive" element={<Liveleaderboard />} />
          <Route path="ce" element={<SetExam />} />
          <Route path="aie" element={<Gugugaga />} />
          <Route path="imgupload" element={<ImgUploader />} />
          <Route path="ccc" element={<GateQuesFormat />} />
          <Route path="gateq" element={<GateQuestions />} />

          {/* <Route path='choice' element={<Choice/>}/>
      <Route path='select' element={<Select/>}/>
      <Route path='fill' element={<Fillups/>}/> */}

          <Route path="questions" element={<Questionpage />} />
        </Routes>
      </dashContext.Provider>
    </BrowserRouter>
  );
}

export default App;
