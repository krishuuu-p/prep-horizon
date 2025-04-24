import { useState } from "react";
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
  console.log("🟢 NEW ProfilePage component rendering with chart, rating, and avatar upload");
  const { user } = useUser();
  const [activePage, setActivePage] = useState("Profile");
  const [hideRating, setHideRating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "/default-avatar.png");
  const userName = user.userName;

  // Generate random marks for now; replace with real data later
  const data = Array.from({ length: 8 }, (_, i) => ({
    exam: `Exam ${i + 1}`,
    score: Math.floor(Math.random() * 101),
  }));

  // Compute weighted average of last 5 marks (more weight to recent tests)
  const lastFive = data.slice(-5);
  const weights = [1, 2, 3, 4, 5];
  const weightedSum = lastFive.reduce(
    (sum, item, idx) => sum + item.score * weights[idx],
    0
  );
  const weightTotal = weights.reduce((a, b) => a + b, 0);
  const avgScore = weightedSum / weightTotal;
  const ratingValue = Math.round(800 + (avgScore / 100) * (3000 - 800));
  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-page">
      {/* Top navigation panel */}
      <Panel activePage={activePage} setActivePage={setActivePage} />

      {}
      <div className="profile-content">
        <div className="profile-header">
          <div className="avatar-upload-container">
            <img
              src={avatarPreview}
              alt="avatar"
              className="avatar"
            />
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
          <h3>Marks Over Exams</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exam" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
