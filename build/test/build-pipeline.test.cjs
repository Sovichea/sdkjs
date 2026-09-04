/**
 * SPDX-FileCopyrightText: 2026 Euro-Office contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'use strict';

const test   = require('node:test');
const assert = require('node:assert/strict');
const path   = require('node:path');
const fs     = require('node:fs');
const os     = require('node:os');

const { assertSafeBuildRoot, SRC_ROOT, BUILD_DIR, DEFAULT_BUILD_ROOT } = require('../scripts/build-pipeline.cjs');

test('assertSafeBuildRoot: allows the default in-tree deploy dir', () => {
    assert.doesNotThrow(() => assertSafeBuildRoot(DEFAULT_BUILD_ROOT));
});

test('assertSafeBuildRoot: allows an out-of-tree BUILD_ROOT', () => {
    assert.doesNotThrow(() => assertSafeBuildRoot('/package/sdkjs'));
});

test('assertSafeBuildRoot: rejects the checkout root itself', () => {
    assert.throws(() => assertSafeBuildRoot(SRC_ROOT));
});

test('assertSafeBuildRoot: rejects the build/ directory itself', () => {
    assert.throws(() => assertSafeBuildRoot(BUILD_DIR));
});

test('assertSafeBuildRoot: rejects an ancestor that contains the checkout', () => {
    assert.throws(() => assertSafeBuildRoot(path.resolve(SRC_ROOT, '..')));
});

test('assertSafeBuildRoot: rejects an arbitrary in-tree subdir other than the default', () => {
    assert.throws(() => assertSafeBuildRoot(path.join(SRC_ROOT, 'word', 'sdkjs')));
});

test('assertSafeBuildRoot: rejects a symlink whose real path resolves back into the checkout', () => {
    // A BUILD_ROOT that is a symlink pointing into SRC_ROOT looks safe by pure
    // string comparison (its literal path is outside the checkout), but
    // fs.rmSync would still recursively delete through it into real source —
    // realpath resolution must catch this before the string comparisons run.
    const tmpParent = fs.mkdtempSync(path.join(os.tmpdir(), 'build-root-symlink-test-'));
    const linkPath = path.join(tmpParent, 'build-root-link');
    fs.symlinkSync(SRC_ROOT, linkPath, 'dir');
    try {
        assert.throws(() => assertSafeBuildRoot(linkPath));
    } finally {
        fs.rmSync(tmpParent, { recursive: true, force: true });
    }
});
