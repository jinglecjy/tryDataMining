/**
 * 名称：简单爬虫接口示例：直接爬取页面，解析页面结构
 * 示例：拉取豆瓣租房7天内的数据
 * 反反爬虫方案：随机伪装浏览器+随机伪装IP
 * 豆瓣是按频率封的,白天一分钟不能超过 40 次请求,晚上不能超过 100 次请求,每次请求间隔1秒
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

// 用匿名ip伪装
const my_ips = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/ip_list.json'), 'utf-8'))

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

    // console.log(my_ips)
    let ret = await new Promise((resolve, reject) => {
      const ip = my_ips.data[Math.floor(Math.random()*my_ips.length)];
      // const ip = 'http://134.119.205.242:1080'
      const header = {
        'Host': 'www.douban.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': my_headers[Math.floor(Math.random()*13)],
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // 'Cookie': 'bid=WBBjEEBmCWU; douban-fav-remind=1; __yadk_uid=99RsXomvOSPycWFHGHxIpjYS1eFZhu0H; ll="118282"; _vwo_uuid_v2=D8444AC897C394988E99A00903CD117BA|10e38dcef1dbdb61eda3871d4ec28215; douban-profile-remind=1; __utma=30149280.394892219.1561877039.1561877039.1561877039.1; __utmz=30149280.1561877039.1.1.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; trc_cookie_storage=taboola%2520global%253Auser-id%3Dff42986e-16bf-47f2-b008-d9e91cae042f-tuct3e10dfe; viewed="2885672"; gr_user_id=612daebc-c256-4a98-8576-cc9dd4166e06; __gads=ID=28d0a849f4310fa0:T=1565229993:S=ALNI_MZsnL6rKEJb8j73lo_p-K4W2GFgFg; ap_v=0,6.0; _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1565266786%2C%22https%3A%2F%2Fwww.baidu.com%2Flink%3Furl%3DnOEfr9i-iUK32sumuyKDFYLlzaIXpLI4lJW33nCFV0aMMoehA_t6ie3fWrZkzV5xo6tL2Fl_WVH1UMnCGqJ_ga%26wd%3D%26eqid%3Dd1344776000cf918000000065d4c135e%22%5D; _pk_ses.100001.8cb4=*; _pk_id.100001.8cb4=f5a05832f1f7d60b.1558699588.15.1565266855.1565263933.',
        'Remote-Address': ip
      };
    
      // console.log(ip)
      superagent.get(href)
      // .timeout({ response: 5000, deadline: 60000 })
      .set('Host', 'www.douban.com')
      .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3')
      .set('Accept-Language', 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7')
      .set('User-Agent', my_headers[Math.floor(Math.random()*13)])
      .set('Cache-Control', 'no-cache')
      .set('Connection', 'keep-alive')
      .set('Remote-Address', ip)
      .set('header', header)
      .set('Cookie', 'bid=WBBjEEBmCWU')
      // .proxy(ip)
      .end(function (err,res) {
        console.log('finished')
        if (err) {
            console.log('err happen', err);
            return err;
        }
        // console.log(res.text)
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
      // 延时一会儿会儿，标识我不是个机器人
      await sleep(5000)

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
    return;
  } else {
    var recDate = new Date()
    var saveJSON = {
      updateTime: recDate.toLocaleString(),
      data: data.data
    }
  
    // 将数据存储本地文件
    var fileName = `租房数据${recDate.getTime()}.json`;
    fs.writeFile(path.resolve(__dirname, `../data/${fileName}`), JSON.stringify(saveJSON), function (err) {
      // 判断 如果有错 抛出错误 否则 打印写入成功
      if (err) {
          throw err;
      } 
      console.log('写入文件成功!')
    })

    return saveJSON;
  }

}

module.exports = getFromPage;