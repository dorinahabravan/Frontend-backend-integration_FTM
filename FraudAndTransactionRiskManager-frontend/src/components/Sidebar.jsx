import { NavLink } from 'react-router-dom'

function Sidebar () {
    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <h2>Fraud Detection</h2>
                <p>Risk Manager</p>
            </div>

            <nav className="sidebar-nav">

            <NavLink to="/">
                Overview
                </NavLink>

                <NavLink to="/accounts">
                    Bank Accounts
                    </NavLink>

                    <NavLink to="/transactions">
                        Transactions
                        </NavLink>

                        <NavLink to="/fraud-cases">
                            Fraud Cases
                            </NavLink>

                          </nav>
                         </aside>

    )

}

export default Sidebar