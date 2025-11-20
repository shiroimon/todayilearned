// Gistのdata-color-mode属性をdarkに変更するスクリプト
// スタイリング（背景透明、テーブル外枠、内線透過）はCSS（gist.css）で管理
(function() {
    // Gistのdata-color-modeをdarkに変更する関数
    function setGistDarkMode(gistFile) {
        const currentMode = gistFile.getAttribute('data-color-mode');
        // lightモードまたは属性がない場合はdarkに変更
        if (!currentMode || currentMode === 'light') {
            gistFile.setAttribute('data-color-mode', 'dark');
        }
    }

    // Gistが読み込まれるまで待機する関数
    function waitForGist() {
        const gistFiles = document.querySelectorAll('.gist-file[data-color-mode="light"]');

        // data-color-mode属性をdarkに変更
        gistFiles.forEach(function(gistFile) {
            setGistDarkMode(gistFile);
        });

        // 既に読み込まれているGist（data-color-mode属性がない場合も含む）にも適用
        const allGistFiles = document.querySelectorAll('.gist-file');
        allGistFiles.forEach(function(gistFile) {
            setGistDarkMode(gistFile);
        });
    }

    // DOMが読み込まれた後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForGist);
    } else {
        waitForGist();
    }

    // Gistが動的に読み込まれる場合に備えて、MutationObserverで監視
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const gistFiles = node.querySelectorAll ?
                            node.querySelectorAll('.gist-file[data-color-mode="light"]') : [];

                        gistFiles.forEach(function(gistFile) {
                            setGistDarkMode(gistFile);
                        });

                        // ノード自体がgist-fileの場合
                        if (node.classList && node.classList.contains('gist-file')) {
                            setGistDarkMode(node);
                        }

                        // ノード内にgist-fileが含まれている場合も適用
                        if (node.querySelectorAll) {
                            const allGistFiles = node.querySelectorAll('.gist-file');
                            allGistFiles.forEach(function(gistFile) {
                                setGistDarkMode(gistFile);
                            });
                        }
                    }
                });
            }
        });
    });

    // ドキュメント全体を監視
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
