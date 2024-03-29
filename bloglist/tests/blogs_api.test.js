const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const helper = require("./test_helper");
const Blog = require("../models/blogs");
const User = require("../models/users");
const app = require("../app");

const testUserPassword = "sekret1";
const testUserName = "root";

const testUser = {
  username: testUserName,
  password: testUserPassword,
};

const getUserToken = async () => {
  const response = await api.post("/api/login").send(testUser);
  return response.body.token;
};

const api = supertest(app);

const generateUsers = async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash(testUserPassword, 10);
  const user = new User({ username: testUserName, passwordHash });

  await user.save();
};

let userToken;

beforeEach(async () => {
  await generateUsers();
  const userList = await helper.usersInDb();
  userToken = await getUserToken();

  await Blog.deleteMany({});
  await Blog.insertMany(helper.getBlogList(userList[0].id));
});

test("blogs are returned as json", async () => {
  const blogs = await api
    .get("/api/blogs")
    .set("Authorization", `Bearer ${userToken}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api
    .get("/api/blogs")
    .set("Authorization", `Bearer ${userToken}`);

  expect(response.body).toHaveLength(helper.initialBlogList.length);
});
xtest("user returns populated blogs", async () => {
  const users = await api.get("/api/users");

  await Blog.insertMany(helper.getBlogList(users.body[0].id));
  const updatedUsers = await api.get("/api/users");

  expect(updatedUsers.body[0].blogs.length).toBe(1);
});

describe("content of returned objects", () => {
  test("specific blog title is returned from the blogs call", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${userToken}`);

    const blogTitle = response.body.map((blog) => blog.title);

    expect(blogTitle).toContain("React patterns");
  });

  test("the first blog is about React Patterns", async () => {
    const response = await helper.blogsInDb();

    expect(response[0].title).toBe("React patterns");
  });
});

describe("create new blogs", () => {
  test("a valid blog can be added", async () => {
    await generateUsers();
    userToken = await getUserToken();
    const userList = await helper.usersInDb();

    const newBlog = {
      title:
        "Cracking the Coding Interview: 189 Programming Questions and Solutions",
      author: "Gayle Laakmann McDowell",
      url: "someurl",
      userID: userList[0].id,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogList.length + 1);

    const enduserlist = await helper.usersInDb();

    const contents = blogsAtEnd.map((blog) => blog.title);
    expect(contents).toContain(newBlog.title);
  });
  test("should return `unauthorized` error if token is not correct", async () => {
    await generateUsers();

    const userList = await helper.usersInDb();

    const newBlog = {
      title:
        "Cracking the Coding Interview: 189 Programming Questions and Solutions",
      author: "Gayle Laakmann McDowell",
      url: "someurl",
      userID: userList[0].id,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `invalid token`)
      .expect(401);
  });

  test("id should be defined on the DB documents", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${userToken}`);
    expect(response.body[1].id).toBeDefined();
  });

  test("if `likes` property is missing, it will be set as 0 by default", async () => {
    await generateUsers();
    userToken = await getUserToken();

    const userList = await helper.usersInDb();
    const newBlog = {
      title: "Test Driven Development: By Example",
      author: "Kent Beck",
      url: "someurl",
      userID: userList[0].id,
    };
    expect(newBlog.id).toBe(undefined);
    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const blogAdded = blogsAtEnd.filter((blog) => blog.title === newBlog.title);
    expect(blogAdded[0].likes).toBeDefined();
  });

  xtest("if `title` and `url` are missing return bad request", async () => {
    const newBlog = {
      author: "Kent Beck",
    };
    const hasProperties = Boolean(newBlog.title && newBlog.url);
    expect(hasProperties).toBe(false);
    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  xtest("should fail if `userID` is not provided", async () => {
    const newBlog = {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0,
    };

    const validBlog = Boolean(newBlog.userID);

    expect(validBlog).toBe(false);

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(400)
      .expect("missing properties");
  });
});

describe("delete a blog", () => {
  it("should delete a blog from the existent list", async () => {
    const blogList = await helper.blogsInDb();
    const id = blogList[1].id;
    expect(blogList).toHaveLength(helper.initialBlogList.length);
    await api
      .delete(`/api/blogs/${id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);
    const updatedBlogs = await helper.blogsInDb();
    expect(updatedBlogs).toHaveLength(helper.initialBlogList.length - 1);
  });
});

xdescribe("get request", () => {
  it("should return a blog document if the id provided exists", async () => {
    const blogList = await helper.blogsInDb();
    const id = blogList[0].id;
    const element = await api.get(`/api/blogs/${id}`).expect(201);

    expect(element.body.title).toBe(blogList[0].title);
  });
});

xdescribe("put request", () => {
  it("should update element in DB", async () => {
    const updateBlog = {
      url: "updatedURL",
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
