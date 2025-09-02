class SessionManager {
    constructor() {
        this.checkSession = this.checkSession.bind(this);
        // Check session status every minute
        setInterval(this.checkSession, 60 * 1000);
    }

    // Create new session
    login(userData) {
        const session = {
            user: userData,
            lastActivity: new Date().getTime(),
            expiresIn: 60 * 60 * 1000 // 1 hour in milliseconds
        };
        
        localStorage.setItem('userSession', JSON.stringify(session));
        return true;
    }

    // Check if session is valid
    checkSession() {
        const session = this.getSession();
        if (!session) return false;

        const currentTime = new Date().getTime();
        const timeDifference = currentTime - session.lastActivity;

        // If inactive for more than 1 hour, logout
        if (timeDifference > session.expiresIn) {
            this.logout();
            return false;
        }

        // Update last activity time
        this.updateLastActivity();
        return true;
    }

    // Update last activity timestamp
    updateLastActivity() {
        const session = this.getSession();
        if (session) {
            session.lastActivity = new Date().getTime();
            localStorage.setItem('userSession', JSON.stringify(session));
        }
    }

    // Get current session
    getSession() {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
    }

    // Get logged in user
    getUser() {
        const session = this.getSession();
        return session ? session.user : null;
    }

    // Logout user
    logout() {
        localStorage.removeItem('userSession');
        // You might want to redirect to login page or show a message
        window.dispatchEvent(new Event('sessionExpired'));
    }
} 