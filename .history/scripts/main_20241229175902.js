// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  // First, wrap all content in skeleton containers
  wrapContentWithSkeletons();

  // Show skeletons and hide content
  showSkeletons();

  // When all resources are loaded (images, styles, etc.)
  window.addEventListener("load", function () {
    // Wait a bit to show the skeleton effect
    setTimeout(hideSkeletons, 1000);
  });
});

function wrapContentWithSkeletons() {
  // Target specific content areas to avoid affecting navigation/header/footer
  const contentAreas = document.querySelectorAll(
    "main, article, .content, section"
  );

  contentAreas.forEach((area) => {
    // Handle text content
    const textElements = area.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
    textElements.forEach((element) => {
      const wrapper = document.createElement("div");
      wrapper.className = "skeleton-wrapper";

      const skeleton = document.createElement("div");
      skeleton.className = `skeleton skeleton-text skeleton-${element.tagName.toLowerCase()}`;

      // Match original element dimensions
      const styles = window.getComputedStyle(element);
      skeleton.style.height = styles.height;
      skeleton.style.width = styles.width;

      wrapper.appendChild(skeleton);
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
    });

    // Handle images
    const images = area.querySelectorAll("img");
    images.forEach((img) => {
      const wrapper = document.createElement("div");
      wrapper.className = "skeleton-wrapper";

      const skeleton = document.createElement("div");
      skeleton.className = "skeleton skeleton-image";

      // Set dimensions based on image
      if (img.height && img.width) {
        skeleton.style.height = `${img.height}px`;
        skeleton.style.width = `${img.width}px`;
      } else {
        skeleton.style.height = "200px";
        skeleton.style.width = "100%";
      }

      wrapper.appendChild(skeleton);
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    });
  });
}

function showSkeletons() {
  const wrappers = document.querySelectorAll(".skeleton-wrapper");
  wrappers.forEach((wrapper) => {
    const skeleton = wrapper.querySelector(".skeleton");
    const content = wrapper.querySelector(":not(.skeleton)");
    if (skeleton && content) {
      skeleton.style.display = "block";
      content.style.display = "none";
    }
  });
}

function hideSkeletons() {
  const wrappers = document.querySelectorAll(".skeleton-wrapper");
  wrappers.forEach((wrapper) => {
    const skeleton = wrapper.querySelector(".skeleton");
    const content = wrapper.querySelector(":not(.skeleton)");
    if (skeleton && content) {
      skeleton.style.display = "none";
      content.style.display = "";
    }
  });
}
