const Express = require('express');
const app = new Express();
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

var getFromPage = require('./api/getFromPage');
var getFromApi = require('./api/getFromApi');
var getIP = require('./api/getIP');
var fenci = require('./lib/fenci');

var hasLocal = async () => {
  // 读取文件目录(文件夹)中的所有文件
  let ret = {
    hasLocal: false,
    filename: ''
  }
  let files = fs.readdirSync(path.resolve(__dirname, './data'));
  for (let i=0; i<files.length; i++) {
    let regexp = new RegExp('租房数据([0-9]*).json', 'g')
    regexp.test(files[i])
    console.log(`[当前文件]${files[i]}`)
    if (RegExp.$1 !== '') {
      let timestamp = _.toNumber(RegExp.$1)
      if ((+new Date()) - timestamp < 1000*60*60*24) {
        console.log('获取到本地数据')
        ret.hasLocal = true;
        ret.filename = files[i];
        return ret;
      }
    }
  }

  console.log('需要爬虫')
  await getFromPage();
  return hasLocal();
}

/**
 * 抓取匿名IP
 * https://www.xicidaili.com/nn
 */
app.get('/getip', async (req, res) => {
  try {
    await getIP();
    res.jsonp('ok')
  } catch(err) {
    console.error(`[getip] ${err}`)
  }
})

app.get('/getFromPage', async (req, res) => {
  try {
    // 获取数据
    // let pachongData = {}
    // if(true) { // 如果本地没有今日数据，爬虫获取
    //   pachongData =  await getFromPage()
    // } else { // 如果今天已经获取过数据

    // }
    let pachongFile = await hasLocal()
    // let pachongData = {}
    // if (pachongFile.filename) {
    //   console.log(pachongFile.filename)
    //   pachongData = fs.readFileSync(path.resolve(__dirname, `./data/${pachongFile.filename}`))
    // }
    
    // // 对标题分词
    // let fenciData = {
    //   updateTime: pachongData.updateTime,
    //   data: []
    // }
    // for (const item of pachongData.data) {
    //   fenciData.data.push({
    //     title: item.title,
    //     titleBreak: fenci(item.title),
    //     href: item.href,
    //     date: item.date
    //   })
    // }

    // return res.jsonp(fenciData)
  } catch (err) {
    console.error(`[getFromPage] catch ${err}`)
    return res.jsonp(err)
  }
})

app.get('/getFromApi', async function (req, res) {
  try {
    let ret = await getFromApi()
    return res.jsonp(ret)
  } catch (err) {
    console.error(`[getFromApi] catch ${err}`)
    return res.jsonp(err)
  }
  
})

// 监听端口、启动程序
var server = app.listen(3000, err => {
  if (err) throw err;
  console.log('server is runing at 3000...');
})

server.setTimeout(100000);
