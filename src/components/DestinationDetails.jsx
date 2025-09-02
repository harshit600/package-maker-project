function DestinationDetails({ loading, destination }) {
  if (loading) {
    return (
      <div className="p-4">
        <div className="skeleton skeleton-image"></div>
        <div className="mt-4">
          <div className="skeleton skeleton-text w-1/2"></div>
          <div className="skeleton skeleton-text w-3/4"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    // Your existing destination details content
  );
}