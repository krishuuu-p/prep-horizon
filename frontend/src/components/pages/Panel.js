import { useNavigate } from 'react-router-dom';
import '../styles/Panel.css';

function Panel({ activePage, setActivePage }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const handleNavigation = (page) => {
        setActivePage(page);
        navigate(`./${page.toLowerCase().replace(/\s+/g, '-')}`); // Navigates to the respective page
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
