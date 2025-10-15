import { ReactNode } from "react";
import { LAYOUT_STYLES } from "@/lib/styles-constants";

interface StandardPageLayoutProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function StandardPageLayout({ title, children, action }: StandardPageLayoutProps) {
  return (
    <div className={`${LAYOUT_STYLES.page.container} ${LAYOUT_STYLES.page.maxWidth} ${LAYOUT_STYLES.page.padding}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {action}
      </div>
      <div className={LAYOUT_STYLES.spacing.section}>
        {children}
      </div>
    </div>
  );
}
