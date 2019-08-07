const Express = require('express');
const app = new Express();

var {getFromPage} = require('./api/crawler');

// 
app.get('/getFromPage', function (req, res, next) {
  getFromPage()
})

// 监听端口、启动程序
app.listen(3000, err => {
  if (err) throw err;
  console.log('server is runing at 3000...');
})
