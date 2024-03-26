import { useState } from "react";

type AlertType = "success" | "error" | "warning" | "info";

export type AlertProps = {
  type: AlertType;
  message: string;
  lifeTimeMs?: number;
};

export default function Alert({ type, message, lifeTimeMs }: AlertProps) {
  const [show, setShow] = useState(true);

  const borderColor = {
    success: "border-green-500",
    error: "border-red-500",
    warning: "border-yellow-500",
    info: "border-blue-500",
  }[type];

  const textColor = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  }[type];

  if (lifeTimeMs !== undefined) {
    setTimeout(() => {
      setShow(false);
    }, lifeTimeMs);
  }

  if (!show) {
    return null;
  }

  return (
    <div
      className={`p-4 rounded-md border-2 my-4 ${borderColor} ${textColor}`}
    >
      <p>{message}</p>
    </div>
  );
}