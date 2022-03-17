const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');
const Blog = require('../models/blogs');
const User = require('../models/users');
const app = require('../app');

const api = supertest(app);

const generateUsers = async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret1', 10);
  const user = new User({ username: 'root', passwordHash });

  await user.save();
};

beforeEach(async () => {
  await generateUsers();
  const userList = await helper.usersInDb();
  await Blog.deleteMany({});

  let blogObject = new Blog({
    ...helper.initialBlogList[0],
    userID: userList[0].id,
  });
  await blogObject.save();

  blogObject = new Blog({
    ...helper.initialBlogList[1],
    userID: userList[0].id,
  });
  await blogObject.save();
});

test('blogs are returned as json', async () => {
  const blogs = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  //console.log('///////////////////blogs', blogs.body);
});

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(helper.initialBlogList.length);
});
test('user returns populated blogs', async() => {
  const users = await api.get('/api/users');
  console.log('user should have blogs/////////', users.body[0].blogs)
  expect(users.body[0].blogs.length).toBe(1)
})

describe('content of returned objects', () => {
  test('specific blog title is returned from the blogs call', async () => {
    const response = await api.get('/api/blogs');

    const blogTitle = response.body.map((blog) => blog.title);

    expect(blogTitle).toContain('React patterns');
  });

  test('the first blog is about React Patterns', async () => {
    const response = await helper.blogsInDb();

    expect(response[0].title).toBe('React patterns');
  });
});

describe('create new blogs', () => {
  test('a valid blog can be added', async () => {
    await generateUsers();
    const userList = await helper.usersInDb();

    const newBlog = {
      title:
        'Cracking the Coding Interview: 189 Programming Questions and Solutions',
      author: 'Gayle Laakmann McDowell',
      url: 'someurl',
      userID: userList[0].id,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogList.length + 1);

    const enduserlist = await helper.usersInDb();

    const contents = blogsAtEnd.map((blog) => blog.title);
    expect(contents).toContain(newBlog.title);
  });

  test('id should be defined on the DB documents', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[1].id).toBeDefined();
  });

  test('if `likes` property is missing, it will be set as 0 by default', async () => {
    await generateUsers();
    const userList = await helper.usersInDb();
    const newBlog = {
      title: 'Test Driven Development: By Example',
      author: 'Kent Beck',
      url: 'someurl',
      userID: userList[0].id,
    };
    expect(newBlog.id).toBe(undefined);
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const blogAdded = blogsAtEnd.filter((blog) => blog.title === newBlog.title);
    expect(blogAdded[0].likes).toBeDefined();
  });

  test('if `title` and `url` are missing return bad request', async () => {
    const newBlog = {
      author: 'Kent Beck',
    };
    const hasProperties = Boolean(newBlog.title && newBlog.url);
    expect(hasProperties).toBe(false);
    await api.post('/api/blogs').send(newBlog).expect(400);
  });

  test('should fail if `userID` is not provided', async () => {
    const newBlog = {
      _id: '5a422bc61b54a676234d17fc',
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
      __v: 0,
    };

    const validBlog = Boolean(newBlog.userID);

    expect(validBlog).toBe(false);

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('missing properties');
  });
});

describe('delete a blog', () => {
  it('should delete a blog from the existent list', async () => {
    const blogList = await helper.blogsInDb();
    const id = blogList[1].id;
    expect(blogList).toHaveLength(helper.initialBlogList.length);
    await api.delete(`/api/blogs/${id}`).expect(204);
    const updatedBlogs = await helper.blogsInDb();
    expect(updatedBlogs).toHaveLength(helper.initialBlogList.length - 1);
  });
});

describe('get request', () => {
  it('should return a blog document if the id provided exists', async () => {
    const blogList = await helper.blogsInDb();
    const id = blogList[0].id;
    const element = await api.get(`/api/blogs/${id}`).expect(201);

    expect(element.body.title).toBe(blogList[0].title);
  });
});

describe('put request', () => {
  it('should update element in DB', async () => {
    const updateBlog = {
      url: 'updatedURL',
    };
    const blogList = await helper.blogsInDb();
    const id = blogList[0].id;
    await api.put(`/api/blogs/${id}`).send(updateBlog).expect(201);
    const updatedBlogList = await helper.blogsInDb();
    expect(updatedBlogList[0].url).toBe(updateBlog.url);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
