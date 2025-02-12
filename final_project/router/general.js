const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here

  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  const getBooks = new Promise((resolve, reject) => {
    if (!books) {
      reject({ message: "Book Not found" });
    } else {
      resolve(books);
    }
  });
  getBooks
    .then((data) => res.status(300).json(data))
    .catch((error) => res.status(400).json(error));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const getBooksByIsbn = new Promise((resolve, reject) => {
    let isbn = parseInt(req.params.isbn);

    if (isbn < 1 || isbn > 10) {
      reject({ message: "Not a valid ISBN number" });
    } else {
      resolve(books[isbn]);
    }
  });

  getBooksByIsbn
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).json(error));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const authorName = req.params.author;
    const booksByAuthor = Object.keys(books)
      .filter(
        (key) => books[key].author.toLowerCase() === authorName.toLowerCase()
      )
      .reduce((result, key) => {
        result[key] = books[key];
        return result;
      }, {});
    if (Object.keys(booksByAuthor).length > 0) {
      resolve(booksByAuthor);
    } else {
      reject({ message: "Books with this author not found" });
    }
  });
  getBooksByAuthor
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).json(error));
});
// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  const getBooksBytitle = new Promise((resolve, reject) => {
    const bookTitle = req.params.title;
    const booksByTitle = Object.keys(books)
      .filter((key) => books[key].title === bookTitle)
      .reduce((result, key) => {
        result[key] = books[key];
        return result;
      }, {});
    if (Object.keys(booksByTitle).length > 0) {
      resolve(booksByTitle);
    } else {
      reject({ message: "Books with this title not found" });
    }
  });
  getBooksBytitle
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).json(error));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const bookIsbn = req.params.isbn;
  if (books[bookIsbn]) {
    return res.status(200).json({ [bookIsbn]: books[bookIsbn] });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
