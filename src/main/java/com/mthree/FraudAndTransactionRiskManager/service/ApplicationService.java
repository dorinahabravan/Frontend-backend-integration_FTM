package com.mthree.FraudAndTransactionRiskManager.service;

import com.mthree.FraudAndTransactionRiskManager.dto.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

public interface ApplicationService {
    public List<Transaction> getTransactions();

    public void importFromPaid();

    public Transaction getTransaction(String transactionID);

    //public TransactionWrapper getTransactionInfo(String transactionID);

    public List<Transaction> searchTransactions(String searchString);

    public List<Account> getAccounts();

    public Account getAccount(String accountID);

    public List<Account> searchAccounts(String searchString);

    public List<Transaction> getTransactionsForAccount(String accountID);

    /*
    public List<RiskRule> getRiskRules();

    public RiskRule getRiskRule(String ruleCode);

    public List<RiskFlag> getTransactionFlags(String transactionID);
     */

    public Case getCase(int caseID);

    public Case setCaseScore(int caseID, int score);

    // Fraud detection
    List<Transaction> colourTransactionsForAccount(String accountID);
    List<Transaction> flagTransactionsForAccount(String accountID);
    List<Transaction> flagAllTransactions();

    // Cases
    List<Case> getCases();
    Case createCase(String accountID, List<String> transactionIDs, String description);
    Case updateCase(int caseID, Case updatedCase);
    void deleteCase(int caseID);

    public Case addCaseForAccount(String accountID);

    public List<Case> getCasesForAccount(String accountID);

    Case addTransactionToCase(int caseID, String transactionID);

    Case setCaseDescription(int caseID, String description);

    Case setCaseStatus(int caseID, String status);

    Case setCaseDecision(int caseID, String decision, String decisionNote);

    List<Case> getAllCases();

    Map<String,List<Transaction>> getTransactionForWeek();

    List<Transaction> getTransactionForDay();


}
