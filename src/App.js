import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";


const CONFIG = {
  MODE: "MOCK", // change to "LIVE" later
  ESP32_URL: "http://192.168.4.1/data"
};

const getMockVitals = () => ({
  temperature: (36 + Math.random() * 3).toFixed(1),
  heartRate: Math.floor(60 + Math.random() * 60),
  spo2: Math.floor(90 + Math.random() * 10),
  timestamp: new Date().toLocaleTimeString()
});

const fetchVitals = async () => {
  try {
    if (CONFIG.MODE === "LIVE") {
      const res = await fetch(CONFIG.ESP32_URL);
      if (!res.ok) throw new Error("ESP32 not reachable");
      return await res.json();
    }
    return getMockVitals();
  } catch {
    return getMockVitals();
  }
};

const Dashboard = ()=> {
  const [vitals, setVitals] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchVitals();
      setVitals(data);
      setHistory(prev => [...prev.slice(-9), data]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatus = () => {
    if (!vitals) return "Normal";

    if (vitals.heartRate > 100 || vitals.spo2 < 94 || vitals.temperature > 38) {
      return "High Risk";
    }
    if (vitals.heartRate > 90 || vitals.temperature > 37.5) {
      return "Warning";
    }
    return "Normal";
  };

  const status = getStatus();

  const getStatusStyle = () => {
    if (status === "High Risk") {
      return "orangeStatus";
    }
    if (status === "Warning") {
      return "redStatus";
    }
    return "";
  };

  const statusStyle = getStatusStyle();

  const getBoxStyle = () => {
    if (status === "High Risk") {
      return "box high-risk"
    }
    if (status === "Warning") {
      return "box warning"
    }
    return "box"
  };

  return (
    <div className="container">
      <h1>Monitoring Dashboard</h1>
      {/* <p><strong>Mode:</strong> {CONFIG.MODE}</p> */}

      <div className="boxContainer">
        <div className={getBoxStyle()}>
          <h3>Temperature 🌡️</h3>
          <p>{vitals?.temperature || "--"} °C</p>
        </div>

        <div className={getBoxStyle()}>
          <h3>Heart Rate ❤️</h3>
          <p>{vitals?.heartRate || "--"} bpm</p>
        </div>

        <div className={getBoxStyle()} >
          <h3>Blood Oxygen 🫁</h3>
          <p>{vitals?.spo2 || "--"} %</p>
        </div>
      </div>

      <div className="statusBar" >
        <h2>Status: <span className={statusStyle}>{status}</span></h2>
      </div>

      <div className="chart">
        <h2>Patient Vitals Trend</h2>
        <ResponsiveContainer width="100%" height={300} >
          <LineChart data={history}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" height={40} />
            <Line type="monotone" dataKey="spo2" stroke="#2796f1"/>
            <Line type="monotone" dataKey="heartRate" stroke="#ff4d4d"/>
            <Line type="monotone" dataKey="temperature" stroke="#eb8125"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;