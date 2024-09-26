# Webapp

## Description

This is a Node.js web application that utilizes Express, PostgreSQL, and Sequelize to provide a robust server environment. The application is configured with environment variables using `dotenv`.


## Installation and Running the Application

1. Clone the repository:

   ```bash
   git clone https://github.com/chetanpw98/Chetan-warad-webapp-forked.git 
   

2. Install the dependencies:
   ```bash
   npm install

3. Run the application
   ```bash
   node app.js

4. To start and stop to the Postgres Server
   ```bash
   net start postgresql-x64-16

   
   net stop postgresql-x64-16


5. To test the API request

   API Response Examples: 

   200 OK
   curl.exe -vvvv http://localhost:8080/healthz

   405 Method Not Allowed
   curl.exe -vvvv -XPUT http://localhost:8080/healthz

   503 Service Unavailable when disconnected to the database.
   curl.exe -vvvv http://localhost:8080/healthz  





