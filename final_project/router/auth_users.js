const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.query; // Review passed as a query parameter
  const username = req.session.authorization["username"]; // Logged-in user

  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Update or add review
  books[isbn].reviews[username] = review;

  res.status(200).json({
    message: `Review for ISBN ${isbn} updated/added successfully.`,
    reviews: books[isbn].reviews,
  });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization["username"]; // Logged-in user

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user." });
  }

  // Remove the review using `filter`-like approach
  books[isbn].reviews = Object.fromEntries(
    Object.entries(books[isbn].reviews).filter(([key]) => key !== username)
  );

  res.status(200).json({
    message: `Review for ISBN ${isbn} deleted successfully.`,
    reviews: books[isbn].reviews, // Return updated reviews
  });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
