const logger = require('./logger');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

const requestLogger = (request, response, next) => {
  const { method, path, body } = request;
  logger.info(` --- method: ${method} Path: ${path}`);
  method === 'POST' && logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    //why is not printing these errors?
    return response.status(401).json({
      error: 'invalid token'
    })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
	}
  next()
}

const userExtractor = async (request, response, next) => {
  const {token} = request;
  if (!token) return response.status(401).json({ error: 'token missing' })
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) return response.status(401).json({ error: 'token missing or invalid' })
  let user =  await User.findById(decodedToken.id);
  if (user) {
    request.user = user;

  }

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
};
