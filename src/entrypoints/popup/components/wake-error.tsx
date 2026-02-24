import { ErrorCode } from "../../../types";
import { ErrorAlert } from "./error-alert";

type WakeErrorProps = {
  errorMsg: string | null;
};

const errorMap: Record<string, { title: string; description: string }> = {
  [ErrorCode.SYSTEM_BLOCKED]: {
    title: "Blocked by device settings",
    description:
      "Your phone's Battery Saver or Low Power Mode is preventing the screen from staying on. Please disable it and try again.",
  },
  [ErrorCode.NOT_SECURE]: {
    title: "Secure connection required",
    description:
      "For security, your browser only allows the screen to stay awake on secure websites (URLs starting with https://).",
  },
  [ErrorCode.NOT_SUPPORTED]: {
    title: "Not supported here",
    description: "Your current browser or device does not support the feature required to keep the screen on.",
  },
};

export const WakeError = ({ errorMsg }: WakeErrorProps) => {
  if (!errorMsg || errorMsg === ErrorCode.PERMISSION_REQUIRED) return null;

  const errorDetails = errorMap[errorMsg] || {
    title: "Caffeine failed to activate",
    description: errorMsg || "An unknown error occurred.",
  };

  return <ErrorAlert title={errorDetails.title} description={errorDetails.description} />;
};
