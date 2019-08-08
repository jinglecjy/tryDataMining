var nodejieba = require("nodejieba");

const fenci = (text) => {
  return nodejieba.cut(text)
}

module.exports = fenci;