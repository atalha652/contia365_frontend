// frontend/src/utils/titleUtils.js

// Function to update page title
export const updatePageTitle = (title) => {
    document.title = title ? `${title} - CONTIA365` : 'CONTIA365';
};

// Function to get page title based on route
export const getPageTitle = (pathname, additionalData = {}) => {
    const path = pathname.toLowerCase();

    // Main pages
    if (path === '/') {
        return 'Home';
    }
    if (path === '/sign-in') {
        return 'Sign In';
    }
    if (path === '/sign-up') {
        return 'Sign Up';
    }

    return 'CONTIA365';
}; 