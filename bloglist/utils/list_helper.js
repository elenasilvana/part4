const dummy = (blogs) => {
    return 1;
}

const getItemBiggerNumber = (itemList, key) => {
    let index = 0
    let maxNum = 0;
    maxNum = itemList[0][key];

    itemList.forEach((item, i) => {
       if (item.likes > maxNum) {
           maxNum = item[key]
           index = i;
       }
    })
    return itemList[index]
}

const totalLikes = (posts) => {
    let result = 0;
    if (posts.length > 0) {
        posts.forEach((post) => {
            result += post.likes
        });
    }

    return result;
}


const favoriteBlog = (blogs) => {
  return getItemBiggerNumber(blogs, 'likes')
}

const mostBlogs = (blogs) => {
    const authors = {};
    let maxNum = 0;
    let author = blogs[0].author;

    blogs.forEach((blog) => {
       if (authors[blog.author]) {
           authors[blog.author] += 1
           if (authors[blog.author] > maxNum) {
               maxNum = authors[blog.author];
               author = blog.author
           }
       } else {
           authors[blog.author] = 1
       }
    });

    return {
        author: author,
        blogs: authors[author]
    }

};

const mostLikes = (blogs) => {
    const authors = {};
    let maxNum = blogs[0].likes;
    let author = blogs[0].author;

    blogs.forEach((blog) => {
        const currentAuthorCount = authors[blog.author]
       if (currentAuthorCount) {
           authors[blog.author] = currentAuthorCount + blog.likes
           if (authors[blog.author] > maxNum) {
               maxNum = authors[blog.author];
               author = blog.author
           }
       } else {
           authors[blog.author] = blog.likes
       }
    });

    return {
        author: author,
        likes: authors[author]
    }

}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}