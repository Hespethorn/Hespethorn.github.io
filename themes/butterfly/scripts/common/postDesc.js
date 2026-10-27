'use strict'

const { stripHTML, truncate } = require('hexo-util')

// Removes code blocks, figures, tables and mermaid diagrams before making an excerpt.
const removeHeavyBlocks = (content) => {
  return content
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<figure[\s\S]*?<\/figure>/gi, ' ')
    .replace(/<table[\s\S]*?<\/table>/gi, ' ')
    .replace(/<div[^>]*class="[^"]*(?:mermaid|table-wrap)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
}

// Truncates the given content to a specified length, removing HTML tags and replacing newlines with spaces.
const truncateContent = (content, length) => {
  return truncate(stripHTML(removeHeavyBlocks(content)), { length }).replace(/\n/g, ' ')
}

// Generates a post description based on the provided data and theme configuration.
const postDesc = (data, hexo) => {
  const { description, content, postDesc } = data

  if (postDesc) return postDesc

  const { length, method } = hexo.theme.config.index_post_content

  if (method === false) return

  let result
  switch (method) {
    case 1:
      result = description
      break
    case 2:
      result = description || truncateContent(content, length)
      break
    default:
      result = truncateContent(content, length)
  }

  data.postDesc = result
  return result
}

module.exports = { truncateContent, postDesc }
