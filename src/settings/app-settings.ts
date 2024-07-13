import { config } from 'dotenv';

config();

export type EnvironmentVariable = { [key: string]: string | undefined };
export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';
export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}

class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) {}
}

class APISettings {
  // Application
  public readonly APP_PORT: number;

  // Database
  public readonly MONGO_CONNECTION_URI: string;
  // SMTP
  public readonly SMTP_USER: string;
  public readonly SMTP_PASSWORD: string;

  //JWT
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;
  constructor(private readonly envVariables: EnvironmentVariable) {
    // Application
    this.APP_PORT = this.getNumberOrDefault(envVariables.APP_PORT, 7840);
    // Database
    this.MONGO_CONNECTION_URI =
      envVariables.MONGO_CONNECTION_URI ?? 'mongodb://localhost/nest';
    // SMTP
    this.SMTP_USER = envVariables.SMTP_USER ?? '';
    this.SMTP_PASSWORD = envVariables.SMTP_PASSWORD ?? '';
    //JWT
    this.JWT_ACCESS_TOKEN_SECRET = envVariables.JWT_ACCESS_TOKEN_SECRET ?? '';
    this.JWT_EXPIRY = envVariables.JWT_EXPIRY ?? '';
    this.REFRESH_TOKEN_EXPIRY = envVariables.REFRESH_TOKEN_EXPIRY ?? '';
  }

  private getNumberOrDefault(value: string, defaultValue: number): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

const env = new EnvironmentSettings(
  (Environments.includes(process.env.ENV?.trim())
    ? process.env.ENV.trim()
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api = new APISettings(process.env);
export const appSettings = new AppSettings(env, api);
