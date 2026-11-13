(function () {
  if (window.__hesperElegantCode) return;
  window.__hesperElegantCode = true;

  // 页脚只保留一个代码框，所以内容取自站点真正写过的主题：
  // 配置继承图、XFF 信任边界、缓存双删、倒排索引、Hexo 构建与超长页渲染。
  // 每段控制在 4~6 行，配合 14ms/字的打字机与 5.6s 停留轮流播放。
  var snippets = [
    {
      lang: 'C++',
      title: 'graph.atomic_swap',
      code: '// readers never observe a half-built graph\nauto next = compile(sources);\nauto prev = current.exchange(next, std::memory_order_acq_rel);\nretire(prev);  // freed after the last reader leaves'
    },
    {
      lang: 'C++',
      title: 'xff.right_to_left',
      code: 'for (auto it = hops.rbegin(); it != hops.rend(); ++it) {\n    if (!is_trusted(*it)) return *it;  // rightmost untrusted hop\n}\nreturn peer_addr;  // TCP peer is never in XFF'
    },
    {
      lang: 'C++',
      title: 'raii.lock_guard',
      code: '{\n    std::lock_guard<std::mutex> lock(mu);\n    graph.apply(patch);\n}  // released on every exit path, even on throw'
    },
    {
      lang: 'C++',
      title: 'cache.double_delete',
      code: 'db.commit(order);                      // 1. 先提交\nredis.del(key);                         // 2. 再删缓存\ndefer([=]{ redis.del(key); }, 500ms);  // 3. 延迟双删兜底'
    },
    {
      lang: 'Python',
      title: 'config.deep_merge',
      code: 'def merge(base, patch):\n    out = dict(base)\n    for k, v in patch.items():\n        out[k] = merge(out[k], v) if isinstance(v, dict) else v\n    return out'
    },
    {
      lang: 'Python',
      title: 'graph.resolve',
      code: 'def resolve(node, seen=frozenset()):\n    if node.ref in seen:\n        raise CycleError(node.ref)\n    for base in node.bases:\n        yield from resolve(base, seen | {node.ref})\n    yield node'
    },
    {
      lang: 'Python',
      title: 'db.transaction',
      code: '@contextmanager\ndef tx(conn):\n    try:\n        yield conn\n        conn.commit()\n    except Exception:\n        conn.rollback()\n        raise'
    },
    {
      lang: 'Python',
      title: 'index.postings',
      code: 'for doc_id, tokens in corpus:\n    for term in set(tokens):\n        postings[term].append(doc_id)  # tf 留到查询时算\n# 权重大却不相关，是语域失配不是打分问题'
    },
    {
      lang: 'Bash',
      title: 'build.pipeline',
      code: 'hexo clean && hexo g && hexo deploy\n# 845 sources -> 842 /posts/ URLs\n# 三个 _ 前缀规划文件不发布'
    },
    {
      lang: 'YAML',
      title: 'post.front_matter',
      code: 'title: 计算机原则五讲（四）\nabbrlink: princ-chapter-04\ncategories: [CS-Principles]\ndate: 2026-11-13  # 排期日，不是写作日'
    },
    {
      lang: 'YAML',
      title: 'nginx.real_ip',
      code: 'set_real_ip_from 10.0.0.0/8;\nreal_ip_header X-Forwarded-For;\nreal_ip_recursive on;  # 取最后一个非可信地址'
    },
    {
      lang: 'CSS',
      title: 'render.long_page',
      code: '.love-card {\n  content-visibility: auto;\n  contain-intrinsic-size: auto 420px;\n}\n/* 80+ 封信只在进入视口时布局 */'
    }
  ];

  var KEYWORDS = {
    'C++': ['auto', 'const', 'return', 'for', 'if', 'else', 'while', 'void', 'int', 'bool', 'class', 'struct', 'new', 'delete', 'template', 'nullptr', 'true', 'false'],
    'Python': ['def', 'return', 'for', 'in', 'if', 'else', 'elif', 'yield', 'from', 'import', 'with', 'as', 'raise', 'try', 'except', 'class', 'None', 'True', 'False', 'isinstance', 'set', 'dict'],
    'Bash': ['for', 'in', 'do', 'done', 'if', 'then', 'fi', 'echo', 'export'],
    'YAML': ['true', 'false', 'on', 'off', 'null'],
    'CSS': ['auto', 'none', 'block', 'flex', 'inherit']
  };

  var index = 0;
  var timer = null;
  var run = 0;

  function all() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-elegant-code]'));
  }

  function prepare(el) {
    if (el.getAttribute('data-elegant-ready')) return;
    el.innerHTML = [
      '<div class="elegant-code__head">',
      '  <span class="elegant-code__lang"></span>',
      '  <span class="elegant-code__title"></span>',
      '</div>',
      '<pre class="elegant-code__pre"><code></code><span class="elegant-code__cursor"></span></pre>'
    ].join('');
    el.setAttribute('data-elegant-ready', '1');
  }

  function esc(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlight(code, lang) {
    var s = esc(code);

    // 注释：C/C++ 用 // 与 #include；CSS 用 /* */；其余语言用行首/空白后的 #
    // 刻意不匹配 & 之后的 #，避免把转义实体 &#39; 当成注释起点。
    if (lang === 'C++' || lang === 'C') {
      s = s.replace(/(\/\/[^\n]*|#[ \t]*(?:include|define)[^\n]*)/g, '<span class="tok-com">$1</span>');
    } else if (lang === 'CSS') {
      s = s.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>');
    } else {
      s = s.replace(/(^|[\s(,])#[^\n]*/gm, function (m, lead) {
        return lead + '<span class="tok-com">' + m.slice(lead.length) + '</span>';
      });
    }

    s = s.replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="tok-str">$1</span>');

    var words = KEYWORDS[lang] || [];
    if (words.length) {
      // 交替分支优先吞掉已生成的 span 标签，否则关键词里的 class
      // 会命中 <span class="tok-com"> 自身，把标签结构改坏。
      var re = new RegExp('(<[^>]*>)|\\b(' + words.join('|') + ')\\b', 'g');
      s = s.replace(re, function (m, tag, kw) {
        return tag ? tag : '<span class="tok-kw">' + kw + '</span>';
      });
    }
    return s;
  }

  function apply(snippet) {
    var myRun = ++run;
    if (timer) clearTimeout(timer);

    var els = all();
    els.forEach(prepare);
    if (!els.length) return;

    els.forEach(function (el) {
      el.querySelector('.elegant-code__lang').textContent = snippet.lang;
      el.querySelector('.elegant-code__title').textContent = snippet.title;
      el.querySelector('code').textContent = '';
    });

    var text = snippet.code;
    var i = 0;

    function step() {
      if (myRun !== run) return;
      var list = all();
      list.forEach(prepare);
      if (!list.length) {
        timer = setTimeout(function () { apply(snippet); }, 400);
        return;
      }
      list.forEach(function (el) {
        el.querySelector('code').textContent = text.slice(0, i);
      });
      i++;
      if (i <= text.length) {
        timer = setTimeout(step, 14);
      } else {
        list.forEach(function (el) {
          el.querySelector('code').innerHTML = highlight(text, snippet.lang);
        });
        timer = setTimeout(next, 5600);
      }
    }

    step();
  }

  function next() {
    var snippet = snippets[index % snippets.length];
    index++;
    apply(snippet);
  }

  next();
  document.addEventListener('pjax:complete', next);
})();
