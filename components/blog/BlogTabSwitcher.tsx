type BlogTabSwitcherProps = {
  activeTab: 'general' | 'platforms';
  setActiveTab: React.Dispatch<React.SetStateAction<'general' | 'platforms'>>;
  selectedPlatforms: number[];
};

const BlogTabSwitcher = ({ activeTab, setActiveTab, selectedPlatforms, }: BlogTabSwitcherProps) => (
  <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => setActiveTab('general')}
        className={`flex items-center justify-center rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${
          activeTab === 'general'
            ? 'border border-white/10 bg-[#101826] text-[#eef4ff] shadow-[0_12px_24px_rgba(0,0,0,0.2)]'
            : 'text-[#8ea0b8] hover:bg-white/[0.03] hover:text-white'
        }`}
      >
        General Content
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('platforms')}
        className={`flex items-center justify-center gap-2 rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${
          activeTab === 'platforms'
            ? 'border border-white/10 bg-[#101826] text-[#eef4ff] shadow-[0_12px_24px_rgba(0,0,0,0.2)]'
            : 'text-[#8ea0b8] hover:bg-white/[0.03] hover:text-white'
        }`}
      >
        Platforms & SEO
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            activeTab === 'platforms'
              ? 'bg-[#1d2b42] text-[#c8d7eb]'
              : 'bg-white/[0.05] text-[#8ea0b8]'
          }`}
        >
          {selectedPlatforms.length}
        </span>
      </button>
    </div>
  </div>
);

export default BlogTabSwitcher;
