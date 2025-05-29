# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## Entry Format

```markdown
### [YYYY-MM-DD] Brief Title

**Author:** Name
**PR:** #number (if applicable)

#### Modified Files:

- file/path:
    - What changed
    - Why changed
    - Impact of change
```

## Changes

### [2024-01-XX] Enhanced Analytics & Error Handling

**Author:** Codeium Team

#### Modified Files:

- src/functions/event-processor/handler.ts:

    - Added AnalyticsEventDetail interface and createAnalyticsEvent helper
    - Added event categorization (USER_ACTION, SYSTEM_EVENT, AUTH_EVENT, QUERY)
    - Added performance metrics (duration, memory usage)
    - Enhanced error tracking (SUCCESS/FAILURE status)
    - Improved context preservation (traceId, userId)
    - Impact: Better analytics tracking and error handling

- src/functions/review-query/handler.ts:

    - Added environment variable validation (REVIEW_TABLE, ANALYTICS_EVENT_BUS)
    - Added input validation (table name: ^[a-zA-Z0-9_.-]+$, restaurant ID: ^[a-zA-Z0-9_-]+$)
    - Added parameter validation (limit: 1-100)
    - Enhanced error handling in DynamoDB operations
    - Made analytics errors non-blocking
    - Impact: Improved data validation and reliability

- lib/lambda-stack.ts:

    - Added public getHandler method
    - Fixed access modifiers for better encapsulation
    - Impact: Better Lambda function access control

- lib/eventbridge-stack.ts:

    - Updated to use getHandler method
    - Fixed private access issues
    - Impact: Proper encapsulation of stack resources

- docs/architecture/event-flows.md:
    - Added analytics documentation and flow diagrams
    - Added implementation guidelines
    - Impact: Better system understanding and maintainability

#### Infrastructure Updates:

- Event Buses:
    - USER_EVENT_BUS: User domain events
    - AUTH_EVENT_BUS: Authentication events
    - SYSTEM_EVENT_BUS: System events
    - ANALYTICS_EVENT_BUS: Analytics data
- Error Handling:
    - Implemented ApplicationError class
    - Added standardized error formats
- Processing:
    - Added parallel SQS event processing
    - Added analytics event routing

### [2024-01-XX] Initial Release v1.0.0

**Author:** Codeium Team

#### Base Setup:

- Initial infrastructure setup
- Core Lambda functions implementation
- Event processing system
- Database integration
- API Gateway endpoints

## How to Update This Changelog

1. **Add New Changes at the Top**

    - Create a new section with today's date
    - Include your name as the author
    - List all modified files

2. **For Each File**

    - Use code blocks to separate changes
    - List all modifications
    - Include important details
    - Note any breaking changes

3. **Format**

    ````markdown
    ### YYYY-MM-DD - Brief Title

    **Author:** Your Name

    #### Files Modified

    **path/to/file**

    ```typescript
    Changes:
    - Change 1
    - Change 2

    Details:
    - Detail 1
    - Detail 2
    ```
    ````

    ```

    ```

4. **Commit Message**
    - Use the same title as your changelog entry
    - Reference the changelog update in your commit
