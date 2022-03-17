const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');
const User = require('../models/users');

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate('user');
    response.json(blogs);
  } catch (error) {
    console.error(error);
  }
});

blogsRouter.get('/:id', async (request, response) => {
  const { id } = request.params;
  try {
    const blog = await Blog.findById(id);
    response.status(201).json(blog);
  } catch (error) {
    console.log(error);
  }
});

blogsRouter.post('/', async (request, response) => {
  const { title, author, likes, url, userID } = request.body;

  let user = await User.findById(userID);

  const isValid = Boolean(url && author && userID && user);

  if (isValid) {
    const newBlog = {
      title,
      url,
      author,
      user: user._id,
      likes: likes || 0,
    };
    const blog = new Blog(newBlog);
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog.id);
    await user.save();
    response.status(201).json(savedBlog);
  } else {
    response.status(400).send('missing properties').end();
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  await Blog.findByIdAndRemove(id);
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params;
  const { url, likes } = request.body;

  if (url || likes) {
    const updated = {
      url,
      likes,
    };
    await Blog.findByIdAndUpdate(id, updated, { new: true });
    response.status(201).end();
  } else {
    response.status(400).end();
  }
});

module.exports = blogsRouter;
