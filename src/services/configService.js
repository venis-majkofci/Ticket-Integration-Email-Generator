const CONFIG_KEY = "emailgen_config_overrides";

function deepMerge(target, source) {
    const result = structuredClone(target);
  
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  
    return result;
}


async function loadConfigFromFile(path = "data/configuration.json") {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error("Failed to load config.json");
    }

    return await response.json();
}

function loadOverrides() {
    const saved = localStorage.getItem(CONFIG_KEY);

    if (!saved) return {};

    try {
        return JSON.parse(saved);
    } catch (e) {
        console.warn("Corrupt config override, ignored");
        return {};
    }
}

function saveOverrides(overrides) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(overrides));
}

export async function loadConfig() {
    const defaultConfig = await loadConfigFromFile();
    const overrides = loadOverrides();

    return deepMerge(defaultConfig, overrides);
}

export async function updateConfig(mutatorFn) {
    const overrides = loadOverrides();
    const updated = structuredClone(overrides);

    mutatorFn(updated);
    saveOverrides(updated);

    return updated;
}

export function ensurePath(obj, path) {
    let current = obj;

    for (const key of path) {
        current[key] ??= {};
        current = current[key];
    }

    return current;
}

export function resetConfig() {
    localStorage.removeItem(CONFIG_KEY);
}