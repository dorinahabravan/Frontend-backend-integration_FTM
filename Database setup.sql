DROP
DATABASE IF EXISTS FraudDB;


CREATE
DATABASE FraudDB;


USE
FraudDB;


-- ACCOUNTS
CREATE TABLE Accounts
(
    id                VARCHAR(40) PRIMARY KEY,
    account_name      VARCHAR(50),
    available         DECIMAL(19, 2) NULL,
    CURRENT           DECIMAL(19, 2) NULL,
    iso_currency_code VARCHAR(5),
    mask              VARCHAR(4),
    account_type      VARCHAR(50),
    account_subtype   VARCHAR(50)
);


-- TRANSACTIONS
CREATE TABLE Transactions
(
    id                     VARCHAR(40) PRIMARY KEY,
    account_id             VARCHAR(50),
    amount                 DECIMAL(19, 2),
    iso_currency_code      VARCHAR(5),
    description            VARCHAR(50),
    primary_category       VARCHAR(50),
    detailed_category      VARCHAR(50),
    payment_channel        VARCHAR(50),
    date_transaction       DATE,
    date_authorised        DATE,
    city                   VARCHAR(50),
    country                VARCHAR(50),
    pending                BOOLEAN,
    merchant_name          VARCHAR(100),
    merchant_entity_id     VARCHAR(50),
    merchant_category_code VARCHAR(4),
    CONSTRAINT FK_account FOREIGN KEY (account_id) REFERENCES Accounts (id)
);


-- CASES
CREATE TABLE Cases
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    account_id    VARCHAR(40),
    status        VARCHAR(30),
    score         INT,
    description   TEXT,
    open_date     DATETIME,
    close_date    DATETIME NULL,
    -- New columns
    decision      VARCHAR(50),
    decision_note TEXT,
    CONSTRAINT FK_account1 FOREIGN KEY (account_id) REFERENCES Accounts (id)
);


-- CASE TRANSACTIONS
CREATE TABLE case_transaction
(
    case_id        INT,
    transaction_id VARCHAR(40),
    CONSTRAINT FK_case FOREIGN KEY (case_id) REFERENCES Cases (id),
    CONSTRAINT FK_transaction FOREIGN KEY (transaction_id) REFERENCES Transactions (id)
);