'use strict';

const path = require('path');
const readdir = require('@yr/readdir');

const RE_JSON = /\.json$/;

/**
 * Load locale files in 'localespath'
 * @param {Array} localeCodes
 * @param {Object} locales
 * @param {String} localespath
 * @param {Obejct} [options]
 *  - {String} rootpath
 */
module.exports = function load (localeCodes, locales, localespath, options = {}) {
  localeCodes.forEach((localeCode) => {
    let localeInstance = locales.get(localeCode);

    if (!localeInstance) {
      let time;

      try {
        time = require(`@yr/time/locale/${localeCode}.json`);
      } catch (err) {
        time = {};
      }

      localeInstance = locales.add(localeCode, { time }, options);
    }

    if (options.rootpath && path.resolve(localespath) !== localespath) {
      localespath = path.join(options.rootpath, localespath);
    }

    const data = loadLocale(path.resolve(localespath, localeCode));

    if (data) localeInstance.set(data);
  });
};

/**
 * Load locale files at 'localepath'
 * @param {String} localepath
 * @returns {Object}
 */
function loadLocale (localepath) {
  let data = {};

  // Read and store file contents
  readdir(localepath, true, RE_JSON)
    .forEach((filepath) => {
      // Use filename as key
      const key = path.basename(filepath).replace(path.extname(filepath), '');
      // Parse property names (directory names under localepath)
      const props = filepath.replace(localepath, '')
        .split(path.sep)
        .slice(1, -1);
      let slot = data;

      if (props.length) {
        // Walk and set props
        props.reduce((prev, cur) => {
          if (!prev[cur]) prev[cur] = {};
          // Store reference
          slot = prev[cur];
          return slot;
        }, data);
      }

      slot[key] = require(filepath);
    });

  return data;
}