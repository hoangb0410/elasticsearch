const express = require("express");
const dotenv = require("dotenv");
const client = require("./elastic");

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Elasticsearch + ExpressJS API"));

app.post("/index", async (req, res) => {
  const { id, title, content } = req.body;

  try {
    const response = await client.index({
      index: "articles",
      id: id,
      document: { title, content },
    });

    res.json({ result: response.result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/search", async (req, res) => {
  const { q, page = 1, size = 10 } = req.query;
  const query = q ? { match: { content: q } } : { match_all: {} };
  try {
    const from = (parseInt(page) - 1) * parseInt(size);

    const response = await client.search({
      index: "articles",
      from,
      size: parseInt(size),
      query,
    });

    res.json({
      total: response.hits.total.value,
      page: parseInt(page),
      size: parseInt(size),
      results: response.hits.hits,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/index/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const response = await client.update({
      index: "articles",
      id,
      doc: { title, content },
    });

    res.json({ result: response.result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/index/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await client.delete({
      index: "articles",
      id,
    });

    res.json({ result: response.result });
  } catch (err) {
    if (err.meta && err.meta.statusCode === 404) {
      res.status(404).json({ error: "Document not found" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.get("/index/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await client.get({
      index: "articles",
      id,
    });

    res.json({
      id: response._id,
      data: response._source,
    });
  } catch (err) {
    if (err.meta && err.meta.statusCode === 404) {
      res.status(404).json({ error: "Document not found" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
