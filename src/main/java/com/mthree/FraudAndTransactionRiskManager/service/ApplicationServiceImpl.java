package com.mthree.FraudAndTransactionRiskManager.service;

import com.mthree.FraudAndTransactionRiskManager.Import.Import;

import com.mthree.FraudAndTransactionRiskManager.dto.*;
import com.mthree.FraudAndTransactionRiskManager.service.appServices.*;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    @Autowired
    TransactionService transactionService;

    @Autowired
    AccountService accountService;

    /*
    @Autowired
    RiskService riskService;
     */

    @Autowired
    CaseService caseService;

    @Autowired
    SearchService searchService;

    @Autowired
    Import importer;

    public ApplicationServiceImpl(TransactionService transactionService, AccountService accountService, CaseService caseService, SearchService searchService, Import imp) throws SQLException, ParseException {
        this.transactionService = transactionService;
        this.accountService = accountService;
        //this.riskService = riskService;
        this.caseService = caseService;
        this.searchService = searchService;
        importer = imp;
        imp.importData();
    }

    @Override
    public List<Transaction> getTransactions() {
        return transactionService.getTransactions();
    }

    @Override
    public void importFromPaid() {

    }

    @Override
    public Transaction getTransaction(String transactionID) {
        return transactionService.getTransaction(transactionID);
    }

    /*
    @Override
    public TransactionWrapper getTransactionInfo(String transactionID) {
        TransactionWrapper wrapper = new TransactionWrapper();

        wrapper.setTransaction(getTransaction(transactionID));
        if (wrapper.getTransaction() == null) {
            //return with null contents
            return wrapper;
        }

        wrapper.setRiskFlags(getTransactionFlags(transactionID));
        return wrapper;
    }


     */
    /*
    search format:
    terms are space deliminated
    all fields are searched if no field is specified for the term
    field specific search terms = field:value
    values beginning with * are fuzzy searched
    results are intersection of terms
     */
    @Override
    public List<Transaction> searchTransactions(String searchString) {
        return (List<Transaction>) searchService.searchObjectsBy(searchString,transactionService.getTransactions());
    }

    @Override
    public List<Account> getAccounts() {
        return accountService.getAccounts();
    }

    @Override
    public Account getAccount(String accountID) {
        return accountService.getAccount(accountID);
    }

    @Override
    public List<Account> searchAccounts(String searchString) {
        return (List<Account>) searchService.searchObjectsBy(searchString,accountService.getAccounts());
    }

    @Override
    public List<Transaction> getTransactionsForAccount(String accountID) {
        if (accountService.getAccount(accountID) == null) {
            return null;
        }
        return transactionService.getTransactionsForAccount(accountID);
    }

    /*
    @Override
    public List<RiskRule> getRiskRules() {
        return riskService.getRiskRules();
    }

    @Override
    public RiskRule getRiskRule(String ruleCode) {
        return riskService.getRiskRule(ruleCode);
    }

    @Override
    public List<RiskFlag> getTransactionFlags(String transactionID) {
        if (transactionService.getTransaction(transactionID) == null) {
            return null;
        }
        return riskService.getRiskFlagForTransaction(transactionID);
    }
    */

    @Override
    public Case getCase(int caseID) {
        return caseService.getCase(caseID);
    }

    @Override
    public Case setCaseScore(int caseID, int score) {
        return caseService.setCaseScore(caseID,score);
    }

    @Override
    public Case addCaseForAccount(String accountID) {
        if (accountService.getAccount(accountID) == null) {
            return null;
        }
        return caseService.addCaseForAccount(accountID);
    }

    @Override
    public List<Case> getCasesForAccount(String accountID) {
        return caseService.getCasesForAccount(accountID);
    }

    @Override
    public Case addTransactionToCase(int caseID, String transactionID) {
        Transaction transaction = transactionService.getTransaction(transactionID);
        if (transaction == null) {
            Case errorCase = new Case();
            errorCase.setDescription("transaction not found");
            return errorCase;
        }
        Case aCase = caseService.getCase(caseID);
        if (aCase == null) {
            Case errorCase = new Case();
            errorCase.setDescription("case not found");
            return errorCase;
        }
        return caseService.addTransactionToCase(caseID,transactionID);
    }

    @Override
    public Case setCaseDescription(int caseID, String description) {
        return caseService.setCaseDescription(caseID,description);
    }

    @Override
    public Case setCaseStatus(int caseID, String status) {
        return caseService.setCaseStatus(caseID,status);
    }


    @Override
    public Case setCaseDecision(int caseID, String decision, String decisionNote) {
        return caseService.setCaseDecision(caseID, decision, decisionNote);
    }

    @Override
    public List<Case> getAllCases() {
        return caseService.getCases();
    }

    @Override
    public Map<String,List<Transaction>> getTransactionForWeek() {
        return transactionService.getTransactionForWeek();
    }

    @Override
    public List<Transaction> getTransactionForDay() {
        return transactionService.getTransactionForDay();
    }

    // Retrieve all cases
    @Override
    public List<Case> getCases() {
        return caseService.getCases();
    }

    // Groups the flagged transactions the user selected into one new case.
    // Returns null if the account does not exist.
    @Override
    public Case createCase(String accountID, List<String> transactionIDs, String description) {

        if (transactionIDs == null || transactionIDs.isEmpty()) {
            throw new IllegalArgumentException("Select at least one flagged transaction to create a case");
        }

        // The account's flagged (AMBER or RED) transactions; null if the account does not exist
        List<Transaction> flagged = flagTransactionsForAccount(accountID);
        if (flagged == null) {
            return null;
        }

        // Match each selected ID to a flagged transaction on this account.
        // LinkedHashSet ignores any ID selected twice while keeping the selection order.
        List<Transaction> selected = new ArrayList<>();
        List<String> notFlagged = new ArrayList<>();

        for (String id : new LinkedHashSet<>(transactionIDs)) {
            Transaction match = flagged.stream()
                    .filter(t -> t.getId().equals(id))
                    .findFirst()
                    .orElse(null);

            if (match == null) {
                notFlagged.add(id);
            } else {
                selected.add(match);
            }
        }

        if (!notFlagged.isEmpty()) {
            throw new IllegalArgumentException("These transactions are not flagged transactions on account "
                    + accountID + ": " + notFlagged);
        }

        Case newCase = new Case();
        newCase.setAccountId(accountID);
        newCase.setDescription(description);
        newCase.setStatus(Case.OPEN);
        newCase.setOpenedAt(LocalDateTime.now());
        newCase.setTransactions(selected);
        // closedAt stays null until the case is closed

        // CaseService saves the case and its transaction links, and returns it with its new caseId
        return caseService.createCase(newCase);
    }

    // Updates a case's description and/or status.
    // Moving to a closed status records closedAt. Returns null if the case does not exist.
    @Override
    public Case updateCase(int caseID, Case updatedCase) {

        Case existing = caseService.getCase(caseID);
        if (existing == null) {
            return null;
        }

        if (updatedCase.getDescription() != null) {
            existing.setDescription(updatedCase.getDescription());
        }

        if (updatedCase.getStatus() != null) {
            existing.setStatus(updatedCase.getStatus());

            boolean closing = Case.CLOSED_SAFE.equals(updatedCase.getStatus())
                    || Case.CLOSED_FRAUD.equals(updatedCase.getStatus());

            if (closing && existing.getClosedAt() == null) {

                existing.setClosedAt(LocalDateTime.now());
            } else if (!closing) {
                existing.setClosedAt((LocalDateTime) null); // reopened
            }
        }

        return caseService.updateCase(existing);
    }

    // Deletes a case and its transaction links
    @Override
    public void deleteCase(int caseID) {
        caseService.deleteCase(caseID);
    }

    //FRAUD DETECTION

    // Rule codes: the name of each fraud check, shown at the start of each reason
    public static final String LARGE_AMOUNT = "LARGE_AMOUNT";
    public static final String PASS_THROUGH = "PASS_THROUGH";
    public static final String NEW_MERCHANT = "NEW_MERCHANT";
    public static final String FOREIGN_CURRENCY = "FOREIGN_CURRENCY";
    public static final String DAILY_VELOCITY = "DAILY_VELOCITY";
    public static final String BALANCE_DRAIN = "BALANCE_DRAIN";
    public static final String HIGH_RISK_MERCHANT_CODE = "HIGH_RISK_MERCHANT_CODE";

    // Score Settings
    // Transactions needed before an account's transactions are checked
    private static final int MIN_HISTORY = 15;
    // transactions needed to know what is normal
    private static final BigDecimal MINIMUM_DEPOSIT = new BigDecimal("500");      // PASS_THROUGH: smallest deposit checked
    private static final int VELOCITY_MINIMUM_PAYMENTS = 10;                       // DAILY_VELOCITY: payments in one day
    private static final BigDecimal BALANCE_DRAIN_SHARE = new BigDecimal("0.8");  // BALANCE_DRAIN: share of balance spent

    // HIGH_RISK_MERCHANT_CODE: merchant category codes linked to potentially dodgy accounts
    private static final Map<String, String> HIGH_RISK_MERCHANT_CODES = Map.of(
            "7995", "gambling and betting",
            "4829", "money transfer",
            "6051", "money orders, foreign currency and crypto");


    public List<Transaction> flagAllTransactions() {

        List<Transaction> allFlagged = new ArrayList<>();

        for (Account account : accountService.getAccounts()) {
            allFlagged.addAll(flagTransactionsForAccount(account.getId()));
        }

        return allFlagged;
    }

    // Returns only the flagged transactions (AMBER or RED) for an account
    public List<Transaction> flagTransactionsForAccount(String accountID) {

        List<Transaction> coloured = colourTransactionsForAccount(accountID);

        if (coloured == null) {
            return null;
        }

        List<Transaction> flagged = new ArrayList<>();

        for (Transaction tx : coloured) {
            if (tx.getFlagColour() != FlagColour.GREEN) {
                flagged.add(tx);
            }
        }

        return flagged;
    }

    // Returns EVERY transaction for an account, oldest first, each with its flag colour:
    // GREEN = no rules fired, AMBER = one rule fired, RED = two or more rules fired.
    // This is the list to show when the user searches an account ID.
    @Override
    public List<Transaction> colourTransactionsForAccount(String accountID) {

        Account account = accountService.getAccount(accountID);

        if (account == null) {
            return null;
        }

        String currency = account.getCurrencyCode();
        BigDecimal availableBalance = account.getAvailable();

        // Oldest first; on the same day, money in comes before money out.
        // Transactions missing an amount or date cannot be checked, so they are skipped.
        List<Transaction> sorted = new ArrayList<>(
                transactionService.getTransactionsForAccount(accountID).stream()
                        .filter(t -> t.getAmount() != null && t.getDateTransaction() != null)
                        .toList()
        );

        sorted.sort(
                Comparator.comparing(Transaction::getDateTransaction)
                        .thenComparing(t -> isInflow(t) ? 0 : 1)
        );

        // Every transaction starts GREEN. The first MIN_HISTORY transactions only build the
        // picture of normal behaviour, so they stay GREEN.
        for (Transaction tx : sorted) {
            tx.setFlagColour(FlagColour.GREEN);
        }

        if (sorted.size() <= MIN_HISTORY) {
            return sorted;
        }

        LocalDate latestDate = sorted.get(sorted.size() - 1).getDateTransaction();

        // Every later transaction is checked against everything that happened before it.
        for (int i = MIN_HISTORY; i < sorted.size(); i++) {

            Transaction tx = sorted.get(i);

            List<Transaction> before = sorted.subList(0, i);

            List<String> reasons = new ArrayList<>();

            addReason(reasons, LARGE_AMOUNT,
                    largeAmount(tx, before, currency));

            addReason(reasons, PASS_THROUGH,
                    passThrough(tx, before, currency));

            addReason(reasons, NEW_MERCHANT,
                    newMerchant(tx, before, currency));

            addReason(reasons, FOREIGN_CURRENCY,
                    foreignCurrency(tx, currency));

            addReason(reasons, DAILY_VELOCITY,
                    dailyVelocity(tx, before));

            addReason(reasons, BALANCE_DRAIN,
                    balanceDrain(tx, currency, availableBalance, latestDate));

            addReason(reasons, HIGH_RISK_MERCHANT_CODE,
                    highRiskMerchantCode(tx));
            // Keeps the triggered fraud rule explanations available for the frontend
            tx.setRiskReasons(reasons);

// The number of rules that fired decides the colour: 0 GREEN, 1 AMBER, 2+ RED
            tx.setFlagColour(FlagColour.fromRuleCount(reasons.size()));

            // The number of rules that fired decides the colour: 0 GREEN, 1 AMBER, 2+ RED
//            tx.setFlagColour(FlagColour.fromRuleCount(reasons.size()));
        }

        return sorted;
    }

    // Rules: each returns an explanation if it fires, or null if not

    // A payment more than 3x the largest payment in the 30 days before it.
    private String largeAmount(Transaction tx, List<Transaction> before, String currency) {
        // To only check payments out in the accounts own currency
        if (!isOutflow(tx) || !isAccountCurrency(tx, currency)) return null;

        LocalDate from = tx.getDateTransaction().minusDays(30);
        Optional<BigDecimal> largest = before.stream()
                .filter(t -> isOutflow(t) && isAccountCurrency(t, currency))
                .filter(t -> t.getDateTransaction().isBefore(tx.getDateTransaction())
                        && !t.getDateTransaction().isBefore(from))
                .map(Transaction::getAmount)
                .max(BigDecimal::compareTo);

        // BigDecimal cannot be compared with < or >
        if (largest.isEmpty() || tx.getAmount().compareTo(largest.get().multiply(BigDecimal.valueOf(3))) <= 0) return null;
        return String.format("This was flagged as the payment of %s is %sx larger than this account's largest "
                        + "payment in the previous 30 days (%s). Unusually large payments can mean the account "
                        + "has been taken over or the customer is being scammed.",
                money(tx.getAmount(), tx.getCurrencyCode()),
                tx.getAmount().divide(largest.get(), 1, RoundingMode.HALF_UP),
                money(largest.get(), tx.getCurrencyCode()));
    }

    // Checks Money is being paid in then at least 80% leaves the account within 2 days. */
    private String passThrough(Transaction tx, List<Transaction> before, String currency) {
        if (!isOutflow(tx) || !isAccountCurrency(tx, currency)) return null;

        // Runs the loop backwards from most recent transaction
        // Breaks after transactions older than 2 days
        for (int i = before.size() - 1; i >= 0; i--) {
            Transaction deposit = before.get(i);
            if (deposit.getDateTransaction().isBefore(tx.getDateTransaction().minusDays(2))) break;
            if (!isInflow(deposit) || !isAccountCurrency(deposit, currency)
                    || deposit.getAmount().abs().compareTo(MINIMUM_DEPOSIT) < 0) continue;

            // Once a deposit is found it adds up every payment out since then and divides by the deposit
            // If the share is at least 80% within the last 2 days
            BigDecimal paidOut = tx.getAmount();
            for (int j = i + 1; j < before.size(); j++) {
                Transaction later = before.get(j);
                if (isOutflow(later) && isAccountCurrency(later, currency)) paidOut = paidOut.add(later.getAmount());
            }
            BigDecimal share = paidOut.divide(deposit.getAmount().abs(), 4, RoundingMode.HALF_UP);
            if (share.compareTo(new BigDecimal("0.8")) < 0) return null;
            return String.format("This was flagged as %d%% of a %s deposit received on %s left the account "
                            + "within 2 days. Money passing straight through an account is a common sign of a "
                            + "money mule account being used to move stolen funds.",
                    Math.min(100, share.multiply(BigDecimal.valueOf(100)).intValue()),
                    money(deposit.getAmount().abs(), deposit.getCurrencyCode()), deposit.getDateTransaction());
        }
        return null;
    }

    // First payment to someone, and bigger than the account's usual (median).
    private String newMerchant(Transaction tx, List<Transaction> before, String currency) {
        if (!isOutflow(tx) || !isAccountCurrency(tx, currency)) return null;
        String key = merchantKey(tx);
        if (before.stream().anyMatch(t -> merchantKey(t).equals(key))) return null;
        // Anymatch returns true as soon as it finds one earlier payment to the same 'merchant'

        // This calculates the median
        // Which is used to flag if new payments are irregularly higher than normal
        List<BigDecimal> amounts = before.stream()
                .filter(t -> isOutflow(t) && isAccountCurrency(t, currency))
                .filter(t -> t.getDateTransaction().isBefore(tx.getDateTransaction()))
                .map(Transaction::getAmount).sorted().toList();
        if (amounts.isEmpty()) return null;

        int mid = amounts.size() / 2;
        BigDecimal median = amounts.size() % 2 == 1 ? amounts.get(mid)
                : amounts.get(mid - 1).add(amounts.get(mid)).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        if (tx.getAmount().compareTo(median) <= 0) return null;
        return String.format("This was flagged as it is the first payment to \"%s\" and, at %s, it is larger "
                        + "than this account's usual payment of %s. Large payments to new payees are a common "
                        + "pattern in scams and unauthorised payments.",
                tx.getDescription(), money(tx.getAmount(), tx.getCurrencyCode()), money(median, tx.getCurrencyCode()));
    }

    // Any transaction in a currency other than the account's own.
    private String foreignCurrency(Transaction tx, String currency) {
        if (currency == null || tx.getCurrencyCode() == null || currency.equals(tx.getCurrencyCode())) return null;
        return String.format("This was flagged as the transaction of %s is in %s, while this account uses %s. "
                        + "Unexpected foreign transactions can mean card details are being used abroad.",
                money(tx.getAmount().abs(), tx.getCurrencyCode()), tx.getCurrencyCode(), currency);
    }

    // 10 or more payments out in a single day.
    private String dailyVelocity(Transaction tx, List<Transaction> before) {
        if (!isOutflow(tx)) return null;

        // Checks the amount of transactions made in one day
        long today = before.stream()
                .filter(t -> isOutflow(t) && t.getDateTransaction().equals(tx.getDateTransaction()))
                .count() + 1; // include this payment

        if (today < VELOCITY_MINIMUM_PAYMENTS) return null;
        return String.format("This was flagged as it was payment number %d out of the account on %s. A burst "
                        + "of payments in one day can mean stolen card details are being tested or the account "
                        + "is being emptied.",
                today, tx.getDateTransaction());
    }

    // A payment that used at least 80% of the money available before it was made.
    private String balanceDrain(Transaction tx, String currency, BigDecimal availableBalance, LocalDate latestDate) {
        if (availableBalance == null || !isOutflow(tx) || !isAccountCurrency(tx, currency)) return null;
        if (!tx.getDateTransaction().equals(latestDate)) return null;

        BigDecimal balanceBefore = availableBalance.add(tx.getAmount());
        if (balanceBefore.signum() <= 0) return null;

        BigDecimal share = tx.getAmount().divide(balanceBefore, 4, RoundingMode.HALF_UP);
        if (share.compareTo(BALANCE_DRAIN_SHARE) < 0) return null;
        return String.format("This was flagged as the payment of %s used %d%% of the money available in the "
                        + "account. Emptying an account quickly is typical after an account has been taken over.",
                money(tx.getAmount(), tx.getCurrencyCode()),
                Math.min(100, share.multiply(BigDecimal.valueOf(100)).intValue()));
    }

    // A payment to a merchant category commonly linked to fraud or money laundering.
    private String highRiskMerchantCode(Transaction tx) {
        String code = tx.getMerchantCategoryCode();
        if (!isOutflow(tx) || code == null || !HIGH_RISK_MERCHANT_CODES.containsKey(code)) return null;
        return String.format("This was flagged as the payment of %s went to merchant category %s (%s). This "
                        + "type of merchant is commonly linked to fraud and money laundering.",
                money(tx.getAmount(), tx.getCurrencyCode()), code, HIGH_RISK_MERCHANT_CODES.get(code));
    }

    // Helpers

    // Adds "RULE_CODE: explanation" to the list
    private static void addReason(List<String> reasons, String ruleCode, String explanation) {
        if (explanation != null) {
            reasons.add(ruleCode + ": " + explanation);
        }
    }

    private static boolean isOutflow(Transaction tx) {
        return tx.getAmount().signum() > 0;
    }

    private static boolean isInflow(Transaction tx) {
        return tx.getAmount().signum() < 0;
    }

    // True if the transaction is in the account's currency.
    private static boolean isAccountCurrency(Transaction tx, String currency) {
        return currency == null || currency.equals(tx.getCurrencyCode());
    }

    // Who was paid: Plaid's merchant ID or Description
    private static String merchantKey(Transaction tx) {
        if (tx.getMerchantEntityId() != null) {
            return tx.getMerchantEntityId();
        }
        return tx.getDescription() == null ? "" : tx.getDescription().trim().toUpperCase(Locale.ROOT);
    }

    // Formats an amount with its currency symbol, e.g. £950.00, $1,300.00
    private static String money(BigDecimal amount, String currency) {
        String number = String.format(Locale.UK, "%,.2f", amount.setScale(2, RoundingMode.HALF_UP));
        if (currency == null) return number;
        return switch (currency) {
            case "GBP" -> "\u00A3" + number;   // £
            case "USD" -> "$" + number;
            case "EUR" -> "\u20AC" + number;   // €
            default -> number + " " + currency;
        };
    }
}