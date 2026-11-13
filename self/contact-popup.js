(function () {
  if (window.__hspContactPopup) return;
  window.__hspContactPopup = true;

  var content = {
    email: {
      title: '邮箱',
      value: '17362995493@163.com',
      hint: '点击下方按钮复制邮箱地址。'
    },
    wechat: {
      title: '微信',
      value: '17362995493',
      hint: '微信号同手机号，点击下方按钮复制。'
    }
  };

  var root = document.createElement('div');
  root.className = 'contact-popup';
  root.id = 'contact-popup';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = [
    '<div class="contact-popup__mask" data-contact-close></div>',
    '<div class="contact-popup__card" role="dialog" aria-modal="true" aria-labelledby="contact-popup-title">',
    '  <span class="contact-popup__eyebrow">CONTACT</span>',
    '  <h3 class="contact-popup__title" id="contact-popup-title">联系方式</h3>',
    '  <p class="contact-popup__value"></p>',
    '  <p class="contact-popup__hint"></p>',
    '  <div class="contact-popup__actions">',
    '    <button type="button" class="contact-popup__copy">复制账号</button>',
    '    <button type="button" class="contact-popup__close" data-contact-close>关闭</button>',
    '  </div>',
    '</div>'
  ].join('');
  document.body.appendChild(root);

  var titleEl = root.querySelector('.contact-popup__title');
  var valueEl = root.querySelector('.contact-popup__value');
  var hintEl = root.querySelector('.contact-popup__hint');
  var copyBtn = root.querySelector('.contact-popup__copy');
  var current = null;

  function open(kind) {
    var item = content[kind];
    if (!item) return;
    current = item;
    titleEl.textContent = item.title;
    valueEl.textContent = item.value;
    hintEl.textContent = item.hint;
    copyBtn.textContent = '复制账号';
    copyBtn.classList.remove('is-copied');
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('contact-popup-open');
  }

  function close() {
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-popup-open');
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {}
    }
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(area);
    return ok;
  }

  copyBtn.addEventListener('click', async function () {
    if (!current) return;
    var ok = await copyText(current.value);
    copyBtn.textContent = ok ? '已复制' : '复制失败';
    copyBtn.classList.toggle('is-copied', ok);
    window.setTimeout(function () {
      copyBtn.textContent = '复制账号';
      copyBtn.classList.remove('is-copied');
    }, 1800);
  });

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var mail = target.closest('a[href^="mailto:"]');
    if (mail) {
      event.preventDefault();
      open('email');
      return;
    }

    var wechat = target.closest('a[href*="wechat"]');
    if (wechat) {
      event.preventDefault();
      open('wechat');
      return;
    }

    if (target.closest('[data-contact-close]')) {
      event.preventDefault();
      close();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && root.classList.contains('is-open')) close();
  });

  var params = new URLSearchParams(window.location.search);
  var kind = params.get('contact');
  if (kind === 'email' || kind === 'wechat') {
    window.setTimeout(function () { open(kind); }, 250);
  }
})();
