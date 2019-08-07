/**
 * 名称：简单爬虫接口示例：直接爬取页面，解析页面结构
 * 示例：拉取豆瓣租房7天内的数据
 * 反反爬虫方案：随机伪装浏览器+随机伪装IP
 * 
 * 作者：cai jieying
 * 时间：2019/08/06
 */

var cheerio = require('cheerio');
var superagent = require('superagent');
var fs = require('fs');
var path = require('path');

const my_href = 'https://www.douban.com/group/106955/discussion?start=0';

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

/**
 * getFromPage
 * 直接爬取页面，根据页面结构解析所需要的数据
 * 示例：拉取豆瓣租房一段时间内的数据
 */
const getFromPage = async () => {
  /**
   * 
   * @param {*} href 页面链接
   * @param {*} interval 时间间隔，多少时间以内的数据，单位ms，默认一天
   * @param {*} escapeArr 屏蔽含有不需要字段的数据，默认为[]
   * @param {*} needArr 屏蔽不含有所需字段的数据，默认为[]
   * @param {*} data 递归数据，默认为[]
   */
  const getOnePage = async ({href, interval=86400000, escapeArr=[], needArr=[], data=[]}) => {
    console.log(href)
    if (!href || typeof href !== 'string' 
    || typeof escapeArr !== 'object' || typeof escapeArr.length === 'undefined'
    || typeof needArr !== 'object' || typeof needArr.length === 'undefined'
    || typeof data !== 'object' || typeof data.length === 'undefined') {
      console.error('函数入参错误');
      return {
        isOverDate: false,
        data: [],
        nextHref: ''
      }
    }
    const escapeReg = new RegExp(escapeArr.join('|'), 'g');
    const needReg = new RegExp(needArr.join('|'), 'g');

    let ret = await new Promise((resolve, reject) => {
      superagent.get(href)
      .set('User-Agent', my_headers[Math.floor(Math.random()*13)]) // 模拟浏览器行为
      .set('Remote-Address', my_ips[Math.floor(Math.random()*10)]) // 安全起见换个IP
      .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3')
      .end(function (err,res) {
        if (err) {
            console.log('err happen', err);
            return err;
        }
        const $ = cheerio.load(res.text);
        let isOverDate = false;
        $('#content .article .olt tr').each(function(index, item) {
          const title = $(item).children('.title').children('a').attr('title');
          const href = $(item).children('.title').children('a').attr('href');
          let date = $(item).children('.time').text();
          
          if (title && href && date) { // 过滤处理数据
            if (!/\d{4}-\d{2}-\d{2}/g.test(date)) { // 补充年份
              date = `${new Date().getFullYear()}-${date}`
            }
            if ((+new Date() - +new Date(date)) - interval > 1e-5) {
              isOverDate = true
            } 

            if (!isOverDate && 
                !(escapeArr.length>0 && escapeReg.test(title)) && 
                !(needArr.length>0 && !needReg.test(title))) {
              data.push({
                title,
                href,
                date
              })
            }
          }
        })

        let nextHref = $('.paginator .next a').attr('href')

        resolve({
          isOverDate,
          data,
          nextHref
        })
      })
    })

    if (ret.isOverDate) {
      return ret;
    }
    else {
      return getOnePage({
        href: ret.nextHref, 
        interval, 
        escapeArr,
        needArr,
        data: ret.data
      })
    }
  }

  // 递归获取多页数据处理
  const interval = 1000 * 60 * 60 * 24 * 7; // 7天内
  const escapeStr = ['求租', '合租'];
  const needArr = ['宝安'];

  console.log('开始获取数据...')
  var data = await getOnePage({
    href: my_href, 
    interval, 
    escapeStr, 
    needArr,
    data: []
  })
  console.log('获取数据完毕')

  if (!data.isOverDate) {
    console.error('数据获取不成功，请检查')
  } else {
    var recDate = new Date()
    var saveJSON = {
      updateTime: recDate.toLocaleString(),
      data
    }
  
    // 将数据存储本地文件
    var fileName = `租房数据${recDate.getFullYear()}-${recDate.getMonth()+1}-${recDate.getDate()}_${recDate.getHours()}:${recDate.getMinutes()}:${recDate.getSeconds()}.json`;
    fs.writeFile(path.resolve(__dirname, `../data/${fileName}`), JSON.stringify(saveJSON), function (err) {
      // 判断 如果有错 抛出错误 否则 打印写入成功
      if (err) {
          throw err;
      } 
      console.log('写入文件成功!')
    })
  }
}

module.exports = getFromPage;