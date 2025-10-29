/**
 * API Configuration
 * Reads configuration from environment variables
 */

// Type-safe helper functions for environment variables
function getEnvVar(key: string, defaultValue: string = ""): string {
  const env = (import.meta as any).env || {};
  return env[key] || defaultValue;
}

function getEnvVarBoolean(key: string, defaultValue: boolean = false): boolean {
  const env = (import.meta as any).env || {};
  const value = env[key];
  if (value === undefined || value === null) return defaultValue;
  return value === "true" || value === "1";
}

function getEnvVarNumber(key: string, defaultValue: number): number {
  const env = (import.meta as any).env || {};
  const value = env[key];
  if (value === undefined || value === null) return defaultValue;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvVarArray(key: string, defaultValue: string[]): string[] {
  const env = (import.meta as any).env || {};
  const value = env[key];
  if (!value) return defaultValue;
  return String(value)
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
}

/**
 * Chrome Built-in AI API Configuration
 */
export const chromeAiConfig = {
  model: getEnvVar("VITE_AI_MODEL", "chrome.ai/gemini-nano"),
  enabled: getEnvVarBoolean("VITE_ENABLE_CHROME_AI", true),
  timeout: getEnvVarNumber("VITE_AI_TIMEOUT", 30000),
  endpoints: {
    prompt: getEnvVar("VITE_CHROME_AI_PROMPT_ENDPOINT", ""),
    writer: getEnvVar("VITE_CH Rental_AI_WRITER_ENDPOINT", ""),
    rewriter: getEnvVar("VITE_CHROME_AI_REWRITER_ENDPOINT", ""),
    proofreader: getEnvVar("VITE_CHROME_AI_PROOFREADER_ENDPOINT", ""),
    summarizer: getEnvVar("VITE_CHROME_AI_SUMMARIZER_ENDPOINT", ""),
    translator: getEnvVar("VITE_CHROME_AI_TRANSLATOR_ENDPOINT", ""),
  },
};

/**
 * Web Translator API Configuration
 */
export const translatorConfig = {
  enabled: getEnvVarBoolean("VITE_ENABLE_WEB_TRANSLATOR", true),
  defaultSourceLanguage: getEnvVar("VITE_DEFAULT_SOURCE_LANGUAGE", "en"),
  supportedLanguages: getEnvVarArray("VITE_SUPPORTED_LANGUAGES", [
    "en",
    "ur",
    "es",
    "fr",
    "de",
    "ja",
    "zh",
  ]),
};

/**
 * Feature Flags
 */
export const featureFlags = {
  offlineMode: getEnvVarBoolean("VITE_OFFLINE_MODE", true),
  enableCache: getEnvVarBoolean("VITE_ENABLE_CACHE", true),
  showPrivacyBadge: getEnvVarBoolean("VITE_SHOW_PRIVACY_BADGE", true),
  useMockApis: getEnvVarBoolean("VITE_USE_MOCK_APIS", false),
};

/**
 * Application Settings
 */
export const appConfig = {
  maxImages: getEnvVarNumber("VITE_MAX_IMAGES", 5),
  maxVoiceDuration: getEnvVarNumber("VITE_MAX_VOICE_DURATION", 60),
  defaultCurrency: getEnvVar("VITE_DEFAULT_CURRENCY", "USD"),
  dbName: getEnvVar("VITE_DB_NAME", "MarketMateDB"),
  dbVersion: getEnvVarNumber("VITE_DB_VERSION", 1),
};

/**
 * Environment Information
 */
export const envConfig = {
  env: getEnvVar("VITE_ENV", "development"),
  debug: getEnvVarBoolean("VITE_DEBUG", false),
  isProduction: getEnvVar("VITE_ENV", "development") === "production",
  isDevelopment: getEnvVar("VITE_ENV", "development") === "development",
};

/**
 * API Keys (for potential future use)
 * Note: Chrome Built-in AI APIs don't require keys, but these are here
 * for potential fallback services or future integrations
 */
export const apiKeys = {
  googleAi: getEnvVar("VITE_GOOGLE_AI_API_KEY", ""),
  openAi: getEnvVar("VITE_OPENAI_API_KEY", ""),
  translation: getEnvVar("VITE_TRANSLATION_API_KEY", ""),
};

/**
 * Log configuration (only in debug mode)
 */
if (envConfig.debug) {
  console.log("🔧 API Configuration:", {
    chromeAi: chromeAiConfig,
    translator: translatorConfig,
    features: featureFlags,
    app: appConfig,
    env: envConfig,
  });
}
