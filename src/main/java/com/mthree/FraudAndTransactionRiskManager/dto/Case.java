package com.mthree.FraudAndTransactionRiskManager.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

//unfinished
public class Case {

    // Case lifecycle statuses
    public static final String OPEN = "OPEN";
    public static final String UNDER_INVESTIGATION = "UNDER_INVESTIGATION";
    public static final String ESCALATED = "ESCALATED";
    public static final String CLOSED_SAFE = "CLOSED_SAFE";
    public static final String CLOSED_FRAUD = "CLOSED_FRAUD";

    private int caseId;
    private String accountId;
    private String description;

    // Stores the investigator's final decision and supporting note.
    private String decision;
    private String decisionNote;


    List<Transaction> transactions = new ArrayList<>();

    private String status;

    private int score;

    private LocalDateTime openedAt;
    private LocalDateTime closedAt;

    private List<Transaction> flaggedTransactions = new ArrayList<>();


    public int getCaseId() { return caseId; }
    public void setCaseId(int caseId) { this.caseId = caseId; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }


    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }


    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public LocalDateTime getOpenedAt() { return openedAt; }
    public String getOpenedAtString(){
        return DateTimeFormatter.ISO_LOCAL_DATE.format(openedAt) + " " + DateTimeFormatter.ISO_LOCAL_TIME.format(openedAt);
    }
    public void setOpenedAt(LocalDateTime openedAt) { this.openedAt = openedAt; }
    public void setOpenedAt(String dateTransaction) {
        DateTimeFormatter myFormatObj = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        this.openedAt = LocalDateTime.parse(dateTransaction, myFormatObj);
    }

    public String getClosedAtString(){
        return DateTimeFormatter.ISO_LOCAL_DATE.format(closedAt) + " " + DateTimeFormatter.ISO_LOCAL_TIME.format(closedAt);
    }
    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public List<Transaction> getFlaggedTransactions() {
        return flaggedTransactions;
    }

    public void setFlaggedTransactions(List<Transaction> flaggedTransactions) {
        this.flaggedTransactions = flaggedTransactions;
    }
    public void setClosedAt(String dateTransaction) {
        if (dateTransaction == null) {
            dateTransaction = "1970-01-01 00:00:00";
            //this.closedAt = null;   // an open case has no close date
            //return;
        }
        DateTimeFormatter myFormatObj = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        this.closedAt = LocalDateTime.parse(dateTransaction, myFormatObj);
    }

    public void setTransactions(List<Transaction> t){
        transactions = t;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public List<String> getTransactionIds(){
        ArrayList<String> list = new ArrayList<>();
       // System.out.println("Hey: ");
        for (Transaction t : transactions){
            //System.out.println("Hey: " + t.getId());
            list.add(t.getId());
        }
        return list;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getDecisionNote() {
        return decisionNote;
    }

    public void setDecisionNote(String decisionNote) {
        this.decisionNote = decisionNote;
    }


}
