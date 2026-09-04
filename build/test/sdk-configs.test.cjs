/**
 * SPDX-FileCopyrightText: 2026 Euro-Office contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'use strict';

const test   = require('node:test');
const assert = require('node:assert/strict');

const { getFilesMin, getFilesAll, mergeConfigs } = require('../lib/sdk-configs.cjs');

test('getFilesMin: desktop min falls back to [] when desktop config omits "min"', () => {
    const sdkCfg = { min: ['a.js'], desktop: { common: ['b.js'] } };
    assert.deepEqual(getFilesMin(sdkCfg, 'desktop'), ['a.js']);
});

test('getFilesMin: mobile_banners min falls back to [] when omitted', () => {
    const sdkCfg = { min: ['a.js'], mobile_banners: { common: ['banner.js'] } };
    assert.deepEqual(getFilesMin(sdkCfg, 'mobile'), ['a.js']);
});

test('getFilesMin: mobile_banners min is prepended when present', () => {
    const sdkCfg = { min: ['a.js'], mobile_banners: { min: ['banner-min.js'] } };
    assert.deepEqual(getFilesMin(sdkCfg, 'mobile'), ['banner-min.js', 'a.js']);
});

test('getFilesAll: desktop common falls back to [] when omitted', () => {
    const sdkCfg = { common: ['a.js'], desktop: { min: ['b.js'] } };
    assert.deepEqual(getFilesAll(sdkCfg, 'desktop'), ['a.js']);
});

test('getFilesAll: mobile_banners common falls back to [] when omitted', () => {
    const sdkCfg = { common: ['a.js'], mobile_banners: { min: ['banner-min.js'] } };
    assert.deepEqual(getFilesAll(sdkCfg, 'mobile'), ['a.js']);
});

test('getFilesAll: mobile_banners common is prepended, then exclude_mobile filters, then mobile appends', () => {
    const sdkCfg = {
        common: ['a.js', 'skip.js'],
        mobile_banners: { common: ['banner.js'] },
        exclude_mobile: ['skip.js'],
        mobile: ['mobile-only.js'],
    };
    assert.deepEqual(
        getFilesAll(sdkCfg, 'mobile'),
        ['banner.js', 'a.js', 'mobile-only.js']
    );
});

test('mergeConfigs: array properties concatenate', () => {
    const base = { min: ['a.js'] };
    mergeConfigs(base, { min: ['b.js'] });
    assert.deepEqual(base.min, ['a.js', 'b.js']);
});

test('mergeConfigs: nested object properties merge recursively', () => {
    const base = { desktop: { min: ['a.js'] } };
    mergeConfigs(base, { desktop: { common: ['b.js'] } });
    assert.deepEqual(base, { desktop: { min: ['a.js'], common: ['b.js'] } });
});
