// Example of how to toggle skeleton loading
function toggleLoading(isLoading) {
  const skeletons = document.querySelectorAll('.skeleton');
  const content = document.querySelector('.content');
  
  if (isLoading) {
    skeletons.forEach(skeleton => skeleton.style.display = 'block');
    content.style.display = 'none';
  } else {
    skeletons.forEach(skeleton => skeleton.style.display = 'none');
    content.style.display = 'block';
  }
}

// Example usage
toggleLoading(true); // Show skeleton
// Simulate loading
setTimeout(() => {
  toggleLoading(false); // Hide skeleton and show content
}, 2000); 