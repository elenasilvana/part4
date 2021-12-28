const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');

blogsRouter.get('/', (request, response) => {
  try {
    Blog.find({}).then((blogs) => {
      response.json(blogs);
    });

  } catch (error) {
    console.error(error)
  }
});

blogsRouter.post('/', (request, response) => {
  const { title, author, likes, url } = request.body;

    if (url && author) {
      const newBlog = {
        title,
        url,
        author,
        likes: likes || 0
      }
      const blog = new Blog(newBlog);
      blog.save().then((result) => {
        response.status(201).json(result);
      });
    } else {
      response.status(400).end();
    }
});

module.exports = blogsRouter;
