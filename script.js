// Show loader
function showLoader() {
  document.getElementById('loader-wrapper').style.display = 'block';
}

// Hide loader
function hideLoader() {
  document.getElementById('loader-wrapper').style.display = 'none';
}

// Example usage during sign in
async function handleSignIn() {
  showLoader();
  try {
    // Your sign in logic here
    await signInUser();
    // When everything is ready
    hideLoader();
  } catch (error) {
    hideLoader();
    // Handle error
  }
} 