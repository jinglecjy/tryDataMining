var http = require('http');
var cheerio = require('cheerio');
var superagent = require('superagent');


superagent.get('https://github.com/').end(function (err,res) {
    if (err) {
        console.log(err);
        return err;
    }
    console.log(res.text)
})