/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

// Smoke test for the built "all" chunk (sdk-all.js) of a single editor module,
// loaded directly from deploy/ alongside sdk-all-min.js — the same load order
// editorscommon.js uses at runtime (min bootstraps, then loads all).
//
// This exists because develop/sdkjs/{module}/scripts.js under COMPILED=1 only
// ever references sdk-all-min.js (mirrors the legacy Gruntfile's writeScripts()
// exactly), so api.html/api-cell.html/api-slide.html/api-visio.html running
// against that manifest never exercise sdk-all.js at all — a bad concat order
// or dropped file specific to one editor's "all" chunk (something touching
// AscWord/AscCommonExcel/AscCommonSlide/AscVisio) can ship undetected.
//
// window.SDK_COMPILED_NAMESPACE (set by the including *-compiled.html file)
// names the editor-specific global this module's "all" chunk is expected to
// define — asserting only that it exists and is non-empty is intentionally
// minimal: this is a load/concat-order smoke test, not an API test suite.
$(function () {

	QUnit.module("Test built 'all' chunk (COMPILED=1 smoke test) for " + window.SDK_COMPILED_NAMESPACE);

	QUnit.test("Editor-specific namespace is defined and non-empty after loading sdk-all-min.js + sdk-all.js", function (assert)
	{
		const ns = window[window.SDK_COMPILED_NAMESPACE];
		assert.ok(ns, window.SDK_COMPILED_NAMESPACE + " is defined on window");
		assert.ok(Object.keys(ns || {}).length > 0, window.SDK_COMPILED_NAMESPACE + " is non-empty");
	});
});
