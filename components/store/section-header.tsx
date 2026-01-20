import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string; // Allow overrides
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12", className)}>
            <div className="space-y-1">
                <h2 className="heading-section tracking-tight">{title}</h2>
                {subtitle && (
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && (
                <div className="shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}
