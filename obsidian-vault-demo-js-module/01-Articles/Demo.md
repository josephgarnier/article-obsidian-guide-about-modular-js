---
tags:
  - guide
  - javascript
  - macro
  - module
  - obsidian
---

> [!tip] Tips
> Switch this page to "source mode" to see the calls to JavaScript code.

## Executing JavaScript code in Obsidian

The Dataview plugin provides [two syntaxes](https://blacksmithgu.github.io/obsidian-dataview/queries/dql-js-inline/#dataview-js) for embedding JavaScript in a markdown file.

The **first syntax** produces a rendering in a dedicated block (a `div`) that is separated from the text before and after it:

````markdown
```dataviewjs
// here my code
```
````

For example, the following markdown code :

````markdown
Text before.

```dataviewjs
dv.span("You read the page: " + dv.fileLink(dv.current().file.path, false, "Guide for Obsidian")) + ".";
```

Text after.
````

Display:

Text before.

```dataviewjs
dv.span("You read the page: " + dv.fileLink(dv.current().file.path, false, "Guide for Obsidian")) + ".";
```

Text after.

The **second syntax** is called *inline* and produces a rendering within the text before and after :

```markdown
`$= // here my code`
```

For example, the following markdown code :

````markdown
Text before. `$= "You read the page: " + dv.fileLink(dv.current().file.path, false, "Guide for Obsidian") + ".";` Text after.
````

Display:

Text before. `$= "You read the page: " + dv.fileLink(dv.current().file.path, false, "Guide for Obsidian") + ".";` Text after.

## Externalise JavaScript code in script files

Syntax to call a macro:

````js
```dataviewjs
customJS.MacroGuide.helloWorld(dv);
```
````

This code will call the script `03-Files/scripts_customjs/my-script.js`.

For example:

```dataviewjs
customJS.MacroGuide.helloWorld(dv);
```

## Importing a script into another

See the demo code in `03-Files/scripts_customjs/my-script-with-import.js`.

For example:

```dataviewjs
customJS.MacroGuideWithImport.helloWorld(dv);
```

## Use Case : Tags of page

The proposed example is a macro called `MacroTagsOfPages`, which displays in a frame the list of tags in the `tags` property of the page. It is inspired by Wikipedia footers (as can be seen, for example, on the [Obsidian page](<https://en.wikipedia.org/wiki/Obsidian_(software)>)). This macro is based on the `UtilityObsidian` module, and its style is defined by the `.macro-tags-of-page` CSS class.

**The source code is available in :**

- `03-Files/scripts_module_common/utility-obsidian.js` : utility module with static functions to modify and to read Obsidian vault.
- `03-Files/scripts_customjs/macro-tags-of-page.js` : code of the macro `MacroTagsOfPages`.
- `.obsidian/snippets/macro.css`: CSS snippet with CSS class `.macro-tags-of-page` for styling the macro.

Syntax to call a macro:

````js
```dataviewjs
await customJS.MacroTagsOfPage.listInBox(dv, dv.current().file.path);;
```
````

For example:

```dataviewjs
await customJS.MacroTagsOfPage.listInBox(dv, dv.current().file.path);
```

## Bonus content

This vault provides **two bonus JavaScript modules** not presented in the original article.

The first module can be found in the `03-Files/scripts_module_common/` folder and contains **JavaScript utility classes** for interacting with any plugins installed and the Obsidian vault. They are intended to be called by other modules.

A second module is located in the `03-Files/scripts_module_widget/` folder and contains **Widgets classes** which are also intended to be called from any other modules.
