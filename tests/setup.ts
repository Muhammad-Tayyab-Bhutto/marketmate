// Jest setup file
import "idb";

// Mock IndexedDB for tests
global.indexedDB = require("fake-indexeddb");
global.IDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange");
