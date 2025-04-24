// src/components/pages/ProfilePage.js
import { useEffect, useState } from "react";
import { useUser } from "../../UserContext";
import Panel from "./StudentPanel";
import "../styles/ProfilePage.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ProfilePage() {
  const { user } = useUser();
  const [activePage, setActivePage] = useState("Profile");
  const [hideRating, setHideRating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "/default-avatar.png");
  const [testData, setTestData] = useState([{ testName: "", score: 0 }]);
  const userName = user.userName;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tests/${userName}/recent-scores`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Test data fetched:", data);
        setTestData(data);
      })
      .catch((err) => console.error("Error fetching test data:", err));
  }, [userName]);

  // compute weighted rating...
  const sz = testData.length;
  const weights = Array.from({ length: sz }, (_, i) => i + 1);
  const weightedSum = testData.reduce(
    (sum, { score }, idx) => sum + score * weights[idx],
    0
  );
  const weightTotal = weights.reduce((a, b) => a + b, 0);
  const avgScore = weightTotal ? weightedSum / weightTotal : 0;
  const ratingValue = Math.round(800 + (avgScore / 100) * (3000 - 800));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-page">
      <Panel activePage={activePage} setActivePage={setActivePage} />

      <div className="profile-header">
        <div className="avatar-upload-container">
          <img src={avatarPreview} alt="avatar" className="avatar" />
          <input
            type="file"
            accept="image/*"
            className="avatar-input"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="user-info">
          <h2>{userName}</h2>
          <p>Enrollment: {user.enrollment || "20210001"}</p>
          <p>Department: {user.department || "Computer Science"}</p>
          {!hideRating && <p>Rating: {ratingValue}</p>}
          <label className="rating-toggle">
            <input
              type="checkbox"
              checked={hideRating}
              onChange={() => setHideRating(!hideRating)}
            />
            Hide Rating
          </label>
        </div>
      </div>

      <div className="chart-container">
        <h3>Marks Over Tests</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={testData}                   
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="testName" />      
            <YAxis domain={[0, 30]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProfilePage;
