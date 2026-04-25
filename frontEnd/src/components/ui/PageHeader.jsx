/**
 * Consistent page title + optional subtitle used at the top of every dashboard page.
 */
export default function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div>
                <h1 className="text-xl font-bold text-slate-800">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
