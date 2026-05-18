// Firebase Configuration for Remote Admin Config
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import type { AdminConfig } from './admin-config';

const firebaseConfig = {
    apiKey: "AIzaSyDummy", // Not needed for RTDB public read
    authDomain: "aikurdi.firebaseapp.com",
    databaseURL: "https://aikurdi-default-rtdb.firebaseio.com",
    projectId: "aikurdi",
    storageBucket: "aikurdi.firebasestorage.app",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const CONFIG_PATH = 'config/admin';

// Fetch remote config from Firebase
export const fetchRemoteConfig = async (): Promise<AdminConfig | null> => {
    try {
        const snapshot = await get(ref(db, CONFIG_PATH));
        if (snapshot.exists()) {
            return snapshot.val() as AdminConfig;
        }
        return null;
    } catch (error) {
        console.error('Error fetching remote config:', error);
        return null;
    }
};

// Save config to Firebase (admin only)
export const saveRemoteConfig = async (config: AdminConfig): Promise<boolean> => {
    try {
        await set(ref(db, CONFIG_PATH), config);
        console.log('Remote config saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving remote config:', error);
        return false;
    }
};
