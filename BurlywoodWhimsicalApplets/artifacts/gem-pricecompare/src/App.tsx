import { type ReactNode, useMemo, useState, useRef, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  useListProducts, getListProductsQueryKey,
  useGetProduct, getGetProductQueryKey,
  useCompareProduct, getCompareProductQueryKey,
  useGetPriceHistory, getGetPriceHistoryQueryKey,
  useGetDashboard, getGetDashboardQueryKey,
  useRefreshPrices,
  type Product, type Comparison, type Dashboard, type PriceHistory,
} from '@workspace/api-client-react';
import {
  ArrowDownRight, ArrowUpRight, BarChart3, BookOpen, Check, ChevronRight,
  CircleHelp, Database, Download, FileText, Filter, History,
  LayoutDashboard, Menu, PackageSearch, PanelLeft, RefreshCw, Search,
  ShieldCheck, Sparkles, Tag, TrendingDown, TrendingUp, X, XCircle,
  Users, Shield, ShieldAlert, LogIn, LogOut, User as UserIcon, KeyRound,
  ChevronDown, Building, UserCheck
} from 'lucide-react';
import {
  Link, Route, Switch, useLocation, useParams, Router as WouterRouter,
} from 'wouter';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LoginPage } from '@/pages/LoginPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';

const queryClient = new QueryClient();
const money = (value = 0) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const pct = (value = 0) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
const dateLabel = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Jun 2026';

const demoProducts: Product[] = [
  { id: 'hp-laserjet-m404dn', name: 'LaserJet Pro M404dn Printer', brand: 'HP', model: 'M404dn', category: 'Office Equipment', gemPrice: 18340, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80', prices: { Amazon: 19699, Flipkart: 18990, IndiaMART: 17600 }, confidence: 94, history: [
    { label: 'Apr 26', gem: 19200, amazon: 20100, flipkart: 19450, indiamart: 18400 }, { label: 'May 26', gem: 18700, amazon: 19800, flipkart: 19200, indiamart: 17900 }, { label: 'Jun 26', gem: 18340, amazon: 19699, flipkart: 18990, indiamart: 17600 },
  ] },
  { id: 'dell-optiplex-7010', name: 'OptiPlex 7010 Small Form Factor', brand: 'Dell', model: '7010 SFF', category: 'IT Hardware', gemPrice: 54890, imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80', prices: { Amazon: 57100, Flipkart: 55999, IndiaMART: 52700 }, confidence: 89, history: [
    { label: 'Apr 26', gem: 55700, amazon: 57900, flipkart: 56900, indiamart: 54000 }, { label: 'May 26', gem: 55000, amazon: 57500, flipkart: 56200, indiamart: 53100 }, { label: 'Jun 26', gem: 54890, amazon: 57100, flipkart: 55999, indiamart: 52700 },
  ] },
  { id: 'epson-projector-982w', name: 'EB-982W Classroom Projector', brand: 'Epson', model: 'EB-982W', category: 'AV & Display', gemPrice: 67450, imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80', prices: { Amazon: 62999, Flipkart: 65100, IndiaMART: 63800 }, confidence: 91, history: [
    { label: 'Apr 26', gem: 68100, amazon: 64800, flipkart: 66900, indiamart: 64500 }, { label: 'May 26', gem: 67800, amazon: 63700, flipkart: 66000, indiamart: 64200 }, { label: 'Jun 26', gem: 67450, amazon: 62999, flipkart: 65100, indiamart: 63800 },
  ] },
  { id: 'canon-imageclass-mf', name: 'imageCLASS All-in-One Printer', brand: 'Canon', model: 'MF3010', category: 'Office Equipment', gemPrice: 21990, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80', prices: { Amazon: 23450, Flipkart: 22800, IndiaMART: 21100 }, confidence: 87, history: [] },
  { id: 'logitech-rally-bar', name: 'Rally Bar Mini Video Conference System', brand: 'Logitech', model: 'Rally Bar Mini', category: 'AV & Display', gemPrice: 89400, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', prices: { Amazon: 92000, Flipkart: 89990, IndiaMART: 86500 }, confidence: 83, history: [] },
];

const demoDashboard: Dashboard = {
  productsAnalyzed: 1284, aboveMarket: 312, belowMarket: 689, potentialSavings: 2847500,
  reviewItems: [{ name: 'LaserJet Pro M404dn Printer', difference: 7.4 }, { name: 'OptiPlex 7010 Small Form Factor', difference: 4.1 }, { name: 'EB-982W Classroom Projector', difference: -6.8 }],
  categoryBreakdown: [{ category: 'IT Hardware', count: 438 }, { category: 'Office Equipment', count: 327 }, { category: 'AV & Display', count: 214 }, { category: 'Furniture', count: 176 }, { category: 'Lab Equipment', count: 129 }],
};

function findDemo(id?: string) { return demoProducts.find((item) => item.id === id) ?? demoProducts[0]; }
function makeComparison(product: Product): Comparison {
  const prices = Object.entries(product.prices);
  const values = prices.map(([, value]) => value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const difference = product.gemPrice - average;
  return {
    product, rows: prices.map(([marketplace, price]) => ({ marketplace, product: product.name, price, difference: product.gemPrice - price, confidence: product.confidence - 2, status: product.gemPrice <= price ? 'Below market' : 'Above market' })),
    marketAverage: average, lowestMarketPrice: Math.min(...values), highestMarketPrice: Math.max(...values), difference, percentageDifference: difference / average * 100, potentialSavings: Math.max(0, difference), recommendation: difference <= 0 ? 'Proceed — GeM price is at or below the cached market average.' : 'Review — cached market prices indicate a potentially higher GeM price.',
  };
}

function DemoNotice({ compact = false }: { compact?: boolean }) {
  return <div className={`demo-notice ${compact ? 'demo-notice-compact' : ''}`} data-testid="status-demo-cached"><Database size={14} /><span><strong>Demo / Cached Data</strong> · No live scraping. Marketplace values are stored reference snapshots.</span></div>;
}

function SkeletonBlock({ className = '' }: { className?: string }) { return <div className={`skeleton rounded-lg ${className}`} aria-label="Loading" data-testid="state-loading" />; }
function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="empty-state" data-testid="state-empty"><PackageSearch size={28} /><strong>{title}</strong><span>{detail}</span></div>; }
function ErrorState({ onRetry }: { onRetry?: () => void }) { return <div className="empty-state" data-testid="state-error"><XCircle size={28} /><strong>Cached service unavailable</strong><span>Showing the latest demo workspace while the API reconnects.</span>{onRetry && <button className="btn btn-secondary mt-2" onClick={onRetry} data-testid="button-retry">Retry connection</button>}</div>; }

function UserMenuDropdown() {
  const { currentUser, users, switchUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <Link
        href="/login"
        className="btn btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
        data-testid="button-header-login"
      >
        <LogIn size={14} />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition cursor-pointer"
        data-testid="button-user-profile"
      >
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
          {currentUser.avatarInitials}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
            {currentUser.name}
            {currentUser.role === 'Administrator' && (
              <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono font-bold">
                ADMIN
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[130px]">
            {currentUser.role}
          </div>
        </div>
        <ChevronDown size={14} className="text-slate-400 mr-1" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="pb-3 mb-2 border-b border-slate-800 px-2 pt-1">
            <div className="text-xs font-bold text-white">{currentUser.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
            <div className="mt-1 text-[10px] text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded inline-block">
              {currentUser.department}
            </div>
          </div>

          <div className="space-y-1 mb-2">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 px-2 py-1">
              Switch Demo Persona
            </div>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  switchUser(u.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                  u.id === currentUser.id
                    ? 'bg-teal-500/15 text-teal-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`w-5 h-5 rounded bg-gradient-to-tr ${u.avatarColor} flex items-center justify-center text-[10px] text-white font-bold shrink-0`}>
                    {u.avatarInitials}
                  </div>
                  <span className="truncate">{u.name} ({u.role.split(' ')[0]})</span>
                </div>
                {u.id === currentUser.id && <Check size={13} className="text-teal-400 shrink-0" />}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1">
            <Link
              href="/admin/users"
              onClick={() => setOpen(false)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition"
            >
              <Users size={14} className="text-amber-400" />
              <span>Admin User Management</span>
            </Link>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition"
            >
              <KeyRound size={14} className="text-cyan-400" />
              <span>Change Login / Sign In</span>
            </Link>

            <button
              onClick={() => {
                logout();
                setOpen(false);
                setLocation('/login');
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const client = useQueryClient();
  const refresh = useRefreshPrices();
  const [lastRefresh, setLastRefresh] = useState('18 Jun 2026 · 09:42 IST');
  const { currentUser, isAdmin, isAuthenticated } = useAuth();

  // Mandatory Authentication Gate: if user is not logged in, show Login Page
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  // If on login page while authenticated, render clean full screen
  if (location === '/login') {
    return <>{children}</>;
  }

  const nav = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/search', label: 'Search & Compare', icon: Search },
    { href: '/products', label: 'Product catalog', icon: Tag },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'Admin Console', icon: Users, badge: 'ADMIN' },
  ];

  const doRefresh = () => refresh.mutate(undefined, {
    onSuccess: (result) => {
      setLastRefresh(dateLabel(result.lastUpdated));
      client.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      client.invalidateQueries({ queryKey: getListProductsQueryKey() });
    }
  });

  return (
    <div className="app-noise min-h-[100dvh]">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">G</div>
          <div>
            <div className="brand-name">GeM <span>PriceCompare</span></div>
            <div className="brand-kicker">PROCUREMENT INTELLIGENCE</div>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-close-menu">
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-rule" />
        <div className="workspace-label uppercase truncate" title={currentUser?.department || 'CHARUSAT UNIVERSITY · BUYER DESK'}>
          {currentUser ? `${currentUser.department.split('/')[0]} · ${currentUser.role}` : 'CHARUSAT UNIVERSITY · BUYER DESK'}
        </div>
        <nav className="nav-list" aria-label="Primary navigation">
          {nav.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item ${location === href ? 'nav-active' : ''}`}
              data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`}
            >
              <Icon size={17} />
              <span>{label}</span>
              {badge && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {badge}
                </span>
              )}
              {location === href && <span className="nav-pip" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-fill" />
        <Link
          href="/about"
          className={`nav-item ${location === '/about' ? 'nav-active' : ''}`}
          data-testid="link-about"
        >
          <CircleHelp size={17} />
          <span>About & methodology</span>
        </Link>
        
        {/* User Status in Sidebar Footer */}
        <div className="sidebar-footer">
          {currentUser ? (
            <>
              <div className={`avatar bg-gradient-to-tr ${currentUser.avatarColor}`}>
                {currentUser.avatarInitials}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="truncate">{currentUser.name}</strong>
                <span className="truncate">{currentUser.role}</span>
              </div>
              <Link href="/login" title="Switch account / Login" className="text-slate-400 hover:text-white p-1">
                <PanelLeft size={16} />
              </Link>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-2 text-xs text-teal-400 font-semibold w-full py-1">
              <LogIn size={16} />
              <span>Sign In to Desk</span>
            </Link>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          data-testid="button-navigation-scrim"
        />
      )}

      <main className="main-shell">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu">
              <Menu size={20} />
            </button>
            <div className="breadcrumbs">
              <span>{isAdmin ? 'Admin workspace' : 'Buyer workspace'}</span>
              <ChevronRight size={14} />
              <strong>
                {location === '/' ? 'Overview' :
                 location === '/admin/users' ? 'Admin User Management' :
                 location.startsWith('/compare') ? 'Comparison' :
                 location.startsWith('/history') ? 'Price history' :
                 location.slice(1).replace('-', ' ')}
              </strong>
            </div>
          </div>

          <div className="topbar-actions">
            <span className="updated-label">Cached snapshot · {lastRefresh}</span>
            <button
              className="btn btn-outline refresh-button"
              onClick={doRefresh}
              disabled={refresh.isPending}
              data-testid="button-refresh-prices"
            >
              <RefreshCw size={15} className={refresh.isPending ? 'spin' : ''} />
              {refresh.isPending ? 'Refreshing' : 'Refresh cache'}
            </button>
            
            <UserMenuDropdown />
          </div>
        </header>

        <div className="page-wrap">{children}</div>
      </main>
    </div>
  );
}

function PageIntro({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="page-intro fade-up"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{detail}</p></div>{action}</div>;
}

function KpiCard({ label, value, detail, tone, icon: Icon }: { label: string; value: string; detail: string; tone: string; icon: typeof TrendingUp }) {
  return <div className={`kpi-card kpi-${tone} fade-up`} data-testid={`kpi-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="kpi-top"><span>{label}</span><span className="kpi-icon"><Icon size={16} /></span></div><strong>{value}</strong><small>{detail}</small></div>;
}

function DashboardPage() {
  const dashboardQuery = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  const dashboard = dashboardQuery.data ?? demoDashboard;
  const { currentUser } = useAuth();
  const firstName = currentUser?.name.split(' ')[0] || 'Buyer';

  return (
    <>
      <PageIntro
        eyebrow="BUYER OVERVIEW"
        title={`Good morning, ${firstName}.`}
        detail={`A focused view of where your procurement decisions stand for ${currentUser?.department || 'your assigned procurement wing'}.`}
        action={
          <div className="flex items-center gap-2">
            <Link href="/search" className="btn btn-primary" data-testid="link-start-comparison">
              <Search size={16} /> Start a comparison
            </Link>
          </div>
        }
      />
      <DemoNotice />
      {dashboardQuery.isLoading && <div className="skeleton-row"><SkeletonBlock className="h-36" /><SkeletonBlock className="h-36" /><SkeletonBlock className="h-36" /><SkeletonBlock className="h-36" /></div>}
      {dashboardQuery.isError && <div className="soft-alert"><ShieldCheck size={15} /> API unavailable — the overview is using composed demo values.</div>}
      <div className="kpi-grid">
        <KpiCard label="Products analyzed" value={dashboard.productsAnalyzed.toLocaleString('en-IN')} detail="Across 5 active categories" tone="teal" icon={Database} />
        <KpiCard label="Need review" value={dashboard.aboveMarket.toString()} detail="GeM price above market signal" tone="amber" icon={ArrowUpRight} />
        <KpiCard label="Below market" value={dashboard.belowMarket.toString()} detail="Good-value purchase signals" tone="blue" icon={TrendingDown} />
        <KpiCard label="Potential savings" value={money(dashboard.potentialSavings)} detail="Across reviewed quantities" tone="green" icon={TrendingUp} />
      </div>
      <div className="dashboard-grid">
        <section className="panel review-panel fade-up fade-up-delay-1">
          <div className="panel-heading">
            <div>
              <div className="section-label">ACTION QUEUE</div>
              <h2>Reviews worth a closer look</h2>
            </div>
            <Link href="/search" className="text-link" data-testid="link-view-all-reviews">View all <ChevronRight size={14} /></Link>
          </div>
          <div className="review-list">
            {dashboard.reviewItems.map((item, index) => (
              <div className="review-row" key={item.name} data-testid={`row-review-${index}`}>
                <div className={`review-index review-index-${item.difference > 0 ? 'up' : 'down'}`}>
                  {item.difference > 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                </div>
                <div className="review-name">
                  <strong>{item.name}</strong>
                  <span>Cached match · {item.difference > 0 ? 'above' : 'below'} market</span>
                </div>
                <strong className={item.difference > 0 ? 'value-negative' : 'value-positive'}>
                  {pct(item.difference)}
                </strong>
                <Link
                  href={`/compare/${demoProducts[index]?.id ?? demoProducts[0].id}`}
                  className="icon-button"
                  aria-label={`Compare ${item.name}`}
                  data-testid={`link-compare-review-${index}`}
                >
                  <ChevronRight size={17} />
                </Link>
              </div>
            ))}
          </div>
        </section>
        <section className="panel breakdown-panel fade-up fade-up-delay-2">
          <div className="panel-heading">
            <div>
              <div className="section-label">CATALOG MIX</div>
              <h2>Category activity</h2>
            </div>
            <Link href="/analytics" className="text-link" data-testid="link-open-analytics">Details <ChevronRight size={14} /></Link>
          </div>
          <div className="breakdown-list">
            {dashboard.categoryBreakdown.map((item, index) => (
              <div className="breakdown-row" key={item.category} data-testid={`row-category-${index}`}>
                <span>{item.category}</span>
                <div className="breakdown-track">
                  <span style={{ width: `${Math.max(12, item.count / dashboard.categoryBreakdown[0].count * 100)}%` }} />
                </div>
                <span className="mono breakdown-count">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="breakdown-foot">
            <span><span className="dot dot-teal" /> Items with cached matches</span>
            <strong>{dashboard.productsAnalyzed.toLocaleString('en-IN')}</strong>
          </div>
        </section>
      </div>
      <section className="insight-strip fade-up fade-up-delay-3">
        <div className="insight-symbol"><Sparkles size={19} /></div>
        <div>
          <strong>Decision signal</strong>
          <p>Start with the review queue: three products currently have the clearest price variance for a sub-minute decision.</p>
        </div>
        <Link href={`/compare/${demoProducts[0].id}`} className="btn btn-secondary" data-testid="link-open-signal">Open signal</Link>
      </section>
    </>
  );
}

function ProductCard({ product, selected, onSelect }: { product: Product; selected?: boolean; onSelect: () => void }) {
  const market = Object.values(product.prices);
  const avg = market.reduce((a, b) => a + b, 0) / market.length;
  const delta = (product.gemPrice - avg) / avg * 100;
  return (
    <button className={`product-card ${selected ? 'product-selected' : ''}`} onClick={onSelect} data-testid={`card-product-${product.id}`}>
      {product.imageUrl && (
        <div className="product-card-media">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="product-card-image"
            onError={(e) => {
              const el = (e.target as HTMLElement).parentElement;
              if (el) el.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="product-card-top">
        <span className="product-category">{product.category}</span>
        <span className={`confidence ${product.confidence >= 90 ? 'confidence-high' : ''}`}>{product.confidence}% match</span>
      </div>
      <h3>{product.name}</h3>
      <p>{product.brand} · {product.model}</p>
      <div className="product-card-bottom">
        <div>
          <span className="tiny-label">GeM price</span>
          <strong>{money(product.gemPrice)}</strong>
        </div>
        <div className={delta <= 0 ? 'value-positive' : 'value-negative'}>
          {delta <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />} {pct(delta)}
        </div>
        <ChevronRight size={17} className="card-chevron" />
      </div>
    </button>
  );
}

function SearchPage({ catalog = false }: { catalog?: boolean }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All categories');
  const params = useMemo(() => ({ q: q || undefined, category: category === 'All categories' ? undefined : category }), [q, category]);
  const productsQuery = useListProducts(params, { query: { queryKey: getListProductsQueryKey(params) } });
  const products = productsQuery.data?.length ? productsQuery.data : demoProducts;
  const filtered = products.filter((product) => `${product.name} ${product.brand} ${product.model}`.toLowerCase().includes(q.toLowerCase()) && (category === 'All categories' || product.category === category));
  const categories = ['All categories', ...Array.from(new Set(demoProducts.map((item) => item.category)))];
  const [, setLocation] = useLocation();

  return (
    <>
      <PageIntro
        eyebrow={catalog ? 'CACHED CATALOG' : 'DISCOVERY WORKSPACE'}
        title={catalog ? 'Product catalog' : 'Search & compare'}
        detail={catalog ? 'Browse the reference set available to your buyer workspace.' : 'Find a cached GeM product, then verify the price before you commit.'}
        action={!catalog && <div className="shortcut-hint"><span className="mono">⌘ K</span> Search catalog</div>}
      />
      <DemoNotice compact />
      <div className="search-toolbar panel fade-up">
        <div className="search-field">
          <Search size={18} />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search product, brand or model"
            aria-label="Search product catalog"
            data-testid="input-search-products"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search" data-testid="button-clear-search">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="select-wrap">
          <Filter size={15} />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter category"
            data-testid="select-category"
          >
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="results-heading">
        <div>
          <span className="section-label">REFERENCE SET</span>
          <h2>{filtered.length} products <span>available for review</span></h2>
        </div>
        <span className="mono result-count">Snapshot 18.06.26</span>
      </div>
      {productsQuery.isLoading && <div className="product-grid">{[1, 2, 3].map((item) => <SkeletonBlock key={item} className="h-56" />)}</div>}
      {productsQuery.isError && <div className="soft-alert"><Database size={15} /> API unavailable — showing the cached demo catalog.</div>}
      {!filtered.length ? (
        <EmptyState title="No matching products" detail="Try a broader term or remove the category filter." />
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={() => setLocation(`/compare/${product.id}`)} />
          ))}
        </div>
      )}
    </>
  );
}

function ComparePage() {
  const { id = demoProducts[0].id } = useParams<{ id: string }>();
  const productQuery = useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } });
  const comparisonQuery = useCompareProduct(id, { query: { enabled: !!id, queryKey: getCompareProductQueryKey(id) } });
  const product = productQuery.data ?? findDemo(id);
  const comparison = comparisonQuery.data ?? makeComparison(product);

  return (
    <>
      <div className="backline">
        <Link href="/search" className="text-link" data-testid="link-back-search">← Back to search</Link>
        <span className="mono">COMPARE / {id.slice(0, 12).toUpperCase()}</span>
      </div>
      <PageIntro
        eyebrow="PRICE VERIFICATION"
        title="Make the call with confidence."
        detail={`${product.brand} ${product.model} · cached reference comparison`}
        action={
          <div className="button-row">
            <button className="btn btn-outline" onClick={() => window.print()} data-testid="button-print-comparison">
              <FileText size={15} /> Print
            </button>
            <button className="btn btn-outline" onClick={() => window.print()} data-testid="button-export-comparison">
              <Download size={15} /> Export PDF
            </button>
          </div>
        }
      />
      <DemoNotice compact />
      <section className="compare-hero panel fade-up">
        {product.imageUrl ? (
          <div className="compare-hero-thumb">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="compare-product-image"
              onError={(e) => {
                const el = (e.target as HTMLElement).parentElement;
                if (el) el.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="match-mark"><ShieldCheck size={24} /></div>
        )}
        <div className="compare-product-copy">
          <div className="section-label">SMART MATCH · {product.confidence}% CONFIDENCE</div>
          <h2>{product.name}</h2>
          <p>{product.brand} · {product.model} · {product.category}</p>
        </div>
        <div className="gem-price">
          <span>GeM listed price</span>
          <strong>{money(product.gemPrice)}</strong>
          <small>Reference snapshot</small>
        </div>
      </section>

      {comparisonQuery.isLoading && <div className="soft-alert"><RefreshCw size={15} className="spin" /> Building comparison from cached records…</div>}
      {comparisonQuery.isError && <div className="soft-alert"><Database size={15} /> Comparison API unavailable — demo values shown for this record.</div>}
      <div className="compare-stat-grid">
        <div className="stat-card">
          <span>Market average</span>
          <strong>{money(comparison.marketAverage)}</strong>
          <small className={comparison.difference <= 0 ? 'value-positive' : 'value-negative'}>
            {comparison.difference <= 0 ? 'GeM is lower' : 'GeM is higher'} by {money(Math.abs(comparison.difference))}
          </small>
        </div>
        <div className="stat-card">
          <span>Lowest cached price</span>
          <strong>{money(comparison.lowestMarketPrice)}</strong>
          <small>IndiaMART reference</small>
        </div>
        <div className="stat-card">
          <span>Potential savings</span>
          <strong className="value-positive">{money(comparison.potentialSavings)}</strong>
          <small>Per unit vs market average</small>
        </div>
        <div className="stat-card">
          <span>Price spread</span>
          <strong>{pct(comparison.percentageDifference)}</strong>
          <small>GeM vs market average</small>
        </div>
      </div>
      <div className="comparison-layout">
        <section className="panel table-panel">
          <div className="panel-heading">
            <div>
              <div className="section-label">MARKETPLACE CHECK</div>
              <h2>Like-for-like references</h2>
            </div>
            <span className="mono subtle-label">3 SOURCES</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Marketplace</th>
                  <th>Matched listing</th>
                  <th>Cached price</th>
                  <th>Difference</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.marketplace}>
                    <td><strong>{row.marketplace}</strong></td>
                    <td className="table-product">{row.product}</td>
                    <td className="mono">{money(row.price)}</td>
                    <td className={row.difference <= 0 ? 'value-positive mono' : 'value-negative mono'}>
                      {row.difference <= 0 ? '−' : '+'}{money(Math.abs(row.difference))}
                    </td>
                    <td><span className="confidence">{row.confidence}%</span></td>
                    <td>
                      <span className={`status ${row.status === 'Below market' ? 'status-good' : 'status-review'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="recommendation-card">
          <div className="rec-icon"><Sparkles size={18} /></div>
          <div className="section-label">RECOMMENDATION</div>
          <h2>{comparison.difference <= 0 ? 'Proceed with GeM' : 'Review before ordering'}</h2>
          <p>{comparison.recommendation}</p>
          <div className="rec-divider" />
          <div className="rec-meta">
            <span>Signal strength</span>
            <strong>{product.confidence >= 90 ? 'Strong' : 'Moderate'}</strong>
          </div>
          <Link href={`/history/${id}`} className="btn btn-secondary w-full justify-center" data-testid="link-view-price-history">
            <History size={15} /> View price history
          </Link>
        </section>
      </div>
      <section className="panel chart-panel">
        <div className="panel-heading">
          <div>
            <div className="section-label">RECENT MOVEMENT</div>
            <h2>Price direction</h2>
          </div>
          <Link href={`/history/${id}`} className="text-link" data-testid="link-open-history">Full history <ChevronRight size={14} /></Link>
        </div>
        <MiniChart points={product.history} />
      </section>
    </>
  );
}

function MiniChart({ points }: { points: Product['history'] }) {
  const values = points.length ? points : findDemo().history;
  const all = values.flatMap((point) => [point.gem, point.amazon, point.flipkart, point.indiamart]);
  const min = Math.min(...all) * .97; const max = Math.max(...all) * 1.03;
  const path = (key: 'gem' | 'amazon' | 'flipkart' | 'indiamart') => values.map((point, index) => `${index ? 'L' : 'M'} ${index * (100 / Math.max(values.length - 1, 1))} ${100 - ((point[key] - min) / (max - min)) * 100}`).join(' ');
  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span><i className="legend-gem" /> GeM</span>
        <span><i className="legend-amazon" /> Amazon</span>
        <span><i className="legend-flipkart" /> Flipkart</span>
        <span><i className="legend-indiamart" /> IndiaMART</span>
      </div>
      <div className="chart-area chart-grid">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Recent cached price movement">
          <path d={path('amazon')} className="line line-amazon" />
          <path d={path('flipkart')} className="line line-flipkart" />
          <path d={path('indiamart')} className="line line-indiamart" />
          <path d={path('gem')} className="line line-gem" />
        </svg>
      </div>
      <div className="chart-labels">{values.map((point) => <span key={point.label}>{point.label}</span>)}</div>
    </div>
  );
}

function HistoryPage() {
  const { id = demoProducts[0].id } = useParams<{ id: string }>();
  const historyQuery = useGetPriceHistory(id, { query: { enabled: !!id, queryKey: getGetPriceHistoryQueryKey(id) } });
  const history: PriceHistory = historyQuery.data ?? { product: findDemo(id), points: findDemo(id).history, currentGemPrice: findDemo(id).gemPrice, marketAverage: Object.values(findDemo(id).prices).reduce((a, b) => a + b, 0) / 3, change30d: -2.4, change90d: -5.6 };
  const [visible, setVisible] = useState(['GeM', 'Amazon', 'Flipkart', 'IndiaMART']);
  const toggle = (item: string) => setVisible((old) => old.includes(item) ? old.filter((name) => name !== item) : [...old, item]);

  return (
    <>
      <div className="backline">
        <Link href={`/compare/${id}`} className="text-link" data-testid="link-back-comparison">← Back to comparison</Link>
        <span className="mono">HISTORY / 90 DAYS</span>
      </div>
      <PageIntro eyebrow="PRICE HISTORY" title={history.product.name} detail="A directional view of cached reference snapshots. Use it to add timing context to your decision." />
      <DemoNotice compact />
      <div className="history-metrics">
        <div className="history-metric"><span>Current GeM price</span><strong>{money(history.currentGemPrice)}</strong></div>
        <div className="history-metric"><span>Market average</span><strong>{money(history.marketAverage)}</strong></div>
        <div className="history-metric"><span>30 day change</span><strong className={history.change30d <= 0 ? 'value-positive' : 'value-negative'}>{pct(history.change30d)}</strong></div>
        <div className="history-metric"><span>90 day change</span><strong className={history.change90d <= 0 ? 'value-positive' : 'value-negative'}>{pct(history.change90d)}</strong></div>
      </div>
      <section className="panel history-chart-panel">
        <div className="panel-heading">
          <div>
            <div className="section-label">REFERENCE SNAPSHOTS</div>
            <h2>GeM against the open market</h2>
          </div>
          <div className="filter-pills">
            {['GeM', 'Amazon', 'Flipkart', 'IndiaMART'].map((item) => (
              <button
                key={item}
                className={`filter-pill ${visible.includes(item) ? 'filter-pill-active' : ''}`}
                onClick={() => toggle(item)}
                data-testid={`button-filter-${item.toLowerCase()}`}
              >
                {visible.includes(item) && <Check size={13} />}
                {item}
              </button>
            ))}
          </div>
        </div>
        <HistoryChart points={history.points.length ? history.points : findDemo().history} visible={visible} />
      </section>
      {historyQuery.isError && <div className="soft-alert"><Database size={15} /> API unavailable — showing demo history for this product.</div>}
      <section className="panel history-table-panel">
        <div className="panel-heading">
          <div>
            <div className="section-label">SNAPSHOT LOG</div>
            <h2>Recorded reference points</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>GeM</th>
                <th>Amazon</th>
                <th>Flipkart</th>
                <th>IndiaMART</th>
              </tr>
            </thead>
            <tbody>
              {history.points.map((point) => (
                <tr key={point.label}>
                  <td><strong>{point.label}</strong></td>
                  <td className="mono">{money(point.gem)}</td>
                  <td className="mono">{money(point.amazon)}</td>
                  <td className="mono">{money(point.flipkart)}</td>
                  <td className="mono">{money(point.indiamart)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function HistoryChart({ points, visible }: { points: Product['history']; visible: string[] }) {
  const min = Math.min(...points.flatMap((point) => [point.gem, point.amazon, point.flipkart, point.indiamart])) * .97; const max = Math.max(...points.flatMap((point) => [point.gem, point.amazon, point.flipkart, point.indiamart])) * 1.03;
  const keys: Array<['GeM' | 'Amazon' | 'Flipkart' | 'IndiaMART', 'gem' | 'amazon' | 'flipkart' | 'indiamart', string]> = [['GeM', 'gem', 'line-gem'], ['Amazon', 'amazon', 'line-amazon'], ['Flipkart', 'flipkart', 'line-flipkart'], ['IndiaMART', 'indiamart', 'line-indiamart']];
  return (
    <div className="chart-wrap large-chart">
      <div className="chart-area chart-grid">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Price history chart">
          {keys.filter(([name]) => visible.includes(name)).map(([, key, css]) => (
            <path
              key={key}
              d={points.map((point, index) => `${index ? 'L' : 'M'} ${index * (100 / Math.max(points.length - 1, 1))} ${100 - ((point[key] - min) / (max - min)) * 100}`).join(' ')}
              className={`line ${css}`}
            />
          ))}
        </svg>
      </div>
      <div className="chart-labels">{points.map((point) => <span key={point.label}>{point.label}</span>)}</div>
    </div>
  );
}

function AnalyticsPage() {
  const dashboardQuery = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  const dashboard = dashboardQuery.data ?? demoDashboard;
  const total = dashboard.categoryBreakdown.reduce((sum, item) => sum + item.count, 0);
  return (
    <>
      <PageIntro eyebrow="BUYER ANALYTICS" title="See the shape of your decisions." detail="A compact read on product coverage, price signals and where attention is best spent." action={<span className="mono analytics-period">PERIOD · LAST 90 DAYS</span>} />
      <DemoNotice compact />
      <div className="analytics-top">
        <section className="panel wide-metric">
          <div className="section-label">PRICE POSITIONING</div>
          <h2>Most of your catalog is decision-ready.</h2>
          <div className="position-bar">
            <span style={{ width: `${dashboard.belowMarket / (dashboard.belowMarket + dashboard.aboveMarket) * 100}%` }} />
            <span style={{ width: `${dashboard.aboveMarket / (dashboard.belowMarket + dashboard.aboveMarket) * 100}%` }} />
          </div>
          <div className="position-legend">
            <span><i className="dot dot-teal" /> Below market <strong>{dashboard.belowMarket}</strong></span>
            <span><i className="dot dot-amber" /> Need review <strong>{dashboard.aboveMarket}</strong></span>
          </div>
        </section>
        <section className="panel savings-card">
          <div className="section-label">VALUE OPPORTUNITY</div>
          <strong>{money(dashboard.potentialSavings)}</strong>
          <p>Potential savings flagged in the current cached workspace.</p>
          <Link href="/search" className="text-link" data-testid="link-analyze-savings">Analyze products <ChevronRight size={14} /></Link>
        </section>
      </div>
      <div className="analytics-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="section-label">CATEGORY COVERAGE</div>
              <h2>Products by category</h2>
            </div>
            <span className="mono">{total} TOTAL</span>
          </div>
          <div className="coverage-chart">
            {dashboard.categoryBreakdown.map((item, index) => (
              <div className="coverage-row" key={item.category}>
                <span className="coverage-name">{item.category}</span>
                <div className="coverage-bar">
                  <span style={{ width: `${item.count / dashboard.categoryBreakdown[0].count * 100}%`, backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }} />
                </div>
                <strong className="mono">{item.count}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel signal-panel">
          <div className="panel-heading">
            <div>
              <div className="section-label">METHODOLOGY SIGNAL</div>
              <h2>Confidence distribution</h2>
            </div>
          </div>
          <div className="confidence-dial">
            <div>
              <strong>{Math.round(demoProducts.reduce((sum, item) => sum + item.confidence, 0) / demoProducts.length)}%</strong>
              <span>average match confidence</span>
            </div>
          </div>
          <p className="muted-copy">A higher confidence score means the brand, model and specification fields align closely across cached sources.</p>
          <Link href="/about" className="text-link" data-testid="link-learn-confidence">How confidence works <ChevronRight size={14} /></Link>
        </section>
      </div>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="TRANSPARENCY NOTE" title="Built for a better procurement minute." detail="GeM PriceCompare is a Smart India Hackathon 2026 prototype by CODENOX at CHARUSAT University." />
      <DemoNotice />
      <div className="about-grid">
        <section className="panel about-lead">
          <div className="about-number">01</div>
          <div>
            <div className="section-label">THE PROTOTYPE</div>
            <h2>Verify first. Decide clearly.</h2>
            <p>Government buyers should not have to reconcile scattered prices while a purchase request waits. This workspace puts a GeM listing beside a comparable open-market reference, then makes the variance legible.</p>
            <div className="about-signature">
              <div className="avatar avatar-large">CN</div>
              <div>
                <strong>CODENOX · CHARUSAT</strong>
                <span>Smart India Hackathon 2026</span>
              </div>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="section-label">METHOD</div>
          <h2>How the signal is built</h2>
          <div className="method-list">
            <div><span>01</span><p><strong>Identify</strong><br />Match product name, brand, model and category.</p></div>
            <div><span>02</span><p><strong>Compare</strong><br />Set GeM against cached marketplace references.</p></div>
            <div><span>03</span><p><strong>Recommend</strong><br />Surface price variance and match confidence.</p></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-label">DATA SOURCES</div>
          <h2>What “cached” means here</h2>
          <p className="muted-copy">The prototype uses stored reference snapshots representing GeM and open-market values. It does not scrape marketplaces live, make a purchase, or guarantee availability.</p>
          <div className="source-tags">
            <span>GeM reference</span>
            <span>Amazon snapshot</span>
            <span>Flipkart snapshot</span>
            <span>IndiaMART snapshot</span>
          </div>
        </section>
        <section className="panel">
          <div className="section-label">RESPONSIBLE USE</div>
          <h2>Decision support, not a verdict.</h2>
          <p className="muted-copy">Prices can differ by tax, warranty, seller, freight, quantity and specification. Always validate the final listing and procurement rules before placing an order.</p>
          <div className="soft-alert"><ShieldCheck size={15} /> Every screen labels its source state so there is no ambiguity.</div>
        </section>
      </div>
    </>
  );
}

function NotFoundPage() {
  return (
    <div className="empty-state page-empty">
      <XCircle size={32} />
      <strong>That workspace view does not exist</strong>
      <span>Return to the buyer overview.</span>
      <Link href="/" className="btn btn-primary mt-3" data-testid="link-back-overview">Back to overview</Link>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin" component={AdminUsersPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/search" component={() => <SearchPage />} />
      <Route path="/products" component={() => <SearchPage catalog />} />
      <Route path="/compare/:id" component={ComparePage} />
      <Route path="/history/:id" component={HistoryPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/about" component={AboutPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppShell>
              <ErrorBoundary resetKey={window.location.pathname}>
                <Router />
              </ErrorBoundary>
            </AppShell>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;