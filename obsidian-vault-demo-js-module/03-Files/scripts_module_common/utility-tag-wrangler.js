// @ts-check

/* -------------------------------------------------------------------------- */
/*                                Import Section                              */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {import('custom-js')} CustomJS
 * @typedef {import('obsidian')} Obsidian
 * @typedef {import('obsidian').App} App
 * @typedef {import('obsidian').Notice} Notice
 * @typedef {import('obsidian').TAbstractFile} TAbstractFile
 * @typedef {import('obsidian').TFile} TFile
 * @typedef {import('obsidian').TFolder} TFolder
 */

class ModuleLoader {
  /**
   * @param {string} moduleFolderSuffix Suffixe name of one of folder module in `/03-Files/scripts_module_<suffixe>/` folders.
   * @param {string} moduleFile Name of the file module in the `/03-Files/scripts_module_<suffixe>/` folder.
   * @returns {any} Exported module.
   */
  static importModule(moduleFolderSuffix, moduleFile) {
    const { obsidian, app } = self.customJS || {};
    if (obsidian == null || app == null) throw new Error("customJS is null.");
    let adapter = app.vault.adapter;
    if (adapter instanceof obsidian.FileSystemAdapter) {
      const modulePath =
        adapter.getBasePath() +
        "/03-Files/scripts_module_" +
        moduleFolderSuffix +
        "/" +
        moduleFile;
      // @ts-ignore
      delete global.require.cache[global.require.resolve(modulePath)];
      return require(modulePath);
    }
    throw new Error("Obsidian adapter is not a FileSystemAdapter.");
  }
}

/* -------------------------------------------------------------------------- */
class UtilityTagWrangler {
  // @ts-ignore
  static #notice = (msg) => new Notice(msg, 10000);
  static #log = (msg) => console.log(msg);
  static #noticeAndThrowError = (error) => {
    // @ts-ignore
    new Notice(error, 10000);
    throw new Error(error);
  };
  static #logAndThrowError = (error) => {
    console.log(error);
    throw new Error(error);
  };

  /**
   * Access to Tag Wrangler plugin.
   * @param {App} app A reference to the Obsidian `app`.
   * @returns {object} Tag Wrangler plugin.
   */
  static getTagWranglerPlugin(app) {
    return app.plugins.plugins["tag-wrangler"];
  }

  /**
   * Check is `string` is in the {@link https://github.com/pjeby/tag-wrangler/blob/master/src/Tag.js|Tag Wrangler tag format}.
   * @param {string} string String to test.
   * @returns {Boolean} `true` if the string is in the Tag Wrangler tag format; otherwise `false`.
   */
  static isTag(string) {
    const tagBody =
      /^#[^\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,.:;<=>?@^`{|}~\[\]\\\s]+$/;
    return tagBody.test(string);
  }

  /**
   * Accessor to the variable `tagPages` of plugin.
   * @param {App} app A reference to the Obsidian `app`.
   * @returns {Map<string,Set<TFile>>}
   * @throws {Error} If Tag Wrangler plugin is inaccessible.
   */
  static getPluginTagPages(app) {
    const tagWranglerPlugin = UtilityTagWrangler.getTagWranglerPlugin(app);
    if (!tagWranglerPlugin)
      throw new Error("Tag Wrangler plugin is inaccessible.");

    return tagWranglerPlugin.tagPages;
  }

  /**
   * Accessor to the variable `pageAliases` of plugin.
   * @param {App} app A reference to the Obsidian `app`.
   * @returns {Map<TFile,string[]>}
   * @throws {Error} If Tag Wrangler plugin is inaccessible.
   */
  static getPluginPageAliases(app) {
    const tagWranglerPlugin = UtilityTagWrangler.getTagWranglerPlugin(app);
    if (!tagWranglerPlugin)
      throw new Error("Tag Wrangler plugin is inaccessible.");

    return tagWranglerPlugin.pageAliases;
  }

  /**
   * Get pages having the alias tag `aliasTag`.
   * @param {App} app A reference to the Obsidian `app`.
   * @param {string} aliasTag Tag of alias to search in pages.
   * @returns {Set<TFile>} Pages found.
   * @throws {Error} If Tag Wrangler plugin is inaccessible.
   */
  static getTagPagesOf(app, aliasTag) {
    const tagWranglerPlugin = UtilityTagWrangler.getTagWranglerPlugin(app);
    if (!tagWranglerPlugin)
      throw new Error("Tag Wrangler plugin is inaccessible.");

    /** @type {Map<string,Set<TFile>>} */
    const tagPages = tagWranglerPlugin.tagPages;
    return tagPages.get(aliasTag) ?? new Set();
  }

  /**
   * Get tags with their tag pages.
   * @param {App} app A reference to the Obsidian `app`.
   * @returns {Map<string,TFile>} Map of tags name with their page in the form `{ key: <tag-name>, value: <tag-page> }`.
   * @throws {Error} If Tag Wrangler plugin is inaccessible, if a tag has more than one tag page or no tag page.
   */
  static getTagPages(app) {
    const tagWranglerPlugin = UtilityTagWrangler.getTagWranglerPlugin(app);
    if (!tagWranglerPlugin)
      throw new Error("Tag Wrangler plugin is inaccessible.");

    /** @type {Map<string,Set<TFile>>} */
    const tagPages = tagWranglerPlugin.tagPages;

    /** @type {Map<string,TFile>} */
    let tagPagesReduced = new Map();
    tagPages.forEach((value, key) => {
      if (value.size > 1)
        throw new Error(`The tag '${key}' has too many tag page.`);
      const [firstElement] = value;
      if (!firstElement) throw new Error(`The tag '${key}' has no tag page.`);
      tagPagesReduced.set(key, firstElement);
    });
    return tagPagesReduced;
  }

  /**
   * Get all tags in the vault that have an associated page.
   * @param {App} app A reference to the Obsidian `app`.
   * @returns {string[]} List of tags.
   * @throws {Error} If Tag Wrangler plugin is inaccessible.
   */
  static getTagsWithPage(app) {
    const tagWranglerPlugin = UtilityTagWrangler.getTagWranglerPlugin(app);
    if (!tagWranglerPlugin)
      throw new Error("Tag Wrangler plugin is inaccessible.");

    /** @type {Map<string,Set<TFile>>} */
    const tagPages = tagWranglerPlugin.tagPages;
    return Array.from(tagPages.keys());
  }

  /**
   * Get tag pages with its alias tags.
   * @param {App} app A reference to the Obsidian `app`.
   * @returns {Map<TFile, string>} Map of pages with its alias tag in the form `{ key: <tag-page>, value: <tag-name> }`.
   * @throws {Error} If Tag Wrangler plugin is inaccessible, if a tag page has more than one tag.
   */
  static getAliasTags(app) {
    const tagWranglerPlugin = UtilityTagWrangler.getTagWranglerPlugin(app);
    if (!tagWranglerPlugin)
      throw new Error("Tag Wrangler plugin is inaccessible.");

    /** @type {Map<TFile,string[]>} */
    const aliasTags = tagWranglerPlugin.pageAliases;

    /** @type {Map<TFile,string>} */
    let aliasTagsReduced = new Map();
    aliasTags.forEach((value, key) => {
      if (value.length > 1)
        throw new Error(
          `The tag page '${key.basename}' has too many alias tag.`
        );
      const [firstElement] = value;
      if (!firstElement)
        throw new Error(`The page '${key.basename}' has no alias tag.`);
      aliasTagsReduced.set(key, firstElement);
    });
    return aliasTagsReduced;
  }
}

module.exports = UtilityTagWrangler;
