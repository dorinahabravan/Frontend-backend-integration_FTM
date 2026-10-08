
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TransactionMap from "../components/TransactionMap";
import BackButton from "../components/BackButton";

function Transactions() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");

    const [searchParams] = useSearchParams();
    const accountId = searchParams.get("accountId");

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setTransactions([]);
            setSearchTerm("");
            setSelectedCountry("");

            try {
                const url = accountId
                    ? `http://localhost:8080/api/FTRM/accounts/${encodeURIComponent(accountId)}/transactions`
                    : "http://localhost:8080/api/FTRM/transactions/all";

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Failed to fetch transactions");
                }

                const data = await response.json();

                setTransactions(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error("Error loading transactions:", error);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [accountId]);

    useEffect(() => {
        const fetchAccount = async () => {
            if (!accountId) {
                setAccount(null);
                return;
            }

            setAccount(null);

            try {
                const response = await fetch(
                    `http://localhost:8080/api/FTRM/accounts/${encodeURIComponent(accountId)}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch account");
                }

                const data = await response.json();
                setAccount(data);
            } catch (error) {
                console.error("Error loading account:", error);
            }
        };

        fetchAccount();
    }, [accountId]);

    const getCurrency = (transaction) =>
        transaction.currencyCode ??
        transaction.isoCurrencyCode ??
        transaction.currency ??
        "";

    const getCategory = (transaction) =>
        transaction.primaryCategory ??
        transaction.categoryPrimary ??
        transaction.category ??
        "";

    const getDetailedCategory = (transaction) =>
        transaction.detailedCategory ??
        transaction.categoryDetailed ??
        "";

    const getTransactionDate = (transaction) =>
        transaction.dateTransaction ??
        transaction.transactionDate ??
        "";

    const getAuthorisedDate = (transaction) =>
        transaction.dateAuthorised ??
        transaction.authorisedDate ??
        "";

    const getMerchantName = (transaction) =>
        transaction.merchantName ?? "";

    const getMerchantCategoryCode = (transaction) =>
        transaction.merchantCategoryCode ?? "";

    const formatAccountId = (id) => {
        if (!id) return "—";

        const value = String(id);

        if (value.length <= 12) {
            return value;
        }

        return `•••• ${value.slice(-6)}`;
    };

    const currencyInfo = {
        GBP: { symbol: "£", flag: "🇬🇧" },
        EUR: { symbol: "€", flag: "🇪🇺" },
        USD: { symbol: "$", flag: "🇺🇸" },
        JPY: { symbol: "¥", flag: "🇯🇵" },
        CAD: { symbol: "$", flag: "🇨🇦" },
        CHF: { symbol: "Fr", flag: "🇨🇭" },
        AUD: { symbol: "$", flag: "🇦🇺" }
    };

    const currencyCounts = transactions.reduce(
        (counts, transaction) => {
            const currency = getCurrency(transaction);

            if (currency) {
                counts[currency] =
                    (counts[currency] || 0) + 1;
            }

            return counts;
        },
        {}
    );

    const currencyData = Object.entries(currencyCounts).map(
        ([currency, count]) => ({
            currency,
            count,
            percentage:
                transactions.length > 0
                    ? Math.round(
                        (count / transactions.length) * 100
                    )
                    : 0
        })
    );

    const filteredTransactions = transactions.filter(
        (transaction) => {
            const search = searchTerm.trim().toLowerCase();

            return (
                String(transaction.description ?? "")
                    .toLowerCase()
                    .includes(search) ||

                String(transaction.accountId ?? "")
                    .toLowerCase()
                    .includes(search) ||

                String(getMerchantName(transaction))
                    .toLowerCase()
                    .includes(search) ||

                String(getCurrency(transaction))
                    .toLowerCase()
                    .includes(search) ||

                String(getCategory(transaction))
                    .toLowerCase()
                    .includes(search) ||

                String(getDetailedCategory(transaction))
                    .toLowerCase()
                    .includes(search) ||

                String(
                    transaction.channel ??
                    transaction.paymentChannel ??
                    ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(transaction.city ?? "")
                    .toLowerCase()
                    .includes(search) ||

                String(transaction.country ?? "")
                    .toLowerCase()
                    .includes(search) ||

                String(getMerchantCategoryCode(transaction))
                    .toLowerCase()
                    .includes(search)
            );
        }
    );

    return (
        <div className="transactions-page">
            <BackButton />

            <div className="page-header">
                <h1>Transactions</h1>
                <p>View and monitor transaction activity</p>
            </div>

            {account && (
                <div className="dashboard-card transaction-account-card">
                    <div className="transaction-account-header">
                        <div>
                            <span className="transaction-account-label">
                                ACCOUNT
                            </span>

                            <h2>{account.name}</h2>
                        </div>

                        <span className="account-type-badge">
                            {account.type}
                        </span>
                    </div>

                    <div className="transaction-account-details">
                        <div>
                            <span>Account ID</span>
                            <strong title={account.id}>
                                {formatAccountId(account.id)}
                            </strong>
                        </div>

                        <div>
                            <span>Mask</span>
                            <strong>
                                {account.mask
                                    ? `••${account.mask}`
                                    : "—"}
                            </strong>
                        </div>

                        <div>
                            <span>Type</span>
                            <strong>{account.type || "—"}</strong>
                        </div>

                        <div>
                            <span>Subtype</span>
                            <strong>
                                {account.subType &&
                                account.subType !== "null"
                                    ? account.subType
                                    : "—"}
                            </strong>
                        </div>

                        <div>
                            <span>Currency</span>
                            <strong>
                                {account.currencyCode || "—"}
                            </strong>
                        </div>

                        <div>
                            <span>Available Balance</span>
                            <strong>
                                {account.currencyCode === "GBP"
                                    ? "£"
                                    : ""}
                                {Number(
                                    account.available ?? 0
                                ).toFixed(2)}
                            </strong>
                        </div>
                    </div>
                </div>
            )}

            <div className="transactions-overview-grid">
                <div className="dashboard-card currency-card">
                    <h2>Transactions by Currency</h2>

                    {currencyData.map((item) => (
                        <div
                            className="currency-row"
                            key={item.currency}
                        >
                            <div className="currency-info">
                                <span>
                                    {currencyInfo[item.currency]?.flag ||
                                        "🌐"}{" "}
                                    {currencyInfo[item.currency]?.symbol ||
                                        "¤"}{" "}
                                    {item.currency}
                                </span>

                                <span>
                                    {item.percentage}%
                                </span>
                            </div>

                            <div className="currency-progress">
                                <div
                                    className="currency-progress-fill"
                                    style={{
                                        width: `${item.percentage}%`
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    {!loading && transactions.length === 0 && (
                        <p>No transactions found.</p>
                    )}
                </div>

                <div className="dashboard-card transaction-map-card">
                    <div className="transaction-map-header">
                        <h2>Transaction Map</h2>

                        <span
                            onClick={() => setSelectedCountry("")}
                            style={{ cursor: "pointer" }}
                        >
                            ALL LOCATIONS ▾
                        </span>
                    </div>

                    <div className="transaction-map-placeholder">
                        <TransactionMap
                            selectedCountry={selectedCountry}
                        />
                    </div>
                </div>
            </div>

            <div className="dashboard-card transactions-table-card">
                <div className="transactions-table-header">
                    <h2>
                        Transactions
                        {!loading &&
                            ` (${filteredTransactions.length})`}
                    </h2>

                    <input
                        type="text"
                        className="transaction-search"
                        placeholder="Search transactions"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />
                </div>

                <div className="table-container">
                    <table className="dashboard-table transactions-table">
                        <thead>
                        <tr>
                            <th>DATE</th>
                            <th>ACCOUNT</th>
                            <th>DESCRIPTION</th>
                            <th>MERCHANT</th>
                            <th>AMOUNT</th>
                            <th>CURRENCY</th>
                            <th>PRIMARY CATEGORY</th>
                            <th>DETAILED CATEGORY</th>
                            <th>CHANNEL</th>
                            <th>CITY</th>
                            <th>COUNTRY</th>
                            <th>AUTHORISED DATE</th>
                            <th>MERCHANT CODE</th>
                            <th>STATUS</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredTransactions.map((transaction) => (
                            <tr
                                key={transaction.id}
                                onClick={() =>
                                    setSelectedCountry(
                                        transaction.country || ""
                                    )
                                }
                                className="clickable-transaction-row"
                            >
                                <td>
                                    {getTransactionDate(transaction) || "—"}
                                </td>

                                <td>
                                        <span title={transaction.accountId}>
                                            {formatAccountId(
                                                transaction.accountId
                                            )}
                                        </span>
                                </td>

                                <td>
                                    {transaction.description || "—"}
                                </td>

                                <td>
                                    {getMerchantName(transaction) || "—"}
                                </td>

                                <td>
                                    {Number(
                                        transaction.amount ?? 0
                                    ).toFixed(2)}
                                </td>

                                <td>
                                    {getCurrency(transaction) || "—"}
                                </td>

                                <td>
                                    {getCategory(transaction) || "—"}
                                </td>

                                <td>
                                    {getDetailedCategory(transaction) || "—"}
                                </td>

                                <td>
                                    {transaction.channel ??
                                        transaction.paymentChannel ??
                                        "—"}
                                </td>

                                <td>
                                    {transaction.city || "—"}
                                </td>

                                <td>
                                    {transaction.country || "—"}
                                </td>

                                <td>
                                    {getAuthorisedDate(transaction) || "—"}
                                </td>

                                <td>
                                    {getMerchantCategoryCode(
                                        transaction
                                    ) || "—"}
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
                        ))}
                        </tbody>
                    </table>

                    {loading && (
                        <p>Loading transactions...</p>
                    )}

                    {!loading &&
                        filteredTransactions.length === 0 && (
                            <p>No transactions found.</p>
                        )}
                </div>
            </div>
        </div>
    );
}

export default Transactions;
