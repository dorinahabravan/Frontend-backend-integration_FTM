package com.mthree.FraudAndTransactionRiskManager.service.appServices;

import com.mthree.FraudAndTransactionRiskManager.dto.Case;

import java.util.List;

public interface CaseService {
    Case getCase(int caseID);

    Case setCaseScore(int caseID, int score);

    Case addCaseForAccount(String accountID);

    List<Case> getCasesForAccount(String accountID);

    // Saves a new case and links its transactions; returns the case with its new caseId
    Case createCase(Case newCase);

    // Returns every case
    List<Case> getCases();

    // Saves changes to an existing case (description, status, closedAt) returns the updated case
    Case updateCase(Case updatedCase);

    // Deletes a case and its links
    void deleteCase(int caseID);

    Case addTransactionToCase(int caseID, String transactionID);

    Case setCaseDescription(int caseID, String description);

    Case setCaseStatus(int caseID, String status);

    // Saves the investigator's decision and supporting note for a case
    Case setCaseDecision(int caseID, String decision, String decisionNote);
}
