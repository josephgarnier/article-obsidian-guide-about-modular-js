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

/** @type {typeof import('module-config')} */
const Config = ModuleLoader.importModule("common", "config.js");
const Path = require("node:path");
const Fs = require("node:fs");
/* -------------------------------------------------------------------------- */

class UtilityModalForm {
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
  static #noticeAndLog = (error) => {
    // @ts-ignore
    new Notice(error, 10000);
    console.log(error);
  };

  /**
   * Access to Modal Form plugin.
   * @alias UtilityTemplater.getTemplaterPlugin
   * @param {App} app Obsidian app.
   * @returns {object} Modal Form plugin.
   */
  static getModalFormPlugin(app) {
    return app.plugins.plugins["modalforms"];
  }

  /**
   * Access to Modal Form API.
   * @alias UtilityTemplater.getTemplaterPlugin
   * @param {App} app Obsidian app.
   * @returns {object} Modal Form plugin.
   * @throws {Error} If API is inaccessibles.
   */
  static getModalFormApi(app) {
    const modalFormPlugin = UtilityModalForm.getModalFormPlugin(app)
    if (!modalFormPlugin)
      throw new Error("Modal Form plugin is inaccessible!");
    
    return modalFormPlugin.api;
  }
}

module.exports = UtilityModalForm;