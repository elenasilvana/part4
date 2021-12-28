const isNotTestMode = process.env.NODE_ENV !== 'test'

const info = (...params) => {
  if (isNotTestMode) {
    console.log(...params);
  }
};

const error = (...params) => {
  if (isNotTestMode) {
    console.error(...params);
  }
};

module.exports = {
  info,
  error,
};
