/**
 * 链接加载器模块
 * 处理中英文链接的跳转行为
 */
(() => {
  /**
   * 检查链接是否包含英文路径
   * @param {string} item - 链接地址
   * @returns {boolean} 是否包含英文路径
   */
  const isIncludeEN = (item) => {
    const key = '/en/';
    return item && item.includes(key);
  };

  /**
   * 全页加载函数
   * @param {string} url - 目标URL
   */
  window.loadFullPage = (url) => {
    if (url) {
      window.location.href = url;
    }
  };

  /**
   * 处理链接点击事件
   * @param {NodeList} elements - 链接元素列表
   * @param {boolean} includeEN - 当前是否在英文页面
   */
  const handleLinks = (elements, includeEN) => {
    if (elements && elements.length > 0) {
      elements.forEach((item) => {
        if (item && item.href) {
          if (!includeEN || !isIncludeEN(item.href)) {
            item.href = `javascript:loadFullPage('${item.href}');`;
          }
        }
      });
    }
  };

  // 主执行逻辑
  try {
    const currentUrl = window.location.href;
    const nowIncludeEN = isIncludeEN(currentUrl);
    const selector = nowIncludeEN
      ? document.querySelectorAll('a[href^="https://butterfly.js.org"]')
      : document.querySelectorAll('a[href^="/en/"]');

    handleLinks(selector, nowIncludeEN);
  } catch (error) {
    console.error('链接加载器错误:', error);
  }
})();