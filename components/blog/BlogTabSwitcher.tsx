type BlogTabSwitcherProps = {
  activeTab: 'general' | 'platforms';
  setActiveTab: React.Dispatch<React.SetStateAction<'general' | 'platforms'>>;
  selectedPlatforms: number[];
};

const BlogTabSwitcher = ({ activeTab, setActiveTab, selectedPlatforms, }: BlogTabSwitcherProps) => (
  <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-2 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => setActiveTab('general')}
        className={`flex items-center justify-center rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${
          activeTab === 'general'
            ? 'border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
            : 'text-[var(--text-muted)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]'
        }`}
      >
        General Content
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('platforms')}
        className={`flex items-center justify-center gap-2 rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${
          activeTab === 'platforms'
            ? 'border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
            : 'text-[var(--text-muted)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]'
        }`}
      >
        Platforms & SEO
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            activeTab === 'platforms'
              ? 'bg-[var(--bg-selected)] text-[#294770]'
              : 'bg-black/[0.04] text-[var(--text-muted)]'
          }`}
        >
          {selectedPlatforms.length}
        </span>
      </button>
    </div>
  </div>
);

export default BlogTabSwitcher;
