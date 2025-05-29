/**
 * Singleton class that maintains global stack context across the application
 */
export class StackContext {
    private static instance: StackContext;

    private constructor(
        private readonly _environment: string,
        private readonly _region: string,
        private readonly _repository: string
    ) {}

    public static initialize(environment: string, region: string, repository: string): void {
        if (!StackContext.instance) {
            StackContext.instance = new StackContext(environment, region, repository);
        }
    }

    public static getInstance(): StackContext {
        if (!StackContext.instance) {
            throw new Error('StackContext must be initialized before use');
        }
        return StackContext.instance;
    }

    public getEnvironment(): string {
        return this.environment;
    }

    public getRegion(): string {
        return this.region;
    }

    public getRepository(): string {
        return this.repository;
    }

    // Add getters for compatibility
    private get environment(): string {
        return this._environment;
    }

    private get region(): string {
        return this._region;
    }

    private get repository(): string {
        return this._repository;
    }
}
