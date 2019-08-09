var nodejieba = require("nodejieba");
nodejieba.load();

const fenci = (text) => {
  return nodejieba.extract(text, 10)
}

module.exports = fenci;