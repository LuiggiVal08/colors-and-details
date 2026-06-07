import Constants from 'expo-constants';

// const BASE_URL = 'https://colors-details-core-production.up.railway.app';
const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://colors-details-core-production.up.railway.app';
const API_BASE_URL = `${BASE_URL}/api`;

export { API_BASE_URL, BASE_URL };
