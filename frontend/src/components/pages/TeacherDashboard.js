import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";

export default function TeacherDashboard() {
  const { user } = useUser();
  const [metrics, setMetrics] = useState({
    classes: 0,
    students: 0,
    upcomingTests: 0,
    recentTests: 0,
  });

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/metrics`
        );
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed loading dashboard metrics", err);
      }
    }
    fetchMetrics();
  }, [user]);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="cards">
        <div className="card">
          <h3>Total Classes</h3>
          <p>{metrics.classes}</p>
        </div>
        <div className="card">
          <h3>Total Students</h3>
          <p>{metrics.students}</p>
        </div>
        <div className="card">
          <h3>Upcoming Tests</h3>
          <p>{metrics.upcomingTests}</p>
        </div>
        <div className="card">
          <h3>Recent Tests</h3>
          <p>{metrics.recentTests}</p>
        </div>
      </div>
    </div>
  );
}
