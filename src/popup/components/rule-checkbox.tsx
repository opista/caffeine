import { IconCheck } from "@tabler/icons-react";
import { cn } from "../utils/cn";

export type RuleCheckboxProps = {
  title: string;
  description: string;
  checked: boolean;
  onClick: () => void;
  className?: string;
};

export const RuleCheckbox = ({ title, description, checked, onClick, className }: RuleCheckboxProps) => {
  return (
    <label
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between p-4 cursor-pointer transition-all has-[:checked]:bg-brand/10",
        className,
      )}
    >
      <div className="flex flex-col min-w-0 pr-4">
        <span className="text-sm font-bold text-slate-700 transition-colors group-has-[:checked]:text-brand">
          {title}
        </span>
        <span className="text-xs text-slate-400 font-medium truncate" title={description}>
          {description}
        </span>
      </div>
      <div className="relative flex items-center shrink-0">
        <input className="sr-only" type="checkbox" checked={checked} readOnly />
        <div className="w-5 h-5 rounded-[4px] border-2 bg-white border-slate-200 flex items-center justify-center transition-all group-hover:border-slate-300 group-hover:bg-slate-300 group-has-[:checked]:border-brand group-has-[:checked]:bg-brand">
          <IconCheck
            stroke={3}
            className={cn(
              "w-3.5 h-3.5 transition-all text-white opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100",
              {
                "scale-100 opacity-100": checked,
              },
            )}
          />
        </div>
      </div>
    </label>
  );
};
