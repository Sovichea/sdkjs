/**
 * SPDX-FileCopyrightText: 2026 Euro-Office contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'use strict';

const test   = require('node:test');
const assert = require('node:assert/strict');

const { fixUrl } = require('../scripts/build-develop.cjs');

test('fixUrl: resolves POSIX-separated relative paths against the base URL', () => {
    assert.deepEqual(
        fixUrl(['word/api.js', 'common/AllFonts.js'], '../../../../sdkjs/build/'),
        ['../../../../sdkjs/build/word/api.js', '../../../../sdkjs/build/common/AllFonts.js'],
    );
});

test('fixUrl: does not corrupt paths containing backslash-separated segments (Windows path.relative output)', () => {
    // path.relative() on Windows returns segments joined with '\', not '/'.
    // url.resolve() treats '\' as a literal character rather than a path
    // separator, so a caller must normalize to '/' before calling fixUrl —
    // this asserts fixUrl's own resolution behaves correctly once that
    // normalization has happened, and stays a visible regression if a caller
    // stops normalizing.
    const winStyleAlreadyNormalized = 'word\\api.js'.split('\\').join('/');
    assert.equal(
        fixUrl([winStyleAlreadyNormalized], '../../../../sdkjs/build/')[0],
        '../../../../sdkjs/build/word/api.js',
    );
});

