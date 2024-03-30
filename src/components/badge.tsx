import React, { useState } from "react";

type BadgeProps = {
  text: string;
  dismissable: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

export default function Badge({
  text,
  onClick,
  dismissable,
  children,
}: BadgeProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    if (dismissable) {
      setIsVisible(false);
    }
    onClick?.();
  };

  const badgeSvg = (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <>
      {isVisible && (
        <div className="bg-blue-100 text-blue-800 inline-flex items-center rounded-full px-4 py-2">
          <span>{text}</span>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 ml-2 focus:outline-none"
            onClick={handleClick}
          >
            {badgeSvg}
            {children}
          </button>
        </div>
      )}
    </>
  );
}
