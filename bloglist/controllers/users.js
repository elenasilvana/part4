const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/users');

usersRouter.post('/', async (request, response) => {
  const { body } = request;
  const { username, name, password } = body;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const isValid = username.length >= 3 && password.length >= 3;

  if (!isValid) {
    response
      .status(400)
      .send('username and password should have at least 3 characters length')
      .end();
  } else {
    const user = new User({
      username: username,
      name: name,
      passwordHash,
    });

    const userFound = await User.find({ username: user.username });

    if (userFound.length !== 0) {
      response.status(400).send('username already exists').end();
    } else {
      const savedUser = await user.save();
      response.status(200).json(savedUser);
    }
  }
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1 });

  response.status(200).json(users);
});

module.exports = usersRouter;
