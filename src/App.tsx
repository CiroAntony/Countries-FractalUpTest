import React from "react";
import "./App.css";
import CountryCard from "./components/CountryCard";
import SideBar from "./components/SideBar";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar />
      <main className="sm:ml-64 p-4">
        <CountryCard />
      </main>
    </div>
  );
};

export default App;
