const { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes } = require('../utils/list_helper');
const { blogs } = require('./utils/mockData');

test('dummy returns one', () => {
  const blogs = [];

  const result = dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  const posts = [{
    id: 'asdfadf',
    title: 'El viaje de la plántula',
    author: 'Elena Casillas',
    likes: 15
  }
];
  test('totalLikes should sum all likes from blog posts', () => {
  const result = totalLikes(posts)
    expect(result).toEqual(15)
  })
})

describe('favoriteBlog', () => {
  test('recieves a list of blogs and return the most liked', () => {
    const blogs = [
      {
        id: 'asdfadf',
        title: 'El viaje de la plántula',
        author: 'Elena Casillas',
        likes: 15
      },   {
          title: 'Canonical string reduction',
          author: 'Edsger W. Dijkstra',
          likes: 12
      }
  ];
  const favorite = favoriteBlog(blogs);

  expect(favorite).toEqual(blogs[0])
  })
});

describe('MostBlogs', () => {
  test('returns the author with more blog posts', () => {
    const result = mostBlogs(blogs);
    const expected = {
      author: 'Robert C. Martin',
      blogs: 3
    }
    expect(result).toEqual(expected)
  })
})

describe('MostLikes', () => {
  test('returns author with more likes', () => {
    const result = mostLikes(blogs)
    const expected = {
      author: 'Edsger W. Dijkstra',
      likes: 17
    };
    expect(result).toEqual(expected)
  })
})