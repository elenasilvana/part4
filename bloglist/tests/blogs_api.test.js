const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const Blog = require('../models/blogs');
const app = require('../app')

const api = supertest(app);

beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(helper.initialBlogList[0])
    await blogObject.save()

    blogObject = new Blog(helper.initialBlogList[1])
    await blogObject.save()
})

test('notes are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
}, 100000)

test('all notes are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogList.length)
})

describe('content of returned objects', () => {
    test('specific blog title is returned from the blogs call', async () => {
        const response = await api.get('/api/blogs');
    
        const blogTitle = response.body.map(blog => blog.title)
    
        expect(blogTitle).toContain('React patterns')
    })
    
    test('the first blog is about React Patterns', async () => {
        const response = await api.get('/api/blogs')
    
        expect(response.body[0].title).toBe('React patterns')
    })
})

describe('create new blogs', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'Cracking the Coding Interview: 189 Programming Questions and Solutions',
            author: 'Gayle Laakmann McDowell',
            url: 'someurl'
        }
    
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogList.length + 1)
    
        const contents = blogsAtEnd.map(blog => blog.title)
        expect(contents).toContain(newBlog.title)
    })
    
    test('id should be defined on the DB documents', async () => {
        const response = await api.get('/api/blogs');
        expect(response.body[1].id).toBeDefined()
    })
    
    test('if `likes` property is missing, it will be set as 0 by default', async () => {
        const newBlog = {
            title: 'Test Driven Development: By Example',
            author: 'Kent Beck',
            url: 'someurl'
        }
        expect(newBlog.id).toBe(undefined)
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
        const blogsAtEnd = await helper.blogsInDb();
        const blogAdded = blogsAtEnd.filter(blog => blog.title === newBlog.title)
        expect(blogAdded[0].likes).toBeDefined()
    })
    
    test('if `title` and `url` are missing return bad request',  async () =>  {
        const newBlog = {
            author: 'Kent Beck'
        }
        const hasProperties = Boolean(newBlog.title && newBlog.url)
        expect(hasProperties).toBe(false);
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    }, 10000)
});

describe('delete a blog', () => {
    it('should delete a blog from the existent list', async () => {
        const response = await api.get('/api/blogs');
        const id = response.body[1].id;
        expect(response.body).toHaveLength(helper.initialBlogList.length);
        await api
        .delete(`/api/blogs/${id}`)
        .expect(204)
    })
})


afterAll( () => {
     mongoose.connection.close()

})