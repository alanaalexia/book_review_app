const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");

const books = require("./books");
let users = require("./users");
const { authenticateJWT, SECRET } = require("./middleware/auth");

const app = express();
app.use(bodyParser.json());

// Sessão
app.use(session({
  secret: "sessionsecret",
  resave: false,
  saveUninitialized: true
}));

/* ===============================
   ROTAS PÚBLICAS (General Users)
================================= */

// 1. Get all books
app.get("/books", (req, res) => res.json(books));

// 2. Get book by ISBN
app.get("/books/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Livro não encontrado" });
  res.json(book);
});

// 3. Get books by author
app.get("/books/author/:author", (req, res) => {
  const result = Object.values(books).filter(b => b.author === req.params.author);
  res.json(result);
});

// 4. Get books by title
app.get("/books/title/:title", (req, res) => {
  const result = Object.values(books).filter(b => b.title === req.params.title);
  res.json(result);
});

// 5. Get book reviews
app.get("/books/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Livro não encontrado" });
  res.json(book.reviews);
});

/* ===============================
   ROTAS DE USUÁRIOS (Auth)
================================= */

// 6. Register new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "Usuário já existe" });
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  res.json({ message: "Usuário registrado com sucesso" });
});

// 7. Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Senha inválida" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

/* ===============================
   ROTAS PROTEGIDAS (Registered Users)
================================= */

// 8. Add/Modify review
app.post("/books/review/:isbn", authenticateJWT, (req, res) => {
  const { review } = req.body;
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Livro não encontrado" });

  book.reviews[req.user.username] = review;
  res.json({ message: "Review adicionado/modificado" });
});

// 9. Delete review
app.delete("/books/review/:isbn", authenticateJWT, (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Livro não encontrado" });

  delete book.reviews[req.user.username];
  res.json({ message: "Review deletado" });
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
