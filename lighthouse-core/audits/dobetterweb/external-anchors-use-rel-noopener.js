/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const URL = require('../../lib/url-shim');
const Audit = require('../audit');
const Formatter = require('../../formatters/formatter');

class ExternalAnchorsUseRelNoopenerAudit extends Audit {
  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      category: 'Performance',
      name: 'external-anchors-use-rel-noopener',
      description: 'Site opens external anchors using rel="noopener"',
      helpText: 'Open new tabs using `rel="noopener"` to improve performance and ' +
          'prevent security vulnerabilities. ' +
          '[Learn more](https://developers.google.com/web/tools/lighthouse/audits/noopener).',
      requiredArtifacts: ['URL', 'AnchorsWithNoRelNoopener']
    };
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit(artifacts) {
    if (artifacts.AnchorsWithNoRelNoopener === -1) {
      return ExternalAnchorsUseRelNoopenerAudit.generateAuditResult({
        rawValue: -1,
        debugString: 'Unknown error with the AnchorsWithNoRelNoopener gatherer.'
      });
    }

    const pageHost = new URL(artifacts.URL.finalUrl).host;
    // Filter usages to exclude anchors that are same origin
    const failingAnchors = artifacts.AnchorsWithNoRelNoopener.usages
      .filter(anchor => new URL(anchor.href).host !== pageHost)
      .map(anchor => {
        return {
          url: `<a
            href="${anchor.href}"
            ${anchor.target ? ` target="${anchor.target}"` : ''}
            ${anchor.rel ? ` rel="${anchor.rel}"` : ''}>...
          </a>`
        };
      });

    return ExternalAnchorsUseRelNoopenerAudit.generateAuditResult({
      rawValue: failingAnchors.length === 0,
      extendedInfo: {
        formatter: Formatter.SUPPORTED_FORMATS.URLLIST,
        value: failingAnchors
      }
    });
  }
}

module.exports = ExternalAnchorsUseRelNoopenerAudit;
