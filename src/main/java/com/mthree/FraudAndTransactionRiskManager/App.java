package com.mthree.FraudAndTransactionRiskManager;

import org.json.simple.parser.ParseException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

import java.sql.SQLException;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
//unfinished

public class App {

    public static void main(String[] args) throws ParseException, SQLException {

        SpringApplication.run(App.class, args);



    }


}

