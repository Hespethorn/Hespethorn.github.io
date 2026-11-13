'use strict'

/**
 * 站点级构建后处理（Hexo 自动加载 <站点根>/scripts/*.js）
 *
 * 不修改主题模板、不改动文章正文，解决两件事：
 *   A. 低价值聚合页输出 noindex,follow，把抓取预算留给 842 篇文章页
 *   B. 两篇单文件累积长文（情书 / 家书）构建时生成信件目录与锚点，
 *      并配合 /self/letter-index.css 的 content-visibility 降低首屏渲染成本
 *
 * 刻意只做字符串级插入，不用 cheerio 重序列化整个文档：
 * 主题页面含内联 SVG、Mermaid、GLOBAL_CONFIG 内联脚本，
 * 整体序列化可能改变标签闭合与转义，风险高于收益。
 *
 * 已核对的产物前提：
 *   - head.pug 输出 <link rel="canonical" href="https://hespethorn.github.io/...">
 *   - urlNoIndex 只做 prettyUrls，不会抹掉 /page/2/
 *   - 长文卡片形态固定：<div class="love-card love-card-N"> + .wax-seal span + .love-title
 */

const LONG_FORM = /^\/posts\/(LoveDays|FamilyProse)\/$/
const LETTER_CSS = '<link rel="stylesheet" href="/self/letter-index.css">'
const ROBOTS_META = '<meta name="robots" content="noindex,follow">'

/** 从完整 HTML 中取 canonical 的 pathname；取不到返回空串（说明不是整页） */
function canonicalPath(html) {
  const link = /<link[^>]+rel=["']canonical["'][^>]*>/i.exec(html)
  if (!link) return ''
  const href = /href=["']([^"']+)["']/i.exec(link[0])
  if (!href) return ''
  try {
    return new URL(href[1], 'https://hespethorn.github.io').pathname
  } catch (e) {
    return href[1].replace(/^https?:\/\/[^/]+/, '')
  }
}

/** 允许抓取、允许传递权重，但不值得进索引 */
function isLowValuePage(pathname) {
  if (/^\/tags\//.test(pathname)) return true // 标签页 / 标签云，1129 个标签里 770 个只挂 1 篇
  if (/\/page\/\d+\//.test(pathname)) return true // 分类、归档等列表的第 2 页起
  return false
}

function stripTags(s) {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function scanCards(html) {
  const re = /<div class="love-card[^"]*"[^>]*>/g
  const cards = []
  let m
  while ((m = re.exec(html)) !== null) {
    cards.push({ start: m.index, end: re.lastIndex, tag: m[0] })
  }
  return cards
}

function collectItems(html, cards) {
  return cards.map((card, i) => {
    const segEnd = cards[i + 1] ? cards[i + 1].start : Math.min(html.length, card.end + 20000)
    const seg = html.slice(card.start, segEnd)
    const seal = /<div class="wax-seal"><span>([\s\S]*?)<\/span><\/div>/.exec(seg)
    const title = /<div class="love-title">([\s\S]*?)<\/div>/.exec(seg)
    return {
      id: 'letter-' + (i + 1),
      sealText: seal ? stripTags(seal[1]) : '',
      titleText: title ? stripTags(title[1]) : ''
    }
  })
}

function renderIndex(items) {
  let lis = ''
  items.forEach((it, i) => {
    const label = [it.sealText, it.titleText].filter(Boolean).join(' · ') || '第 ' + (i + 1) + ' 封'
    const cls = i > 0 && i % 10 === 0 ? ' class="letter-group-start"' : ''
    lis += '<li' + cls + '><a href="#' + it.id + '">' + escapeHtml(label) + '</a></li>'
  })

  return '<nav class="letter-index" id="letter-index" aria-label="信件目录">' +
    '<details>' +
    '<summary><span class="letter-index-title">信件目录</span>' +
    '<span class="letter-index-count">共 ' + items.length + ' 封 · 点击展开</span></summary>' +
    '<div class="letter-index-body"><ol>' + lis + '</ol></div>' +
    '</details></nav>\n'
}

/** 单遍重建：给每张卡补 id，目录插在第一张卡之前 */
function addLetterIndex(html) {
  const cards = scanCards(html)
  if (cards.length === 0) return html

  const items = collectItems(html, cards)
  const indexHtml = renderIndex(items)

  let out = ''
  let cursor = 0
  cards.forEach((card, i) => {
    const newTag = /\sid=["']/.test(card.tag)
      ? card.tag
      : card.tag.slice(0, -1) + ' id="' + items[i].id + '">'
    out += html.slice(cursor, card.start)
    if (i === 0) out += indexHtml
    out += newTag
    cursor = card.end
  })
  out += html.slice(cursor)
  return out
}

hexo.extend.filter.register('after_render:html', function (html) {
  if (typeof html !== 'string' || html.indexOf('</head>') === -1) return html

  const pathname = canonicalPath(html)
  if (!pathname) return html

  let result = html

  // A. 低价值聚合页：自带 robots meta 的页面不重复插
  if (isLowValuePage(pathname) && !/name=["']robots["']/i.test(result)) {
    result = result.replace('</head>', ROBOTS_META + '\n</head>')
  }

  // B. 两篇累积长文：已有目录则跳过，保证重复构建幂等
  if (LONG_FORM.test(pathname) && result.indexOf('id="letter-index"') === -1) {
    const withIndex = addLetterIndex(result)
    if (withIndex !== result) {
      result = withIndex
      if (result.indexOf('/self/letter-index.css') === -1) {
        result = result.replace('</head>', LETTER_CSS + '\n</head>')
      }
    }
  }

  // C. 右下角工具栏：原「去评论」按钮已随评论区一起被主题移除，
  //    在「回到顶部」上方补一个「直达页脚」，样式沿用 rightside.styl 的 & > div > a。
  const FOOTER_BTN = '<a id="to_footer" href="#footer-wrap" title="直达页脚" aria-label="直达页脚"><i class="fas fa-arrow-down"></i></a>';
  if (result.indexOf('id="to_footer"') === -1 && result.indexOf('<button id="go-up"') !== -1) {
    result = result.replace('<button id="go-up"', FOOTER_BTN + '<button id="go-up"');
  }

  return result
}, 20)
