package com.mthree.FraudAndTransactionRiskManager.controller;

import com.mthree.FraudAndTransactionRiskManager.dto.*;
import com.mthree.FraudAndTransactionRiskManager.service.ApplicationService;
import com.mthree.FraudAndTransactionRiskManager.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/FTRM")
@CrossOrigin(origins = "http://localhost:5175")
//unfinished
public class Controller {

    @Autowired
    ApplicationService applicationService;

    @Autowired
    AuditService auditService;


    // retrieve all transactions
    @GetMapping("/transactions/all")
    public List<Transaction> getAllTransaction() {
        auditService.writeToAudit("getAllTransaction");
        return applicationService.getTransactions();
    }

    // retrieve transactions for past 7 days
    @GetMapping("/transactions/week")
    public Map<String,List<Transaction>> getTransactionForWeek() {
        auditService.writeToAudit("getTransactionForWeek");
        return applicationService.getTransactionForWeek();
    }

    // retrieve transactions for past 24 hours
    // note - transaction time is not stored, assumes transactions occur at end of day
    @GetMapping("/transactions/day")
    public List<Transaction> getTransactionForDay() {
        auditService.writeToAudit("getTransactionForDay");
        return applicationService.getTransactionForDay();
    }

    // retrieve transaction with id
    @GetMapping("/transactions/{transactionID}")
    public Transaction getTransaction(@PathVariable String transactionID) {
        auditService.writeToAudit("getTransaction:" + transactionID);
        return applicationService.getTransaction(transactionID);
    }

    /*
    // retrieve transaction risk flags with transaction id
    @GetMapping("/transactions/{transactionID}/flags")
    public List<RiskFlag> getTransactionFlags(@PathVariable String transactionID) {
        auditService.writeToAudit("getTransactionFlags:" + transactionID);
        return applicationService.getTransactionFlags(transactionID);
    }

    // retrieve transaction and related data with id
    @GetMapping("/transactions/{transactionID}/info")
    public TransactionWrapper getTransactionInfo(@PathVariable String transactionID) {
        auditService.writeToAudit("getTransactionInfo:" + transactionID);
        return applicationService.getTransactionInfo(transactionID);
        
    }
    */

    // retrieve transactions with search
    @GetMapping("/transactions/search")
    public List<Transaction> searchTransactions(String searchString) {
        auditService.writeToAudit("searchTransactions:" + searchString);
        return applicationService.searchTransactions(searchString);
    }




    // retrieve all account
    @GetMapping("/accounts/all")
    public List<Account> getAllTransactions() {
        auditService.writeToAudit("getAllTransactions");
        return applicationService.getAccounts();
    }

    // retrieve account with id
    @GetMapping("/accounts/{accountID}")
    public Account getAccount(@PathVariable String accountID) {
        auditService.writeToAudit("getAccount:" + accountID);
        return applicationService.getAccount(accountID);
    }

    // retrieve accounts with search
    @GetMapping("/accounts/search")
    public List<Account> searchAccounts(String searchString) {
        auditService.writeToAudit("searchAccounts:" + searchString);
        return applicationService.searchAccounts(searchString);
    }

    // retrieve transactions relating to account
    @GetMapping("/accounts/{accountID}/transactions")
    public List<Transaction> getAccountTransactions(@PathVariable String accountID) {
        auditService.writeToAudit("getAccountTransactions:" + accountID);
        return applicationService.getTransactionsForAccount(accountID);
    }


    // Added to expose fraud detection results to the frontend.
    // Returns all account transactions with their calculated GREEN, AMBER or RED flag colour.
    @GetMapping("/accounts/{accountID}/transactions/coloured")
    public List<Transaction> getColouredAccountTransactions(
            @PathVariable String accountID) {

        auditService.writeToAudit(
                "getColouredAccountTransactions:" + accountID
        );

        return applicationService.colourTransactionsForAccount(accountID);
    }



    /*
    // retrieve all risk rules
    @GetMapping("/risk-rules/all")
    public List<RiskRule> getRiskRules() {
        auditService.writeToAudit("getRiskRules");
        return applicationService.getRiskRules();
    }

    // retrieve risk rules by code
    @GetMapping("/risk-rules/{ruleCode}")
    public RiskRule getRiskRule(@PathVariable String ruleCode) {
        auditService.writeToAudit("getRiskRule:" + ruleCode);
        return applicationService.getRiskRule(ruleCode);
    }
    */


    // retrieve all cases
    @GetMapping("/cases/all")
    public List<Case> getAllCases() {

        auditService.writeToAudit("getAllCases");
        return applicationService.getAllCases();
    }

    // retrieve case by id
    @GetMapping("/cases/{caseID}")
    public Case getCase(@PathVariable int caseID) {
        auditService.writeToAudit("getCase:" + caseID);
        return applicationService.getCase(caseID);
    }

    // updates case score
    @PutMapping("/cases/{caseID}/score")
    public Case setCaseScore(@PathVariable int caseID, @RequestBody String score) {
        int scoreInt = Integer.parseInt(score);
        auditService.writeToAudit("setCaseScore:" + caseID + ":" + scoreInt);
        return applicationService.setCaseScore(caseID,scoreInt);
    }

    // updates case description
    @PutMapping("/cases/{caseID}/description")
    public Case setCaseDescription(@PathVariable int caseID, @RequestBody String description) {
        auditService.writeToAudit("setCasDescription:" + caseID + ":" + description);

        return applicationService.setCaseDescription(caseID,description);
    }

    // updates case status
    //Note: REQUEST BODY MUST BE SPELLED CORRECTLY, or it will return with error code 500
    @PutMapping("/cases/{caseID}/status")
    public Case setCaseStatus(@PathVariable int caseID, @RequestBody String status) {
        auditService.writeToAudit("setCaseStatus:" + caseID + ":" + status);
        return applicationService.setCaseStatus(caseID,status);
    }

    // Saves the investigator's final decision and supporting note
    @PutMapping("/cases/{caseID}/decision")
    public Case setCaseDecision(
            @PathVariable int caseID,
            @RequestBody Case decisionUpdate) {

        auditService.writeToAudit(
                "setCaseDecision:" + caseID + ":" + decisionUpdate.getDecision()
        );

        return applicationService.setCaseDecision(
                caseID,
                decisionUpdate.getDecision(),
                decisionUpdate.getDecisionNote()
        );
    }


    // Updates an existing fraud case
    @PutMapping("/cases/{caseID}")
    public Case updateCase(
            @PathVariable int caseID,
            @RequestBody Case updatedCase) {

        updatedCase.setCaseId(caseID);

        auditService.writeToAudit("updateCase:" + caseID);

        return applicationService.updateCase(caseID, updatedCase);
    }

    // Deletes a fraud case
    @DeleteMapping("/cases/{caseID}")
    public void deleteCase(@PathVariable int caseID) {

        auditService.writeToAudit("deleteCase:" + caseID);

        applicationService.deleteCase(caseID);
    }

    // add transaction to case
    @PutMapping("/cases/{caseID}/add-transaction/{transactionID}")
    public Case addTransactionToCase(@PathVariable int caseID,@PathVariable String transactionID) {
        auditService.writeToAudit("addTransactionToCase:" + caseID + ":" + transactionID);
        return applicationService.addTransactionToCase(caseID,transactionID);
    }

    // creates new case from accountID
    @PostMapping("accounts/{accountID}/cases")
    public Case addCaseForAccount(@PathVariable String accountID) {
        auditService.writeToAudit("addCaseForAccount:" + accountID);

        return applicationService.addCaseForAccount(accountID);
    }

    // gets case from accountID
    @GetMapping("accounts/{accountID}/cases")
    public List<Case> getCaseForAccount(@PathVariable String accountID) {
        auditService.writeToAudit("getCaseForAccount:" + accountID);
        return applicationService.getCasesForAccount(accountID);
    }








    @GetMapping("/{testString}")
    public String test(@PathVariable String testString) {
        return testString + "test";
    }
}
