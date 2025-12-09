/**
 * Loading Skeleton para Analytics
 * Muestra placeholders mientras cargan los datos
 */

const LoadingSkeleton = ({ type = 'kpi' }) => {
  if (type === 'kpi') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
