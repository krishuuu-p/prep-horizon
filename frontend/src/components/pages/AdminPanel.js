import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../UserContext';
import '../styles/AdminPanel.css';

function AdminPanel({ activePage, setActivePage }) {
    const navigate = useNavigate();
    // const { userType, userId } = useParams();
    const { user } = useUser();
    const userType = user.userType;
    const userName = user.userName;

    const handleLogout = () => {
        navigate('/');
    };

    const handleNavigation = (page) => {
        setActivePage(page);
        console.log("userName is",userName);
        if (page !== activePage) {
            navigate(`/${userType}/${userName}/${page.toLowerCase().replace(/\s+/g, '-')}`);
        }
    };

    return (
        <div className="panel">
            <div className="left-options">
                {["Home", "Classes", "Student Management", "Teacher Management", "Tests Management"].map((page) => (
                    <span
                        key={page}
                        className={activePage === page ? "active" : ""}
                        onClick={() => handleNavigation(page)}
                    >
                        {page}
                    </span>
                ))}
            </div>
            <div className="right-options">
                <span className="coaching-name">Nalle Institute</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default AdminPanel;
