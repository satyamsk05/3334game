import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const IconDashboard: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" fill="currentColor" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" fill="currentColor" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" fill="currentColor" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" fill="currentColor" />
  </svg>
);

export const IconGamepad: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M6 5h12a5 5 0 0 1 4.9 6.2l-1.3 6.3a2.5 2.5 0 0 1-4.2 1.2l-2.4-2.4a2 2 0 0 0-1.4-.6h-3.2a2 2 0 0 0-1.4.6l-2.4 2.4a2.5 2.5 0 0 1-4.2-1.2L1.1 11.2A5 5 0 0 1 6 5zm1.5 4a1 1 0 0 0-1 1v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 0 0-1-1zm9 1a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm2 2.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"
      fill="currentColor"
    />
  </svg>
);

export const IconWallet: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v1.2a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 0 4 9.2v.3A2.5 2.5 0 0 1 5.5 9H20a2 2 0 0 1 2 2v7.5A2.5 2.5 0 0 1 19.5 21h-14A2.5 2.5 0 0 1 3 18.5V5.5zm14 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"
      fill="currentColor"
    />
  </svg>
);

export const IconWithdraw: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M4 4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4zm2 2.5a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1z"
      fill="currentColor"
    />
    <path
      d="M3 13.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.5zm8-1.5a1 1 0 0 0-1 1v3.59l-1.3-1.3a1 1 0 0 0-1.4 1.42l3 3a1 1 0 0 0 1.4 0l3-3a1 1 0 0 0-1.4-1.42l-1.3 1.3V13a1 1 0 0 0-1-1z"
      fill="currentColor"
    />
  </svg>
);

export const IconTransactions: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.2a6.5 6.5 0 0 1-.2-1.5A6.5 6.5 0 0 1 19.5 13c.53 0 1.04.07 1.5.2V7.5L16.5 3H5zm2 4.5h6a1 1 0 1 1 0 2H7a1 1 0 0 1 0-2zm0 4h4a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2z"
      fill="currentColor"
    />
    <circle cx="18" cy="18" r="4.5" fill="currentColor" />
    <path
      d="M18 15.5v2.8l1.8 1.1"
      stroke="var(--surface-raised, #121216)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconPlayers: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 12c-5.33 0-8 2.67-8 6v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-3.33-2.67-6-8-6z"
      fill="currentColor"
    />
  </svg>
);

export const IconCrown: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M3.2 7.3a1 1 0 0 1 1.6-.8l4.2 3.1 2.3-5.2a1 1 0 0 1 1.8 0l2.3 5.2 4.2-3.1a1 1 0 0 1 1.6.8l-1.5 11.2a2 2 0 0 1-2 1.7H6.3a2 2 0 0 1-2-1.7L3.2 7.3zm8.8 5.7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
      fill="currentColor"
    />
  </svg>
);

export const IconBell: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M12 2a3 3 0 0 0-3 3v.3C6.2 6.2 4 8.8 4 12v3.5l-1.7 1.7A1 1 0 0 0 3 19h18a1 1 0 0 0 .7-1.7L20 15.5V12c0-3.2-2.2-5.8-5-6.7V5a3 3 0 0 0-3-3zm-2.5 18a2.5 2.5 0 0 0 5 0h-5z"
      fill="currentColor"
    />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2l7.8 4.5v9L12 20l-7.8-4.5v-9L12 2zm0 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"
      fill="currentColor"
    />
  </svg>
);

export const IconChart: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="3" y="14" width="4" height="7" rx="1.5" fill="currentColor" />
    <rect x="10" y="9" width="4" height="12" rx="1.5" fill="currentColor" />
    <rect x="17" y="4" width="4" height="17" rx="1.5" fill="currentColor" />
    <path
      d="M4 11l5-4 5 3 6-6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconBook: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14.5a1.5 1.5 0 0 1-2.4 1.2L12 16.5l-5.6 3.2A1.5 1.5 0 0 1 4 18.5V4zm4 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H8z"
      fill="currentColor"
    />
  </svg>
);

export const IconChat: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M20 3H4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3v3.5a1 1 0 0 0 1.6.8L14.2 19H20a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zm-13 6h10a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2zm7 4H7a1 1 0 1 1 0-2h7a1 1 0 1 1 0 2z"
      fill="currentColor"
    />
  </svg>
);

export const IconLogOut: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M3 4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3a1 1 0 1 1-2 0V4H5v16h7v-3a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4zm12.3 5.3a1 1 0 0 1 1.4 0l3 3a1 1 0 0 1 0 1.4l-3 3a1 1 0 1 1-1.4-1.4l1.3-1.3H9a1 1 0 1 1 0-2h7.6l-1.3-1.3a1 1 0 0 1 0-1.4z"
      fill="currentColor"
    />
  </svg>
);

export const IconMoonSolid: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M12 2a10 10 0 1 0 9.8 12.1 1 1 0 0 0-1.2-1.2 8 8 0 0 1-7.5-9.7 1 1 0 0 0-1.1-1.2z"
      fill="currentColor"
    />
  </svg>
);

export const IconSunSolid: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <path
      d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
