# Oishiiteru Infrastructure Agents Guide

## Overview

This directory contains the knowledge bases and documentation for various specialized agents that assist in managing the Oishiiteru infrastructure. Each agent has specific responsibilities and expertise in different aspects of the infrastructure.

## Agent Structure Standards

Each agent should follow this standard directory structure:

```
agents/
├── README.md                 # This guide
└── [agent-name]/            # e.g., infrastructure-architect
    ├── README.md            # Agent directory overview
    ├── profile.md           # Agent's profile and capabilities
    ├── CHANGELOG.md         # Version history and changes
    └── knowledge/           # Knowledge base directory
        └── [domain].md      # Domain-specific knowledge files
```

## Version Control

All agent documents must follow these versioning rules:

1. **Version Format**: `vX.Y.Z` where:

    - X: Major version (breaking changes)
    - Y: Minor version (new features, non-breaking)
    - Z: Patch version (bug fixes, minor updates)

2. **Change Documentation**:
    - Each agent must maintain a CHANGELOG.md
    - All changes must be dated and versioned
    - Changes must include a brief description

Example CHANGELOG.md entry:

```markdown
## [v1.2.0] - 2024-12-07

### Added

- New cost optimization strategies
- CloudWatch monitoring guidelines

### Changed

- Updated deployment workflow
- Refined security recommendations

### Fixed

- Corrected IAM policy examples
- Fixed broken internal links
```

## Document Headers

Each document should include this standard header:

```markdown
# [Document Title]

Version: vX.Y.Z
Last Updated: YYYY-MM-DD HH:MM:SS +TZ
Status: [Active|Draft|Deprecated]

## Overview

[Document purpose and scope]
```

## Knowledge Base Guidelines

1. **Organization**:

    - Group related information logically
    - Use consistent headings and structure
    - Include examples where appropriate

2. **Maintenance**:

    - Review and update quarterly
    - Archive outdated information
    - Keep examples current

3. **Cross-referencing**:
    - Use relative links to other documents
    - Maintain link integrity
    - Document dependencies

## Current Agents

1. **Infrastructure Architect**
    - Version: v1.0.0
    - Focus: Cloud infrastructure and optimization
    - Status: Active

## Adding New Agents

To add a new agent:

1. Create directory: `agents/[agent-name]`
2. Include required files:
    - README.md
    - profile.md
    - CHANGELOG.md
3. Add knowledge base documents
4. Update this guide

## Quality Standards

1. **Documentation**:

    - Clear and concise writing
    - Proper formatting
    - Regular updates
    - Version control

2. **Knowledge Base**:

    - Accurate information
    - Practical examples
    - Current best practices
    - Regular reviews

3. **Maintenance**:
    - Quarterly reviews
    - Version updates
    - Deprecation notices
    - Archive management

## Version History

### [v1.0.0] - 2024-12-07 14:51:26 +08:00

- Initial guide creation
- Established directory structure
- Defined versioning standards
- Added documentation guidelines
