import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import FrontPage from "../pages/FrontPage";
import ExercisePage from "../pages/ExercisePage.jsx";
import RegisterPage from "../pages/RegisterPage";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/frontPage" element={<FrontPage/>}/>
                <Route path="/exercise/:section/:topic" element={<ExercisePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
