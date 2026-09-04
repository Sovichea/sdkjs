/**
 * SPDX-FileCopyrightText: 2026 Euro-Office contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Guards the "bare global" backward-compat contract that ~287 places across
 * sdkjs depend on (see webpack.sdk.factory.mjs's `iife: false` comment): the
 * 'min' chunk config has no imports, no splitChunks, no externals, so webpack
 * currently inlines the single concatenated module directly at true top
 * level, with no __webpack_require__ runtime and no per-module function
 * wrapper — a bare top-level `var` in the source lands on the global object
 * exactly like a plain <script> tag would.
 *
 * The first test below compiles sdkConfig()'s own real 'min' chunk config
 * (not a hand-written stand-in) so a future edit to chunkConfig() that
 * accidentally adds externals/splitChunks/a dynamic import() to the actual
 * production config is caught directly, rather than only being caught if
 * someone remembers to also update a synthetic config here.
 *
 * The second test proves the discriminating assertion itself is meaningful —
 * that adding import() (the documented danger case) actually does switch a
 * matching synthetic config to the wrapped __webpack_require__ form — so a
 * webpack version change that stopped honoring iife:false wouldn't leave
 * this suite passing for the wrong reason.
 */

'use strict';

const test   = require('node:test');
const assert = require('node:assert/strict');
const path   = require('node:path');
const url    = require('node:url');
const fs     = require('node:fs');
const os     = require('node:os');
const webpack = require('webpack');

function compile(tmpDir, entrySource, { withDynamicImport }) {
    const entry = path.join(tmpDir, 'entry.js');
    fs.writeFileSync(entry, entrySource);

    if (withDynamicImport) {
        fs.writeFileSync(path.join(tmpDir, 'other.js'), 'export default 42;');
    }

    return new Promise((resolve, reject) => {
        const compiler = webpack({
            mode: 'production',
            entry,
            output: {
                path: tmpDir,
                filename: withDynamicImport ? 'wrapped.js' : 'bare.js',
                // Same knob the real 'min'/'all' chunk configs set — see
                // webpack.sdk.factory.mjs's chunkConfig().
                iife: false,
            },
            // Minification is a separate concern (covered by the mangle:false
            // tests) — disabled here so it can't obscure the wrapping question.
            optimization: { minimize: false },
        });
        compiler.run((err, stats) => {
            compiler.close(() => {});
            if (err || stats.hasErrors()) return reject(err || new Error(stats.toString()));
            resolve(fs.readFileSync(path.join(tmpDir, withDynamicImport ? 'wrapped.js' : 'bare.js'), 'utf8'));
        });
    });
}

test('bare-global contract: the real sdkConfig() "min" chunk stays unwrapped', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bare-global-real-'));
    const prevBuildRoot = process.env.BUILD_ROOT;
    const prevCacheDir  = process.env.WEBPACK_CACHE_DIR;
    // Isolate this run from the real deploy dir and the shared persistent
    // webpack cache — this test only cares about the compiled shape, not
    // about producing (or reusing) real build output.
    process.env.BUILD_ROOT       = tmpDir;
    process.env.WEBPACK_CACHE_DIR = path.join(tmpDir, '.webpack-cache');
    try {
        const { sdkConfig } = await import(
            url.pathToFileURL(path.join(__dirname, '..', 'webpack.sdk.factory.mjs'))
        );
        const [minConfig] = sdkConfig('word');

        const bundle = await new Promise((resolve, reject) => {
            const compiler = webpack(minConfig);
            compiler.run((err, stats) => {
                compiler.close(() => {});
                if (err || stats.hasErrors()) return reject(err || new Error(stats.toString()));
                resolve(fs.readFileSync(path.join(minConfig.output.path, 'sdk-all-min.js'), 'utf8'));
            });
        });

        // sdkjs's real 'min' chunk does trip webpack's harmless "global object"
        // runtime helper (some concatenated file does a `typeof global`-style
        // check) — that adds a bare `__webpack_require__.g` accessor object but
        // does NOT wrap the module code itself, so checking for that substring
        // alone (as an earlier version of this test did against a trivial
        // synthetic entry that never triggered it) would false-positive on the
        // real config. The markers below are specific to true modularization:
        // they only appear once webpack decides it needs the require-function/
        // module-map runtime, which is what actually moves the bare vars inside
        // a function scope and breaks the ~287 call sites.
        assert.equal(bundle.includes('__webpack_modules__'), false,
            'sdkConfig("word")\'s real "min" chunk config must not gain a webpack module map — that would mean the bare-global inlining broke');
        assert.equal(bundle.includes('__webpack_module_cache__'), false,
            'sdkConfig("word")\'s real "min" chunk config must not gain a webpack module cache — a future edit adding externals/splitChunks/import() would silently break ~287 bare-global call sites at runtime with a green build and no warning');
        assert.equal(/function\s+__webpack_require__\s*\(/.test(bundle), false,
            'sdkConfig("word")\'s real "min" chunk config must not gain a __webpack_require__ module-loader function — same regression as above');
    } finally {
        if (prevBuildRoot === undefined) delete process.env.BUILD_ROOT; else process.env.BUILD_ROOT = prevBuildRoot;
        if (prevCacheDir === undefined) delete process.env.WEBPACK_CACHE_DIR; else process.env.WEBPACK_CACHE_DIR = prevCacheDir;
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('bare-global contract: adding import() (the documented danger case) switches webpack to the wrapped runtime', async () => {
    // Proves the test above actually discriminates wrapped vs. unwrapped output,
    // rather than passing unconditionally regardless of config shape.
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bare-global-wrapped-'));
    try {
        const bundle = await compile(
            tmpDir,
            'var AscCommonSdkTestGlobal = { value: 1 + 1 };\nimport("./other.js").then(function (m) { console.log(m); });\n',
            { withDynamicImport: true },
        );

        assert.equal(bundle.includes('__webpack_require__'), true,
            'sanity check: import() must actually force the wrapped bootstrap form for this assertion to mean anything above');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});
