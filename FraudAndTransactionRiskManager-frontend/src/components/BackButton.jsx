import { useNavigate } from "react-router-dom";

function BackButton() {
    const navigate = useNavigate();

    return (
        <button
            className="back-arrow-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            title="Go back"
        >
            ←
        </button>
    );
}

export default BackButton;