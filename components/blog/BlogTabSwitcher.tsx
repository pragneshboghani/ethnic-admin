type BlogTabSwitcherProps = {
  activeTab: 'general' | 'platforms';
  setActiveTab: React.Dispatch<React.SetStateAction<'general' | 'platforms'>>;
  selectedPlatforms: number[];
};

const BlogTabSwitcher = ({ activeTab, setActiveTab, selectedPlatforms }: BlogTabSwitcherProps) => (
  <div className="flex glass-card">
    <button
      type="button"
      onClick={() => setActiveTab('general')}
      className={`px-6 py-3 font-medium text-sm transition-colors relative ${
        activeTab === 'general'
          ? "bg-white/20 text-white shadow-lg border border-white/20 rounded-xl"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      General Content
    </button>
    <button
      type="button"
      onClick={() => setActiveTab('platforms')}
      className={`px-6 py-3 font-medium text-sm transition-colors relative ${
        activeTab === 'platforms'
          ? "bg-white/20 text-white shadow-lg border border-white/20 rounded-xl"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      Platforms & SEO
      {selectedPlatforms.length > 0 && (
        <span className="text-white rounded ml-[10px]">
          {`(${selectedPlatforms.length})`}
        </span>
      )}
    </button>
  </div>
);

export default BlogTabSwitcher