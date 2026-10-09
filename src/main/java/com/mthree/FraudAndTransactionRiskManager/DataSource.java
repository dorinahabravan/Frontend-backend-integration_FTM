package com.mthree.FraudAndTransactionRiskManager;


import com.mysql.cj.jdbc.MysqlDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import java.sql.SQLException;

@Configuration
public class DataSource {

    @Bean
    public static MysqlDataSource getDataSource() throws SQLException {

        MysqlDataSource ds = new MysqlDataSource();
        ds.setServerName("localhost");
        ds.setDatabaseName("FraudDB");
        //Needed to avoid errors
        ds.setServerTimezone("Europe/London");
        ds.setUseSSL(false);

        ds.setUser("root");
        
        //Will need to be changed for other computers!!!
        ds.setPassword("DB_PASSWORD");
        ////////////////////////////////////////////
        
        ds.setAllowPublicKeyRetrieval(true);
        return ds;
    }

    // Registers the database connection details with Spring as the applications single DataSOurce bean.
    // There must be exactly one DataSource bean, or Spring cannot tell which one to inject.

    public javax.sql.DataSource mysqlDataSource() throws SQLException {
        return getDataSource();
    }

    // Creates the JdbcTemplate that every Dao receives through its constructor
    // Spring passes in the datasource bean above, so all queries use the same database connection
    @Bean
    public JdbcTemplate jdbcTemplate(javax.sql.DataSource dataSource) throws SQLException {
        return new JdbcTemplate(dataSource);
    }

    // Creates the transaction manager that @Transactional relies on
    // It must use the same DataSource as the JdbcTemplate, otherwise a rollback
    // would not undo the JdbcTemplate's changes.
    @Bean
    public PlatformTransactionManager transactionManager(javax.sql.DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

}
