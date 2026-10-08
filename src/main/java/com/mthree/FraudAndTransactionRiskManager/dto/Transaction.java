package com.mthree.FraudAndTransactionRiskManager.dto;

import org.json.simple.JSONObject;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;


//unfinished
public class Transaction {

    private String id;
    private String accountId;
    private String plaidTransactionId;
    private BigDecimal amount;
    private String currencyCode;
    private String description;
    private String merchantName;
    private String merchantEntityId;
    private String merchantCategoryCode;
    private String primaryCategory;
    private String detailedCategory;
    private String channel;
    private LocalDate dateTransaction;
    private LocalDate dateAuthorised ;
    private String city;
    private String country;
    private Boolean pending;
    private FlagColour flagColour = FlagColour.GREEN;


    private List<String> riskReasons = new ArrayList<>();

    public String getId() {
        return id;
    }

    public String getAccountId() {
        return accountId;
    }

    public String getPlaidTransactionId() { return plaidTransactionId; }
    public void setPlaidTransactionId(String plaidTransactionId) { this.plaidTransactionId = plaidTransactionId; }

    public BigDecimal getAmount() {
        return amount;
    }
    public String getAmountAsString(){
        return amount.toString();
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public Boolean getPending() {
        return pending;
    }

    public LocalDate getDateAuthorised() {
        return dateAuthorised;
    }

    public LocalDate getDateTransaction() {
        return dateTransaction;
    }

    public String getChannel() {
        return channel;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public String getDescription() {
        return description;
    }

    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }

    public String getMerchantEntityId() { return merchantEntityId; }
    public void setMerchantEntityId(String merchantEntityId) { this.merchantEntityId = merchantEntityId; }

    public String getMerchantCategoryCode() { return merchantCategoryCode; }
    public void setMerchantCategoryCode(String merchantCategoryCode) { this.merchantCategoryCode = merchantCategoryCode; }

    public String getDetailedCategory() {
        return detailedCategory;
    }

    public String getPrimaryCategory() {
        return primaryCategory;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public void setAmount(String amount) {
        this.amount = new BigDecimal(amount);
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setDateAuthorised(LocalDate dateAuthorised) {
        this.dateAuthorised = dateAuthorised;
    }

    public void setDateAuthorised(String dateAuthorised) {
        DateTimeFormatter myFormatObj = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        this.dateAuthorised = LocalDate.parse(dateAuthorised, myFormatObj);
    }

    public void setDateTransaction(LocalDate dateTransaction) {
        this.dateTransaction = dateTransaction;
    }

    public void setDateTransaction(String dateTransaction) {
        DateTimeFormatter myFormatObj = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        this.dateTransaction = LocalDate.parse(dateTransaction, myFormatObj);
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDetailedCategory(String detailedCategory) {
        this.detailedCategory = detailedCategory;
    }

    public void setPending(Boolean pending) {
        this.pending = pending;
    }

    public void setPrimaryCategory(String primaryCategory) {
        this.primaryCategory = primaryCategory;
    }

    public FlagColour getFlagColour() { return flagColour; }

    public void setFlagColour(FlagColour flagColour) {
        this.flagColour = flagColour;
    }

    public List<String> getRiskReasons() {
        return riskReasons;
    }

    public void setRiskReasons(List<String> riskReasons) {
        this.riskReasons = riskReasons;
    }

    @Override
    public String toString() {
        return "Transaction{" +
                "id='" + id + '\'' +
                ", accountId='" + accountId + '\'' +
                ", plaidTransactionId='" + plaidTransactionId + '\'' +
                ", amount=" + amount +
                ", currencyCode='" + currencyCode + '\'' +
                ", description='" + description + '\'' +
                ", merchantName='" + merchantName + '\'' +
                ", merchantEntityId='" + merchantEntityId + '\'' +
                ", merchantCategoryCode='" + merchantCategoryCode + '\'' +
                ", primaryCategory='" + primaryCategory + '\'' +
                ", detailedCategory='" + detailedCategory + '\'' +
                ", channel='" + channel + '\'' +
                ", dateTransaction=" + dateTransaction +
                ", dateAuthorised=" + dateAuthorised +
                ", city='" + city + '\'' +
                ", country='" + country + '\'' +
                ", pending=" + pending +
                ", flag colour=" + flagColour +
                '}';
    }


}
