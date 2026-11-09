
import useLocalStore from 'hooks/useLocalStore';
import locales from 'i18n/index.js';

function useTranslate() {
  const localStore = useLocalStore();
  const localeKey = localStore.getLocale() || import.meta.env.VITE_LOCALE;
  let messages = locales[localeKey];
  return {
    locale: localeKey,
    messages,
    /**
     * Translate a given key by looking it up in the current locale's messages,
     * and if arguments are given, replace placeholders in the translated string
     * with the given values.
     *
     * @param {string} key - key to look up in the current locale's messages
     * @param {Object} [args] - object with placeholder names as keys and values
     *   to replace them with
     * @returns {string} - translated string with placeholders replaced, or the
     *   given key if no translation is found
     */
    t: function (key, args) {
      let value = key.split('.').reduce((p, c) => p?.[c], messages);
      if (value && args) {
        const names = Object.keys(args);
        const vals = Object.values(args);
        return new Function(...names, `return \`${value}\`;`)(...vals);
      }
      return value || key;
    }
  };
}

const i18n = useTranslate();
const $t = i18n.t;
export { $t, i18n };