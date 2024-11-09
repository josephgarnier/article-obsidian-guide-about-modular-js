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

class FilePicker {
  // @ts-ignore
  #notice = (msg) => new Notice(msg, 10000);
  #log = (msg) => console.log(msg);
  #noticeAndThrowError = (error) => {
    // @ts-ignore
    new Notice(error, 10000);
    throw new Error(error);
  };
  #logAndThrowError = (error) => {
    console.log(error);
    throw new Error(error);
  };
  #noticeAndLog = (error) => {
    // @ts-ignore
    new Notice(error, 10000);
    console.log(error);
  };

  /** @type {Promise<string>} */
  #waitForClose;
  #resolvePromise = (value) => {};
  #rejectPromise = (reason) => {};
  /** @type {boolean} */
  #submitted = false;
  /** @type {HTMLInputElement} */
  #inputEl;
  /** @type {string} */
  #selectedFilePath;

  /**
   * @returns {Promise<string>}
   */
  static pickFile() {
    const filePickerWidget = new FilePicker();
    return filePickerWidget.waitForClose;
  }

  /**
   * Construct a `FilePicker` object.
   */
  constructor() {
    this.#waitForClose = new Promise((resolve, reject) => {
      this.#resolvePromise = resolve;
      this.#rejectPromise = reject;
    });

    this.#inputEl = this.#createInputFilePicker();
    this.#inputEl.addEventListener("cancel", this.onCancel.bind(this));
    this.#inputEl.addEventListener("change", this.onChange.bind(this), {
      once: true,
    });
    this.#inputEl.addEventListener("input", this.onInput.bind(this));

    this.#open();
  }

  /**
   * @returns {Promise<string>}
   */
  get waitForClose() {
    return this.#waitForClose;
  }

  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file|\<input type="file"\> documentation} and {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/files|HTMLInputElement: files property documentation}
   * @returns {HTMLInputElement}
   */
  #createInputFilePicker() {
    const filePicker = Object.assign(document.createElement("input"), {
      type: "file",
      multiple: false,
      accept: "*",
    });
    return filePicker;
  }

  #open() {
    this.#inputEl.click();
  }

  onCancel(event) {
    this.#submitted = false;
    this.#onClose();
  }

  onChange(event) {
    if (this.#inputEl.files && this.#inputEl.files.length) {
      // @ts-ignore
      this.#selectedFilePath = this.#inputEl.files[0].path;
      this.#submitted = true;
    }
    this.#onClose();
  }

  onInput(event) {}

  #onClose() {
    if (!this.#submitted)
      this.#rejectPromise(
        "No given input."
      ); // Ideally, a press on cancel should not be considered as a failure, but a success, to not throw an exeption. A Boolean variable would indicate the button clicked and would be transmitted by event.
    else this.#resolvePromise(this.#selectedFilePath);
  }
}

module.exports = FilePicker;
