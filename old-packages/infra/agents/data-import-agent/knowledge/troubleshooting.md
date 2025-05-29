# Data Import Troubleshooting

Version: v1.0.0
Last Updated: 2024-12-09 11:16:36 +08:00
Status: Active

## Overview

Problem resolution guides for common data import issues in the Oishiiteru platform.

## Common Issues

### 1. Data Validation Failures

#### Symptoms

- High validation error rates
- Inconsistent data formats
- Missing required fields

#### Diagnosis

1. Check error logs
2. Review validation rules
3. Analyze data patterns
4. Verify source data

#### Resolution

1. Implement validation logging:

```typescript
function validateWithLogging(data: any, rules: ValidationRules): boolean {
    try {
        const validationResult = validate(data, rules);

        if (!validationResult.valid) {
            console.error('Validation failed:', {
                data: data.id || 'unknown',
                errors: validationResult.errors,
                rules: Object.keys(rules),
            });
        }

        return validationResult.valid;
    } catch (error) {
        console.error('Validation error:', {
            error: error instanceof Error ? error.message : error,
            data: data.id || 'unknown',
        });
        return false;
    }
}
```

2. Common fixes:
    - Update validation rules
    - Fix data formatting
    - Add data cleaning
    - Improve error handling

### 2. Import Performance Issues

#### Symptoms

- Slow import speeds
- High resource usage
- Timeouts during import

#### Diagnosis

1. Monitor throughput
2. Check resource limits
3. Analyze bottlenecks
4. Review batch sizes

#### Resolution

1. Optimize batch processing:

```typescript
class BatchProcessor {
    private readonly batchSize: number;
    private readonly maxConcurrent: number;

    constructor(batchSize = 25, maxConcurrent = 4) {
        this.batchSize = batchSize;
        this.maxConcurrent = maxConcurrent;
    }

    async processBatches<T>(items: T[], processor: (item: T) => Promise<void>): Promise<void> {
        const batches = this.createBatches(items);

        for (let i = 0; i < batches.length; i += this.maxConcurrent) {
            const currentBatches = batches.slice(i, i + this.maxConcurrent);
            await Promise.all(currentBatches.map((batch) => this.processBatch(batch, processor)));
        }
    }

    private createBatches<T>(items: T[]): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < items.length; i += this.batchSize) {
            batches.push(items.slice(i, i + this.batchSize));
        }
        return batches;
    }

    private async processBatch<T>(
        batch: T[],
        processor: (item: T) => Promise<void>
    ): Promise<void> {
        const startTime = Date.now();

        try {
            await Promise.all(batch.map(processor));

            console.log('Batch processed:', {
                size: batch.length,
                duration: Date.now() - startTime,
            });
        } catch (error) {
            console.error('Batch processing failed:', {
                size: batch.length,
                duration: Date.now() - startTime,
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }
}
```

### 3. Data Consistency Issues

#### Symptoms

- Duplicate records
- Missing relationships
- Inconsistent states

#### Diagnosis

1. Verify unique constraints
2. Check relationships
3. Validate data integrity
4. Review transactions

#### Resolution

1. Implement consistency checks:

```typescript
async function ensureConsistency(
    data: ImportData,
    context: { table: string; key: string }
): Promise<void> {
    // Check for duplicates
    const existing = await findExisting(context.table, data[context.key]);
    if (existing) {
        console.warn('Duplicate record found:', {
            table: context.table,
            key: context.key,
            value: data[context.key],
        });
        return;
    }

    // Validate relationships
    const relationshipErrors = await validateRelationships(data);
    if (relationshipErrors.length > 0) {
        console.error('Relationship validation failed:', {
            errors: relationshipErrors,
            data: data.id,
        });
        throw new Error('Invalid relationships');
    }

    // Ensure data integrity
    await validateIntegrity(data);
}
```

2. Data cleanup procedures:
    - Remove duplicates
    - Fix relationships
    - Update references
    - Validate integrity
