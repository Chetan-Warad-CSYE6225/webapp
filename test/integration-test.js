import dotenv from 'dotenv';
import supertest from 'supertest';
import { expect } from 'chai';

import app from '../src/app.js'; // Adjust this path if necessary
const request = supertest(app);

dotenv.config();

const port = process.env.SERVER_PORT;
console.log(`Server port: ${port}`);

describe('User API', function () {
  // Test 1: Create a user and validate the account exists
  it('Test 1 - Create an account, and using the GET call, validate account exists', async function () {
    try {
      const userData = {
        email: 'testuser1123@example.com',
        password: 'Password123@',
        first_name: 'John',
        last_name: 'Doe',
      };

      // Bypass email verification by setting `is_verified: true`
      const createResponse = await request
        .post('/v1/user')
        .send({ ...userData, is_verified: true })
        .expect(201);

      const createdUser = createResponse.body;

      // Validate the account exists with a GET request
      const updatedResponse = await request
        .get('/v1/user/self')
        .set(
          'Authorization',
          'Basic ' +
            Buffer.from(userData.email + ':' + userData.password).toString('base64')
        )
        .expect(200);

      const retrievedUser = updatedResponse.body;

      // Assertions to ensure the retrieved user matches the created user
      expect(retrievedUser.first_name).to.equal(createdUser.first_name);
      expect(retrievedUser.last_name).to.equal(createdUser.last_name);
      expect(retrievedUser.email).to.equal(createdUser.email);
      console.log('Test 1 passed successfully.');
    } catch (error) {
      console.error('Test 1 failed:', error.message);
      throw error; // Ensure the test fails in case of an error
    }
  });

  // Test 2: Update a user and validate the account was updated
  it('Test 2 - Update the account and using the GET call, validate the account was updated', async function () {
    try {
      const userData = {
        email: 'testuser1123@example.com',
        password: 'Password123@',
        first_name: 'John',
        last_name: 'Doe',
      };

      const userDataUpdate = {
        password: 'Password456@',
        first_name: 'Johnny',
        last_name: 'Doe',
      };

      // Update user information
      await request
        .put('/v1/user/self')
        .set(
          'Authorization',
          'Basic ' +
            Buffer.from(userData.email + ':' + userData.password).toString('base64')
        )
        .send(userDataUpdate)
        .expect(204);

      // Validate the updated user information with a GET request
      const updatedResponse = await request
        .get('/v1/user/self')
        .set(
          'Authorization',
          'Basic ' +
            Buffer.from(
              userData.email + ':' + userDataUpdate.password
            ).toString('base64')
        )
        .expect(200);

      const retrievedUser = updatedResponse.body;

      // Assertions to ensure the updated fields match
      expect(retrievedUser.first_name).to.equal(userDataUpdate.first_name);
      expect(retrievedUser.last_name).to.equal(userDataUpdate.last_name);
      console.log('Test 2 passed successfully.');
    } catch (error) {
      console.error('Test 2 failed:', error.message);
      throw error; // Ensure the test fails in case of an error
    }
  });
});
