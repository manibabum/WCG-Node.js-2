#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fetch = require('pkg-fetch');
const dontBuild = require('pkg-fetch/lib-es5/upload.js').dontBuild;
const knownPlatforms = fetch.system.knownPlatforms;
const items = [];

function nodeRangeToNodeVersion (nodeRange) {
  assert(/^node/.test(nodeRange));
  return 'v' + nodeRange.slice(4);
}

for (const nodeRange of [ 'node0', 'node4', 'node6', 'node8', 'node10' ]) {
  const nodeVersion = nodeRangeToNodeVersion(nodeRange);
  for (const platform of knownPlatforms) {
    const archs = [ 'x86', 'x64' ];
    if (platform === 'linux') archs.push('armv7');
    // linux-armv7 is needed in multi-arch tests,
    // so keeping it here as obligatory. but let's
    // leave compiling for freebsd to end users
    if (platform === 'freebsd') continue;
    for (const arch of archs) {
      if (dontBuild(nodeVersion, platform, arch)) continue;
      items.push({ nodeRange, platform, arch });
    }
  }
}

let p = Promise.resolve();
items.forEach((item) => {
  p = p.then(() => fetch.need(item));
});

p.catch((error) => {
  if (!error.wasReported) console.log(`> ${error}`);
  process.exit(2);
});
