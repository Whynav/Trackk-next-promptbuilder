import React, { useState, useMemo } from 'react';

// ─── Material Symbol Icon helper ──────────────────────────────────────────────
const Icon = ({ name, size = 20, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontSize: `${size}px` }}
  >
    {name}
  </span>
);

// ─── Utility ──────────────────────────────────────────────────────────────────
const joinList = (arr, connector = 'and') => {
  if (!arr || arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} ${connector} ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')}, ${connector} ${arr[arr.length - 1]}`;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const GOALS = [
  { id: 'fast_moving', label: 'Fast Movers',           icon: 'trending_up' },
  { id: 'breakout',    label: 'Breakout Candidates',   icon: 'bolt' },
  { id: 'long_term',   label: 'Long-Term Quality',     icon: 'verified' },
  { id: 'undervalued', label: 'Undervalued Stocks',    icon: 'sell' },
  { id: 'affordable',  label: 'Affordable (Under ₹500)', icon: 'account_balance_wallet' },
  { id: 'sector',      label: 'Sector Tailwinds',      icon: 'wind_power' },
  { id: 'event',       label: 'News & Catalysts',      icon: 'newspaper' },
  { id: 'active',      label: 'High Trading Volume',   icon: 'monitoring' },
  { id: 'safer',       label: 'Low Volatility / Safe', icon: 'shield' },
  { id: 'custom',      label: 'Custom / Build Own',    icon: 'tune', dashed: true },
];

const HORIZONS = [
  { id: 'intraday',  label: 'Intraday' },
  { id: 'swing',     label: 'Swing' },
  { id: 'medium',    label: 'Medium Term' },
  { id: 'long',      label: 'Long Term' },
  { id: 'exploring', label: 'Diversified Portfolio' },
];

const UNIVERSES = {
  sectors:     ['Any Sector', 'Banking & Finance', 'Energy', 'EV & Auto', 'Pharma', 'IT & Tech', 'Infrastructure', 'Defense', 'Consumer Goods', 'PSU'],
  marketCaps:  ['Any Cap', 'Large Cap', 'Mid Cap', 'Small Cap'],
  priceRanges: ['Any Price', 'Under ₹100', 'Under ₹500', '₹500 - ₹1000', 'Over ₹1000'],
};

const SIGNAL_FAMILIES = [
  {
    id: 'momentum', title: 'Price Action & Momentum', icon: 'show_chart',
    options: ['strong recent price performance', 'near 52-week highs', 'sustained momentum', 'short-term uptrend', 'breakout potential'],
  },
  {
    id: 'volume', title: 'Volume & Activity', icon: 'bar_chart',
    options: ['high trading volume', 'sudden volume spike', 'unusual activity', 'liquid stocks', 'high trader interest'],
  },
  {
    id: 'technical', title: 'Technical Indicators', icon: 'query_stats',
    options: ['RSI strength', 'RSI oversold', 'above key moving averages', 'bullish trend alignment', 'volatility expansion'],
  },
  {
    id: 'fundamental', title: 'Fundamental Strength', icon: 'account_balance',
    options: ['strong revenue growth', 'strong profit growth', 'high ROE / ROCE', 'low debt', 'healthy margins', 'positive cash flow', 'consistent earnings'],
  },
  {
    id: 'valuation', title: 'Valuation', icon: 'balance',
    options: ['low PE relative to peers', 'reasonable valuation', 'undervalued with strong business quality', 'fair price with growth'],
  },
  {
    id: 'safety', title: 'Stability & Safety', icon: 'anchor',
    options: ['lower volatility', 'stable earnings', 'strong balance sheet', 'defensive businesses'],
  },
  {
    id: 'event', title: 'Event & Catalyst Sensitivity', icon: 'campaign',
    options: ['stocks that react strongly to news', 'earnings-sensitive stocks', 'policy-sensitive stocks', 'announcement-driven movers', 'catalyst-led setups'],
  },
];

const EXCLUSIONS = [
  'avoid penny stocks',
  'avoid loss-making companies',
  'avoid highly volatile stocks',
  'prefer profitable companies',
  'prefer liquid stocks only',
];

const RISKS = ['Aggressive', 'Balanced', 'Safer'];

const PROMPT_LIBRARY = [
  { category: 'Momentum',    title: 'High Volume Movers',    color: 'orange',   tags: ['Swing', 'Volume'],       why: 'Great for catching stocks already in motion with institutional backing.',        prompt: 'Find mid and small-cap stocks under ₹1000 showing strong upward momentum, with strong recent price performance and sudden volume spikes, for a swing trade. Avoid penny stocks.' },
  { category: 'Momentum',    title: '52-Week High Chasers',  color: 'yellow',   tags: ['Swing', 'Price Action'],  why: 'Perfect for trend followers looking for names breaking into new territory.',     prompt: 'Find stocks near their 52-week highs, showing sustained momentum and high trader interest, for a swing trade.' },
  { category: 'Breakouts',   title: 'Technical Squeeze',     color: 'lavender', tags: ['Technical', 'Swing'],     why: 'Finds tightly coiled charts right before they make a major directional move.',  prompt: 'Find stocks setting up for a breakout, showing volatility expansion and breakout potential, for a swing trade.' },
  { category: 'Long-term',   title: 'The Compounder',        color: 'yellow',   tags: ['Long Term', 'Fundamental'], why: 'The gold standard for finding mature, high-quality businesses to hold.',       prompt: 'Find large and mid-cap stocks with solid fundamentals, showing strong profit growth and high ROE / ROCE, for a long-term investment.' },
  { category: 'Undervalued', title: 'Beaten Down Quality',   color: 'lavender', tags: ['Value', 'Medium Term'],   why: 'Good for finding unloved stocks that still have a solid underlying business.',   prompt: 'Find stocks that look undervalued, showing stable earnings and low PE relative to peers, for a medium-term position.' },
  { category: 'Affordable',  title: 'Under ₹100 Momentum',  color: 'orange',   tags: ['Budget', 'Momentum'],     why: 'Filters out junk while finding cheaper stocks that are actually moving.',        prompt: 'Find stocks priced under ₹100 with strong momentum, showing high trading volume and strong recent price performance. Avoid loss-making companies.' },
  { category: 'Event',       title: 'Earnings Movers',       color: 'yellow',   tags: ['News', 'Swing'],          why: 'Built to catch the volatility immediately surrounding corporate earnings.',      prompt: 'Find tech and pharma stocks reacting to recent catalysts, showing earnings-sensitive stocks and high trading volume, for a swing trade.' },
  { category: 'Thematic',    title: 'EV & Auto Boom',        color: 'lavender', tags: ['Sector', 'Growth'],       why: 'Combines a top-down thematic view with actual fundamental growth numbers.',     prompt: 'Find EV & Auto stocks with strong sector tailwinds, showing strong revenue growth and bullish trend alignment, for a swing trade.' },
  { category: 'Safer',       title: 'Defensive Yielders',    color: 'yellow',   tags: ['Safe', 'Long Term'],      why: 'Prioritizes capital protection and low-stress holding over aggressive growth.',  prompt: 'Find large-cap stocks with a defensive profile, showing lower volatility and strong balance sheet, for a long-term investment.' },
  { category: 'Hybrid',      title: 'Techno-Funda Setup',    color: 'orange',   tags: ['Funda', 'Tech'],          why: 'The best of both worlds: strong underlying business meeting a great chart setup.', prompt: 'Find stocks showing strong profit growth, low debt, breakout potential, and RSI strength, for a swing trade.' },
];

// ─── Prompt Generator ─────────────────────────────────────────────────────────
const generatePromptText = ({ goal, horizon, universe, signals, risk, exclusions }) => {
  if (!goal && signals.length === 0 && exclusions.length === 0) return '';

  const hasMarketCap = universe.marketCap && universe.marketCap !== 'Any Cap';
  const hasSector    = universe.sector    && universe.sector    !== 'Any Sector';
  let universePart =
    hasMarketCap && hasSector ? `${universe.marketCap.toLowerCase()} ${universe.sector.toLowerCase()} stocks`
    : hasMarketCap             ? `${universe.marketCap.toLowerCase()} stocks`
    : hasSector                ? `${universe.sector.toLowerCase()} stocks`
    : 'stocks';

  let prompt = `Find ${universePart}`;
  if (universe.priceRange && universe.priceRange !== 'Any Price')
    prompt += ` priced ${universe.priceRange.toLowerCase()}`;

  const goalMap = {
    fast_moving: 'showing strong upward momentum',
    breakout:    'setting up for a breakout',
    long_term:   'with high-quality business fundamentals',
    undervalued: 'that are undervalued relative to peers',
    affordable:  'that are low-priced and budget-friendly',
    sector:      'aligned with strong sector trends',
    event:       'reacting to recent news or earnings catalysts',
    active:      'with high trading volume and activity',
    safer:       'with stable earnings and low volatility',
  };
  const goalPhrase = goal ? goalMap[goal] : '';
  if (goalPhrase) prompt += ` ${goalPhrase}`;

  const activeSignals = signals.slice(0, 3);
  if (activeSignals.length > 0)
    prompt += (goalPhrase ? ', specifically showing ' : ' showing ') + joinList(activeSignals);

  const horizonMap = {
    intraday:  'for an intraday setup.',
    swing:     'for a swing trade.',
    medium:    'for a medium-term position.',
    long:      'for a long-term investment.',
    exploring: 'for a diversified portfolio.',
  };
  prompt += ` ${horizonMap[horizon] || '.'}`;

  const avoids  = exclusions.filter(e => e.startsWith('avoid')).map(e => e.replace('avoid ', ''));
  const prefers = exclusions.filter(e => e.startsWith('prefer')).map(e => e.replace('prefer ', ''));
  const parts   = [];
  if (avoids.length)  parts.push(`Avoid ${joinList(avoids)}.`);
  if (prefers.length) parts.push(`Prefer ${joinList(prefers)}.`);
  if (risk === 'Safer')      parts.push('Prioritize capital protection.');
  else if (risk === 'Aggressive') parts.push('Focus on high-growth potential.');
  if (parts.length) prompt += ` ${parts.join(' ')}`;

  return prompt.replace(/\s+/g, ' ').trim();
};

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────
const NeoCard = ({ children, bg = 'bg-white', className = '' }) => (
  <div className={`${bg} border-[3px] border-black rounded-xl shadow-neo relative ${className}`}>
    {children}
  </div>
);

const StepBadge = ({ n, bg = 'bg-[#FB923C]', rotate = '-rotate-[10deg]' }) => (
  <div className={`absolute -top-4 -left-4 w-8 h-8 ${bg} rounded-full border-[3px] border-black flex items-center justify-center font-headline text-base font-extrabold z-10 ${rotate}`}>
    {n}
  </div>
);

const GoalChip = ({ goal, active, onClick }) => (
  <button
    onClick={onClick}
    className={`neo-chip flex items-center gap-1.5 px-4 py-2 border-[3px] border-black font-label text-xs tracking-wider font-bold
      ${goal.dashed ? 'border-dashed rounded-lg bg-[#f3f3f3]' : 'rounded-full bg-white'}
      ${active ? 'bg-[#FB923C] !shadow-none !translate-x-[2px] !translate-y-[2px]' : ''}`}
  >
    <Icon name={goal.icon} size={15} />
    {goal.label}
  </button>
);

const SignalChip = ({ label, active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`neo-chip px-3 py-1.5 border-[2px] border-black rounded-lg font-label text-[11px] tracking-wide font-bold
      ${active   ? 'bg-[#FB923C] text-black !shadow-none !translate-x-[1px] !translate-y-[1px]' : ''}
      ${disabled && !active ? 'bg-[#f3f3f3] text-[#aaa] border-[#ccc] cursor-not-allowed' : ''}
      ${!active && !disabled ? 'bg-white text-black' : ''}`}
  >
    {label}
  </button>
);

const NeoSelect = ({ value, onChange, options, label, pulse }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && (
      <label className="font-label text-[10px] uppercase tracking-widest text-[#4b4734] font-bold">{label}</label>
    )}
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full appearance-none bg-white border-[2px] rounded-lg px-4 py-2.5 font-label text-xs font-bold focus:outline-none cursor-pointer transition-all
          ${pulse ? 'border-[#FB923C] shadow-[0_0_0_3px_rgba(251,146,60,0.2)]' : 'border-black focus:border-[#FB923C]'}`}
      >
        {options.map(opt => {
          const val = typeof opt === 'object' ? opt.id : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      <Icon name="expand_more" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

// Library card accent colors
const CARD_ACCENTS = {
  orange:  'bg-[#FB923C]',
  yellow:  'bg-[#fde047]',
  lavender:'bg-[#DDD6FE]',
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab]     = useState('builder');
  const [toastMsg,  setToastMsg]      = useState('');
  const [copied,    setCopied]        = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [confirmReset,  setConfirmReset]  = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [activeTags,    setActiveTags]    = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);

  const defaultState = {
    goal: '',
    horizon: 'medium',
    universe: { sector: 'Any Sector', marketCap: 'Any Cap', priceRange: 'Any Price' },
    signals: [],
    risk: 'Balanced',
    exclusions: [],
  };
  const [builderState, setBuilderState] = useState(defaultState);
  const currentPrompt = useMemo(() => generatePromptText(builderState), [builderState]);

  const showToast = msg => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };
  const updateState = (key, val) => { setHasInteracted(true); setBuilderState(p => ({ ...p, [key]: val })); };

  const handleGoalSelect = goalId => {
    setHasInteracted(true);
    setBuilderState(prev => {
      const isDeselect = prev.goal === goalId;
      let s = { ...prev, goal: isDeselect ? '' : goalId };
      if (!isDeselect && prev.signals.length === 0) {
        if (goalId === 'affordable')  s.universe = { ...s.universe, priceRange: 'Under ₹500' };
        if (goalId === 'fast_moving') { s.horizon = 'swing';    s.signals = ['strong recent price performance', 'sustained momentum']; }
        if (goalId === 'breakout')    { s.horizon = 'swing';    s.signals = ['breakout potential', 'high trading volume']; }
        if (goalId === 'long_term')   { s.horizon = 'long';     s.signals = ['strong profit growth', 'high ROE / ROCE', 'low debt']; }
        if (goalId === 'undervalued') { s.horizon = 'medium';   s.signals = ['low PE relative to peers', 'undervalued with strong business quality']; }
        if (goalId === 'event')       { s.horizon = 'swing';    s.signals = ['stocks that react strongly to news', 'unusual activity']; }
        if (goalId === 'active')      { s.horizon = 'intraday'; s.signals = ['liquid stocks', 'high trader interest']; }
        if (goalId === 'safer')       { s.horizon = 'long';     s.signals = ['lower volatility', 'stable earnings']; s.risk = 'Safer'; }
      }
      return s;
    });
  };

  const toggleSignal = signal => {
    setHasInteracted(true);
    setBuilderState(prev => {
      if (prev.signals.includes(signal)) return { ...prev, signals: prev.signals.filter(s => s !== signal) };
      if (prev.signals.length >= 4) { showToast('Signal limit reached (4 max).'); return prev; }
      return { ...prev, signals: [...prev.signals, signal] };
    });
  };

  const toggleExclusion = ex => {
    setHasInteracted(true);
    setBuilderState(prev => ({
      ...prev,
      exclusions: prev.exclusions.includes(ex) ? prev.exclusions.filter(e => e !== ex) : [...prev.exclusions, ex],
    }));
  };

  const handleSurpriseMe = () => {
    const g = GOALS.filter(x => x.id !== 'custom')[Math.floor(Math.random() * (GOALS.length - 1))];
    const h = HORIZONS[Math.floor(Math.random() * HORIZONS.length)].id;
    const relevant = SIGNAL_FAMILIES.filter(f =>
      (g.id === 'fast_moving' && f.id === 'momentum')  ||
      (g.id === 'breakout'    && (f.id === 'technical' || f.id === 'momentum')) ||
      (g.id === 'long_term'   && f.id === 'fundamental') ||
      (g.id === 'undervalued' && f.id === 'valuation')  ||
      (g.id === 'event'       && f.id === 'event')      ||
      (g.id === 'active'      && f.id === 'volume')     ||
      (g.id === 'safer'       && f.id === 'safety')
    );
    const families = relevant.length > 0 ? relevant : SIGNAL_FAMILIES.slice(0, 2);
    const sigs = [];
    families.forEach(f => { const opt = f.options[Math.floor(Math.random() * f.options.length)]; if (opt && !sigs.includes(opt)) sigs.push(opt); });
    setHasInteracted(true);
    setBuilderState({ ...defaultState, goal: g.id, horizon: h, signals: sigs });
    showToast('Random setup generated!');
  };

  const saveHistory = p => setPromptHistory(prev => [p, ...prev.filter(x => x !== p)].slice(0, 5));

  const handleCopy = () => {
    if (!currentPrompt) return;
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true); saveHistory(currentPrompt);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTrackk = () => {
    if (!currentPrompt) return;
    navigator.clipboard.writeText(currentPrompt);
    saveHistory(currentPrompt);
    window.open('https://trackk.in/', '_blank');
    showToast('Prompt copied! Opening Trackk Next...');
  };

  const resetBuilder = () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return; }
    setBuilderState(defaultState); setHasInteracted(false); setConfirmReset(false);
    showToast('Builder reset');
  };

  const isHighlighted = id =>
    (builderState.goal === 'fast_moving' && id === 'momentum') ||
    (builderState.goal === 'breakout'    && (id === 'technical' || id === 'momentum')) ||
    (builderState.goal === 'long_term'   && id === 'fundamental') ||
    (builderState.goal === 'undervalued' && id === 'valuation') ||
    (builderState.goal === 'event'       && id === 'event') ||
    (builderState.goal === 'active'      && id === 'volume') ||
    (builderState.goal === 'safer'       && id === 'safety');

  const allTags        = [...new Set(PROMPT_LIBRARY.flatMap(p => p.tags))];
  const filteredLibrary = PROMPT_LIBRARY.filter(p => {
    const matchSearch = !librarySearch || p.title.toLowerCase().includes(librarySearch.toLowerCase()) || p.prompt.toLowerCase().includes(librarySearch.toLowerCase());
    const matchTags   = activeTags.length === 0 || activeTags.some(t => p.tags.includes(t));
    return matchSearch && matchTags;
  });

  // ── Prompt panel content (reused in desktop sidebar + mobile drawer) ─────────
  const PromptPanel = ({ mobile = false }) => (
    <div className={mobile ? 'p-4' : 'p-6 flex flex-col flex-1'}>
      {/* Header */}
      <div className={`flex items-center gap-2 ${mobile ? 'mb-3' : 'mb-4 pb-3 border-b-2 border-[#4b4734]'}`}>
        <Icon name="terminal" size={18} className="text-[#FB923C]" />
        <span className="font-label text-[11px] tracking-widest uppercase text-[#FB923C] font-bold">Generated Prompt</span>
      </div>

      {/* Prompt text box */}
      <div className={`bg-[#1c1c1c] border-[2px] border-[#4b4734] rounded-lg p-4 flex items-start ${mobile ? 'min-h-[72px] mb-3' : 'flex-1 min-h-[180px] mb-4'}`}>
        <p className={`font-label text-sm leading-relaxed w-full ${hasInteracted && currentPrompt ? 'text-[#dadada]' : 'text-[#4b4734] italic text-center mt-auto mb-auto'}`}>
          {hasInteracted && currentPrompt
            ? currentPrompt
            : "Select a discovery goal or tap 'Surprise Me' to start building your prompt..."}
        </p>
      </div>

      {/* CTAs */}
      {hasInteracted && currentPrompt && (
        <div className={`flex gap-2 ${mobile ? '' : 'flex-col'}`}>
          {!mobile && (
            <button onClick={handleCopy}
              className="neo-btn w-full py-2.5 bg-white border-[3px] border-black rounded-lg font-label text-xs font-bold shadow-neo-sm flex items-center justify-center gap-2 text-black">
              <Icon name={copied ? 'check' : 'content_copy'} size={16} />
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
          )}
          <button onClick={handleOpenTrackk}
            className={`neo-btn ${mobile ? 'flex-1' : 'w-full'} py-2.5 bg-[#FB923C] border-[3px] border-black rounded-lg font-label text-xs font-bold shadow-neo flex items-center justify-center gap-2 text-black`}>
            <Icon name="open_in_new" size={16} />
            {mobile ? 'Open Trackk Next' : 'Copy & Open Trackk Next'}
          </button>
          {mobile && (
            <button onClick={handleCopy}
              className="neo-btn py-2.5 px-3 bg-white border-[3px] border-black rounded-lg font-label text-xs font-bold shadow-neo-sm flex items-center justify-center text-black">
              <Icon name={copied ? 'check' : 'content_copy'} size={16} />
            </button>
          )}
        </div>
      )}

      {/* Reset + history (desktop only) */}
      {!mobile && (
        <>
          {hasInteracted && (
            <button onClick={resetBuilder}
              className={`mt-3 w-full py-2 font-label text-xs font-bold rounded-lg border-[2px] flex items-center justify-center gap-1.5 transition-all
                ${confirmReset ? 'bg-red-50 border-[#ba1a1a] text-[#ba1a1a]' : 'bg-transparent border-black text-[#4b4734] hover:text-black hover:border-black'}`}>
              <Icon name="refresh" size={14} />
              {confirmReset ? 'Click again to confirm' : 'Reset Builder'}
            </button>
          )}
          {promptHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t-[2px] border-[#4b4734]">
              <span className="font-label text-[10px] uppercase tracking-widest text-[#4b4734] block mb-2">Recent Prompts</span>
              <div className="flex flex-col gap-1.5">
                {promptHistory.map((h, i) => (
                  <button key={i} onClick={() => { navigator.clipboard.writeText(h); showToast('History copied!'); }}
                    className="text-left text-[11px] font-label text-[#aaa] bg-[#1a1a1a] border border-[#4b4734] rounded px-2 py-1 truncate hover:bg-[#252525]">
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-body text-black">

      {/* ── Toast ── */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-[#FB923C] text-black px-5 py-2.5 border-[3px] border-black shadow-neo font-label text-xs font-bold flex items-center gap-2 rounded-lg transition-all duration-300
        ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <Icon name="check" size={16} />
        {toastMsg}
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#FEFCE8] border-b-4 border-black shadow-[4px_4px_0px_0px_#000] flex justify-between items-center px-5 md:px-10 h-[72px]">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button className="md:hidden text-black p-1 hover:text-[#FB923C] transition-colors">
            <Icon name="menu" size={26} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#fde047] border-[3px] border-black flex items-center justify-center flex-shrink-0">
              <Icon name="auto_awesome" size={16} className="text-black" />
            </div>
            <h1 className="font-headline text-2xl font-extrabold italic uppercase tracking-tighter text-black hidden sm:block">
              TRACKK
            </h1>
            <span className="font-headline text-sm font-bold text-[#4b4734] hidden md:block mt-0.5">
              Next Prompt Builder
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button onClick={handleSurpriseMe}
            className="neo-chip hidden md:flex items-center gap-1.5 bg-[#DDD6FE] border-[2px] border-black px-4 py-2 rounded-lg font-label text-xs font-bold">
            <Icon name="magic_button" size={15} />
            Surprise Me
          </button>
          {/* Tab switcher */}
          <div className="flex border-[3px] border-black rounded-xl overflow-hidden">
            <button onClick={() => setActiveTab('builder')}
              className={`px-5 py-2 font-label text-xs font-bold transition-colors
                ${activeTab === 'builder' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f3f3f3]'}`}>
              Builder
            </button>
            <button onClick={() => setActiveTab('library')}
              className={`px-5 py-2 font-label text-xs font-bold border-l-[2px] border-black transition-colors
                ${activeTab === 'library' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f3f3f3]'}`}>
              Library
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className={`max-w-[1600px] mx-auto px-5 md:px-10 py-8 ${hasInteracted ? 'pb-[200px] lg:pb-10' : 'pb-10'}`}>

        {/* ══ Builder Tab ══ */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── Left: Form (8 cols) ── */}
            <div className="lg:col-span-8 flex flex-col gap-8 relative">

              {/* Decorative floating icons */}
              <span className="material-symbols-outlined absolute -top-6 -left-6 text-[#FB923C] opacity-25 pointer-events-none select-none z-0" style={{ fontSize: '80px', transform: 'rotate(12deg)' }}>astrophotography_off</span>
              <span className="material-symbols-outlined absolute top-52 -right-4 text-[#DDD6FE] opacity-35 pointer-events-none select-none z-0" style={{ fontSize: '64px', transform: 'rotate(-12deg)' }}>local_florist</span>

              {/* 1 ── Discovery Goal */}
              <NeoCard className="pt-8 pb-6 px-6">
                <StepBadge n="1" bg="bg-[#FB923C]" rotate="-rotate-[10deg]" />
                <h2 className="font-headline text-2xl font-bold mb-1">What are you trying to find?</h2>
                <p className="font-body text-sm text-[#4b4734] mb-4">Select a primary discovery goal.</p>
                <div className="flex flex-wrap gap-2.5">
                  {GOALS.map(g => (
                    <GoalChip key={g.id} goal={g} active={builderState.goal === g.id} onClick={() => handleGoalSelect(g.id)} />
                  ))}
                </div>
              </NeoCard>

              {/* 2 + 3 ── Timeframe & Risk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <NeoCard bg="bg-[#fde047]" className="pt-8 pb-6 px-6">
                  <StepBadge n="2" bg="bg-white" rotate="rotate-[5deg]" />
                  <h3 className="font-headline text-xl font-bold mb-4">Timeframe</h3>
                  <NeoSelect value={builderState.horizon} onChange={val => updateState('horizon', val)} options={HORIZONS} />
                </NeoCard>
                <NeoCard bg="bg-[#DDD6FE]" className="pt-8 pb-6 px-6">
                  <StepBadge n="3" bg="bg-white" rotate="-rotate-[5deg]" />
                  <h3 className="font-headline text-xl font-bold mb-4">Risk Preference</h3>
                  <div className="flex border-[3px] border-black rounded-xl overflow-hidden">
                    {RISKS.map((r, i) => (
                      <button key={r} onClick={() => updateState('risk', r)}
                        className={`flex-1 py-2.5 font-label text-xs font-bold transition-colors
                          ${i < RISKS.length - 1 ? 'border-r-[2px] border-black' : ''}
                          ${builderState.risk === r ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f3f3f3]'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </NeoCard>
              </div>

              {/* 4 ── Filter Universe */}
              <NeoCard className="pt-8 pb-6 px-6">
                <StepBadge n="4" bg="bg-[#FB923C]" rotate="rotate-[8deg]" />
                <div className="flex items-baseline gap-2 mb-5">
                  <h3 className="font-headline text-2xl font-bold">Filter Universe</h3>
                  <span className="font-label text-[10px] uppercase tracking-widest text-[#4b4734] font-bold">(Optional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <NeoSelect label="MARKET CAP"  value={builderState.universe.marketCap}  onChange={val => setBuilderState(p => ({ ...p, universe: { ...p.universe, marketCap: val } }))}  options={UNIVERSES.marketCaps} />
                  <NeoSelect label="SECTOR"       value={builderState.universe.sector}     onChange={val => setBuilderState(p => ({ ...p, universe: { ...p.universe, sector: val } }))}     options={UNIVERSES.sectors}    pulse={builderState.goal === 'sector' && builderState.universe.sector === 'Any Sector'} />
                  <NeoSelect label="PRICE RANGE"  value={builderState.universe.priceRange} onChange={val => setBuilderState(p => ({ ...p, universe: { ...p.universe, priceRange: val } }))} options={UNIVERSES.priceRanges} pulse={builderState.goal === 'affordable' && builderState.universe.priceRange === 'Any Price'} />
                </div>
              </NeoCard>

              {/* 5 ── Conditions & Signals */}
              <NeoCard className="pt-8 pb-6 px-6">
                <StepBadge n="5" bg="bg-[#DDD6FE]" rotate="-rotate-[15deg]" />
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-headline text-2xl font-bold">Conditions & Signals</h3>
                    <p className="font-body text-sm text-[#4b4734] mt-0.5">Select up to 4 specific conditions.</p>
                  </div>
                  <div className={`px-3 py-1 border-[2px] border-black rounded-full font-label text-xs font-bold flex-shrink-0 ml-4
                    ${builderState.signals.length >= 4 ? 'bg-[#FB923C] text-black' : 'bg-black text-white'}`}>
                    {builderState.signals.length} / 4 Selected
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-5">
                  {/* Signal families */}
                  {SIGNAL_FAMILIES.map(family => {
                    const hi = isHighlighted(family.id);
                    return (
                      <div key={family.id}
                        className={`border-[2px] border-black rounded-lg p-4 relative overflow-hidden transition-all
                          ${hi ? 'border-[3px] shadow-neo bg-[#FFFEF0]' : 'bg-white'}`}>
                        {hi && (
                          <div className="absolute -top-px right-4 bg-[#FB923C] text-black text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 border-[2px] border-black font-label">
                            Suggested
                          </div>
                        )}
                        {/* Watermark */}
                        <Icon name={family.icon} size={80} className="absolute right-[-8px] bottom-[-8px] opacity-[0.06] pointer-events-none" />
                        <h4 className="font-body text-sm font-bold flex items-center gap-2 mb-3">
                          <Icon name={family.icon} size={18} className={hi ? 'text-[#FB923C]' : 'text-black'} />
                          {family.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {family.options.map(opt => (
                            <SignalChip key={opt} label={opt}
                              active={builderState.signals.includes(opt)}
                              onClick={() => toggleSignal(opt)}
                              disabled={builderState.signals.length >= 4 && !builderState.signals.includes(opt)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Quick Exclusions */}
                  <div className="border-[2px] border-[#ba1a1a] rounded-lg p-4 relative overflow-hidden bg-[#ffdad6]">
                    <Icon name="cancel" size={80} className="absolute right-[-8px] bottom-[-8px] opacity-[0.07] text-[#ba1a1a] pointer-events-none" />
                    <h4 className="font-body text-sm font-bold flex items-center gap-2 mb-3 text-[#ba1a1a]">
                      <Icon name="close" size={18} className="text-[#ba1a1a]" />
                      Quick Exclusions
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {EXCLUSIONS.filter(e => e.startsWith('avoid')).map(ex => (
                        <button key={ex} onClick={() => toggleExclusion(ex)}
                          className={`neo-chip flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-black rounded-full font-label text-[11px] font-bold
                            ${builderState.exclusions.includes(ex) ? 'bg-[#ba1a1a] text-white !shadow-none !translate-x-[1px] !translate-y-[1px]' : 'bg-white text-black'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] flex-shrink-0" />
                          {ex}
                        </button>
                      ))}
                    </div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-[#4b4734] mb-2 font-bold">Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {EXCLUSIONS.filter(e => e.startsWith('prefer')).map(ex => (
                        <button key={ex} onClick={() => toggleExclusion(ex)}
                          className={`neo-chip px-3 py-1.5 border-[2px] border-black rounded-full font-label text-[11px] font-bold
                            ${builderState.exclusions.includes(ex) ? 'bg-black text-white !shadow-none !translate-x-[1px] !translate-y-[1px]' : 'bg-white text-black'}`}>
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </NeoCard>
            </div>

            {/* ── Right: Sticky Prompt Panel (4 cols, desktop only) ── */}
            <div className="hidden lg:flex lg:col-span-4 flex-col sticky top-[90px] gap-5">
              {/* Terminal panel */}
              <div className="bg-black border-[3px] border-black rounded-xl shadow-neo-orange min-h-[480px] flex flex-col relative overflow-hidden">
                {/* CRT scanline */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)' }} />
                <PromptPanel mobile={false} />
              </div>
              {/* Pro tip sticker */}
              <div className="flex justify-end">
                <div className="bg-[#ffe24c] px-4 py-2.5 border-[3px] border-black shadow-neo inline-block"
                  style={{ transform: 'rotate(3deg)' }}>
                  <p className="font-body text-sm font-bold flex items-center gap-1.5">
                    <Icon name="lightbulb" size={16} />
                    Pro tip: Mix signals!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ Library Tab ══ */}
        {activeTab === 'library' && (
          <div>
            <div className="mb-6">
              <h2 className="font-headline text-3xl font-extrabold mb-1">Prompt Library</h2>
              <p className="font-body text-[#4b4734]">Battle-tested prompts for Indian market discovery.</p>
            </div>

            {/* Search + Tag filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b4734]" />
                <input type="text" placeholder="Search prompts..." value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                  className="w-full bg-white border-[3px] border-black rounded-xl pl-10 pr-4 py-2.5 font-body text-sm focus:outline-none focus:border-[#FB923C]" />
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button key={tag} onClick={() => setActiveTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag])}
                    className={`neo-chip px-3 py-2 border-[2px] border-black rounded-lg font-label text-xs font-bold
                      ${activeTags.includes(tag) ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredLibrary.map((item, i) => (
                <div key={i} className="bg-white border-[3px] border-black rounded-xl shadow-neo overflow-hidden flex flex-col">
                  {/* Coloured header */}
                  <div className={`${CARD_ACCENTS[item.color] || 'bg-[#FB923C]'} border-b-[3px] border-black px-5 py-3`}>
                    <span className="font-label text-[10px] uppercase tracking-widest text-black font-bold">{item.category}</span>
                    <h3 className="font-headline text-lg font-bold text-black">{item.title}</h3>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="font-body text-sm text-black leading-relaxed mb-3">{item.prompt}</p>
                    <p className="font-label text-[11px] text-[#4b4734] mb-4 flex items-start gap-1.5 leading-relaxed">
                      <Icon name="lightbulb" size={13} className="mt-0.5 flex-shrink-0" />
                      {item.why}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 border-[2px] border-black rounded font-label text-[10px] font-bold bg-[#FEFCE8]">{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => { navigator.clipboard.writeText(item.prompt); showToast('Prompt copied!'); }}
                        className="neo-btn flex-1 py-2 bg-black text-white border-[2px] border-black rounded-lg font-label text-xs font-bold shadow-neo-sm flex items-center justify-center gap-1.5">
                        <Icon name="content_copy" size={14} />
                        Copy
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(item.prompt); window.open('https://trackk.in/', '_blank'); }}
                        className={`neo-btn flex-[2] py-2 ${CARD_ACCENTS[item.color] || 'bg-[#FB923C]'} border-[2px] border-black rounded-lg font-label text-xs font-bold shadow-neo-sm flex items-center justify-center gap-1.5 text-black`}>
                        <Icon name="open_in_new" size={14} />
                        Use on Trackk Next
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Mobile: Fixed bottom prompt drawer ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t-4 border-[#FB923C]">
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <Icon name="terminal" size={16} className="text-[#FB923C]" />
          <span className="font-label text-[11px] tracking-widest uppercase text-[#FB923C] font-bold">Generated Prompt</span>
          <button onClick={handleSurpriseMe}
            className="ml-auto flex items-center gap-1 bg-[#DDD6FE] border-[2px] border-black px-3 py-1 rounded-lg font-label text-[11px] font-bold text-black neo-chip">
            <Icon name="magic_button" size={13} />
            Surprise
          </button>
        </div>
        <PromptPanel mobile={true} />
      </div>
    </div>
  );
}
