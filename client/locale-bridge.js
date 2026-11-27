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

        var published = null;

        function publish() {
          var active = readActive();
          published = {
            active: active,
            get: readActive,
          };
          window.__P3R_DSH_LOCALE__ = published;
          try {
            window.dispatchEvent(new CustomEvent('p3r-dsh-locale-change', { detail: { locale: active } }));
          } catch {}
        }

        function cleanup(unsub) {
          try {
            if (typeof unsub === 'function') unsub();
          } catch {}
          if (published && window.__P3R_DSH_LOCALE__ === published) {
            try {
              delete window.__P3R_DSH_LOCALE__;
            } catch {
              window.__P3R_DSH_LOCALE__ = undefined;
            }
          }
        }

        publish();

        var unsub = typeof localeService.subscribe === 'function' ? localeService.subscribe(publish) : null;
        if (typeof ctx.effect === 'function') {
          ctx.effect(function () {
            return function () {
              cleanup(unsub);
            };
          }, 'dsh-p3r-ui: locale bridge');
        } else if (typeof ctx.on === 'function') {
          ctx.on('dispose', function () {
            cleanup(unsub);
          });
        }

        // Optional thinking-effort bridge over DSH's native ModelDirectoryResolver & UiSession.
        // Uses lazy ctx.inject so hosts without model-selection stay unaffected.
        if (typeof ctx.inject === 'function') {
          ctx.inject(['uiSession', 'modelDirectories'], function (scope) {
            var uiSession = scope && scope.uiSession;
            var modelDirectories = scope && scope.modelDirectories;
            var currentBinding = uiSession && uiSession.adapter && uiSession.adapter.current;
            if (!currentBinding || !modelDirectories || typeof modelDirectories.directoryFor !== 'function') return;

            var activeSessionId = undefined;
            var activeDirectory = null;
            var unsubDir = null;
            var effortBridge = null;

            function resolveDefaultLabel() {
              try {
                if (typeof localeService.translate === 'function') {
                  var translated = localeService.translate('model', 'effort.providerDefault');
                  if (translated && translated !== 'effort.providerDefault') return translated;
                }
              } catch {}
              return 'Default';
            }

            function buildEffortSnapshot() {
              if (!activeDirectory || !activeDirectory.store || typeof activeDirectory.store.getSnapshot !== 'function') {
                return { available: false, sessionId: activeSessionId, choices: [], activeIndex: -1, busy: false };
              }
              try {
                var st = activeDirectory.store.getSnapshot();
                if (!st || !st.current) {
                  return { available: false, sessionId: activeSessionId, choices: [], activeIndex: -1, busy: st ? st.status === 'selecting' : false };
                }
                var groups = Array.isArray(st.groups) ? st.groups : [];
                var matchedModel = null;
                for (var g = 0; g < groups.length; g++) {
                  var grp = groups[g];
                  if (!grp || grp.id !== st.current.provider) continue;
                  var models = Array.isArray(grp.models) ? grp.models : [];
                  for (var m = 0; m < models.length; m++) {
                    if (models[m] && models[m].id === st.current.model) {
                      matchedModel = models[m];
                      break;
                    }
                  }
                  if (matchedModel) break;
                }
                var reasoning = matchedModel && matchedModel.reasoning;
                if (!reasoning || !Array.isArray(reasoning.efforts) || reasoning.efforts.length === 0) {
                  return { available: false, sessionId: activeSessionId, choices: [], activeIndex: -1, busy: st.status === 'selecting' };
                }
                // Optimistically reflect in-flight pending effort for the same model so sliders never snap back during RPC
                var sameModelPending = st.pending && st.pending.provider === st.current.provider && st.pending.model === st.current.model ? st.pending : null;
                var activeSel = sameModelPending || st.current;
                var effectiveEffort = activeSel.reasoningEffort !== undefined
                  ? activeSel.reasoningEffort
                  : reasoning.defaultEffort;
                var choices = [];
                if (reasoning.defaultEffort === undefined) {
                  choices.push({ key: 'provider-default', effort: undefined, label: resolveDefaultLabel() });
                }
                for (var i = 0; i < reasoning.efforts.length; i++) {
                  var lv = reasoning.efforts[i];
                  if (!lv) continue;
                  choices.push({ key: 'effort:' + lv.id, effort: lv.id, label: lv.name || String(lv.id) });
                }
                var activeIndex = -1;
                for (var j = 0; j < choices.length; j++) {
                  if (choices[j].effort === effectiveEffort) {
                    activeIndex = j;
                    break;
                  }
                }
                return {
                  available: choices.length > 1,
                  sessionId: activeSessionId,
                  provider: st.current.provider,
                  model: st.current.model,
                  modelName: matchedModel.name || st.current.model,
                  effectiveEffort: effectiveEffort,
                  choices: choices,
                  activeIndex: activeIndex,
                  busy: st.status === 'selecting' || st.status === 'loading',
                };
              } catch {
                return { available: false, sessionId: activeSessionId, choices: [], activeIndex: -1, busy: false };
              }
            }

            function emitEffortChange() {
              try {
                window.dispatchEvent(new CustomEvent('p3r-dsh-effort-change', { detail: buildEffortSnapshot() }));
              } catch {}
            }

            function attachActiveSession() {
              var nextId = undefined;
              try {
                var snap = typeof currentBinding.getSnapshot === 'function' ? currentBinding.getSnapshot() : currentBinding.value;
                nextId = snap && snap.key;
              } catch {}
              if (nextId === activeSessionId && activeDirectory) return;
              if (typeof unsubDir === 'function') {
                try { unsubDir(); } catch {}
                unsubDir = null;
              }
              activeSessionId = nextId;
              activeDirectory = null;
              if (nextId !== undefined && nextId !== null) {
                try {
                  activeDirectory = modelDirectories.directoryFor(nextId);
                  if (activeDirectory && activeDirectory.store && typeof activeDirectory.store.subscribe === 'function') {
                    unsubDir = activeDirectory.store.subscribe(emitEffortChange);
                  }
                } catch {
                  activeDirectory = null;
                }
              }
              emitEffortChange();
            }

            effortBridge = {
              getSnapshot: function () {
                attachActiveSession();
                return buildEffortSnapshot();
              },
              ensureLoaded: function () {
                attachActiveSession();
                if (!activeDirectory || typeof activeDirectory.load !== 'function') {
                  return Promise.resolve(buildEffortSnapshot());
                }
                try {
                  return Promise.resolve(activeDirectory.load()).then(function () {
                    var snap = buildEffortSnapshot();
                    emitEffortChange();
                    return snap;
                  }, function () {
                    return buildEffortSnapshot();
                  });
                } catch {
                  return Promise.resolve(buildEffortSnapshot());
                }
              },
              selectEffort: function (effort) {
                attachActiveSession();
                if (!activeDirectory || typeof activeDirectory.select !== 'function') {
                  return Promise.resolve({ ok: false });
                }
                try {
                  var st = activeDirectory.store && typeof activeDirectory.store.getSnapshot === 'function'
                    ? activeDirectory.store.getSnapshot()
                    : null;
                  if (!st || !st.current) return Promise.resolve({ ok: false });
                  var nextSel = { provider: st.current.provider, model: st.current.model };
                  if (effort !== undefined) nextSel.reasoningEffort = effort;
                  return Promise.resolve(activeDirectory.select(nextSel));
                } catch {
                  return Promise.resolve({ ok: false });
                }
              },
            };

            window.__P3R_DSH_EFFORT__ = effortBridge;
            attachActiveSession();

            var unsubCurrent = typeof currentBinding.subscribe === 'function'
              ? currentBinding.subscribe(attachActiveSession)
              : null;

            function cleanupEffort() {
              if (typeof unsubCurrent === 'function') {
                try { unsubCurrent(); } catch {}
                unsubCurrent = null;
              }
              if (typeof unsubDir === 'function') {
                try { unsubDir(); } catch {}
                unsubDir = null;
              }
              activeDirectory = null;
              if (window.__P3R_DSH_EFFORT__ === effortBridge) {
                try {
                  delete window.__P3R_DSH_EFFORT__;
                } catch {
                  window.__P3R_DSH_EFFORT__ = undefined;
                }
              }
            }

            if (typeof scope.effect === 'function') {
              scope.effect(function () {
                return cleanupEffort;
              }, 'dsh-p3r-ui: effort bridge');
            } else if (typeof scope.on === 'function') {
              scope.on('dispose', cleanupEffort);
            }
          });
        }
      };

      return module.exports;
    },
  });
})();
