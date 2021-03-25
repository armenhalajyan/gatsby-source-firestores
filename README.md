# gatsby-firesource [![npm version](https://badge.fury.io/js/gatsby-firesource.svg)](https://badge.fury.io/js/gatsby-firesource)

Gatsby source plugin for building websites using Firestore as a data source.

# Usage

1. Get a private key for each Firebase project.
2. Put the private keys somewhere in your Gatsby project.
3. `$ npm i gatsby-source-firestores`
4. Configure `gatsby-config.js`

```javascript
module.exports = {
    plugins: [
        {
            resolve: 'gatsby-source-firestores',
            options: {
                bases: [
                    {
                        credential: require('./books.firebase.json'),
                        types: [
                            {
                                type: 'Book',
                                collection: 'books',
                                map: (doc) => ({
                                    title: doc.title,
                                    isbn: doc.isbn,
                                    author___NODE: doc.author.id,
                                }),
                            },
                            {
                                type: 'Author',
                                collection: 'authors',
                                map: (doc) => ({
                                    name: doc.name,
                                    country: doc.country,
                                    books___NODE: doc.books.map(
                                        (book) => book.id
                                    ),
                                }),
                            },
                        ],
                    },

                    {
                        credential: require('./blog.firebase.json'), 
                        types: [
                            {
                                type: 'Post', 
                                collection: 'posts', 
                                map: (doc) => ({
                                    title: doc.title, 
                                    user___NODE: doc.user.id
                                }), 
                            },
                            {
                                type: 'User',
                                collection: 'users',
                                map: (doc) => ({
                                    name: doc.name, 
                                    email: user.email,
                                    posts___NODE: doc.posts.map(
                                        (post) => post.id
                                    ),
                                }),
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
```

5. To query

```graphql
{
    allBook {
        edges {
            node {
                title
                isbn
                author {
                    name
                }
            }
        }
    }
    allPost {
        edges {
            node {
                title
                user {
                    name
                }
            }
        }
    }
}
```

# Configurations

| Key        | Description                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| bases      | Array of databases, which require credential and types keys                                                                           |
| credential | Require your private key here                                                                                                               |
| types      | Array of types, which require the following 3 keys                                                                                          |
| type       | The type of the collection, which will be used in GraphQL queries. Eg, when `type = Book`, the GraphQL types are named `book` and `allBook` |
| collection | The name of the collections in Firestore. Nested collections are **not** tested.                                                            |
| map        | A function to map your data in Firestore to Gatsby nodes, utilize the undocumented `___NODE` to link between nodes                          |

# Disclaimer

This project is created solely to suit our requirements, no maintenance/warranty are provided. Feel free to send in pull requests.

# Acknowledgement

[gatsby-firesource](https://github.com/tomphill/gatsby-firesource)
