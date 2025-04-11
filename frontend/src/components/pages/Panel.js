import { useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import '../styles/Panel.css';

function Panel({ activePage, setActivePage }) {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const userType = user.userType;
    const userName = user.userName;

    const handleLogout = () => {
        setUser({ userType: null, userName: '', name: '' });
        localStorage.removeItem("user");
        navigate('/');
    };

    const handleNavigation = (page) => {
        setActivePage(page);
        if (page !== activePage) {
            navigate(`/${userType}/${userName}/${page.toLowerCase().replace(/\s+/g, '-')}`);
        }
    };

    return (
        <div className="panel">
            <div className="left-options">
                {["Home", "Tests", "Interview Practice", "PDF to Quiz", "Profile"].map((page) => (
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

export default Panel;
