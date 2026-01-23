import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string; // Allow overrides
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16", className)}>
            <div className="space-y-3 max-w-3xl">
                <h2 className="heading-section text-foreground">{title}</h2>
                {subtitle && (
                    <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && (
                <div className="shrink-0 pt-2 md:pt-0">
                    {action}
                </div>
            )}
        </div>
    );
}
