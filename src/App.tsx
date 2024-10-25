import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import CountryCard from "./components/CountryCard";
import SideBar from "./components/SideBar";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <SideBar />
        <main className="sm:ml-64 p-4">
          <Routes>
            <Route path="/" element={<CountryCard />} />
            <Route path="/vista1" element={<div>Vista 1</div>} />
            <Route path="/vista2" element={<div>Vista 2</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
