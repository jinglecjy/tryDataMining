const Express = require('express');
const app = new Express();

var getFromPage = require('./api/getFromPage');
var getFromApi = require('./api/getFromApi');

// 
app.get('/getFromPage', function (req, res) {
  getFromPage()
})

app.get('/getFromApi', function (req, res) {
  getFromApi()
})

// 监听端口、启动程序
app.listen(3000, err => {
  if (err) throw err;
  console.log('server is runing at 3000...');
})
