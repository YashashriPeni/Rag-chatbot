import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = ["#6366F1", "#EF4444", "#10B981", "#F59E0B"];

function StudentDashboard() {

  // 🔥 NEW STATE
  const [dashboardData, setDashboardData] = useState({
    health_score: 0,
    stress_mentions: 0,
    headaches: 0,
    sleep_issues: 0,
    alerts: []
  });

  // 🔥 FETCH DASHBOARD DATA
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
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  // 🔥 DYNAMIC DATA FOR CHARTS
  const symptomData = [
    { name: "Stress", value: dashboardData.stress_mentions },
    { name: "Headache", value: dashboardData.headaches },
    { name: "Sleep Issues", value: dashboardData.sleep_issues }
  ];

  const weeklyData = [
    { day: "Mon", cases: dashboardData.stress_mentions },
    { day: "Tue", cases: dashboardData.headaches },
    { day: "Wed", cases: dashboardData.sleep_issues },
    { day: "Thu", cases: dashboardData.messages || 0 },
    { day: "Fri", cases: dashboardData.negative || 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">
        📊 Student Health Analytics
      </h1>

      {/* 🔥 SUMMARY CARDS (NOW DYNAMIC) */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <Card title="Health Score" value={`${dashboardData.health_score}%`} />
        <Card title="Stress Mentions" value={dashboardData.stress_mentions} />
        <Card title="Headache Reports" value={dashboardData.headaches} />
        <Card title="Sleep Issues" value={dashboardData.sleep_issues} />
      </div>

      {/* 🔥 ALERTS */}
      <div className="mb-6">
        {dashboardData.alerts.map((alert, index) => (
          <div key={index} className="bg-red-100 text-red-700 p-2 rounded mb-2">
            {alert}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">
            Symptom Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={symptomData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {symptomData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">
            Weekly Health Mentions
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cases" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= HOSPITAL SECTION (UNCHANGED) ================= */}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          🏥 Arundhati Hospital Integration
          <span className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full">
            Secure Sync Ready
          </span>
        </h2>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            🩺 Last Hospital Visit
          </h3>
          <div className="grid grid-cols-4 gap-6">
            <Info label="Last Visit" value="12 Feb 2026" />
            <Info label="Diagnosed Issue" value="Mild Dehydration" />
            <Info label="Prescribed" value="ORS + Rest" />
            <Info label="Follow-up Status" value="Pending" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            📋 Recent Hospital Records
          </h3>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="py-2">Date</th>
                <th>Issue</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="py-2">Feb 12</td>
                <td>Dehydration</td>
                <td>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                    Low
                  </span>
                </td>
                <td>Resolved</td>
              </tr>

              <tr className="border-b">
                <td className="py-2">Jan 28</td>
                <td>Migraine</td>
                <td>
                  <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                    Medium
                  </span>
                </td>
                <td>Ongoing</td>
              </tr>

              <tr>
                <td className="py-2">Jan 10</td>
                <td>Stress</td>
                <td>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                    Low
                  </span>
                </td>
                <td>Resolved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

export default StudentDashboard;