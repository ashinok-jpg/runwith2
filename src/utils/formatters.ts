export const formatPace = (secondsPerKm: number): string => {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDistance = (km: number): string => {
  return `${km.toFixed(1)}km`;
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
};

export const getIntensityColor = (intensity: string): string => {
  switch (intensity) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'moderate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'hard':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'workout':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'race':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getIntensityLabel = (intensity: string): string => {
  switch (intensity) {
    case 'easy':
      return 'Easy Run';
    case 'moderate':
      return 'Moderate';
    case 'hard':
      return 'Hard Run';
    case 'workout':
      return 'Workout';
    case 'race':
      return 'Race';
    default:
      return intensity;
  }
};