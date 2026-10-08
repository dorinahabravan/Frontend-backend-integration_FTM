package com.mthree.FraudAndTransactionRiskManager.dao;

import com.mthree.FraudAndTransactionRiskManager.dao.Mappers.CaseMapper;
import com.mthree.FraudAndTransactionRiskManager.dao.Mappers.TransactionMapper;
import com.mthree.FraudAndTransactionRiskManager.dto.Case;
import com.mthree.FraudAndTransactionRiskManager.dto.Transaction;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

// @Repository lets Spring create this class and inject it wherever a CaseDao is @Autowired
@Repository
public class CaseDaoImpl implements CaseDao {

    // Same date format that Case.setOpenedAt(String) and setClosedAt(String) read back
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JdbcTemplate jdbc;

    public CaseDaoImpl(JdbcTemplate j) {
        jdbc = j;
    }

    // Adding a case to the database assigns it a new id.
    // Saves the case, links each of its transactions, and returns the saved case with its new id.
    @Override
    public Case createCase(Case fraudCase) {

        final String sql =
                "INSERT INTO cases(account_id, status, score, description, decision, decision_note, open_date, close_date) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();



        jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, new String[]{"id"});
            statement.setString(1, fraudCase.getAccountId());
            statement.setString(2, fraudCase.getStatus());
            statement.setInt(3, fraudCase.getScore());
            statement.setString(4, fraudCase.getDescription());
            statement.setString(5, fraudCase.getDecision());
            statement.setString(6, fraudCase.getDecisionNote());
            statement.setString(7, formatDate(fraudCase.getOpenedAt()));
            statement.setString(8, formatDate(fraudCase.getClosedAt()));
            return statement;
        }, keyHolder);


        // The id the database generated for the new case
        int newCaseId = Objects.requireNonNull(keyHolder.getKey()).intValue();

        for (String transactionId : fraudCase.getTransactionIds()) {

            addTransactionToCase(newCaseId, transactionId);
        }


        return findCaseById(newCaseId);
    }

    // Returns the case with its transactions, or null if no case has this id
    @Override
    public Case findCaseById(int caseId) {
        List<Case> found = jdbc.query("SELECT * FROM cases WHERE id = ?", new CaseMapper(), caseId);
        if (found.isEmpty()) {
            return null;
        }
        Case foundCase = found.get(0);
        loadTransactions(foundCase);

        return foundCase;
    }

    @Override
    public List<Case> findOpenCaseByAccountId(String accountId) {
        List<Case> cases = jdbc.query("SELECT * FROM cases WHERE account_id = ?", new CaseMapper(), accountId);
        List<Case> openCases = new ArrayList<>();

        for (Case c : cases) {
            if (!(Case.CLOSED_SAFE.equals(c.getStatus()) || Case.CLOSED_FRAUD.equals(c.getStatus()))) {
                loadTransactions(c);
                openCases.add(c);
            }
        }
        return openCases;
    }

    @Override
    public void updateCaseScore(int caseId, int score) {
        jdbc.update("UPDATE cases SET score = ? WHERE id = ?", score, caseId);
    }

    // NEW

    @Override
    public List<Case> findAllCases() {

        List<Case> cases = jdbc.query("SELECT * FROM cases ORDER BY id", new CaseMapper());
        for (Case c : cases) {
            loadTransactions(c);
        }
        return cases;
    }

    // Saves changes to the case itself; the transactions in the case do not change
    @Override
    public void updateCase(Case updatedCase) {
        jdbc.update(
                "UPDATE cases SET description = ?, status = ?, decision = ?, decision_note = ?, close_date = ? WHERE id = ?",
                updatedCase.getDescription(),
                updatedCase.getStatus(),
                updatedCase.getDecision(),
                updatedCase.getDecisionNote(),
                formatDate(updatedCase.getClosedAt()),
                updatedCase.getCaseId()
        );
    }

    // Call deleteTransactionsFromCase first, so no links are left pointing at a deleted case
    @Override
    public void deleteCase(int caseId) {
        jdbc.update("DELETE FROM cases WHERE id = ?", caseId);
    }

    @Override
    public void addTransactionToCase(int caseId, String transactionId) {
        jdbc.update("INSERT INTO case_transaction(case_id, transaction_id) VALUES (?, ?)", caseId, transactionId);
    }

    @Override
    public List<String> findTransactionIdsByCaseId(int caseId) {
        return jdbc.query("SELECT transaction_id FROM case_transaction WHERE case_id = ?",
                (rs, rowNum) -> rs.getString("transaction_id"), caseId);
    }

    @Override
    public void deleteTransactionsFromCase(int caseId) {
        jdbc.update("DELETE FROM case_transaction WHERE case_id = ?", caseId);
    }

    //  Helpers

    // Fills in a case's transactions from the case_transaction link table and the transactions table
    private void loadTransactions(Case c) {
        List<Transaction> transactions = new ArrayList<>();

        for (String transactionId : findTransactionIdsByCaseId(c.getCaseId())) {
            List<Transaction> found = jdbc.query("SELECT * FROM transactions WHERE id = ?",
                    new TransactionMapper(), transactionId);
            if (!found.isEmpty()) {
                transactions.add(found.get(0));
            }
        }
        c.setTransactions(transactions);
    }

    // Formats a date for the database, or null if there is no date
    private static String formatDate(LocalDateTime date) {
        return date == null ? null : DATE_FORMAT.format(date);
    }
}