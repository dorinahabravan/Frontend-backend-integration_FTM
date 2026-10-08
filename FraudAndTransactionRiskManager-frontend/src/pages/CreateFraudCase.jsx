import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackButton from "../components/BackButton";

function CreateFraudCase() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Account selected from the Dashboard.
    const accountId = searchParams.get("accountId");
    console.log("ACCOUNT ID SENT TO BACKEND:", accountId);

    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [caseNote, setCaseNote] = useState("");

    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [creatingCase, setCreatingCase] = useState(false);
    const [error, setError] = useState("");

    // Loads the account and fraud analysis used when creating the case.
    useEffect(() => {
        if (!accountId) {
            setError("No account selected.");
            setLoading(false);
            return;
        }

        const loadCaseData = async () => {
            try {
                setLoading(true);
                setError("");

                const [accountResponse, transactionsResponse] =
                    await Promise.all([
                        fetch(
                            `http://localhost:8080/api/FTRM/accounts/${accountId}`
                        ),
                        fetch(
                            `http://localhost:8080/api/FTRM/accounts/${accountId}/transactions/coloured`
                        ),
                    ]);

                if (!accountResponse.ok) {
                    throw new Error("Failed to fetch account");
                }

                if (!transactionsResponse.ok) {
                    throw new Error("Failed to fetch transactions");
                }

                const accountData = await accountResponse.json();
                const transactionData =
                    await transactionsResponse.json();

                setAccount(accountData);
                setTransactions(transactionData);
            } catch (error) {
                console.error(
                    "Error loading fraud case data:",
                    error
                );

                setError(
                    "Unable to load account transactions."
                );
            } finally {
                setLoading(false);
            }
        };

        loadCaseData();
    }, [accountId]);

    const handleTransactionSelect = (transactionId) => {
        setSelectedTransactions((currentSelected) => {
            if (currentSelected.includes(transactionId)) {
                return currentSelected.filter(
                    (id) => id !== transactionId
                );
            }

            return [...currentSelected, transactionId];
        });
    };

    // Long Plaid IDs are shortened only in the UI.
    const formatAccountId = (id) => {
        if (!id) return "—";

        if (id.length <= 12) {
            return id;
        }

        return `•••• ${id.slice(-6)}`;
    };

    const formatAmount = (amount, currency) => {
        if (amount === null || amount === undefined) {
            return "—";
        }

        const symbol =
            currency === "GBP"
                ? "£"
                : currency === "USD"
                    ? "$"
                    : currency === "EUR"
                        ? "€"
                        : "";

        return `${symbol}${Number(amount).toFixed(2)}`;
    };

    // Creates the case, links the selected transactions,
    // saves the investigation note and opens Case Details.
    const handleCreateCase = async () => {
        if (
            selectedTransactions.length === 0 ||
            creatingCase
        ) {
            return;
        }

        try {
            setCreatingCase(true);
            setError("");

            // Creates the initial fraud case for the account.
            const caseResponse = await fetch(
                `http://localhost:8080/api/FTRM/accounts/${accountId}/cases`,
                {
                    method: "POST",
                }
            );

            if (!caseResponse.ok) {
                throw new Error("Failed to create fraud case");
            }

            const newCase = await caseResponse.json();

            if (!newCase?.caseId) {
                throw new Error(
                    "Backend did not return a case ID"
                );
            }

            // Links each selected transaction to the new case.
            for (const transactionId of selectedTransactions) {
                const transactionResponse = await fetch(
                    `http://localhost:8080/api/FTRM/cases/${newCase.caseId}/add-transaction/${transactionId}`,
                    {
                        method: "PUT",
                    }
                );

                if (!transactionResponse.ok) {
                    throw new Error(
                        `Failed to add transaction ${transactionId}`
                    );
                }
            }

            // Stores the investigation note as the case description.
            if (caseNote.trim()) {
                const noteResponse = await fetch(
                    `http://localhost:8080/api/FTRM/cases/${newCase.caseId}/description`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "text/plain",
                        },
                        body: caseNote.trim(),
                    }
                );

                if (!noteResponse.ok) {
                    throw new Error(
                        "Failed to save investigation note"
                    );
                }
            }

            // Opens the case only after all creation steps succeed.
            navigate(
                `/fraud-cases/${newCase.caseId}`,
                { replace: true }
            );
        } catch (error) {
            console.error(
                "Error creating fraud case:",
                error
            );

            setError(
                "The fraud case could not be created completely."
            );

            setCreatingCase(false);
        }
    };

    if (loading) {
        return (
            <div className="create-fraud-case-page">
                <BackButton />

                <div className="page-header">
                    <h1>Create Fraud Case</h1>
                    <p>Loading account transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="create-fraud-case-page">
            <BackButton />

            <div className="page-header">
                <h1>Create Fraud Case</h1>

                <p>
                    Select transactions from an account to create a
                    fraud case
                </p>
            </div>

            {error && (
                <div className="form-error-message">
                    {error}
                </div>
            )}

            {/* Account currently being investigated */}
            <div className="dashboard-card create-case-account">
                <div className="create-account-header">
                    <div>
                        <h2>Account Information</h2>

                        <p>
                            Account selected for fraud investigation
                        </p>
                    </div>
                </div>

                <div className="create-account-details">
                    <div className="account-detail-item">
                        <span>ACCOUNT ID</span>

                        <strong
                            title={account?.id || accountId}
                        >
                            {formatAccountId(
                                account?.id || accountId
                            )}
                        </strong>
                    </div>

                    <div className="account-detail-item">
                        <span>ACCOUNT NAME</span>
                        <strong>
                            {account?.name || "—"}
                        </strong>
                    </div>

                    <div className="account-detail-item">
                        <span>MASK</span>

                        <strong>
                            {account?.mask
                                ? `•••• ${account.mask}`
                                : "—"}
                        </strong>
                    </div>

                    <div className="account-detail-item">
                        <span>TYPE</span>
                        <strong>
                            {account?.type || "—"}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Transactions available for inclusion in the case */}
            <div className="dashboard-card create-case-transactions">
                <div className="create-section-header">
                    <div>
                        <h2>Select Transactions</h2>

                        <p>
                            Select one or more transactions to include
                            in this case
                        </p>
                    </div>

                    <span className="selected-count">
                        {selectedTransactions.length} selected
                    </span>
                </div>

                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                        <tr>
                            <th></th>
                            <th>DATE</th>
                            <th>DESCRIPTION</th>
                            <th>AMOUNT</th>
                            <th>CATEGORY</th>
                            <th>PAYMENT CHANNEL</th>
                            <th>RISK</th>
                            <th>STATUS</th>
                        </tr>
                        </thead>

                        <tbody>
                        {transactions.length > 0 ? (
                            transactions.map(
                                (transaction) => (
                                    <tr
                                        key={transaction.id}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedTransactions.includes(
                                                    transaction.id
                                                )}
                                                onChange={() =>
                                                    handleTransactionSelect(
                                                        transaction.id
                                                    )
                                                }
                                            />
                                        </td>

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
                                            {transaction.channel ||
                                                "—"}
                                        </td>

                                        <td>
                                                <span
                                                    className={`risk-colour-badge ${
                                                        transaction.flagColour
                                                            ?.toLowerCase() ||
                                                        ""
                                                    }`}
                                                >
                                                    {transaction.flagColour ||
                                                        "—"}
                                                </span>
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
                                )
                            )
                        ) : (
                            <tr>
                                <td colSpan="8">
                                    No transactions available
                                    for this account.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Investigation note and case creation */}
                <div className="dashboard-card create-case-details">
                    <div className="create-case-note-section">
                        <h2>Case Notes</h2>

                        <p>
                            Add an investigation note for this case
                        </p>

                        <textarea
                            placeholder="Add investigation note..."
                            value={caseNote}
                            onChange={(event) =>
                                setCaseNote(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="create-case-actions">
                        <span>
                            {selectedTransactions.length}{" "}
                            transaction(s) selected
                        </span>

                        <button
                            type="button"
                            className="create-case-button"
                            onClick={handleCreateCase}
                            disabled={
                                selectedTransactions.length ===
                                0 ||
                                creatingCase
                            }
                        >
                            {creatingCase
                                ? "Creating Case..."
                                : "Create Case"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateFraudCase;