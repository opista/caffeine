import browser from "webextension-polyfill";
import { ErrorCode } from "../../types";
import { ErrorAlert } from "./error-alert";

type WakeErrorProps = {
  errorMsg: string | null;
};

const errorMap: Record<string, { title: string; description: string; showFixButton: boolean }> = {
  [ErrorCode.SYSTEM_BLOCKED]: {
    title: "System prevented Wake Lock",
    description: "Check your OS battery settings or power saving mode.",
    showFixButton: true,
  },
  [ErrorCode.NOT_SECURE]: {
    title: "Secure Connection Required",
    description: "Wake Lock can only be active on secure HTTPS pages.",
    showFixButton: false,
  },
  [ErrorCode.NOT_SUPPORTED]: {
    title: "Browser Not Supported",
    description: "Your browser doesn't support the Wake Lock API.",
    showFixButton: false,
  },
};

export const WakeError = ({ errorMsg }: WakeErrorProps) => {
  if (!errorMsg || errorMsg === ErrorCode.PERMISSION_REQUIRED) return null;

  const errorDetails = errorMap[errorMsg] || {
    title: "Wake Lock failed to activate",
    description: errorMsg || "An unknown error occurred.",
    showFixButton: false,
  };

  return (
    <ErrorAlert
      title={errorDetails.title}
      description={errorDetails.description}
      buttonText={errorDetails.showFixButton ? "Fix Issue" : undefined}
      onButtonClick={
        errorDetails.showFixButton
          ? () => {
              browser.tabs.create({
                url: "https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API",
              });
            }
          : undefined
      }
    />
  );
};
