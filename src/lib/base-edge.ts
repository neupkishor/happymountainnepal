// Edge runtime compatible version - NO Node.js modules
// Only direct JSON imports

import managerData from '../../base/manager.json';

// Function to make manager data available in Edge runtime
export function getManagerData() {
    return managerData;
}
