/**
 * CampusCard Component
 *
 * Renders a campus selection card with:
 * - Campus photograph
 * - CTA button (pill-shaped) with campus name and arrow
 * - Optional "Coming Soon" overlay for disabled campuses
 *
 * Props:
 *   @param {string}  name      - Campus name displayed on the CTA button (e.g., "JAIPUR", "MESRA")
 *   @param {string}  image     - Path to the campus image file
 *   @param {string}  href      - Navigation target URL when clicked
 *   @param {boolean} disabled  - If true, shows "Coming Soon" overlay instead of navigating
 *   @param {Function} onDisabledClick - Callback when a disabled card is clicked
 *   @param {Function} onClick  - Callback when an active card is clicked (for React state transitions)
 */

import { useCallback } from 'react';

function CampusCard({ name, image, href, disabled = false, onDisabledClick, onClick }) {
  const handleClick = useCallback(
    (e) => {
      if (disabled) {
        e.preventDefault();
        if (onDisabledClick) onDisabledClick(name);
      } else if (onClick) {
        e.preventDefault();
        onClick(name);
      }
    },
    [disabled, onDisabledClick, onClick, name]
  );

  return (
    <a
      href={disabled ? '#' : href}
      className={`campus-card${disabled ? ' campus-card--disabled' : ''}`}
      onClick={handleClick}
      aria-label={`${name} campus${disabled ? ' — Coming Soon' : ''}`}
      id={`campus-card-${name.toLowerCase()}`}
    >
      {/* Campus Image */}
      <div className="campus-card__image-wrapper">
        <img
          className="campus-card__image"
          src={image}
          alt={`${name} campus building`}
          loading="lazy"
          decoding="async"
        />

        {/* CTA Button */}
        <div className="campus-card__cta">
          <span>{name}</span>
          <span className="campus-card__cta-arrow" aria-hidden="true">→</span>
        </div>
      </div>

      {/* Coming Soon Overlay (only for disabled cards) */}
      {disabled && (
        <div className="campus-card__coming-soon">
          <span className="campus-card__coming-soon-text">Coming Soon</span>
        </div>
      )}
    </a>
  );
}

export default CampusCard;
