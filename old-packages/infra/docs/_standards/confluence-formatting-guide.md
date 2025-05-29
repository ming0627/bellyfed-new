# Confluence-Compatible Documentation Guide

**Document Type:** STANDARD
**Last Updated:** December 2024
**Owner:** Documentation Team
**Reviewers:** Architecture Team

## Overview

This guide outlines the formatting standards for Bellyfed documentation to ensure compatibility with Confluence when using automated migration tools. Following these standards will ensure that documentation is properly rendered in Confluence and maintains its structure and readability.

## Document Structure

### Metadata Header

Every document should include a metadata header at the top:

```markdown
# Document Title

**Document Type:** [TECH|OPS|DEV|ARCH|PROD]
**Last Updated:** [Date in MMMM YYYY format]
**Owner:** [Team or Individual]
**Reviewers:** [List of reviewers]
```

### Section Hierarchy

Use proper heading levels to create a clear hierarchy:

```markdown
# H1 - Document Title (only one per document)

## H2 - Major Section

### H3 - Subsection

#### H4 - Detailed Point
```

Confluence will use this hierarchy to create the page's table of contents and structure.

## Formatting Elements

### Text Formatting

- **Bold**: Use `**bold text**` for emphasis
- _Italic_: Use `*italic text*` for slight emphasis
- ~~Strikethrough~~: Use `~~strikethrough~~` for deprecated content
- `Code`: Use backticks for inline code

### Lists

#### Unordered Lists

Use hyphens for unordered lists:

```markdown
- Item 1
- Item 2
    - Subitem 2.1
    - Subitem 2.2
- Item 3
```

#### Ordered Lists

Use numbers for ordered lists:

```markdown
1. First step
2. Second step
    1. Substep 2.1
    2. Substep 2.2
3. Third step
```

### Code Blocks

Use triple backticks with language specification:

````markdown
```typescript
function example() {
    console.log('This is a code example');
}
```
````

### Tables

Use standard Markdown tables:

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Links

#### Internal Links

For links to other documents within the repository:

```markdown
[Link Text](../relative/path/to/document.md)
```

These will be converted to Confluence internal links during migration.

#### External Links

For links to external resources:

```markdown
[Link Text](https://example.com)
```

### Images

Include alt text and title for all images:

```markdown
![Alt text for image](path/to/image.png 'Title for image')
```

For diagrams, include a description below the image:

```markdown
![System Architecture Diagram](path/to/diagram.png 'System Architecture')

_Figure 1: High-level system architecture showing the interaction between components_
```

### Admonitions

Use the following format for notes, warnings, and tips:

```markdown
> **Note:** This is an important note.

> **Warning:** This is a warning.

> **Tip:** This is a helpful tip.
```

### Confluence Macros

Some Confluence macros can be represented in Markdown and will be converted during migration:

#### Info Panel

```markdown
> **Info**
> This is an information panel.
```

#### Warning Panel

```markdown
> **Warning**
> This is a warning panel.
```

#### Code Panel

````markdown
```typescript title="Example Code"
// This will be rendered as a code panel with a title
function example() {
    return 'Hello World';
}
```
````

## Labels and Tags

Add labels at the bottom of each document for Confluence categorization:

```markdown
---

**Labels:** label1, label2, label3
```

## Document Naming Conventions

- Use kebab-case for file names: `example-document.md`
- Be descriptive but concise
- Include the document type in the file name when appropriate: `architecture-overview.md`

## Confluence Space mapping

Our documentation structure maps to Confluence spaces as follows:

| Documentation Directory | Confluence Space |
| ----------------------- | ---------------- |
| ARCHITECTURE            | ARCH             |
| CORE                    | CORE             |
| DEVELOPMENT             | DEV              |
| FEATURES                | FEAT             |
| OPERATIONS              | OPS              |
| PROD                    | PROD             |

## Best Practices

1. **Keep Content Focused**: Each document should focus on a single topic
2. **Use Consistent Terminology**: Use the same terms throughout the documentation
3. **Update Metadata**: Keep the metadata header up-to-date
4. **Review Regularly**: Review and update documentation regularly
5. **Test Migration**: Test the migration to Confluence before publishing
6. **Include Examples**: Provide examples where appropriate
7. **Use Diagrams**: Use diagrams to illustrate complex concepts
8. **Cross-Reference**: Link to related documents

## References

- [Confluence Markdown Support](https://confluence.atlassian.com/doc/confluence-wiki-markup-251003035.html)
- [Markdown Guide](https://www.markdownguide.org/)
- [Mermaid Diagram Syntax](https://mermaid-js.github.io/mermaid/#/)

---

**Labels:** documentation, standards, confluence, formatting
