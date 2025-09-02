// Initialize session manager
const sessionManager = new SessionManager();

// Example login function
function handleLogin(username, password) {
    // Your authentication logic here
    // If authentication is successful:
    const userData = {
        id: 1,
        username: username,
        // other user data
    };
    
    sessionManager.login(userData);
    console.log('Logged in successfully');
}

// Example of checking session before accessing protected content
function accessProtectedContent() {
    if (!sessionManager.checkSession()) {
        console.log('Session expired or invalid');
        window.location.href = '/login.html';
        return;
    }
    
    const user = sessionManager.getUser();
    console.log('Access granted for user:', user.username);
    // Your protected content logic here
}

// Listen for session expiration
window.addEventListener('sessionExpired', () => {
    alert('Your session has expired. Please login again.');
    window.location.href = '/login.html';
}); 