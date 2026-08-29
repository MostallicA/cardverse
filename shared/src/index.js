'use strict';
/**
 * CardVerse Shared - Entry Point
 *
 * Document ID: CV-SHARED-001
 * Version: 0.1.0
 * Status: Development
 *
 * Shared utilities, types, and constants used across the CardVerse monorepo.
 * This package is consumed by backend, frontend, and other workspaces.
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, '__esModule', { value: true });
// Export all shared types
__exportStar(require('./types'), exports);
// Export all shared utilities
__exportStar(require('./utils'), exports);
// Export all shared constants
__exportStar(require('./constants'), exports);
