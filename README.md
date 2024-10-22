# Webapp

## Description

This is a Node.js web application that utilizes Express, PostgreSQL, and Sequelize to provide a robust server environment. The application is configured with environment variables using `dotenv`.


## Installation and Running the Application

1. Clone the repository :

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

5. To run the Integration tests
   ```bash
   npm test

6. Endpoint URLs:

   Route to check if the server is healthy
   GET /healthz

   GET route to retrieve user details (Authenticated request)
   GET /v1/user/self

   POST route to add a new user to the database
   POST /v1/user

   PUT route to update user details (Authenticated request)
   PUT /v1/user/self

   Sample JSON Response for GET:
   ```bash
      {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane.doe@example.com",
      "account_created": "2016-08-29T09:12:33.001Z",
      "account_updated": "2016-08-29T09:12:33.001Z"
      }

   Status: 200 OK

   Sample JSON Request for POST:
      {
      "first_name": "Jane",
      "last_name": "Doe",
      "password": "skdjfhskdfjhg",
      "email": "jane.doe@example.com"
      }

   Status: 201 Created

   Sample JSON Request for PUT:
   {
   "first_name": "Jane",
   "last_name": "Doe",
   "password": "skdjfhskdfjhg"
   }

   Status: 204 No Content

Responses for GET/healthz:
```bash
   Status: 200 OK if it is healthy and no payload
   Status: 400 Bad Request
   Status: 503 if unhealthy

   Responses for other request methods for /healthz:
   Status: 405 Method Not Allowed




7. To test the API request

   API Response Examples: 

   200 OK

   curl.exe -vvvv http://localhost:8080/healthz

   405 Method Not Allowed

   curl.exe -vvvv -XPUT http://localhost:8080/healthz

   503 Service Unavailable when disconnected to the database.

   curl.exe -vvvv http://localhost:8080/healthz  




   Developer: Chetan Warad
   NUID: 002817179
   Email: warad.c@northeastern.edu
