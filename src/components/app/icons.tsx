// hand-rolled strokes lifted straight from the design canvas. no icon dep.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

// shared stroke setup, callers just pass size and colour
function Svg({ size = 16, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const GridIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </Svg>
);

export const ClockIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3.5 2" />
  </Svg>
);

export const CalendarIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </Svg>
);

export const CardIcon = (p: P) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="19" height="13" rx="3" />
    <path d="M2.5 11h19" />
  </Svg>
);

export const UserIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M4.5 20c1.4-3.6 4.1-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
  </Svg>
);

export const UsersIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3.4" />
    <path d="M2.8 20c1.3-3.4 3.6-5.1 6.2-5.1s4.9 1.7 6.2 5.1" />
    <path d="M16.5 5.4a3.4 3.4 0 010 6.2M18 14.9c2 .5 3.4 2.1 4.2 4.4" />
  </Svg>
);

export const ApprovalIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 13l4.5 4.5L19 7" />
    <path d="M3 20h18" />
  </Svg>
);

export const CheckIcon = (p: P) => (
  <Svg strokeWidth={2.6} {...p}>
    <path d="M5 13l4.5 4.5L19 7" />
  </Svg>
);

export const XIcon = (p: P) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const BellIcon = (p: P) => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 1112 0c0 4 1.4 5.5 2 6H4c.6-.5 2-2 2-6z" />
    <path d="M10.2 19a2 2 0 003.6 0" />
  </Svg>
);

export const SearchIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21" />
  </Svg>
);

export const ExitIcon = (p: P) => (
  <Svg {...p}>
    <path d="M15 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8" />
    <path d="M18 12H10M15 9l3 3-3 3" />
  </Svg>
);

export const PlusIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const DocIcon = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2.5" />
    <path d="M9 9h6M9 13h6" />
  </Svg>
);

export const SlipIcon = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2.5" />
    <path d="M9 9h6M9 13h6M9 17h3" />
  </Svg>
);

export const CameraIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M4 8.5h3l1.5-2h7L17 8.5h3v10H4z" />
    <circle cx="12" cy="13" r="3" />
  </Svg>
);

export const ChevronLeft = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M14 6l-6 6 6 6" />
  </Svg>
);

export const ChevronRight = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M10 6l6 6-6 6" />
  </Svg>
);

export const InfoIcon = (p: P) => (
  <Svg strokeWidth={2.1} {...p}>
    <path d="M12 8v.01M12 11v5" />
    <circle cx="12" cy="12" r="9" />
  </Svg>
);

export const PlaneIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </Svg>
);
