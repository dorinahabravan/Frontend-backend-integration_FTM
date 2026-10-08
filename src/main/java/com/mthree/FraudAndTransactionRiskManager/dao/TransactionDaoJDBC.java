package com.mthree.FraudAndTransactionRiskManager.dao;

import com.mthree.FraudAndTransactionRiskManager.DataSource;
import com.mthree.FraudAndTransactionRiskManager.dao.Mappers.TransactionMapper;
import com.mthree.FraudAndTransactionRiskManager.dto.Transaction;
import com.mysql.cj.jdbc.MysqlDataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TransactionDaoJDBC implements TransactionDao{
    private final JdbcTemplate jdbc;

    public TransactionDaoJDBC(JdbcTemplate j) throws SQLException {
        jdbc = j;
    }

    @Override
    public List<Transaction> getTransactions(){
        List<Transaction> list = jdbc.query("SELECT * FROM Transactions", new TransactionMapper());
        System.out.println(list.get(0).getCity());
        return list;
    }

    @Override
    public void updateTransactions() {
        throw new UnsupportedOperationException();
    }


    @Override
    public Transaction findTransactionById(String transactionId) {
        String sql = "SELECT * FROM Transactions WHERE id = ?";

        List<Transaction> transactions = jdbc.query(
                sql,
                new TransactionMapper(),
                transactionId
        );

        return transactions.isEmpty() ? null : transactions.get(0);
    }


    @Override
    public List<Transaction> findTransactionsByAccountId(String accountId) {
        return jdbc.query("SELECT * FROM Transactions WHERE account_id = '" + accountId + "';", new TransactionMapper());
    }
}
