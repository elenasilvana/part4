const { blogs } = require('./utils/mockData');
const Blog = require('../models/blogs')
const initialBlogList = blogs.slice(0,2);

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

module.exports = {
    initialBlogList, nonExistingId, blogsInDb
}