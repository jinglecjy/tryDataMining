/**
 * 名称：简单爬虫接口示例：爬取API结果
 * 示例：拉取豆瓣高分电影
 * 
 * 作者：cai jieying
 * 时间：2019/08/06
 */
var superagent = require('superagent');
var fs = require('fs');
var path = require('path');

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
  
  // 随机假装一个IP，可以这里找：http://www.goubanjia.com/
  const my_ips = [
    '111.231.94.44:8888',
    '111.231.90.122:8888',
    '117.191.11.104:80',
    '117.191.11.76:80',
    '117.191.11.74:80',
    '123.139.56.238:9999',
    '117.191.11.113:8080',
    '117.191.11.110:8080',
    '117.191.11.72:8080',
    '117.191.11.107:80'
  ];
  

const getFromApi = () => {
  const type='movie';
  const tag='豆瓣高分';
  const sort='recommend';
  const page_limit=25;
  const page_start=0;
  const href = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${tag}&sort=${sort}&page_limit=${page_limit}&page_start=${page_start}`;
  superagent.get(href)
    .set('Server', 'dae')
    .set('Transfer-Encoding', 'chunked')
    .set('Vary', 'Accept-Encoding')
    .set('X-Content-Type-Options', 'nosniff')
    .set('X-DAE-App', 'movie')
    .set('X-DAE-Node', 'fram28')
    .set('X-Douban-Mobileapp', 0)
    .set('X-Xss-Protection', '1; mode=block')
    .set('User-Agent', my_headers[Math.floor(Math.random() * 13)]) // 模拟浏览器行为
    .set('Remote-Address', my_ips[Math.floor(Math.random() * 10)]) // 安全起见换个IP
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3')
    .end(function (err, res) {
      if (err) {
        console.log('err happen', err);
        return err;
      }
      console.log(res)
    })
}

module.exports = getFromApi;