// Create a function to automatically add skeletons to the whole page
function addSkeletonsToPage() {
  // Add skeletons to images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-image';
    skeleton.style.width = img.width + 'px';
    skeleton.style.height = img.height + 'px';
    img.parentNode.insertBefore(skeleton, img);
    img.style.display = 'none';
  });

  // Add skeletons to text elements
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
  textElements.forEach(element => {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-text';
    skeleton.style.width = (Math.random() * 50 + 50) + '%'; // Random width between 50-100%
    element.parentNode.insertBefore(skeleton, element);
    element.style.display = 'none';
  });
}

// Function to remove all skeletons and show content
function removeSkeletons() {
  // Remove skeleton elements
  const skeletons = document.querySelectorAll('.skeleton');
  skeletons.forEach(skeleton => skeleton.remove());

  // Show all previously hidden elements
  const hiddenElements = document.querySelectorAll('img, p, h1, h2, h3, h4, h5, h6, span');
  hiddenElements.forEach(element => element.style.display = '');
}

// Add this to your page load event
document.addEventListener('DOMContentLoaded', function() {
  // Add skeletons immediately
  addSkeletonsToPage();

  // Remove skeletons after content loads
  window.addEventListener('load', function() {
    // Add a small delay to make the skeleton effect noticeable
    setTimeout(removeSkeletons, 1000);
  });
});
