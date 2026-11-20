'use strict'

// 27 篇单篇原则已并入《计算机原则五讲》，旧地址保留跳转，避免外部链接失效。
// 映射表见同目录 princ-redirects.json（abbrlink -> 目标章节 abbrlink）。
const map = require('./princ-redirects.json')

hexo.extend.generator.register('princ_redirects', function () {
  return Object.keys(map).map(function (from) {
    const to = '/posts/' + map[from] + '/'
    return {
      path: 'posts/' + from + '/index.html',
      data: function () {
        return [
          '<!DOCTYPE html>',
          '<html lang="zh-CN">',
          '<head>',
          '<meta charset="utf-8">',
          '<title>页面已迁移</title>',
          '<link rel="canonical" href="' + to + '">',
          '<meta name="robots" content="noindex">',
          '<meta http-equiv="refresh" content="0; url=' + to + '">',
          '<script>location.replace(' + JSON.stringify(to) + ')</script>',
          '</head>',
          '<body>',
          '<p>这篇原则已并入《计算机原则五讲》，正在跳转；若未自动跳转，请点击 <a href="' + to + '">这里</a>。</p>',
          '</body>',
          '</html>'
        ].join('')
      }
    }
  })
})
