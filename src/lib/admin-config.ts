// Admin Configuration - Stores settings in localStorage
// This allows the admin to dynamically change models and their names

export interface ModelConfig {
    id: string;
    name: string;
    fullName: string;
    enabled: boolean;
    apiType: 'manus' | 'puter';
    model: string;
}

export interface AdminConfig {
    defaultModel: string;
    manusApiKey: string;
    manusBaseUrl: string;
    models: ModelConfig[];
}

const ADMIN_CONFIG_KEY = 'aikurdi_admin_config';
const ADMIN_PASSWORD = '12345678rk'; // Password to access admin panel

// Default configuration
const defaultConfig: AdminConfig = {
    defaultModel: 'manus',
    manusApiKey: 'sk-BcmwiN3gGznjwuAkzNZ86c',
    manusBaseUrl: 'https://api.manus.im/api/llm-proxy/v1',
    models: [
        {
            id: 'manus',
            name: 'پێشەنگ',
            fullName: 'مۆدێلی پێشەنگ',
            enabled: true,
            apiType: 'manus',
            model: 'gemini-2.5-flash'
        },
        {
            id: 'fast',
            name: 'وردبین',
            fullName: 'مۆدێلی وردبین',
            enabled: true,
            apiType: 'puter',
            model: 'gemini-3-flash-preview'
        }
    ]
};

// Get admin config from localStorage
export const getAdminConfig = (): AdminConfig => {
    try {
        const stored = localStorage.getItem(ADMIN_CONFIG_KEY);
        if (stored) {
            return { ...defaultConfig, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Error loading admin config:', error);
    }
    return defaultConfig;
};

// Save admin config to localStorage
export const saveAdminConfig = (config: AdminConfig): void => {
    try {
        localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
        console.error('Error saving admin config:', error);
    }
};

// Verify admin password
export const verifyAdminPassword = (password: string): boolean => {
    return password === ADMIN_PASSWORD;
};

// Get model by ID
export const getModelById = (id: string): ModelConfig | undefined => {
    const config = getAdminConfig();
    return config.models.find(m => m.id === id);
};

// Update a specific model
export const updateModel = (id: string, updates: Partial<ModelConfig>): void => {
    const config = getAdminConfig();
    const modelIndex = config.models.findIndex(m => m.id === id);
    if (modelIndex !== -1) {
        config.models[modelIndex] = { ...config.models[modelIndex], ...updates };
        saveAdminConfig(config);
    }
};

// Get enabled models for display
export const getEnabledModels = (): ModelConfig[] => {
    const config = getAdminConfig();
    return config.models.filter(m => m.enabled);
};
