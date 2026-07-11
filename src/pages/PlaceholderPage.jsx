import React from 'react';

export const PlaceholderPage = ({ title, role }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{title} is under development</h2>
          <p className="text-gray-600 mb-6">
            This page will be available soon with all features for {role} role.
          </p>
          {/* Sign Out removed - use global LogoutGear in App shell */}
        </div>
      </div>
    </div>
  );
};
