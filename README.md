# CLOUD NATIVE WEB APPLICATION

## Description
A robust User Management Service built with Node.js and Express.js, enabling CRUD operations and email verification during user registration. Deployed on AWS, the infrastructure is provisioned using Terraform for scalability and efficiency.

Features

User Management: Comprehensive CRUD operations for managing user data.

Health Monitoring: A dedicated endpoint to track application health and connected service status.

Secure Deployment: Implements HTTPS with SSL certificates and customer-managed encryption keys to ensure data security.

Scalability and Reliability: Utilizes managed instance groups and load balancers for high availability and scalability.

Event-Driven Architecture: Sends verification emails through SendGrid by leveraging AWS SNS and Lambda Functions.

## Architecture Diagram
![Architecture Diagram](csye6225.jpeg)



## Installation and Running the Application 

1. Clone the repository :

   ```bash
   git clone https://github.com/chetan1398/Cloud-Native-Web-Application-.git
   

2. Install the dependencies:
   ```bash
   npm install

3. Run the application
   ```bash
   node app.js

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
   ```bash
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
