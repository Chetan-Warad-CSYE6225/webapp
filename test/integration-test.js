import dotenv from 'dotenv';
import supertest from 'supertest';
import { expect } from 'chai';

import app from '../src/app.js';
const request = supertest(app);

dotenv.config();

const port = process.env.SERVER_PORT;
console.log(port)

describe('User API', async function() {
  it('Test 1 - Create an account, and using the GET call, validate account exists', async function() {
    const userData = {
        email: 'test17@example.com',
        password: 'Password123@',
        first_name: 'John',
        last_name: 'Doe',
        is_verified: true
    
      };

      const createResponse = await request
      .post('/v1/user')
      .send(userData)
      .expect(201);

      const createdUser = createResponse.body;
      
      const updatedResponse = await request
      .get('/v1/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userData.email + ':' + userData.password).toString('base64'))
      .expect(200);
      const retrievedUser = updatedResponse.body;

      expect(retrievedUser.first_name).to.deep.equal(createdUser.first_name);
      expect(retrievedUser.id).to.deep.equal(createdUser.id);
      expect(retrievedUser.last_name).to.deep.equal(createdUser.last_name);
      expect(retrievedUser.email).to.deep.equal(createdUser.email);
  });

  it('Test 2 - Update the account and using the GET call, validate the account was updated', async function() {
    const userData = {
      email: 'test17@example.com',
      password: 'Password123@',
      first_name: 'John',
      last_name: 'Doe'
    };
    const userDataUpdate = {
        password: 'Password123@2344',
        first_name: 'JohnDa',
        last_name: 'Doe'
      };

      const createResponse = await request
      .put('/v1/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userData.email + ':' + userData.password).toString('base64'))
      .send(userDataUpdate)
      .expect(204);

      const updatedResponse = await request
      .get('/v1/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userData.email + ':' + userDataUpdate.password).toString('base64'))
      .expect(200);

      const retrievedUser = updatedResponse.body;
      expect(userDataUpdate.first_name).to.deep.equal(retrievedUser.first_name);
      expect(userDataUpdate.last_name).to.deep.equal(retrievedUser.last_name);
  });
});
