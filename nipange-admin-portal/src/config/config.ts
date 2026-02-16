interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  google: {
    clientId: string;
    clientName: string;
  };
  app: {
    name: string;
    env: string;
  };
}

const getRequiredEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getOptionalEnv = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

export const config: AppConfig = {
  api: {
    baseUrl: getRequiredEnv('VITE_API_BASE_URL'),
    timeout: parseInt(getOptionalEnv('VITE_API_TIMEOUT', '30000'), 10),
  },
  app: {
    name: getOptionalEnv('VITE_APP_NAME', 'Nipange Web App'),
    env: getOptionalEnv('VITE_APP_ENV', 'development'),
  },
};

export const isProduction = (): boolean => {
  return config.app.env === 'production';
};

export const isDevelopment = (): boolean => {
  return config.app.env === 'development';
};

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${config.api.baseUrl}${cleanEndpoint}`;
};

export default config;