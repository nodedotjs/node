'use strict';

const common = require('../common');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

if (!common.isMainThread)
  common.skip('process.chdir is not available in Workers');

const tmpdir = require('../common/tmpdir');

process.chdir('..');
assert.notStrictEqual(process.cwd(), __dirname);
process.chdir(__dirname);
assert.strictEqual(process.cwd(), __dirname);

let dirName;
if (process.versions.icu) {
  // ICU is available, use characters that could possibly be decomposed
  dirName = 'weird \uc3a4\uc3ab\uc3af characters \u00e1\u00e2\u00e3';
} else {
  // ICU is unavailable, use characters that can't be decomposed
  dirName = 'weird \ud83d\udc04 characters \ud83d\udc05';
}
const dir = path.resolve(tmpdir.path, dirName);

// Make sure that the tmp directory is clean
tmpdir.refresh();

fs.mkdirSync(dir);
process.chdir(dir);
assert.strictEqual(process.cwd().normalize(), dir.normalize());

process.chdir('..');
assert.strictEqual(process.cwd().normalize(),
                   path.resolve(tmpdir.path).normalize());

const err = {
  code: 'ERR_INVALID_ARG_TYPE',
  message: /The "directory" argument must be of type string/
};
common.expectsError(function() { process.chdir({}); }, err);
common.expectsError(function() { process.chdir(); }, err);

// Check that our built-in methods do not have a prototype/constructor behaviour
// if they don't need to. This could be tested for any of our C++ methods.
assert.strictEqual(process.cwd.prototype, undefined);
assert.throws(() => new process.cwd(), TypeError);
