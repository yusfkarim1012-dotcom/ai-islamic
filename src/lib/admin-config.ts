// Admin Configuration - Uses Firebase Remote Config + localStorage fallback
// When admin saves config, it goes to Firebase so ALL users see the change

import { fetchRemoteConfig, saveRemoteConfig } from './firebase-config';

export interface ModelConfig {
    id: string;
    name: string;
    fullName: string;
    enabled: boolean;
    apiType: 'manus' | 'puter' | 'bluesminds';
    model: string;
}

export interface AdminConfig {
    defaultModel: string;
    manusApiKey: string;
    manusApiKeys?: string[];
    manusBaseUrl: string;
    bluesmindsApiKey: string;
    bluesmindsApiKeys?: string[];
    bluesmindsBaseUrl: string;
    bluesmindsModel?: string;
    serverDisabled?: string;
    serverPriority?: string;
    models: ModelConfig[];
}

const ADMIN_CONFIG_KEY = 'aikurdi_admin_config';
const ADMIN_PASSWORD = '12345678rk'; // Password to access admin panel
export const CONFIG_UPDATED_EVENT = 'aikurdi_config_updated';

// Helper to notify the app when config changes
export const dispatchConfigUpdate = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(CONFIG_UPDATED_EVENT));
    }
};

// Default configuration (fallback when no remote config)
const defaultConfig: AdminConfig = {
    defaultModel: 'manus',
    manusApiKey: 'sk-BcmwiN3gGznjwuAkzNZ86c',
    manusApiKeys: ['sk-BcmwiN3gGznjwuAkzNZ86c'],
    manusBaseUrl: 'https://api.manus.im/api/llm-proxy/v1',
    bluesmindsApiKey: 'VFnpPZlpu0iFyQkJtHF7HNfjjmn5FXJd9K2BV',
    bluesmindsApiKeys: ['VFnpPZlpu0iFyQkJtHF7HNfjjmn5FXJd9K2BV'],
    bluesmindsBaseUrl: 'https://api.bluesminds.com/v1',
    bluesmindsModel: 'gemini-2.5-flash',
    serverDisabled: '',
    serverPriority: 'bluesminds_first',
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
            id: 'bluesminds',
            name: 'بلوزمایندز',
            fullName: 'مۆدێلی بلوزمایندز',
            enabled: true,
            apiType: 'bluesminds',
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

// Initialize remote config - call this on app startup
export const initRemoteConfig = async (): Promise<void> => {
    try {
        const remoteConfig = await fetchRemoteConfig();
        if (remoteConfig) {
            // Save remote config to localStorage as cache
            localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(remoteConfig));
            console.log('Remote config loaded from Firebase');
            dispatchConfigUpdate(); // Notify listeners
        } else {
            // No remote config yet - push default config to Firebase
            console.log('No remote config found, pushing defaults to Firebase');
            await saveRemoteConfig(defaultConfig);
        }
    } catch (error) {
        console.error('Error initializing remote config:', error);
    }
};

// Get admin config from localStorage (cached from Firebase)
export const getAdminConfig = (): AdminConfig => {
    try {
        const stored = localStorage.getItem(ADMIN_CONFIG_KEY);
        if (stored) {
            const config = { ...defaultConfig, ...JSON.parse(stored) };
            if (!config.manusApiKeys || !Array.isArray(config.manusApiKeys)) {
                config.manusApiKeys = config.manusApiKey ? [config.manusApiKey] : [];
            }
            while (config.manusApiKeys.length < 10) {
                config.manusApiKeys.push('');
            }
            if (!config.bluesmindsApiKeys || !Array.isArray(config.bluesmindsApiKeys)) {
                config.bluesmindsApiKeys = config.bluesmindsApiKey ? [config.bluesmindsApiKey] : [];
            }
            while (config.bluesmindsApiKeys.length < 10) {
                config.bluesmindsApiKeys.push('');
            }
            if (config.bluesmindsModel === undefined) config.bluesmindsModel = 'gemini-2.5-flash';
            if (config.serverDisabled === undefined) config.serverDisabled = '';
            if (config.serverPriority === undefined) config.serverPriority = 'bluesminds_first';
            return config;
        }
    } catch (error) {
        console.error('Error loading admin config:', error);
    }
    const config = { ...defaultConfig };
    if (!config.manusApiKeys || !Array.isArray(config.manusApiKeys)) {
        config.manusApiKeys = config.manusApiKey ? [config.manusApiKey] : [];
    }
    while (config.manusApiKeys.length < 10) {
        config.manusApiKeys.push('');
    }
    if (!config.bluesmindsApiKeys || !Array.isArray(config.bluesmindsApiKeys)) {
        config.bluesmindsApiKeys = config.bluesmindsApiKey ? [config.bluesmindsApiKey] : [];
    }
    while (config.bluesmindsApiKeys.length < 10) {
        config.bluesmindsApiKeys.push('');
    }
    return config;
};

// Save admin config to BOTH localStorage AND Firebase
export const saveAdminConfig = async (config: AdminConfig): Promise<boolean> => {
    try {
        // Save locally first
        localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
        dispatchConfigUpdate(); // Notify listeners immediately for local UI responsiveness
        // Then save to Firebase so all users get the update
        const success = await saveRemoteConfig(config);
        return success;
    } catch (error) {
        console.error('Error saving admin config:', error);
        return false;
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
export const updateModel = async (id: string, updates: Partial<ModelConfig>): Promise<void> => {
    const config = getAdminConfig();
    const modelIndex = config.models.findIndex(m => m.id === id);
    if (modelIndex !== -1) {
        config.models[modelIndex] = { ...config.models[modelIndex], ...updates };
        await saveAdminConfig(config);
    }
};

// Get enabled models for display
export const getEnabledModels = (): ModelConfig[] => {
    const config = getAdminConfig();
    return config.models.filter(m => m.enabled);
};
