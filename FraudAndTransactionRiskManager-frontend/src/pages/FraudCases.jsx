
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FolderOpen, ShieldAlert, CheckCircle2 } from "lucide-react";
import BackButton from "../components/BackButton";

const API_URL = "http://localhost:8080/api/FTRM";

function FraudCases() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [fraudCases, setFraudCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingCaseId, setEditingCaseId] = useState(null);
    const [editingStatus, setEditingStatus] = useState("");

    const loadCases = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/cases/all`);

            if (!response.ok) {
                throw new Error("Failed to load fraud cases");
            }

            const data = await response.json();
            setFraudCases(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading fraud cases:", err);
            setError("Unable to load fraud cases.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCases();
    }, []);

    const handleViewCase = (caseId) => {
        navigate(`/fraud-cases/${caseId}`);
    };

    const handleEditCase = (fraudCase) => {
        setEditingCaseId(fraudCase.caseId);
        setEditingStatus(fraudCase.status);
        setError("");
    };

    const handleSaveCase = async (fraudCase) => {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/cases/${fraudCase.caseId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: editingStatus,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update case status");
            }

            const updatedCase = await response.json();

            if (updatedCase.status !== editingStatus) {
                throw new Error(
                    updatedCase.status || "Status update was rejected"
                );
            }

            setFraudCases((currentCases) =>
                currentCases.map((currentCase) =>
                    currentCase.caseId === fraudCase.caseId
                        ? updatedCase
                        : currentCase
                )
            );

            setEditingCaseId(null);
            setEditingStatus("");
        } catch (err) {
            console.error("Error updating fraud case:", err);
            setError("Unable to update fraud case. " + err.message);
        }
    };

    const handleDeleteCase = async (caseId) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete Case #${caseId}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `${API_URL}/cases/${caseId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete fraud case");
            }

            setFraudCases((currentCases) =>
                currentCases.filter(
                    (fraudCase) => fraudCase.caseId !== caseId
                )
            );

            if (editingCaseId === caseId) {
                setEditingCaseId(null);
                setEditingStatus("");
            }
        } catch (err) {
            console.error("Error deleting fraud case:", err);
            setError("Unable to delete fraud case.");
        }
    };

    const formatAccountId = (id) => {
        if (!id) {
            return "—";
        }

        const value = String(id);

        if (value.length <= 8) {
            return value;
        }

        return `•••• ${value.slice(-6)}`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        if (Array.isArray(date)) {
            const [year, month, day, hour = 0, minute = 0] = date;
            const pad = (value) => String(value).padStart(2, "0");

            return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`;
        }

        return String(date).replace("T", " ");
    };

    const formatStatus = (status) => {
        if (!status) {
            return "—";
        }

        return String(status).replaceAll("_", " ");
    };

    const filteredCases = fraudCases.filter((fraudCase) => {
        const search = searchTerm.toLowerCase();

        return (
            String(fraudCase.caseId || "")
                .toLowerCase()
                .includes(search) ||
            String(fraudCase.accountId || "")
                .toLowerCase()
                .includes(search) ||
            String(fraudCase.status || "")
                .toLowerCase()
                .includes(search) ||
            String(fraudCase.decision || "")
                .toLowerCase()
                .includes(search)
        );
    });

    const openCases = fraudCases.filter(
        (fraudCase) =>
            fraudCase.status === "OPEN" ||
            fraudCase.status === "UNDER_INVESTIGATION" ||
            fraudCase.status === "ESCALATED"
    ).length;

    const confirmedFraudCases = fraudCases.filter(
        (fraudCase) => fraudCase.status === "CLOSED_FRAUD"
    ).length;

    const closedCases = fraudCases.filter(
        (fraudCase) =>
            fraudCase.status === "CLOSED_FRAUD" ||
            fraudCase.status === "CLOSED_SAFE"
    ).length;

    if (loading) {
        return (
            <div className="fraud-cases-page">
                <BackButton />

                <div className="page-header">
                    <h1>Fraud Cases</h1>
                    <p>Loading fraud cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fraud-cases-page">
            <BackButton />

            <div className="page-header">
                <h1>Fraud Cases</h1>
                <p>Review and manage fraud investigations</p>
            </div>

            {error && (
                <p className="error-message">{error}</p>
            )}

            <div className="fraud-cases-kpi-grid">
                <div className="fraud-case-kpi">
                    <span className="fraud-case-kpi-icon">
                        <FolderOpen size={24} strokeWidth={1.8} />
                    </span>

                    <div>
                        <span className="fraud-case-kpi-label">
                            OPEN CASES
                        </span>

                        <strong>{openCases}</strong>
                        <p>Cases awaiting investigation</p>
                    </div>
                </div>

                <div className="fraud-case-kpi">
                    <span className="fraud-case-kpi-icon">
                        <ShieldAlert size={24} strokeWidth={1.8} />
                    </span>

                    <div>
                        <span className="fraud-case-kpi-label">
                            CONFIRMED FRAUD
                        </span>

                        <strong>{confirmedFraudCases}</strong>
                        <p>Cases confirmed as fraud</p>
                    </div>
                </div>

                <div className="fraud-case-kpi">
                    <span className="fraud-case-kpi-icon">
                        <CheckCircle2 size={24} strokeWidth={1.8} />
                    </span>

                    <div>
                        <span className="fraud-case-kpi-label">
                            CLOSED CASES
                        </span>

                        <strong>{closedCases}</strong>
                        <p>Cases resolved</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-card fraud-cases-card">
                <div className="fraud-cases-table-header">
                    <h2>Fraud Cases</h2>

                    <input
                        type="text"
                        placeholder="Search cases"
                        className="fraud-case-search"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />
                </div>

                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                        <tr>
                            <th>CASE ID</th>
                            <th>ACCOUNT</th>
                            <th>STATUS</th>
                            <th>SCORE</th>
                            <th>OPENED</th>
                            <th>CLOSED</th>
                            <th>DECISION</th>
                            <th>ACTION</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredCases.length > 0 ? (
                            filteredCases.map((fraudCase) => (
                                <tr key={fraudCase.caseId}>
                                    <td>
                                        #{fraudCase.caseId}
                                    </td>

                                    <td title={fraudCase.accountId || ""}>
                                        {formatAccountId(
                                            fraudCase.accountId
                                        )}
                                    </td>

                                    <td>
                                        {editingCaseId ===
                                        fraudCase.caseId ? (
                                            <select
                                                value={editingStatus}
                                                onChange={(event) =>
                                                    setEditingStatus(
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="OPEN">
                                                    Open
                                                </option>

                                                <option value="UNDER_INVESTIGATION">
                                                    Under Investigation
                                                </option>

                                                <option value="ESCALATED">
                                                    Escalated
                                                </option>

                                                <option value="CLOSED_FRAUD">
                                                    Closed Fraud
                                                </option>

                                                <option value="CLOSED_SAFE">
                                                    Closed Safe
                                                </option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`case-status-badge ${
                                                    fraudCase.status?.toLowerCase() || ""
                                                }`}
                                            >
                                                    {formatStatus(
                                                        fraudCase.status
                                                    )}
                                                </span>
                                        )}
                                    </td>

                                    <td>
                                        <strong>
                                            {fraudCase.score ?? 0}
                                        </strong>
                                    </td>

                                    <td>
                                        {formatDate(
                                            fraudCase.openedAt
                                        )}
                                    </td>

                                    <td>
                                        {["CLOSED_FRAUD", "CLOSED_SAFE"].includes(fraudCase.status)
                                            ? formatDate(fraudCase.closedAt)
                                            : "—"}
                                    </td>

                                    <td>
                                        {fraudCase.decision || "—"}
                                    </td>

                                    <td>
                                        <div className="case-actions">
                                            <button
                                                type="button"
                                                className="view-case-button"
                                                onClick={() =>
                                                    handleViewCase(
                                                        fraudCase.caseId
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                            {editingCaseId ===
                                            fraudCase.caseId ? (
                                                <button
                                                    type="button"
                                                    className="update-case-button"
                                                    onClick={() =>
                                                        handleSaveCase(
                                                            fraudCase
                                                        )
                                                    }
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="update-case-button"
                                                    onClick={() =>
                                                        handleEditCase(
                                                            fraudCase
                                                        )
                                                    }
                                                >
                                                    Update
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="delete-case-button"
                                                onClick={() =>
                                                    handleDeleteCase(
                                                        fraudCase.caseId
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">
                                    No fraud cases found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default FraudCases;
