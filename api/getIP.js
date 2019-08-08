/**
 * 名称：获取高匿IP存储到本地
 * 
 * 作者：cai jieying
 * 时间：2019/08/08
 */

var cheerio = require('cheerio');
var superagent = require('superagent');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

const my_href = 'https://www.xicidaili.com/nn/';

// 随机假装一个浏览器
const my_headers = [
  "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/537.75.14",
  "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)",
  'Mozilla/5.0 (Windows; U; Windows NT 5.1; it; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11',
  'Opera/9.25 (Windows NT 5.1; U; en)',
  'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
  'Mozilla/5.0 (compatible; Konqueror/3.5; Linux) KHTML/3.5.5 (like Gecko) (Kubuntu)',
  'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12',
  'Lynx/2.8.5rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/1.2.9',
  "Mozilla/5.0 (X11; Linux i686) AppleWebKit/535.7 (KHTML, like Gecko) Ubuntu/11.04 Chromium/16.0.912.77 Chrome/16.0.912.77 Safari/535.7",
  "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0 "
];


const getIP = async () => {
  let res = await new Promise((resolve, reject) => {
    superagent.get(my_href)
    .set('User-Agent', my_headers[Math.floor(Math.random()*13)]) // 模拟浏览器行为
    // .set('Remote-Address', my_ips[Math.floor(Math.random()*10)]) // 安全起见换个IP
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3')
    .end(function (err,res) {
      if (err) {
          console.log('err happen', err);
          return err;
      }
      const $ = cheerio.load(res.text);
      let data = []
      $('#ip_list tr').each(function(index, item) {
        
        if ($(item).children('td').length>4) {
          const host = $(item).children('td').eq(1).text();
          const port = $(item).children('td').eq(2).text();
          const type = _.toLower($(item).children('td').eq(5).text());
          if (/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/g.test(host) &&
          /^[0-9]*$/g.test(port) && /https/g.test(type)) {
            // data.push(`${type}://${host}:${port}`)
            data.push(`${host}:${port}`)
          }
        }
      })

      resolve(data)
    })
  })

  let ret = {
    length: res.length,
    data: res
  }

  // ip保存到本地
  var fileName = `ip_list.json`;

  fs.writeFile(path.resolve(__dirname, `../data/${fileName}`), JSON.stringify(ret), function (err) {
    // 判断 如果有错 抛出错误 否则 打印写入成功
    if (err) {
        throw err;
    } 
    console.log('写入ip文件成功!')
  })

  return ret;
}

module.exports = getIP;