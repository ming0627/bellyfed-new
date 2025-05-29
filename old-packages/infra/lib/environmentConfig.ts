import { CONFIG, EnvironmentConfigSettings } from './config.js';

/**
 * Class for managing environment-specific configuration
 */
export class EnvironmentConfig {
    private static instances: Record<string, EnvironmentConfig> = {};
    private config: EnvironmentConfigSettings;
    private environment: string;

    /**
     * Constructor creates a new EnvironmentConfig instance
     * @param environment The environment name
     */
    private constructor(environment: string) {
        this.environment = environment;
        this.config = CONFIG.getEnvironmentConfig(environment);
    }

    /**
     * Get a singleton instance of EnvironmentConfig for a given environment
     * @param environment The environment name
     * @returns EnvironmentConfig instance
     */
    public static getInstance(environment: string): EnvironmentConfig {
        if (!EnvironmentConfig.instances[environment]) {
            EnvironmentConfig.instances[environment] = new EnvironmentConfig(environment);
        }
        return EnvironmentConfig.instances[environment];
    }

    /**
     * Get the environment name
     * @returns Environment name
     */
    public getEnvironment(): string {
        return this.environment;
    }

    /**
     * Get the configuration for the environment
     * @returns Environment configuration
     */
    public getConfig(): EnvironmentConfigSettings {
        return this.config;
    }

    /**
     * Get VPC configuration
     * @returns VPC configuration
     */
    public getVpcConfig() {
        return this.config.vpc;
    }

    /**
     * Get Aurora configuration
     * @returns Aurora configuration
     */
    public getAuroraConfig() {
        return this.config.aurora;
    }

    /**
     * Get Lambda configuration
     * @returns Lambda configuration
     */
    public getLambdaConfig() {
        return this.config.lambda;
    }

    /**
     * Get Slack webhook URL
     * @returns Slack webhook URL
     */
    public getSlackWebhookUrl(): string {
        return this.config.slackWebhookUrl;
    }

    /**
     * Get ECS configuration
     * @returns ECS configuration
     */
    public getEcsConfig() {
        return this.config.ecs;
    }

    /**
     * Get Typesense configuration
     * @returns Typesense configuration
     */
    public getTypesenseConfig() {
        return this.config.typesense;
    }

    /**
     * Get alert email address
     * @returns Alert email address or empty string if not configured
     */
    public getAlertEmail(): string {
        // Return the alert email from the config if it exists, otherwise return an empty string
        return this.config.alertEmail || '';
    }
}
