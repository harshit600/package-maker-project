function ProfileSection({ loading, user }) {
  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="skeleton w-16 h-16 rounded-full"></div>
        <div>
          <div className="skeleton skeleton-text w-32"></div>
          <div className="skeleton skeleton-text w-24"></div>
        </div>
      </div>
    );
  }

  return (
    // Your existing profile section content
  );
} 