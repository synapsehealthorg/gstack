// polyfill.js — Node v18 polyfill for ES2023 toSorted method

if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) {
    return [...this].sort(compareFn);
  };
}
console.log("[POLYFILL] Array.prototype.toSorted successfully loaded.");
