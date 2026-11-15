(function () {
  if (typeof window === 'undefined' || !window.__ModuleLoader__ || typeof window.__ModuleLoader__.load !== 'function') {
    return;
  }

  window.__ModuleLoader__.load({
    id: 'dsh-p3r-ui',
    factory: function () {
      var module = { exports: {} };
      var exports = module.exports;
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

      exports.name = 'dsh-p3r-ui';
      exports.inject = ['locale'];

      exports.apply = function apply(ctx) {
        var localeService = ctx && ctx.locale;
        if (!localeService || typeof localeService.getSnapshot !== 'function') return;

        function readActive() {
          try {
            var snap = localeService.getSnapshot();
            return snap && typeof snap.active === 'string' ? snap.active : '';
          } catch {
            return '';
          }
        }

        function publish() {
          var active = readActive();
          window.__P3R_DSH_LOCALE__ = {
            active: active,
            get: readActive,
          };
          try {
            window.dispatchEvent(new CustomEvent('p3r-dsh-locale-change', { detail: { locale: active } }));
          } catch {}
        }

        publish();

        if (typeof localeService.subscribe === 'function') {
          var unsub = localeService.subscribe(publish);
          if (typeof ctx.effect === 'function') {
            ctx.effect(function () {
              return function () {
                try {
                  if (typeof unsub === 'function') unsub();
                } catch {}
              };
            }, 'dsh-p3r-ui: locale bridge');
          } else if (typeof ctx.on === 'function') {
            ctx.on('dispose', function () {
              try {
                if (typeof unsub === 'function') unsub();
              } catch {}
            });
          }
        }
      };

      return module.exports;
    },
  });
})();
