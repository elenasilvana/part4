const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/users');

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;


    const isValid = username.length >= 3 && password.length >= 3;
    if (!isValid) {
      return response
        .status(400)
        .send('username and password should have at least 3 characters length')
        .end();
    }
  const existingUser = await User.findOne({ username })
	if (existingUser) {
		return response.status(400).json({
			error: 'username already exists'
		})
	}

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

	const user = new User({
		username,
		name,
		passwordHash,
	})

	const savedUser = await user.save()
	response.status(201).json(savedUser)

});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1 })

  response.status(200).json(users);

});

module.exports = usersRouter;
