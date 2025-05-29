# Lambda Function Module Syntax Guide

## Overview

This document provides guidance on the correct module syntax to use in AWS Lambda functions for the Bellyfed project. Using the wrong module syntax is a common cause of Lambda function failures.

## CommonJS vs ES Modules

AWS Lambda supports both CommonJS and ES Modules syntax, but they require different configurations:

### CommonJS (Default)

By default, Lambda functions use CommonJS module syntax. This is the recommended approach for Bellyfed Lambda functions.

**Example of CommonJS syntax:**

```javascript
// Imports
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { v4: uuidv4 } = require('uuid');

// Exports
exports.handler = async (event) => {
    // Function implementation
};
```

### ES Modules

To use ES Modules syntax, you need to:

1. Set `"type": "module"` in your `package.json`
2. Configure the Lambda function to use the correct handler format
3. Use `.mjs` file extension or configure your build process appropriately

**Example of ES Modules syntax:**

```javascript
// Imports
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';

// Exports
export const handler = async (event) => {
    // Function implementation
};
```

## Common Issues

### "Cannot use import statement outside a module" Error

This error occurs when:

- You use ES Modules syntax (`import` statements) in a Lambda function configured for CommonJS
- The function is not properly configured with `"type": "module"` in package.json

### Solution

1. **Preferred approach**: Convert ES Modules syntax to CommonJS

    - Change `import` statements to `require()`
    - Change `export const handler` to `exports.handler`

2. **Alternative approach**: Configure for ES Modules
    - Add `"type": "module"` to package.json
    - Update the build process to handle ES Modules correctly

## Best Practices for Bellyfed

For consistency across the Bellyfed project:

1. **Use CommonJS syntax for all Lambda functions**
2. Use `require()` for imports
3. Use `exports.handler` for the handler function
4. Ensure tsconfig.json has `"module": "CommonJS"` for TypeScript functions
5. Test Lambda functions locally before deployment

## Testing Module Syntax

Before deploying, you can test your Lambda function locally to ensure the module syntax is correct:

```bash
# For CommonJS
node -e "console.log(require('./dist/index').handler)"

# For ES Modules
node --input-type=module -e "import { handler } from './dist/index.js'; console.log(handler)"
```

## References

- [AWS Lambda Node.js Runtime Documentation](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html)
- [Node.js ECMAScript Modules](https://nodejs.org/api/esm.html)
