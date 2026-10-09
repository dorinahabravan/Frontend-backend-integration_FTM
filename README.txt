Created by Team 3:
Dorina Habravan
Reece Gilliland
Sean Meaney
Romaan Mahmood

Setup instructions:
First you need to ensure you run SQL_test.sql in MYSQL to set up the database
Then you need to navigate to src/main/java/com/mthree/FraudAndTransactionRiskManager/DataSource.java.
On line 29, it says: ds.setPassword("DB_PASSWORD"));
This must be changed to reflect the password you used when setting up you local host environment for the database

To run it, ensure you run src/main/java/com/mthree/FraudAndTransactionRiskManager/App.java
This will run the backend

Then, using command prompt, you must navigate to: FraudAndTransactionRiskManager-frontend
And run: npm install
Finally, you must then run: npm run dev -- --port 5175

To see the result, open localhost:5175 on a browser!
