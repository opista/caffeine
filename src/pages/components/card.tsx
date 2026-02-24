import { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";

export type CardProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Card<T extends ElementType = "div">({ as, className, children, ...props }: CardProps<T>) {
  const Component = as || "div";
  return (
    <Component className={cn("bg-white rounded-[24px] shadow-sm flex flex-col overflow-hidden", className)} {...props}>
      {children}
    </Component>
  );
}
