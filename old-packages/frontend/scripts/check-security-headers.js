#!/usr/bin/env node

/**
 * This script checks the security headers of a deployed application.
 * It can be used in CI/CD pipelines to verify that security headers are properly set.
 *
 * Usage:
 *   node scripts/check-security-headers.js https://app-dev.bellyfed.com
 */

const https = require('https');
const url = require('url');

// The URL to check
const targetUrl = process.argv[2] || 'https://app-dev.bellyfed.com';

// Required security headers
const requiredHeaders = {
  'content-security-policy': {
    required: true,
    directives: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*",
      "connect-src 'self' https://*.amazonaws.com",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "object-src 'none'",
    ],
  },
  'x-content-type-options': {
    required: true,
    value: 'nosniff',
  },
  'x-frame-options': {
    required: true,
    value: 'DENY',
  },
  'x-xss-protection': {
    required: true,
    value: '1; mode=block',
  },
  'referrer-policy': {
    required: true,
    value: 'strict-origin-when-cross-origin',
  },
};

console.log(`Checking security headers for ${targetUrl}...`);

// Parse the URL
const parsedUrl = url.parse(targetUrl);

// Make a request to the URL
const req = https.request(
  {
    hostname: parsedUrl.hostname,
    path: parsedUrl.path || '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Security-Headers-Check/1.0',
    },
  },
  (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:');

    // Check each required header
    let missingHeaders = [];
    let incorrectHeaders = [];

    Object.keys(requiredHeaders).forEach((header) => {
      const headerConfig = requiredHeaders[header];
      const headerValue = res.headers[header];

      if (!headerValue && headerConfig.required) {
        missingHeaders.push(header);
        console.log(`  ${header}: MISSING`);
      } else if (headerValue) {
        if (headerConfig.value && headerValue !== headerConfig.value) {
          incorrectHeaders.push({
            header,
            expected: headerConfig.value,
            actual: headerValue,
          });
          console.log(
            `  ${header}: ${headerValue} (INCORRECT - expected ${headerConfig.value})`,
          );
        } else if (headerConfig.directives) {
          const missingDirectives = headerConfig.directives.filter(
            (directive) => !headerValue.includes(directive),
          );
          if (missingDirectives.length > 0) {
            incorrectHeaders.push({
              header,
              missingDirectives,
            });
            console.log(
              `  ${header}: ${headerValue} (MISSING DIRECTIVES: ${missingDirectives.join(', ')})`,
            );
          } else {
            console.log(`  ${header}: ${headerValue} (OK)`);
          }
        } else {
          console.log(`  ${header}: ${headerValue} (OK)`);
        }
      }
    });

    // Print other headers
    Object.keys(res.headers).forEach((header) => {
      if (!requiredHeaders[header]) {
        console.log(`  ${header}: ${res.headers[header]}`);
      }
    });

    // Summary
    console.log('\nSummary:');
    if (missingHeaders.length === 0 && incorrectHeaders.length === 0) {
      console.log('✅ All required security headers are present and correct.');
      process.exit(0);
    } else {
      if (missingHeaders.length > 0) {
        console.log(`❌ Missing headers: ${missingHeaders.join(', ')}`);
      }
      if (incorrectHeaders.length > 0) {
        console.log('❌ Incorrect headers:');
        incorrectHeaders.forEach((item) => {
          if (item.missingDirectives) {
            console.log(
              `  - ${item.header}: Missing directives: ${item.missingDirectives.join(', ')}`,
            );
          } else {
            console.log(
              `  - ${item.header}: Expected "${item.expected}", got "${item.actual}"`,
            );
          }
        });
      }
      process.exit(1);
    }
  },
);

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});

req.end();
