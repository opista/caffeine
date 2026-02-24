import { IconAlertCircle, IconArrowRight } from "@tabler/icons-react";
import { Card } from "./card";

export type ErrorAlertProps = {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
};

export const ErrorAlert = ({ title, description, buttonText, onButtonClick }: ErrorAlertProps) => {
  return (
    <Card className="bg-red-50 border border-red-100 p-4 flex-row gap-3 items-start">
      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
        <IconAlertCircle size="1.125rem" className="text-red-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-red-900 leading-none mb-1">{title}</h3>
        <p className="text-xs text-red-700 leading-tight">{description}</p>
        {buttonText && onButtonClick && (
          <button
            onClick={onButtonClick}
            className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 hover:underline cursor-pointer"
          >
            {buttonText} <IconArrowRight size="0.875rem" />
          </button>
        )}
      </div>
    </Card>
  );
};
