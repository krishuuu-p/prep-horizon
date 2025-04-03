import { useNavigate } from 'react-router-dom';
import '../styles/AdminPanel.css';
import { useUser } from '../../UserContext';

function AdminPanel({ activePage, setActivePage }) {
    const navigate = useNavigate();
    const { user } = useUser();
    const userName = user.userName;

    const handleLogout = () => {
        navigate('/');
    };

    const handleNavigation = (page) => {
        setActivePage(page);
        console.log("userName is",userName);
        if (page !== activePage) {
            navigate(`/admin/${userName}/${page.toLowerCase().replace(/\s+/g, '-')}`);
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
