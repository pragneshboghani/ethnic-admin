const renderStatusBadge = (status: string) => {
    const baseClass = "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] border";

    const statusClasses = {
        approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/10",
        rejected: "bg-rose-500/10 text-rose-300 border-rose-500/10",
        hold: "bg-amber-500/10 text-amber-300 border-amber-500/10",
    };

    return (
        <span className={`${baseClass} ${statusClasses[status as keyof typeof statusClasses] || statusClasses.hold}`} >
            {status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending"}
        </span>
    );
};

export default renderStatusBadge