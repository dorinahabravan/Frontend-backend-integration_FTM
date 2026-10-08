
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";


function Accounts() {
    const navigate = useNavigate();

    //Accounts received from the backend API
    const[accounts, setAccounts] = useState([]);

    //Tracks the request state while account data is being loaded
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {


                console.log("FETCH URL TEST:", "http://localhost:8080/api/FTRM/accounts/all");
                const response = await fetch ("http://localhost:8080/api/FTRM/accounts/all"

                );

                if(!response.ok){
                    throw new Error("Failed to fetch bank accounts");

                }
                const data = await response.json();

                console.log("ACCOUNTS FROM BACKEND", data);

                setAccounts(data);
            }catch (error){
                console.error("Error loading bank accounts:", error);

            }finally{
                setLoading(false);
            }
        };

        fetchAccounts();
    } , []);





    // Opens the Transactions page for the selected account.
    // The account ID is passed as a query parameter so it can later
    // be used to request the correct transactions from the backend.
    const handleViewTransactions = (accountId) => {
        navigate(`/transactions?accountId=${accountId}`);
    };

    return (
        <div className="accounts-page">
            <BackButton />

            <div className="page-header">
                <h1>Bank Accounts</h1>
                <p>View bank accounts</p>
            </div>

            {/* Account data is rendered dynamically to support API data later. */}
            <div className="dashboard-card accounts-table-card">
                <table className="accounts-table">
                    <thead>
                    <tr>
                        <th>ACCOUNT NAME</th>
                        <th>MASK</th>
                        <th>TYPE</th>
                        <th>SUBTYPE</th>
                        <th>ACTION</th>
                    </tr>
                    </thead>

                    <tbody>
                    {accounts.map((account) => (
                        <tr key={account.id}>
                            <td>
                                <div className="account-name-cell">
                                    <div className="account-icon">
                                        {account.type === "Credit"
                                            ? "💳"
                                            : "🏦"}
                                    </div>

                                    <div>
                                            <span className="account-name">
                                                {account.name}
                                            </span>

                                        <span className="account-id">
                                                Account ID: {account.id}
                                            </span>
                                    </div>
                                </div>
                            </td>

                            <td>
                                    <span className="account-mask">
                                        ••{account.mask}
                                    </span>
                            </td>

                            <td>{account.type}</td>

                            <td>
                                    <span className="account-subtype">
                                        {account.subType}
                                    </span>
                            </td>

                            <td>
                                <button
                                    className="view-transactions-button"
                                    onClick={() =>
                                        handleViewTransactions(
                                            account.id
                                        )
                                    }
                                >
                                    View Transactions
                                    <span>→</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Accounts;