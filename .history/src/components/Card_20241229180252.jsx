function Card({ loading, data }) {
  if (loading) {
    return (
      <div className="bg-gray-800/40 p-4 rounded-lg">
        <div className="skeleton skeleton-image mb-4"></div>
        <div className="skeleton skeleton-text w-3/4"></div>
        <div className="skeleton skeleton-text w-1/2"></div>
        <div className="skeleton skeleton-text w-1/4"></div>
      </div>
    );
  }

  return (
    // Your existing card content
  );
} 