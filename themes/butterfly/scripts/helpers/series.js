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

  const sortPosts = posts => {
    const { orderBy = 'date', order = 1 } = this.theme.aside.card_post_series
    if (orderBy === 'title') {
      const collator = new Intl.Collator('zh-Hans-CN', { numeric: true })
      return posts.toArray().sort((a, b) => {
        const cmp = collator.compare(a.title || '', b.title || '')
        return cmp * order
      })
    }
    return posts.sort('date', order)
  }

  return getGroupArray(sortPosts(this.site.posts))
})
