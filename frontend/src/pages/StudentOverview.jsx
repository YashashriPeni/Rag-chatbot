import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

const COLORS = ["#10B981", "#EF4444"];

function StudentOverview({ analysis }) {

  // ✅ FIXED: load from localStorage instead of null
  const [dashboardData, setDashboardData] = useState(() => {
    const saved = localStorage.getItem("dashboardData");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/dashboard");
      const data = await res.json();

      // ✅ SAVE + UPDATE
      setDashboardData(data);
      localStorage.setItem("dashboardData", JSON.stringify(data));

    } catch (err) {
      console.error("Overview error:", err);
    }
  };

  const healthScore =
    analysis?.score ??
    dashboardData?.health_score ??
    82;

  const healthy =
    analysis?.healthy ??
    dashboardData?.health_score ??
    70;

  const risk =
    analysis?.risk ??
    (dashboardData ? 100 - dashboardData.health_score : 30);

  const summaryData = [
    { name: "Healthy Mentions", value: healthy },
    { name: "Risk Mentions", value: risk }
  ];

  const status =
    analysis?.status ??
    (dashboardData ? "Live Updating 💚" : "Stable & Improving 💚");

  const insights =
    analysis?.insights ??
    (() => {
      const tips = [];

      const stress = dashboardData?.stress_mentions ?? 0;
      const headaches = dashboardData?.headaches ?? 0;
      const sleep = dashboardData?.sleep_issues ?? 0;
      const score = dashboardData?.health_score ?? 82;

      if (stress > 2) {
        tips.push("Try short breathing exercises or meditation daily.");
      } else {
        tips.push("Stress levels look manageable — keep maintaining balance.");
      }

      if (sleep > 1) {
        tips.push("Maintain a consistent sleep schedule and avoid screens before bed.");
      } else {
        tips.push("Sleep pattern looks stable — good job maintaining it.");
      }

      if (headaches > 0) {
        tips.push("Stay hydrated and reduce prolonged screen exposure.");
      }

      if (score < 50) {
        tips.push("Consider consulting a doctor if symptoms persist.");
      } else if (score < 75) {
        tips.push("Focus on hydration, nutrition, and regular breaks.");
      } else {
        tips.push("Overall health looks good — keep up the routine.");
      }

      return tips;
    })();

  const hospital =
    analysis?.hospital ?? {
      lastVisit: "12 Feb 2026",
      doctor: "Dr. Rao",
      followUp: "Pending Review"
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-200 p-10">

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          🌟 Student Wellness Overview
        </h1>
        <p className="text-gray-600 mt-2">
          A complete summary of your health patterns and hospital integration.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Overall Health Score
          </h2>
          <p className="text-gray-600 mb-4">
            Based on chat patterns and hospital visits.
          </p>
          <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm">
            {status}
          </span>
        </div>

        <div className="w-48 h-48 relative">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={summaryData}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
              >
                {summaryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute text-center text-3xl font-bold top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            {healthScore}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          💡 AI Health Insights
        </h2>

        <ul className="space-y-3 text-gray-700">
          {insights.map((item, index) => (
            <li key={index}>✔️ {item}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">
          🏥 Arundhati Hospital Snapshot
        </h2>

        <div className="grid grid-cols-3 gap-6">
          <Info label="Last Visit" value={hospital.lastVisit} />
          <Info label="Doctor" value={hospital.doctor} />
          <Info label="Follow-Up" value={hospital.followUp} />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
}

export default StudentOverview;