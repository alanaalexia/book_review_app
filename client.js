// client.js
// ======================================================
// Book Review Client – Tasks 10–13
// - Task 10: Get all books – async function + Node-style callback
// - Task 11: Search by ISBN – Promises (then/catch)
// - Task 12: Search by Author – async/await
// - Task 13: Search by Title – async/await
// CLI usage examples at the bottom.
// ======================================================

const axios = require("axios");

// Permite mudar a URL via variável de ambiente, se quiser (ex.: na nuvem)
// Por padrão usa localhost:3000 (igual ao index.js)
const BASE_URL = process.env.BOOKS_API_URL || "http://localhost:3000";

// -----------------------------
// Task 10 – Get all books (callback)
// cb signature: (error, data)
// -----------------------------
async function getAllBooks(cb) {
  try {
    const res = await axios.get(`${BASE_URL}/books`, { timeout: 5000 });
    cb(null, res.data);
  } catch (err) {
    const msg = err.response
      ? `HTTP ${err.response.status} ${err.response.statusText}`
      : err.message;
    cb(new Error(msg));
  }
}

// -----------------------------
// Task 11 – Search by ISBN (Promises)
// -----------------------------
function getBookByISBN(isbn) {
  return axios
    .get(`${BASE_URL}/books/isbn/${encodeURIComponent(isbn)}`, { timeout: 5000 })
    .then((res) => {
      console.log("✅ Book by ISBN:", isbn);
      console.log(JSON.stringify(res.data, null, 2));
      return res.data;
    })
    .catch((err) => {
      if (err.response) {
        console.error(`❌ HTTP ${err.response.status} ${err.response.statusText}`);
        console.error(err.response.data);
      } else {
        console.error("❌ Error:", err.message);
      }
      throw err;
    });
}

// -----------------------------
// Task 12 – Search by Author (async/await)
// -----------------------------
async function getBooksByAuthor(author) {
  try {
    const url = `${BASE_URL}/books/author/${encodeURIComponent(author)}`;
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`✅ Books by author: ${author}`);
    console.log(JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error(`❌ HTTP ${err.response.status}:`, err.response.data);
    } else {
      console.error("❌ Error:", err.message);
    }
    throw err;
  }
}

// -----------------------------
// Task 13 – Search by Title (async/await)
// -----------------------------
async function getBooksByTitle(title) {
  try {
    const url = `${BASE_URL}/books/title/${encodeURIComponent(title)}`;
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`✅ Books by title: ${title}`);
    console.log(JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error(`❌ HTTP ${err.response.status}:`, err.response.data);
    } else {
      console.error("❌ Error:", err.message);
    }
    throw err;
  }
}

// -----------------------------
// CLI Runner – execute um comando por vez
// -----------------------------
if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);

  switch (cmd) {
    case "all": {
      // Task 10
      return getAllBooks((err, data) => {
        if (err) {
          console.error("GET /books failed:", err.message);
          process.exitCode = 1;
          return;
        }
        console.log("✅ Books:\n", JSON.stringify(data, null, 2));
      });
    }
    case "isbn": {
      // Task 11
      const isbn = rest[0];
      if (!isbn) {
        console.error("Usage: node client.js isbn <ISBN>");
        process.exit(1);
      }
      return getBookByISBN(isbn).catch(() => process.exit(1));
    }
    case "author": {
      // Task 12 – permite nomes com espaço sem precisar de aspas
      const author = rest.join(" ");
      if (!author) {
        console.error('Usage: node client.js author "Author Name"');
        process.exit(1);
      }
      return getBooksByAuthor(author).catch(() => process.exit(1));
    }
    case "title": {
      // Task 13 – permite títulos com espaço
      const title = rest.join(" ");
      if (!title) {
        console.error('Usage: node client.js title "Book Title"');
        process.exit(1);
      }
      return getBooksByTitle(title).catch(() => process.exit(1));
    }
    default: {
      console.log("Usage:");
      console.log("  node client.js all");
      console.log("  node client.js isbn 1234567890");
      console.log('  node client.js author "Robert C. Martin"');
      console.log('  node client.js title "Clean Code"');
    }
  }
}

// Exports opcionais (caso queira importar em testes)
module.exports = {
  getAllBooks,
  getBookByISBN,
  getBooksByAuthor,
  getBooksByTitle,
};
