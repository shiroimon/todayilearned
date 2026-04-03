// Gistのdata-color-modeをページのテーマに連動させるスクリプト
(function() {
    function getPageColorMode() {
        return document.documentElement.getAttribute('data-color-mode') || 'light';
    }

    function applyGistColorMode() {
        var mode = getPageColorMode();
        var gistFiles = document.querySelectorAll('.gist-file');
        gistFiles.forEach(function(gistFile) {
            gistFile.setAttribute('data-color-mode', mode);
            gistFile.setAttribute('data-dark-theme', 'dark');
            gistFile.setAttribute('data-light-theme', 'light');
        });
    }

    // DOMが読み込まれた後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyGistColorMode);
    } else {
        applyGistColorMode();
    }

    // Gistが動的に読み込まれる場合 & テーマ切り替え時に対応
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // テーマ切り替え検知（html要素のdata-color-mode変更）
            if (mutation.type === 'attributes' && mutation.target === document.documentElement) {
                applyGistColorMode();
                return;
            }
            // 新しいGist要素の追加検知
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains('gist-file')) {
                            applyGistColorMode();
                        } else if (node.querySelectorAll) {
                            var gists = node.querySelectorAll('.gist-file');
                            if (gists.length > 0) applyGistColorMode();
                        }
                    }
                });
            }
        });
    });

    // html要素のdata-color-mode属性変更を監視
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color-mode'] });
    // body以下のDOM追加を監視（Gist動的読み込み対応）
    observer.observe(document.body, { childList: true, subtree: true });
})();
