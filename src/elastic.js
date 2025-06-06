const { Client } = require("@elastic/elasticsearch");
const dotenv = require("dotenv");
dotenv.config();

const client = new Client({ node: process.env.ELASTICSEARCH_HOST });

module.exports = client;
