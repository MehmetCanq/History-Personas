
(function () {
    const STORAGE_KEY = 'theme';
    const DEFAULT_THEME = 'dark';

    const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(mode) {
        document.body.setAttribute('data-theme', mode);
        updateButtons(mode);
    }
    window.setTheme = function (mode) {
        if (!['dark', 'light', 'system'].includes(mode)) return;
        localStorage.setItem(STORAGE_KEY, mode);
        applyTheme(mode);
    };

    function updateButtons(activeMode) {
        document.querySelectorAll('[data-theme-btn]').forEach(function (btn) {
            if (btn.getAttribute('data-theme-btn') === activeMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function init() {
        const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
        applyTheme(saved);
    }
    window.addEventListener('pageLoaded', function () {
        const current = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
        updateButtons(current);
    });
    systemDarkQuery.addEventListener('change', function () {
        const current = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
        if (current === 'system') {
            updateButtons('system');
        }
    });

    init();
})();
