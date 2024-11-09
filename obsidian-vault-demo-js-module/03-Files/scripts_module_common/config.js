/**
 * @description Module for all config variables.
 * @module Config
 */

// @ts-check

module.exports = {
  obsidianFolderPaths: {
    article: "01-Articles",
    project: "02-Projects",
    file: "03-Files",
    tags: "04-Tags",
    template: "05-Templates",
    templateSource: "05-Templates/Source",
    special: "06-Special",
    user: "07-User",
    help: "08-Help",
    archives: "09-Archives",
  },
  fsRootPaths: {
    linux: "/home/joseph/", // Root path on Linux File System
    windows: "%userprofile%/", // Root path on Windows File System
    android: "", // Root path on Android File System
    mac: "", // Root path on Mac File System
    ios: "", // Root path on iOS File System
  },
};
