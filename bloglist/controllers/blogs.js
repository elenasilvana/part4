const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
    response.json(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get('/:id', async (request, response, next) => {
  const { id } = request.params;
  try {
    const blog = await Blog.findById(id);
    response.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/', async (request, response, next) => {
  const { title, author, likes, url, userID } = request.body;
  const { user } = request

  try {

    const isValid = Boolean(url && author && user);

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

      user.blogs = user.blogs.concat(savedBlog._id);

      response.status(201).json(savedBlog);
    } else {
      response.status(400).send('missing properties').end();
    }

  } catch (error) {
    next(error)
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  try { 
    let blog = await Blog.findById(id)
  
    if (`${user._id}` === `${blog.user}`)  {
      const noteToRemove = await Blog.findByIdAndRemove(id)
      if (noteToRemove) {
        return response.status(204).end()
      }
    } 

  } catch(error) {
    return response
					.status(401)
					.json({
						error: 'operation not allowed',
					})
					.end();
  }

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
