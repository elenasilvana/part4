const { blogs } = require('./utils/mockData');
const Blog = require('../models/blogs');
const User = require('../models/users');
const initialBlogList = blogs.slice(0,2);

const getBlogList = (id) =>  initialBlogList.map((blog) => {
  return { ...blog, userID: id, user: id
  }

})

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'me' });
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogList, nonExistingId, blogsInDb, usersInDb, getBlogList
}