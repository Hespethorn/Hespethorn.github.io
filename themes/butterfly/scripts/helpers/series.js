'use strict'

hexo.extend.helper.register('groupPosts', function () {
  const getGroupArray = array => {
    return array.reduce((groups, item) => {
      const key = item.series
      if (key) {
        groups[key] = groups[key] || []
        groups[key].push(item)
      }
      return groups
    }, {})
  }

  const sortOne = list => {
    const { orderBy = 'date', order = 1 } = this.theme.aside.card_post_series
    const arr = list.slice()
    // 该系列每篇都写了 front-matter order（数值）时，按 order 排序，
    // 用于「按序号推进」的系列（同日多篇也能定序）；否则回退到 title / date。
    if (arr.length && arr.every(p => typeof p.order === 'number')) {
      return arr.sort((a, b) => (a.order - b.order) * order)
    }
    if (orderBy === 'title') {
      const collator = new Intl.Collator('zh-Hans-CN', { numeric: true })
      return arr.sort((a, b) => collator.compare(a.title || '', b.title || '') * order)
    }
    return arr.sort((a, b) => (a.date.valueOf() - b.date.valueOf()) * order)
  }

  const groups = getGroupArray(this.site.posts.toArray())
  Object.keys(groups).forEach(key => {
    groups[key] = sortOne(groups[key])
  })

  return groups
})
