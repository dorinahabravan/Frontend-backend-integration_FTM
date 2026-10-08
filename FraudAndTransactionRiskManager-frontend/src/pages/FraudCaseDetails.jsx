import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

function FraudCaseDetails() {
    const { caseId } = useParams();

    const [fraudCase, setFraudCase] = useState(null);
    const [account, setAccount] = useState(null);

    // Stores the fraud analysis returned by the backend for the account.
    // These transactions contain flagColour and riskReasons.
    const [colouredTransactions, setColouredTransactions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isEditingNote, setIsEditingNote] = useState(false);
    const [caseNote, setCaseNote] = useState("");

    const [decision, setDecision] = useState("");
    const [decisionNote, setDecisionNote] = useState("");
    const [submittedDecision, setSubmittedDecision] = useState(null);

    // Loads the fraud case using the case ID from the URL.
    useEffect(() => {
        const loadCase = async () => {
            try {
                setLoading(true);
                setError("");

                const caseResponse = await fetch(
                    `http://localhost:8080/api/FTRM/cases/${caseId}`
                );

                if (!caseResponse.ok) {
                    throw new Error("Failed to load fraud case");
                }

                const caseData = await caseResponse.json();

                if (!caseData) {
                    throw new Error("Fraud case not found");
                }

                setFraudCase(caseData);
                setCaseNote(caseData.description || "");

                // Restores the saved decision when the page is refreshed.
                if (caseData.decision) {
                    setSubmittedDecision({
                        decision: caseData.decision,
                        note: caseData.decisionNote || "",
                    });
                }

                if (caseData.accountId) {
                    const accountResponse = await fetch(
                        `http://localhost:8080/api/FTRM/accounts/${caseData.accountId}`
                    );

                    if (accountResponse.ok) {
                        const accountData = await accountResponse.json();
                        setAccount(accountData);
                    }

                    const colouredResponse = await fetch(
                        `http://localhost:8080/api/FTRM/accounts/${caseData.accountId}/transactions/coloured`
                    );

                    if (colouredResponse.ok) {
                        const colouredData =
                            await colouredResponse.json();

                        setColouredTransactions(colouredData);
                    }
                }
            } catch (err) {
                console.error("Error loading fraud case:", err);
                setError("Unable to load fraud case.");
            } finally {
                setLoading(false);
            }
        };

        loadCase();
    }, [caseId]);

    // Shortens long Plaid account IDs only for display.
    // The complete ID is still used for API requests.
    const formatAccountId = (id) => {
        if (!id) return "—";
        if (id.length <= 12) return id;

        return `•••• ${id.slice(-6)}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return String(date).replace("T", " ");
    };

    const formatAmount = (amount, currency) => {
        if (amount === null || amount === undefined) return "—";

        const symbol =
            currency === "GBP"
                ? "£"
                : currency === "USD"
                    ? "$"
                    : currency === "EUR"
                        ? "€"
                        : "";

        return `${symbol}${amount}`;
    };

    const formatDecision = (value) => {
        switch (value) {
            case "CLOSED_FRAUD":
                return "Fraud Confirmed";
            case "CLOSED_SAFE":
                return "Not Fraud";
            case "UNDER_INVESTIGATION":
                return "Further Review";
            default:
                return value || "—";
        }
    };

    // Saves the investigation note as the case description.
    const handleSaveNote = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/FTRM/cases/${caseId}/description`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: caseNote,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to save case note");
            }

            const updatedCase = await response.json();

            setFraudCase((currentCase) => ({
                ...currentCase,
                description: updatedCase.description,
            }));

            setCaseNote(updatedCase.description || "");
            setIsEditingNote(false);
        } catch (err) {
            console.error("Error saving case note:", err);
        }
    };

    // Saves the investigator's decision and updates the case status.
    const handleSubmitDecision = async () => {
        if (!decision) return;

        try {
            let backendStatus;

            if (decision === "Fraud Confirmed") {
                backendStatus = "CLOSED_FRAUD";
            } else if (decision === "Not Fraud") {
                backendStatus = "CLOSED_SAFE";
            } else if (decision === "Further Review") {
                backendStatus = "UNDER_INVESTIGATION";
            }

            // First persist the investigator's decision.
            const decisionResponse = await fetch(
                `http://localhost:8080/api/FTRM/cases/${caseId}/decision`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        decision: decision,
                        decisionNote: decisionNote.trim(),
                    }),
                }
            );

            if (!decisionResponse.ok) {
                throw new Error("Failed to save decision.");
            }

            const savedDecisionCase = await decisionResponse.json();

            // Then update the case using the backend's CaseStatus values.
            const statusResponse = await fetch(
                `http://localhost:8080/api/FTRM/cases/${caseId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: backendStatus,
                }
            );

            if (!statusResponse.ok) {
                throw new Error("Failed to update case status.");
            }

            const updatedCase = await statusResponse.json();

            setFraudCase(updatedCase);

            setSubmittedDecision({
                decision: savedDecisionCase.decision,
                note: savedDecisionCase.decisionNote,
            });

            setDecision("");
            setDecisionNote("");
        } catch (error) {
            console.error("Error submitting decision:", error);
        }
    };

    if (loading) {
        return (
            <div className="fraud-case-details-page">
                <BackButton />

                <div className="page-header">
                    <h1>Fraud Case #{caseId}</h1>
                    <p>Loading case...</p>
                </div>
            </div>
        );
    }

    if (error || !fraudCase) {
        return (
            <div className="fraud-case-details-page">
                <BackButton />

                <div className="page-header">
                    <h1>Fraud Case #{caseId}</h1>
                    <p>{error || "Case data is not available."}</p>
                </div>
            </div>
        );
    }

    // Transactions selected when the fraud case was created.
    const transactions = fraudCase.transactions || [];

    // Matches case transactions with the fraud analysis returned by backend.
    const riskFlags = transactions.flatMap((caseTransaction) => {
        const analysedTransaction = colouredTransactions.find(
            (transaction) =>
                String(transaction.id) === String(caseTransaction.id)
        );

        if (!analysedTransaction) {
            return [];
        }

        const reasons = analysedTransaction.riskReasons || [];

        return reasons.map((reason) => ({
            transactionId: analysedTransaction.id,
            description:
                analysedTransaction.description ||
                caseTransaction.description,
            colour: analysedTransaction.flagColour || "GREEN",
            reason,
        }));
    });

    const isClosed =
        fraudCase.status === "CLOSED_FRAUD" ||
        fraudCase.status === "CLOSED_SAFE";

    return (
        <div className="fraud-case-details-page">
            <BackButton />

            <div className="case-details-top">
                <div>
                    <div className="case-breadcrumb">
                        <strong>Fraud Cases</strong>
                        <span>&gt; Case #{caseId}</span>
                    </div>

                    <h1>Fraud Case #{caseId}</h1>

                    <p>
                        Review account activity and manage investigation
                    </p>
                </div>

                <span className="high-priority-badge">
                    {(fraudCase.status || "OPEN").replaceAll("_", " ")}
                </span>
            </div>

            <div className="case-summary-grid">

                {/* Current information for the selected fraud case */}
                <div className="dashboard-card case-summary-card">
                    <h2>Case Information</h2>

                    <div className="case-detail-row">
                        <span>Status</span>

                        <strong className="case-status-open">
                            {(fraudCase.status || "OPEN").replaceAll(
                                "_",
                                " "
                            )}
                        </strong>
                    </div>

                    <div className="case-detail-row">
                        <span>Score</span>
                        <strong>{fraudCase.score ?? 0}</strong>
                    </div>

                    <div className="case-detail-row">
                        <span>Opened</span>

                        <strong>
                            {formatDate(fraudCase.openedAt)}
                        </strong>
                    </div>

                    <div className="case-detail-row">
                        <span>Closed</span>

                        <strong>
                            {isClosed && fraudCase.closedAt
                                ? formatDate(fraudCase.closedAt)
                                : "----"}
                        </strong>
                    </div>
                </div>

                {/* Account associated with this fraud case */}
                <div className="dashboard-card case-summary-card">
                    <h2>Account Information</h2>

                    <div className="case-detail-row">
                        <span>Account</span>

                        <strong>
                            {account?.mask
                                ? `•••• ${account.mask}`
                                : formatAccountId(
                                    fraudCase.accountId
                                )}
                        </strong>
                    </div>

                    <div className="case-detail-row">
                        <span>Name</span>
                        <strong>{account?.name || "—"}</strong>
                    </div>

                    <div className="case-detail-row">
                        <span>Type</span>
                        <strong>{account?.type || "—"}</strong>
                    </div>

                    <div className="case-detail-row">
                        <span>Subtype</span>
                        <strong>{account?.subType || "—"}</strong>
                    </div>

                    <div className="case-detail-row">
                        <span>Account ID</span>

                        <strong title={fraudCase.accountId}>
                            {formatAccountId(
                                fraudCase.accountId
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Transactions linked to this case by the backend */}
            <div className="dashboard-card case-transactions-details">
                <div className="case-card-header">
                    <div>
                        <h2>Case Transactions</h2>

                        <p>
                            Transactions included in this investigation
                        </p>
                    </div>

                    <span>
                        {transactions.length} transaction(s)
                    </span>
                </div>

                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                        <tr>
                            <th>DATE</th>
                            <th>DESCRIPTION</th>
                            <th>AMOUNT</th>
                            <th>CATEGORY</th>
                            <th>PAYMENT CHANNEL</th>
                            <th>STATUS</th>
                        </tr>
                        </thead>

                        <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>
                                        {transaction.dateTransaction ||
                                            "—"}
                                    </td>

                                    <td>
                                        {transaction.description ||
                                            "—"}
                                    </td>

                                    <td>
                                        {formatAmount(
                                            transaction.amount,
                                            transaction.currencyCode
                                        )}
                                    </td>

                                    <td>
                                        {transaction.primaryCategory ||
                                            "—"}
                                    </td>

                                    <td>
                                        {transaction.channel || "—"}
                                    </td>

                                    <td>
                                            <span
                                                className={`status-badge ${
                                                    transaction.pending
                                                        ? "pending"
                                                        : "completed"
                                                }`}
                                            >
                                                {transaction.pending
                                                    ? "Pending"
                                                    : "Completed"}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">
                                    No transactions linked to this case.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Real fraud rules returned by the backend */}
            <div className="dashboard-card risk-flags-card">
                <div className="case-card-header">
                    <div>
                        <h2>Risk Flags</h2>

                        <p>
                            Rules triggered by transactions included in
                            this case
                        </p>
                    </div>

                    <span>{riskFlags.length} flag(s)</span>
                </div>

                {riskFlags.length > 0 ? (
                    <div className="risk-flags-list">
                        {riskFlags.map((flag, index) => {
                            const [ruleCode, ...explanationParts] =
                                flag.reason.split(": ");

                            const explanation =
                                explanationParts.join(": ");

                            return (
                                <div
                                    className="risk-flag-item"
                                    key={`${flag.transactionId}-${index}`}
                                >
                                    <div className="risk-flag-header">
                                        <strong>
                                            {ruleCode.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </strong>

                                        <span
                                            className={`risk-colour-badge ${
                                                flag.colour
                                                    ?.toLowerCase() || ""
                                            }`}
                                        >
                                            {flag.colour || "—"}
                                        </span>
                                    </div>

                                    <p>
                                        {explanation ||
                                            flag.reason}
                                    </p>

                                    <small>
                                        Transaction:{" "}
                                        {flag.description ||
                                            flag.transactionId}
                                    </small>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="no-risk-flags">
                        No risk flags recorded for these transactions.
                    </p>
                )}
            </div>

            <div className="case-bottom-grid">

                {/* Case description is used as the investigation note */}
                <div className="dashboard-card case-notes-details">
                    <div className="case-card-header">
                        <h2>Case Notes</h2>

                        {!isEditingNote && (
                            <button
                                type="button"
                                className="edit-note-button"
                                onClick={() =>
                                    setIsEditingNote(true)
                                }
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {isEditingNote ? (
                        <div className="edit-case-note">
                            <textarea
                                value={caseNote}
                                onChange={(event) =>
                                    setCaseNote(
                                        event.target.value
                                    )
                                }
                            />

                            <div className="edit-note-actions">
                                <button
                                    type="button"
                                    className="cancel-note-button"
                                    onClick={() => {
                                        setCaseNote(
                                            fraudCase.description || ""
                                        );
                                        setIsEditingNote(false);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="save-note-button"
                                    onClick={handleSaveNote}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="case-notes-list">
                            <div className="case-note-item">
                                <div className="case-note-meta">
                                    <span>
                                        INVESTIGATION NOTE
                                    </span>

                                    <strong>
                                        {formatDate(
                                            fraudCase.openedAt
                                        )}
                                    </strong>
                                </div>

                                <p>
                                    {caseNote ||
                                        "No investigation note."}
                                </p>
                            </div>

                            {submittedDecision && (
                                <div className="case-note-item decision-note-item">
                                    <div className="case-note-meta">
                                        <span>DECISION</span>

                                        <strong>
                                            {formatDecision(
                                                submittedDecision.decision
                                            )}
                                        </strong>
                                    </div>

                                    <p>
                                        {submittedDecision.note ||
                                            "No additional decision notes."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="dashboard-card record-decision-details">
                    <h2>Record Decision</h2>

                    <select
                        value={decision}
                        onChange={(event) =>
                            setDecision(event.target.value)
                        }
                    >
                        <option value="" disabled>
                            Select a decision
                        </option>

                        <option value="Fraud Confirmed">
                            Fraud Confirmed
                        </option>

                        <option value="Not Fraud">
                            Not Fraud
                        </option>

                        <option value="Further Review">
                            Further Review
                        </option>
                    </select>

                    <label htmlFor="decision-note">
                        Notes
                    </label>

                    <textarea
                        id="decision-note"
                        placeholder="Add details about the decision..."
                        value={decisionNote}
                        onChange={(event) =>
                            setDecisionNote(event.target.value)
                        }
                    />

                    <button
                        type="button"
                        className="submit-decision-button"
                        onClick={handleSubmitDecision}
                    >
                        Submit Decision
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FraudCaseDetails;