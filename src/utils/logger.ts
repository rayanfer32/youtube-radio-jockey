export type LogLevel = "debug" | "info" | "warn" | "error";

type LoggerConfig = {
  enabled: boolean;
  level: LogLevel;
};

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

let config: LoggerConfig = { enabled: true, level: "warn" };

const applySettings = (settings: Record<string, unknown>) => {
  const level = settings.logLevel;
  config = {
    enabled:
      typeof settings.loggingEnabled === "boolean" ? settings.loggingEnabled : true,
    level:
      typeof level === "string" && level in levelPriority
        ? (level as LogLevel)
        : "warn",
  };
};

chrome.storage.sync.get(["loggingEnabled", "logLevel"], applySettings);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;
  if (changes.loggingEnabled || changes.logLevel) {
    applySettings({
      loggingEnabled: changes.loggingEnabled?.newValue ?? config.enabled,
      logLevel: changes.logLevel?.newValue ?? config.level,
    });
  }
});

const write = (level: LogLevel, message: string, ...details: unknown[]) => {
  if (!config.enabled || levelPriority[level] < levelPriority[config.level]) return;
  if (level === "debug") console.debug(`[YouTube RJ][DEBUG] ${message}`, ...details);
  else if (level === "info") console.info(`[YouTube RJ][INFO] ${message}`, ...details);
  else if (level === "warn") console.warn(`[YouTube RJ][WARN] ${message}`, ...details);
  else console.error(`[YouTube RJ][ERROR] ${message}`, ...details);
};

const Logger = {
  debug: (message: string, ...details: unknown[]) => write("debug", message, ...details),
  info: (message: string, ...details: unknown[]) => write("info", message, ...details),
  warn: (message: string, ...details: unknown[]) => write("warn", message, ...details),
  error: (message: string, ...details: unknown[]) => write("error", message, ...details),
};

export default Logger;
