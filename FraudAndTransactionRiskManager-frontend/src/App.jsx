import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Accounts from './pages/Accounts.jsx'
import Transactions from './pages/Transactions.jsx'
import FraudCases from './pages/FraudCases.jsx'
import CreateFraudCase from "./pages/CreateFraudCase.jsx";
import FraudCaseDetails from './pages/FraudCaseDetails.jsx'


import Sidebar from './components/Sidebar'

import './App.css'


function App() {

  return(
      <div className="app-layout">
         <Sidebar/>

        <main className="main-content">
  <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/accounts" element={<Accounts />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/fraud-cases" element={<FraudCases />} />
      <Route path="/fraud-cases/new" element={<CreateFraudCase />} />
      <Route path="/fraud-cases/:caseId" element={<FraudCaseDetails />} />


  </Routes>
        </main>

        </div>
  )
}
export default App
