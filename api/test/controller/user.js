/**
 * Integration tests for the /user controller
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import chai from 'chai';
import chaiHttp from 'chai-http';
import Mongoose from 'mongoose';
import mock from 'mock-mongoose';
import { generateToken } from '../../dist/service/auth.js';

chai.use(chaiHttp);

const mockMongoose = new mock.MockMongoose(Mongoose);

let app;
before(async () => {
  await mockMongoose.prepareStorage();
  app = await import('../../dist/main.js');
});

describe('User Controller', () => {

  const dudeData = {
    password: 'TheDudeAbides',
    'password-confirm': 'TheDudeAbides',
    email: 'thedude@lebowski.com'
  };

  // user registration tests
  describe('register', () => {

    before(async () => mockMongoose.helper.reset());

    it('needs a valid username', async () => {
      const res = await chai
        .request(app.default)
        .put('/api/user/d')
        .send(dudeData);
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('username');
    });

    it('needs a valid email', async () => {
      const res = await chai
        .request(app.default)
        .put('/api/user/dude')
        .send(Object.assign({}, dudeData, { email: 'invalid' }));
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('email');
    });

    it('needs matching passwords', async () => {
      const res = await chai
        .request(app.default)
        .put('/api/user/dude')
        .send(Object.assign({}, dudeData, { 'password-confirm': 'whoops' }));
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('password-confirm');
    });

    it('works when everything is good', async () => {
      const res = await chai
        .request(app.default)
        .put('/api/user/dude')
        .send(dudeData);
      chai.expect(res).to.have.status(201);
    });

    it(`won't insert duplicate emails`, async () => {
      const res = await chai
        .request(app.default)
        .put('/api/user/dude1')
        .send(dudeData);
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('email');
    });

    it(`won't insert duplicate usernames`, async () => {
      const res = await chai
        .request(app.default)
        .put('/api/user/dude')
        .send(Object.assign({}, dudeData, { email: 'dude1@lebowski.com' }));
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('username');
    });

  });

  // user auth tests
  describe('auth', () => {

    before(async () => {
      await mockMongoose.helper.reset();
      await chai
        .request(app.default)
        .put('/api/user/dude')
        .send(dudeData);
    });

    it('should fail for an invalid username/email', async () => {
      const res = await chai
        .request(app.default)
        .post('/api/user/token')
        .send({
          user: 'flynn@thearcade.com',
          password: dudeData.password
        });
      chai.expect(res).to.have.status(401);
    });

    it('should fail for an invalid password', async () => {
      const res = await chai
        .request(app.default)
        .post('/api/user/token')
        .send({
          user: dudeData.email,
          password: 'JustLikeYourOpinion'
        });
      chai.expect(res).to.have.status(401);
    });

    it('should return a token for valid email/password', async () => {
      const res = await chai
        .request(app.default)
        .post('/api/user/token')
        .send({
          user: dudeData.email,
          password: dudeData.password
        });
      chai.expect(res).to.have.status(200);
      chai.expect(res.body.token).to.not.be.empty;
    });

    it('should return a token for valid username/password', async () => {
      const res = await chai
        .request(app.default)
        .post('/api/user/token')
        .send({
          user: 'dude',
          password: dudeData.password
        });
      chai.expect(res).to.have.status(200);
      chai.expect(res.body.token).to.not.be.empty;
    });

  });

  // event creation tests
  describe('events', () => {

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventData = {
      name: 'Bowling',
      start: today.toISOString(),
      end: tomorrow.toISOString()
    };

    before(async () => {
      await mockMongoose.helper.reset();
      await chai
        .request(app.default)
        .put('/api/user/dude')
        .send(dudeData);
    });

    it('should prevent creation without a token', async () => {
      const res = await chai
        .request(app.default)
        .put('/api/user/event')
        .send(eventData);
      chai.expect(res).to.have.status(401);
    });

    it('should prevent creation without a name', async () => {
      const token = await generateToken('dude');
      const res = await chai
        .request(app.default)
        .put('/api/user/event')
        .send(Object.assign({}, eventData, { 'name': '' }))
        .set('Authorization', `Bearer ${token}`);
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('name');
    });

    it('should prevent creation with a bad start', async () => {
      const token = await generateToken('dude');
      const res = await chai
        .request(app.default)
        .put('/api/user/event')
        .send(Object.assign({}, eventData, { 'start': 'yesterday' }))
        .set('Authorization', `Bearer ${token}`);
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('start');
    });

    it('should prevent creation with a bad end', async () => {
      const token = await generateToken('dude');
      const res = await chai
        .request(app.default)
        .put('/api/user/event')
        .send(Object.assign({}, eventData, { 'end': 'yesterday' }))
        .set('Authorization', `Bearer ${token}`);
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('end');
    });

    it('should prevent creation with invalid duration', async () => {
      const token = await generateToken('dude');
      const res = await chai
        .request(app.default)
        .put('/api/user/event')
        .send({
          name: 'Bowling',
          start: tomorrow.toISOString(),
          end: today.toISOString()
        })
        .set('Authorization', `Bearer ${token}`);
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('end');
    });

  });

});
