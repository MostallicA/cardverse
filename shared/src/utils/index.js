'use strict';
// Utility functions
Object.defineProperty(exports, '__esModule', { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.sleep = void 0;
var sleep = function (ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};
exports.sleep = sleep;
var isDevelopment = function () {
  return process.env.NODE_ENV === 'development';
};
exports.isDevelopment = isDevelopment;
var isProduction = function () {
  return process.env.NODE_ENV === 'production';
};
exports.isProduction = isProduction;
var isTest = function () {
  return process.env.NODE_ENV === 'test';
};
exports.isTest = isTest;
