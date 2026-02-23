import { IconCheck } from '@tabler/icons-react';
import { cn } from '../utils/cn';

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
        "group flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-brand/5 has-[:checked]:bg-brand/10",
        className
      )}
    >
      <div className="flex flex-col min-w-0 pr-4">
        <span className="text-[13px] font-bold text-slate-700 transition-colors group-has-[:checked]:text-brand">
          {title}
        </span>
        <span className="text-[10px] text-slate-400 font-medium truncate" title={description}>
          {description}
        </span>
      </div>
      <div className="relative flex items-center shrink-0">
        <input
          className="sr-only"
          type="checkbox"
          checked={checked}
          readOnly
        />
        <div className="w-5 h-5 rounded-[4px] border-2 bg-white border-slate-200 flex items-center justify-center transition-all group-has-[:checked]:border-brand group-has-[:checked]:bg-brand">
          <IconCheck stroke={3} className={cn(
            "w-3.5 h-3.5 transition-all text-brand",
            checked ? "scale-100 opacity-100 text-white" : "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-30"
          )} />
        </div>
      </div>
    </label>
  );
};
