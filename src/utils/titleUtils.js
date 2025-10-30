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

    // App pages
    if (path.startsWith('/app')) {
        if (path.includes('/dashboard')) {
            return 'App Dashboard';
        }
        if (path.includes('/invoices')) {
            return 'Invoices';
        }
        if (path.includes('/bank-reconciliation')) {
            return 'Bank Reconciliation';
        }
        if (path.includes('/ledger')) {
            return 'Ledger';
        }
        if (path.includes('/expences')) {
            return 'Expenses';
        }
        if (path.includes('/payroll')) {
            return 'Payroll';
        }
        return 'App';
    }


    return 'CONTIA365';


};