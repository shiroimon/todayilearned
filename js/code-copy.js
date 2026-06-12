/*
 * シンタックスハイライトのコードブロック右上にコピーボタンを追加する。
 * Mermaid ブロック（language-mermaid）は除外。
 */
(function () {
  function init() {
    var blocks = document.querySelectorAll('div.highlight');
    blocks.forEach(function (block) {
      if (block.querySelector('.copy-btn')) return;

      var code = block.querySelector('pre code');
      if (!code) return;
      if (code.className && code.className.indexOf('language-mermaid') >= 0) return;

      block.classList.add('has-copy-btn');

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy code');
      btn.textContent = 'Copy';

      btn.addEventListener('click', function () {
        var text = code.innerText;
        var done = function (ok) {
          btn.textContent = ok ? 'Copied!' : 'Failed';
          btn.classList.toggle('copied', ok);
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try {
            done(document.execCommand('copy'));
          } catch (e) {
            done(false);
          }
          document.body.removeChild(ta);
        }
      });

      block.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
