import clsx from "clsx";
import type { ReactElement } from "react";

export interface ButtonProps {
  className?: string;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  className,
  text,
  onClick,
  disabled,
}: ButtonProps): ReactElement {
  return (
    <button
      className={clsx(
        className,
        "rounded-lg px-3 py-2 text-white transition-transform ",
        disabled
          ? "bg-zinc-300"
          : "cursor-pointer bg-yellow drop-shadow-2xl hover:translate-y-[-3px]"
      )}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
