import React, { useEffect, useState } from 'react';
import { getGeneratedAvatarUrl, getInitials } from '../utils/avatar';

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  /** Firebase uid. Preferred seed so header + leaderboard show the same avatar. */
  uid?: string | null;
  alt?: string;
  /** Sizing / border classes, e.g. "w-8 h-8 rounded-full object-cover". */
  className?: string;
  /** Font sizing for the initials fallback, e.g. "text-xs". */
  textClassName?: string;
}

/**
 * Renders a user's avatar with graceful degradation:
 * 1. the real Firebase photo (Google sign-in),
 * 2. a deterministic generated avatar (email/password accounts have no photo),
 * 3. plain initials if even the generated image cannot be decoded.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  displayName,
  email,
  uid,
  alt,
  className = 'w-8 h-8 rounded-full object-cover',
  textClassName = 'text-xs'
}) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [generatedFailed, setGeneratedFailed] = useState(false);

  // Reset the failure state when the signed-in account changes.
  useEffect(() => {
    setPhotoFailed(false);
    setGeneratedFailed(false);
  }, [photoURL, uid]);

  const initials = getInitials(displayName, email);
  const seed = uid || email || displayName || 'typist';
  const generatedUrl = getGeneratedAvatarUrl(seed, initials);

  // Tier 3: initials badge (the generated SVG is universally supported, so this is a safety net).
  if (generatedFailed) {
    return (
      <div
        className={`${className} bg-cyan-500/20 text-cyan-200 font-bold flex items-center justify-center ${textClassName}`}
        title={displayName || email || 'Typist'}
      >
        {initials}
      </div>
    );
  }

  const usePhoto = Boolean(photoURL && photoURL.trim()) && !photoFailed;

  return (
    <img
      src={usePhoto ? (photoURL as string) : generatedUrl}
      alt={alt || displayName || email || 'User avatar'}
      // Google profile photos are served from a CDN that can reject hot-linked
      // referrers (403), which renders as a broken image without this.
      referrerPolicy="no-referrer"
      onError={() => (usePhoto ? setPhotoFailed(true) : setGeneratedFailed(true))}
      className={className}
    />
  );
};
