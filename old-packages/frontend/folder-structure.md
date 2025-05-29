bellyfed/
│
├── .github/ # GitHub-specific files (e.g., workflows)
│ └── workflows/ # GitHub Actions workflows
│
├── amplify/ # AWS Amplify configuration
│ ├── backend/ # Amplify backend resources
│ └── team-provider-info.json # Team provider information
│
├── public/ # Static files
│ ├── favicon.ico
│ └── images/ # Static images
│
├── src/
│ ├── components/ # React components
│ ├── contexts/ # React context providers
│ ├── data/ # Data layer
│ │ ├── core/ # Core data types (users, organizations)
│ │ ├── food/ # Food-related data
│ │ │ ├── establishments/
│ │ │ ├── menus/
│ │ │ └── rankings/
│ │ ├── events/ # Event-related data
│ │ ├── locations/ # Location-related data
│ │ └── social/ # Social features data
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Third-party library configurations
│ ├── pages/ # Next.js pages
│ ├── services/ # Business logic and API services
│ ├── styles/ # Global styles and theme
│ ├── types/ # TypeScript type definitions
│ └── utils/ # Utility functions
│
├── tests/ # Test files
│ ├── unit/
│ ├── integration/
│ └── e2e/
│
├── .eslintrc.json # ESLint configuration
├── .gitignore # Git ignore file
├── .prettierrc # Prettier configuration
├── amplify.yml # Amplify build configuration
├── next.config.js # Next.js configuration
├── package.json # Project dependencies and scripts
├── README.md # Project documentation
├── schema.graphql # GraphQL schema
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json # TypeScript configuration

## Directory Purposes

### Components

- Reusable UI components
- Follow atomic design principles (atoms, molecules, organisms)

### Data

- Organized by domain
- Each subdirectory contains related data files
- Includes type definitions specific to that domain

### Services

- Business logic layer
- API integrations
- Data transformation and processing

### Pages

- Next.js page components
- Minimal logic, mostly composition of components

### Utils

- Helper functions
- Pure functions
- Shared utilities
