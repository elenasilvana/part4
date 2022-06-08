const bcrypt = require('bcrypt');
const supertest = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/users');
const Blog = require('../models/blogs');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const generateBlogs = async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(helper.initialBlogList[0]);
  await blogObject.save();

  blogObject = new Blog(helper.initialBlogList[1]);
  await blogObject.save();
};

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await generateBlogs();
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret1', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  it('creates successfully an user with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'mochi',
      name: 'Mochi Gatita',
      password: 'asdf123',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  });

  it('should fail if username and password has less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: '12',
      password: 'ff',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('username and password should have at least 3 characters length');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtStart.length).toBe(usersAtEnd.length);
  });

  it('should not add user if user already exist', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'Mochi Gatita',
      password: 'asdf123',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect({ error: 'username already exists' });

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  it('should return existent users', async () => {
    const usersAtStart = await helper.usersInDb();
    const users = await api.get('/api/users');

    expect(users.body[0]).toHaveProperty('blogs');
    expect(users.body.length).toBe(usersAtStart.length);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
