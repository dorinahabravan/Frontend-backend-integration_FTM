
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KpiCard from "../components/KpiCard.jsx";

const API_URL = "http://localhost:8080/api/FTRM";

const getTransactionDate = (transaction) => {
    const value =
        transaction.dateTransaction ??
        transaction.transactionDate;

    if (!value) return "";

    const date = String(value).slice(0, 10);

    if (
        date === "1970-01-01" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return "";
    }

    const parsed = new Date(`${date}T12:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    const normalised = [
        parsed.getFullYear(),
        String(parsed.getMonth() + 1).padStart(2, "0"),
        String(parsed.getDate()).padStart(2, "0")
    ].join("-");

    return normalised === date ? date : "";
};

const dateFromString = (dateString) =>
    new Date(`${dateString}T12:00:00`);

const formatDate = (value) => {
    const date = getTransactionDate({
        dateTransaction: value
    });

    if (!date) return "—";

    return dateFromString(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatAmount = (transaction) => {
    const amount = Number(transaction.amount || 0);
    const currency = transaction.currencyCode || "USD";

    try {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency
        }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
};

const getAmountGroup = (value) => {
    if (value === null || value === undefined || value === "") {
        return "Unknown";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount) || amount < 0) {
        return "Unknown";
    }

    if (amount < 100) return "Under 100";
    if (amount < 500) return "100–499";
    if (amount < 1000) return "500–999";
    if (amount < 5000) return "1,000–4,999";

    return "5,000+";
};

const getActivityData = (transactions, view) => {
    const groups = new Map();

    transactions.forEach((transaction) => {
        let label;

        if (view === "channel") {
            label = transaction.channel || "Unknown";
        } else if (view === "amount") {
            label = getAmountGroup(transaction.amount);
        } else {
            label = transaction.primaryCategory || "Uncategorised";
        }

        label =
            String(label).replaceAll("_", " ").trim() ||
            "Unknown";

        groups.set(label, (groups.get(label) || 0) + 1);
    });

    return [...groups.entries()]
        .map(([label, count]) => ({
            label,
            count
        }))
        .sort(
            (a, b) =>
                b.count - a.count ||
                a.label.localeCompare(b.label)
        );
};

function Dashboard() {
    const navigate = useNavigate();

    const [accountId, setAccountId] = useState("");
    const [transactionPeriod, setTransactionPeriod] =
        useState("week");
    const [activityView, setActivityView] =
        useState("category");

    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [fraudCases, setFraudCases] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const endpoints = [
                    `${API_URL}/transactions/all`,
                    `${API_URL}/accounts/all`,
                    `${API_URL}/cases/all`
                ];

                const responses = await Promise.all(
                    endpoints.map((url) => fetch(url))
                );

                if (responses.some((response) => !response.ok)) {
                    throw new Error(
                        "Failed to retrieve dashboard data"
                    );
                }

                const [
                    transactionData,
                    accountData,
                    caseData
                ] = await Promise.all(
                    responses.map((response) => response.json())
                );

                if (cancelled) return;

                setTransactions(
                    Array.isArray(transactionData)
                        ? transactionData
                        : []
                );

                setAccounts(
                    Array.isArray(accountData)
                        ? accountData
                        : []
                );

                setFraudCases(
                    Array.isArray(caseData)
                        ? caseData
                        : []
                );
            } catch (err) {
                if (cancelled) return;

                console.error("Dashboard loading error:", err);
                setError("Unable to load dashboard data.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        // Prevent stale API responses from updating an unmounted component.
        return () => {
            cancelled = true;
        };
    }, []);

    const openCases = fraudCases.filter((fraudCase) =>
        ["OPEN", "UNDER_INVESTIGATION", "ESCALATED"].includes(
            fraudCase.status
        )
    ).length;

    const escalatedCases = fraudCases.filter(
        (fraudCase) => fraudCase.status === "ESCALATED"
    ).length;

    const sortedTransactions = [...transactions].sort(
        (a, b) =>
            getTransactionDate(b).localeCompare(
                getTransactionDate(a)
            )
    );

    const latestTransactionDate = sortedTransactions
        .map(getTransactionDate)
        .find(Boolean);

    // Anchor relative filters to the dataset rather than the current date.
    const referenceDate = latestTransactionDate
        ? dateFromString(latestTransactionDate)
        : new Date();

    const activityData = getActivityData(
        transactions,
        activityView
    );

    const activityMax = Math.max(
        1,
        ...activityData.map((item) => item.count)
    );

    // Preserve currency boundaries instead of aggregating unconverted amounts.
    const volumeByCurrency = transactions.reduce(
        (totals, transaction) => {
            if (
                transaction.amount === null ||
                transaction.amount === undefined ||
                transaction.amount === ""
            ) {
                return totals;
            }

            const amount = Number(transaction.amount);

            if (!Number.isFinite(amount)) {
                return totals;
            }

            const currency = String(
                transaction.currencyCode || "Unknown"
            ).toUpperCase();

            totals[currency] =
                (totals[currency] || 0) + amount;

            return totals;
        },
        {}
    );

    const currencyEntries = Object.entries(volumeByCurrency);

    const volumeDisplay =
        currencyEntries.length === 1
            ? `${currencyEntries[0][1].toLocaleString("en-GB", {
                maximumFractionDigits: 2
            })} ${currencyEntries[0][0]}`
            : currencyEntries.length > 1
                ? "Multiple currencies"
                : "—";

    const caseStatusDistribution = [
        {
            label: "Open / Investigating",
            count: openCases,
            className: "low-score"
        },
        {
            label: "Confirmed Fraud",
            count: fraudCases.filter(
                (fraudCase) =>
                    fraudCase.status === "CLOSED_FRAUD"
            ).length,
            className: "high-score"
        },
        {
            label: "Closed Safe",
            count: fraudCases.filter(
                (fraudCase) =>
                    fraudCase.status === "CLOSED_SAFE"
            ).length,
            className: "medium-score"
        }
    ];

    const maxCaseCount = Math.max(
        1,
        ...caseStatusDistribution.map((item) => item.count)
    );

    const filteredRecentTransactions =
        sortedTransactions
            .filter((transaction) => {
                const dateString =
                    getTransactionDate(transaction);

                if (!dateString) return false;

                const transactionDate =
                    dateFromString(dateString);

                const differenceInDays = Math.round(
                    (referenceDate - transactionDate) / 86400000
                );

                return transactionPeriod === "24h"
                    ? differenceInDays === 0
                    : differenceInDays >= 0 &&
                    differenceInDays < 7;
            })
            .slice(0, 10);

    const handleFindTransactions = () => {
        const value = accountId.trim();

        if (!value) return;

        navigate(
            `/fraud-cases/new?accountId=${encodeURIComponent(value)}`
        );
    };


    const [activityPeriod, setActivityPeriod] = useState("all");

    const transactionActivity = (() => {
        const validTransactions = transactions
            .map((transaction) => ({
                ...transaction,
                activityDate: String(
                    transaction.dateTransaction ??
                    transaction.transactionDate ??
                    ""
                ).slice(0, 10)
            }))
            .filter((transaction) =>
                /^\d{4}-\d{2}-\d{2}$/.test(transaction.activityDate) &&
                !Number.isNaN(
                    new Date(`${transaction.activityDate}T12:00:00`).getTime()
                )
            );

        if (validTransactions.length === 0) {
            return [];
        }

        // Anchor chart periods to the latest available transaction.
        const latestDate = validTransactions
            .map((transaction) => transaction.activityDate)
            .sort()
            .at(-1);

        const endDate = new Date(`${latestDate}T12:00:00`);

        const startDate = new Date(endDate);

        if (activityPeriod === "7d") {
            startDate.setDate(endDate.getDate() - 6);
        } else if (activityPeriod === "30d") {
            startDate.setDate(endDate.getDate() - 29);
        } else {
            const earliestDate = validTransactions
                .map((transaction) => transaction.activityDate)
                .sort()[0];

            startDate.setTime(
                new Date(`${earliestDate}T12:00:00`).getTime()
            );
        }

        const days = Math.round(
            (endDate - startDate) / 86400000
        ) + 1;

        // Use daily buckets for short periods and weekly/monthly buckets
        // for larger datasets to keep the chart readable.
        const bucketSize =
            activityPeriod === "7d"
                ? 1
                : activityPeriod === "30d"
                    ? 3
                    : Math.max(1, Math.ceil(days / 12));

        const buckets = [];

        for (let offset = 0; offset < days; offset += bucketSize) {
            const bucketStart = new Date(startDate);
            bucketStart.setDate(startDate.getDate() + offset);

            const bucketEnd = new Date(bucketStart);
            bucketEnd.setDate(
                bucketStart.getDate() + Math.min(bucketSize, days - offset) - 1
            );

            const startKey = [
                bucketStart.getFullYear(),
                String(bucketStart.getMonth() + 1).padStart(2, "0"),
                String(bucketStart.getDate()).padStart(2, "0")
            ].join("-");

            const endKey = [
                bucketEnd.getFullYear(),
                String(bucketEnd.getMonth() + 1).padStart(2, "0"),
                String(bucketEnd.getDate()).padStart(2, "0")
            ].join("-");

            buckets.push({
                startKey,
                endKey,
                label: bucketStart.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short"
                }),
                count: 0
            });
        }

        validTransactions.forEach((transaction) => {
            const bucket = buckets.find(
                (item) =>
                    transaction.activityDate >= item.startKey &&
                    transaction.activityDate <= item.endKey
            );

            if (bucket) {
                bucket.count += 1;
            }
        });

        return buckets;
    })();

    const maxActivity = Math.max(
        1,
        ...transactionActivity.map((item) => item.count)
    );


    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1>Fraud Overview</h1>
                    <p>
                        Monitor transaction risk and fraud investigations
                    </p>
                </div>
            </div>

            {error && (
                <p
                    role="alert"
                    style={{
                        color: "#dc2626",
                        marginBottom: 20
                    }}
                >
                    {error}
                </p>
            )}

            <div className="dashboard-kpi-grid">
                <KpiCard
                    title="TOTAL TRANSACTIONS"
                    value={
                        loading
                            ? "..."
                            : transactions.length.toLocaleString()
                    }
                />

                <KpiCard
                    title="TOTAL BANK ACCOUNTS"
                    value={
                        loading
                            ? "..."
                            : accounts.length.toLocaleString()
                    }
                />

                <KpiCard
                    title="OPEN FRAUD CASES"
                    value={
                        loading
                            ? "..."
                            : openCases.toLocaleString()
                    }
                />

                <KpiCard
                    title="ESCALATED CASES"
                    value={
                        loading
                            ? "..."
                            : escalatedCases.toLocaleString()
                    }
                />
            </div>

            <div className="dashboard-charts">

                <div className="dashboard-card transaction-trend-card">
                    <div className="trend-card-header">
                        <div>
                            <h2>Transaction Activity Over Time</h2>
                            <p>Transaction volume across the selected period</p>
                        </div>

                        <div className="activity-period-selector">
                            {[
                                ["7d", "7 Days"],
                                ["30d", "30 Days"],
                                ["all", "All Time"]
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={
                                        activityPeriod === value
                                            ? "period-button active"
                                            : "period-button"
                                    }
                                    onClick={() => setActivityPeriod(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="trend-legend">
                        <span className="activity-legend-dot"></span>
                        <span>Total Transactions</span>
                    </div>

                    <div
                        className="activity-vertical-chart"
                        key={activityPeriod}
                    >
                        {transactionActivity.length > 0 ? (
                            transactionActivity.map((item, index) => (
                                <div
                                    className="activity-vertical-column"
                                    key={`${item.startKey}-${index}`}
                                >
                                    <div className="activity-vertical-plot">
                                        <div
                                            className="activity-vertical-bar"
                                            style={{
                                                height: `${
                                                    (item.count / maxActivity) * 100
                                                }%`,
                                                animationDelay: `${index * 55}ms`
                                            }}
                                            title={`${item.count} transactions`}
                                        >
                            <span className="activity-bar-tooltip">
                                {item.count} transactions
                            </span>
                                        </div>
                                    </div>

                                    <span className="activity-vertical-label">
                        {item.label}
                    </span>
                                </div>
                            ))
                        ) : (
                            <p>No transaction activity available.</p>
                        )}
                    </div>
                </div>


                <div className="dashboard-card score-distribution-card">
                    <div className="card-header">
                        <div>
                            <h2>Case Status Distribution</h2>
                            <p>
                                Fraud investigations by current status
                            </p>
                        </div>
                    </div>

                    {caseStatusDistribution.map((item) => (
                        <div
                            className="score-item"
                            key={item.label}
                        >
                            <div className="score-label">
                                <span>{item.label}</span>
                                <strong>{item.count}</strong>
                            </div>

                            <div className="score-bar">
                                <div
                                    className={`score-fill ${item.className}`}
                                    style={{
                                        width: `${
                                            (item.count /
                                                maxCaseCount) *
                                            100
                                        }%`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-bottom">
                <div className="dashboard-card recent-transactions-card">
                    <div className="recent-transactions-header">
                        <div>
                            <h2>Recent Transactions</h2>

                            <div className="transaction-period-filter">
                                <button
                                    type="button"
                                    className={
                                        transactionPeriod === "24h"
                                            ? "period-button active"
                                            : "period-button"
                                    }
                                    onClick={() =>
                                        setTransactionPeriod("24h")
                                    }
                                >
                                    Last 24 Hours
                                </button>

                                <button
                                    type="button"
                                    className={
                                        transactionPeriod === "week"
                                            ? "period-button active"
                                            : "period-button"
                                    }
                                    onClick={() =>
                                        setTransactionPeriod("week")
                                    }
                                >
                                    Past Week
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="view-all-button"
                            onClick={() => navigate("/transactions")}
                        >
                            View All
                        </button>
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
                            {filteredRecentTransactions.length > 0 ? (
                                filteredRecentTransactions.map(
                                    (transaction) => (
                                        <tr key={transaction.id}>
                                            <td>
                                                {formatDate(
                                                    transaction.dateTransaction ??
                                                    transaction.transactionDate
                                                )}
                                            </td>

                                            <td>
                                                {transaction.description ||
                                                    transaction.merchantName ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {formatAmount(transaction)}
                                            </td>

                                            <td>
                                                {transaction.primaryCategory
                                                    ? String(
                                                        transaction.primaryCategory
                                                    ).replaceAll(
                                                        "_",
                                                        " "
                                                    )
                                                    : "—"}
                                            </td>

                                            <td>
                                                {transaction.channel ||
                                                    "—"}
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
                                    <td colSpan="6">
                                        {loading
                                            ? "Loading transactions..."
                                            : "No transactions found for this period."}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-card create-case-card">
                    <div className="create-case-header">
                        <h2>Create Fraud Case</h2>
                    </div>

                    <p className="create-case-description">
                        Create a fraud case by selecting transactions
                        from a bank account.
                    </p>

                    <div className="create-case-form">
                        <label htmlFor="dashboard-account-id">
                            ACCOUNT ID
                        </label>

                        <input
                            id="dashboard-account-id"
                            type="text"
                            placeholder="Enter Account ID"
                            value={accountId}
                            onChange={(event) =>
                                setAccountId(event.target.value)
                            }
                        />

                        <button
                            type="button"
                            className="find-transactions-button"
                            onClick={handleFindTransactions}
                        >
                            Find Transactions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
