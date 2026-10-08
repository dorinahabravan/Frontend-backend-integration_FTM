package com.mthree.FraudAndTransactionRiskManager.dao.Mappers;

import com.mthree.FraudAndTransactionRiskManager.dto.Transaction;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class TransactionMapper implements RowMapper<Transaction> {

    public Transaction mapRow(ResultSet rs, int rowNum) throws SQLException {
        Transaction temp = new Transaction();

        temp.setId(rs.getString("id"));
        temp.setAccountId(rs.getString("account_id"));
        temp.setAmount(rs.getString("amount"));
        temp.setCurrencyCode(rs.getString("iso_currency_code"));



        String currency = temp.getCurrencyCode();

        if ("USD".equals(currency)) {
            temp.setCity("New York");
            temp.setCountry("USA");

        } else if ("GBP".equals(currency)) {
            temp.setCity("London");
            temp.setCountry("United Kingdom");

        } else if ("EUR".equals(currency)) {
            String[] cities = {"Madrid", "Paris", "Berlin", "Rome", "Amsterdam"};
            String[] countries = {"Spain", "France", "Germany", "Italy", "Netherlands"};

            int index = Math.floorMod(temp.getId().hashCode(), cities.length);

            temp.setCity(cities[index]);
            temp.setCountry(countries[index]);

        } else if ("JPY".equals(currency)) {
            temp.setCity("Tokyo");
            temp.setCountry("Japan");

        } else if ("CAD".equals(currency)) {
            temp.setCity("Toronto");
            temp.setCountry("Canada");

        } else if ("CHF".equals(currency)) {
            temp.setCity("Zurich");
            temp.setCountry("Switzerland");

        } else if ("AUD".equals(currency)) {
            temp.setCity("Sydney");
            temp.setCountry("Australia");

        } else {
            temp.setCity(null);
            temp.setCountry(null);
        }


        temp.setDescription(rs.getString("description"));
        temp.setPrimaryCategory(rs.getString("primary_category"));
        temp.setDetailedCategory(rs.getString("detailed_category"));
        temp.setChannel(rs.getString("payment_channel"));
        temp.setDateTransaction(rs.getString("date_transaction"));
        temp.setDateAuthorised(rs.getString("date_authorised"));
        //temp.setCity(rs.getString("city"));
        //temp.setCountry(rs.getString("country"));
        temp.setPending(rs.getBoolean("pending"));

        temp.setMerchantName(rs.getString("merchant_name"));
        temp.setMerchantEntityId(rs.getString("merchant_entity_id"));
        temp.setMerchantCategoryCode(rs.getString("merchant_category_code"));

        return temp;
    }
}
