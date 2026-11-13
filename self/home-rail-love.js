/* 首页侧栏恋爱计时：构建期写入天数作 SSR 兜底，客户端每秒校正。
   pjax 只替换 DOM，脚本带 data-pjax 可能重复执行；用一次性守卫保留
   同一个 interval，每次 tick 重新查询 DOM，即可覆盖 pjax 后的新节点。 */
(function () {
  if (window.__hspLoveClockStarted) return;
  window.__hspLoveClockStarted = true;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function tick() {
    var roots = document.querySelectorAll('[data-love-since]');
    if (!roots.length) return;

    var now = Date.now();
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      var start = new Date(root.getAttribute('data-love-since')).getTime();
      if (!isFinite(start)) continue;

      var diff = Math.max(0, now - start);
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor(diff / 3600000) % 24;
      var minutes = Math.floor(diff / 60000) % 60;
      var seconds = Math.floor(diff / 1000) % 60;

      var dayNode = root.querySelector('[data-love-days]');
      var hmsNode = root.querySelector('[data-love-hms]');
      if (dayNode) dayNode.textContent = String(days);
      if (hmsNode) {
        hmsNode.textContent = ' ' + pad(hours) + ' 时 ' + pad(minutes) + ' 分 ' + pad(seconds) + ' 秒';
      }
    }
  }

  tick();
  setInterval(tick, 1000);
})();
