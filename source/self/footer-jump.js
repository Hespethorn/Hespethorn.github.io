(function () {
  if (window.__hspFooterJump) return;
  window.__hspFooterJump = true;

  // 右下角「直达页脚」按钮：事件委托挂在 document 上，pjax 切页不失效。
  // 按钮本身带 href="#footer-wrap"，脚本未加载时浏览器原生锚点也能兜底。
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    if (!target.closest('#to_footer')) return;

    var footer = document.getElementById('footer') || document.getElementById('footer-wrap');
    if (!footer) return;

    event.preventDefault();
    footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });
})();
