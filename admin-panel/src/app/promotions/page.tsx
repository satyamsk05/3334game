'use client';
import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Layers,
  Check,
  X,
  Smartphone,
  Edit2,
  Eye,
  Sliders,
  Wallet,
  Gamepad2,
  Gift,
  Zap,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Bell,
  RefreshCw
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  badge_text: string;
  cta_text: string;
  target_route: string;
  gradient_start: string;
  gradient_end: string;
  icon_type?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const GRADIENT_PRESETS = [
  { name: 'Purple Royal', start: '#5B1FA6', end: '#3B0764' },
  { name: 'Cyber Indigo', start: '#6D28D9', end: '#2E1065' },
  { name: 'Emerald Mint', start: '#0F766E', end: '#042F2E' },
  { name: 'Crimson Ruby', start: '#9D174D', end: '#500724' },
  { name: 'Sunset Amber', start: '#D97706', end: '#78350F' },
  { name: 'Neon Electric', start: '#0284C7', end: '#0C4A6E' },
  { name: 'Dark Obsidian', start: '#1E293B', end: '#0F172A' }
];

const ROUTE_OPTIONS = [
  { label: '⚔️ 1v1 XO Battle', value: '/games/xo' },
  { label: '🎡 Ring of Future', value: '/games/ring' },
  { label: '💳 Add Cash / Deposit', value: '/wallet/deposit' },
  { label: '🏧 UPI Cashout / Withdraw', value: '/wallet/withdraw' },
  { label: '🎁 VIP Rewards & Refer', value: '/reward' }
];

const ICON_PRESETS = [
  { id: 'welcome', label: '🎁 Welcome Gift', icon: Gift },
  { id: 'xo', label: '⚔️ XO Battle', icon: Gamepad2 },
  { id: 'ring', label: '🎡 Ring Wheel', icon: Zap },
  { id: 'wallet', label: '💰 Cashback Wallet', icon: Wallet },
  { id: 'general', label: '🔥 Hot Bonus', icon: Flame }
];

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState('WELCOME BONUS');
  const [subtitle, setSubtitle] = useState('Claim 100% instant cash boost on your first deposit!');
  const [badgeText, setBadgeText] = useState('HOT');
  const [ctaText, setCtaText] = useState('ADD CASH');
  const [targetRoute, setTargetRoute] = useState('/wallet/deposit');
  const [gradientStart, setGradientStart] = useState('#5B1FA6');
  const [gradientEnd, setGradientEnd] = useState('#3B0764');
  const [iconType, setIconType] = useState('welcome');
  const [displayOrder, setDisplayOrder] = useState('1');

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await adminService.getPromotions();
      if (res.success && Array.isArray(res.data)) {
        setPromotions(res.data);
      } else {
        setPromotions([]);
      }
    } catch (err: any) {
      console.error('Fetch promotions error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setBadgeText('HOT');
    setCtaText('PLAY NOW');
    setTargetRoute('/games/xo');
    setGradientStart('#6D28D9');
    setGradientEnd('#2E1065');
    setIconType('xo');
    setDisplayOrder(`${promotions.length + 1}`);
    setShowModal(true);
  };

  const openEditModal = (p: Promotion) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSubtitle(p.subtitle);
    setBadgeText(p.badge_text || 'HOT');
    setCtaText(p.cta_text || 'PLAY NOW');
    setTargetRoute(p.target_route || '/games/xo');
    setGradientStart(p.gradient_start || '#5B1FA6');
    setGradientEnd(p.gradient_end || '#3B0764');
    setIconType(p.icon_type || 'welcome');
    setDisplayOrder(`${p.display_order || 1}`);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim()) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        badgeText: badgeText.trim() || 'HOT',
        ctaText: ctaText.trim() || 'PLAY NOW',
        targetRoute: targetRoute.trim() || '/games/xo',
        gradientStart,
        gradientEnd,
        iconType,
        displayOrder: parseInt(displayOrder, 10) || 1
      };

      if (editingId) {
        const res = await adminService.updatePromotion(editingId, payload);
        if (res.success) {
          setSuccessMsg('Promotion updated and synchronized across all active mobile apps!');
          setShowModal(false);
          await fetchPromotions();
        } else {
          setErrorMsg(res.message || 'Failed to update promotion');
        }
      } else {
        const res = await adminService.createPromotion(payload);
        if (res.success) {
          setSuccessMsg('New promotion banner published to mobile app carousel!');
          setShowModal(false);
          await fetchPromotions();
        } else {
          setErrorMsg(res.message || 'Failed to create promotion');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error saving promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      const res = await adminService.togglePromotionStatus(id, !currentStatus);
      if (res.success) {
        await fetchPromotions();
      } else {
        alert(res.message || 'Failed to toggle status');
      }
    } catch (err: any) {
      alert(`Error toggling status: ${err.response?.data?.message || err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete promotion "${name}"?`)) return;

    try {
      const res = await adminService.deletePromotion(id);
      if (res.success) {
        setSuccessMsg(`Promotion "${name}" deleted.`);
        await fetchPromotions();
      } else {
        alert(res.message || 'Failed to delete promotion');
      }
    } catch (err: any) {
      alert(`Error deleting promotion: ${err.response?.data?.message || err.message}`);
    }
  };

  // Render Artwork Icon Component for preview
  const renderPreviewArtwork = (type: string) => {
    switch (type) {
      case 'xo':
        return (
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/30 to-indigo-500/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg transform rotate-6">
            <Gamepad2 className="h-9 w-9 text-indigo-200 drop-shadow-md" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        );
      case 'ring':
        return (
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-teal-500/30 to-emerald-500/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg animate-pulse">
            <Zap className="h-9 w-9 text-teal-200 drop-shadow-md" />
          </div>
        );
      case 'wallet':
        return (
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500/30 to-rose-500/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg transform -rotate-3">
            <Wallet className="h-9 w-9 text-pink-200 drop-shadow-md" />
          </div>
        );
      case 'welcome':
      default:
        return (
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-purple-500/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg transform rotate-3">
            <Gift className="h-9 w-9 text-amber-200 drop-shadow-md" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-primary" />
              <span>Promotions & App Hero Banners</span>
            </h1>
            <Badge variant="mint">100% Server Driven</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Dynamic carousel promotion cards delivered live to the Android & iOS player home screen
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchPromotions}
            variant="secondary"
            size="sm"
            className="rounded-xl px-3"
            title="Refresh Promotions"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Button
            onClick={openCreateModal}
            variant="primary"
            size="sm"
            className="rounded-xl px-4 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Create Banner</span>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center justify-between rounded-xl border border-status-positive/20 bg-status-positive/10 p-3.5 text-xs text-status-positive font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="p-1 hover:bg-status-positive/20 rounded">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between rounded-xl border border-status-negative/20 bg-status-negative/10 p-3.5 text-xs text-status-negative font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-status-negative/20 rounded">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Hero Live Mobile Phone Simulator Preview Tray */}
      <div className="rounded-2xl border border-border-default bg-surface-raised p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-default pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-accent-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Live Player App Simulation (Home Carousel)
            </h2>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Real-time visual rendering as shown on player smartphones
          </span>
        </div>

        {loading ? (
          <div className="flex h-44 items-center justify-center rounded-xl bg-surface-base border border-border-muted">
            <Loader2 className="h-6 w-6 animate-spin text-accent-primary" />
          </div>
        ) : promotions.filter((p) => p.is_active).length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center rounded-xl bg-surface-base border border-dashed border-border-default text-xs text-text-tertiary gap-2">
            <span>No active promotion banners.</span>
            <Button size="sm" variant="primary" onClick={openCreateModal}>Create First Banner</Button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {promotions
              .filter((p) => p.is_active)
              .map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: `linear-gradient(135deg, ${p.gradient_start} 0%, ${p.gradient_end} 100%)`
                  }}
                  className="relative shrink-0 w-[340px] h-[160px] rounded-2xl p-4 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-white/15 transition-all hover:scale-[1.01]"
                >
                  {/* Glassmorphic highlights */}
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  
                  {/* Top Bar: Badge & Priority */}
                  <div className="flex items-center justify-between z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-amber-300 border border-white/15 shadow-sm">
                      {p.badge_text || 'HOT'}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-white/90">
                      Rank #{p.display_order}
                    </span>
                  </div>

                  {/* Main Body */}
                  <div className="flex items-center justify-between gap-3 z-10">
                    <div className="flex-1 pr-2">
                      <h3 className="text-sm font-extrabold leading-tight tracking-wide drop-shadow-md text-white">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-white/90 line-clamp-2 mt-1 leading-normal font-medium">
                        {p.subtitle}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {renderPreviewArtwork(p.icon_type || 'welcome')}
                    </div>
                  </div>

                  {/* Bottom Bar: Action Route & CTA Button */}
                  <div className="flex items-center justify-between pt-1 z-10 border-t border-white/10">
                    <span className="text-[10px] font-mono text-white/70 truncate max-w-[170px]">
                      {p.target_route}
                    </span>
                    
                    <div className="px-3.5 py-1.5 rounded-xl bg-white text-gray-900 shadow-md text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-transform">
                      <span>{p.cta_text || 'PLAY NOW'}</span>
                      <ArrowRight className="h-3 w-3 text-gray-900" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Promotions Management Table / Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent-primary" />
            <span>Configured Promotion Banners ({promotions.length})</span>
          </h2>
          <span className="text-xs text-text-tertiary">Order dictates mobile carousel slide sequence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((p) => {
            const isToggling = togglingId === p.id;
            return (
              <Card
                key={p.id}
                className={`p-4 space-y-3.5 border transition-all ${
                  p.is_active
                    ? 'border-border-default bg-surface-raised shadow-sm'
                    : 'border-border-muted bg-surface-base opacity-75'
                }`}
              >
                {/* Header: Gradient Indicator, Status Badge & Priority */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ background: `linear-gradient(135deg, ${p.gradient_start}, ${p.gradient_end})` }}
                      className="h-5 w-8 rounded-md border border-white/20 shadow-sm"
                    />
                    <Badge variant={p.is_active ? 'positive' : 'neutral'}>
                      {p.is_active ? 'ACTIVE ON APP' : 'HIDDEN'}
                    </Badge>
                  </div>

                  <span className="text-[11px] font-mono font-medium text-text-secondary">
                    Seq: #{p.display_order}
                  </span>
                </div>

                {/* Banner Metadata */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-md">
                      {p.badge_text}
                    </span>
                    <span className="text-[10px] font-mono text-text-tertiary uppercase">
                      Icon: {p.icon_type || 'welcome'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug">{p.title}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">{p.subtitle}</p>
                </div>

                {/* Action Details */}
                <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary pt-2 border-t border-border-muted">
                  <span className="text-text-secondary font-semibold">CTA: {p.cta_text}</span>
                  <span className="truncate max-w-[130px] text-text-tertiary" title={p.target_route}>{p.target_route}</span>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggle(p.id, p.is_active)}
                      disabled={isToggling}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-fast ${
                        p.is_active
                          ? 'border-status-warning/40 text-status-warning hover:bg-status-warning/10'
                          : 'border-status-positive/40 text-status-positive hover:bg-status-positive/10'
                      }`}
                    >
                      {isToggling ? 'Updating...' : p.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-text-secondary hover:text-accent-primary transition-fast rounded-lg hover:bg-accent-primary/10"
                      title="Edit Banner"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-1.5 text-text-tertiary hover:text-status-negative transition-fast rounded-lg hover:bg-status-negative/10"
                    title="Delete Promotion"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create / Edit Promotion Modal with Live Mobile Preview */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl p-6 bg-surface-raised border border-border-default shadow-2xl rounded-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-default pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-primary" />
                <h3 className="text-base font-bold text-text-primary">
                  {editingId ? 'Edit App Promo Banner' : 'Create Live App Promo Banner'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Controls (7 Cols) */}
              <form onSubmit={handleSave} className="lg:col-span-7 space-y-4 text-xs">
                <div>
                  <label className="block text-text-secondary font-semibold mb-1">Banner Headline Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. WELCOME BONUS"
                    required
                    className="w-full h-9 rounded-lg border border-border-default bg-surface-base px-3 text-text-primary font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-semibold mb-1">Subtitle / Offer Description</label>
                  <textarea
                    rows={2}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Claim 100% instant cash boost on your first deposit!"
                    required
                    className="w-full rounded-lg border border-border-default bg-surface-base p-2.5 text-text-primary font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Top Badge Tag</label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g. HOT, 30X, VIP"
                      className="w-full h-9 rounded-lg border border-border-default bg-surface-base px-3 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Button CTA Text</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g. PLAY NOW, ADD CASH"
                      className="w-full h-9 rounded-lg border border-border-default bg-surface-base px-3 text-text-primary font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Target Screen Navigation</label>
                    <select
                      value={targetRoute}
                      onChange={(e) => setTargetRoute(e.target.value)}
                      className="w-full h-9 rounded-lg border border-border-default bg-surface-base px-2.5 text-text-primary font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    >
                      {ROUTE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-text-secondary font-semibold mb-1">Display Sequence Rank</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      min="1"
                      max="99"
                      className="w-full h-9 rounded-lg border border-border-default bg-surface-base px-3 font-mono text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    />
                  </div>
                </div>

                {/* Artwork Icon Type */}
                <div>
                  <label className="block text-text-secondary font-semibold mb-1.5">Artwork Icon Type</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {ICON_PRESETS.map((ic) => {
                      const IconComp = ic.icon;
                      const isSelected = iconType === ic.id;
                      return (
                        <button
                          key={ic.id}
                          type="button"
                          onClick={() => setIconType(ic.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'border-accent-primary bg-accent-primary/10 text-accent-primary font-bold shadow-sm'
                              : 'border-border-default bg-surface-base text-text-secondary hover:border-border-muted'
                          }`}
                        >
                          <IconComp className="h-4 w-4 mb-1" />
                          <span className="text-[10px] leading-tight">{ic.label.split(' ')[1] || ic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gradient Themes */}
                <div>
                  <label className="block text-text-secondary font-semibold mb-1.5">Theme Gradient Color</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENT_PRESETS.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setGradientStart(g.start);
                          setGradientEnd(g.end);
                        }}
                        style={{ background: `linear-gradient(135deg, ${g.start}, ${g.end})` }}
                        className={`h-7 px-2.5 rounded-lg text-[10px] font-bold text-white shadow-sm flex items-center gap-1 border ${
                          gradientStart === g.start ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-surface-raised border-white' : 'border-white/20'
                        }`}
                      >
                        {gradientStart === g.start && <Check className="h-3 w-3" />}
                        <span>{g.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex Color Inputs */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-text-tertiary">Start:</span>
                      <input
                        type="color"
                        value={gradientStart}
                        onChange={(e) => setGradientStart(e.target.value)}
                        className="h-6 w-7 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-text-secondary">{gradientStart}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-text-tertiary">End:</span>
                      <input
                        type="color"
                        value={gradientEnd}
                        onChange={(e) => setGradientEnd(e.target.value)}
                        className="h-6 w-7 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-text-secondary">{gradientEnd}</span>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-border-default">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={saving || !title.trim() || !subtitle.trim()}
                    isLoading={saving}
                  >
                    {editingId ? 'Save & Update' : 'Publish Banner'}
                  </Button>
                </div>
              </form>

              {/* Right Column: Live Mobile App Device Preview (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-accent-primary" />
                    <span>Real-time Smartphone Simulator</span>
                  </span>
                  <Badge variant="neutral">WYSIWYG Preview</Badge>
                </div>

                {/* Smartphone Mockup Frame */}
                <div className="w-[300px] h-[480px] rounded-[36px] bg-[#0A0614] border-[6px] border-[#2A2045] shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden ring-1 ring-white/10">
                  
                  {/* Smartphone Top Bezel / Dynamic Island */}
                  <div className="w-full flex justify-between items-center px-2 pt-1 pb-2">
                    <span className="text-[9px] font-semibold text-white/80 font-mono">9:41</span>
                    <div className="w-16 h-3.5 rounded-full bg-black border border-white/10" />
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2 rounded-xs border border-white/80" />
                    </div>
                  </div>

                  {/* App Header Simulation */}
                  <div className="w-full px-1 py-1 flex items-center justify-between border-b border-white/10 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
                        BA
                      </div>
                      <span className="text-[11px] font-black tracking-wider text-white">BIT ARCADE GAME</span>
                    </div>

                    <div className="px-2 py-0.5 rounded-full bg-[#1E1634] border border-white/10 text-[10px] font-bold text-emerald-400">
                      ₹ 2,450.00
                    </div>
                  </div>

                  {/* LIVE BANNER CARD PREVIEW */}
                  <div className="my-auto w-full">
                    <div className="text-[9px] uppercase tracking-wider text-white/50 font-bold mb-1 px-1">
                      Hero Carousel
                    </div>

                    <div
                      style={{
                        background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
                      }}
                      className="relative w-full h-[155px] rounded-2xl p-3 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-white/20 transition-all"
                    >
                      {/* Ambient light glow */}
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 rounded-full bg-white/15 blur-lg pointer-events-none" />

                      {/* Top row */}
                      <div className="flex items-center justify-between z-10">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-amber-300 border border-white/15">
                          {badgeText || 'HOT'}
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/90">
                          #{displayOrder || 1}
                        </span>
                      </div>

                      {/* Content & Artwork */}
                      <div className="flex items-center justify-between gap-2 z-10">
                        <div className="flex-1 pr-1">
                          <h4 className="text-xs font-black leading-tight tracking-wide drop-shadow text-white">
                            {title || 'BANNER TITLE'}
                          </h4>
                          <p className="text-[10px] text-white/90 line-clamp-2 mt-0.5 leading-snug font-medium">
                            {subtitle || 'Banner description will appear here on user phones.'}
                          </p>
                        </div>

                        <div className="shrink-0 scale-90">
                          {renderPreviewArtwork(iconType)}
                        </div>
                      </div>

                      {/* CTA button */}
                      <div className="flex items-center justify-between pt-1 z-10 border-t border-white/10">
                        <span className="text-[9px] font-mono text-white/70 truncate max-w-[120px]">
                          {targetRoute}
                        </span>
                        <div className="px-2.5 py-1 rounded-lg bg-white text-gray-900 shadow text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <span>{ctaText || 'PLAY NOW'}</span>
                          <ArrowRight className="h-2.5 w-2.5 text-gray-900" />
                        </div>
                      </div>
                    </div>

                    {/* Dot Pagination Simulation */}
                    <div className="flex justify-center gap-1.5 mt-2">
                      <div className="w-4 h-1.5 rounded-full bg-purple-500" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                  </div>

                  {/* Smartphone Home Screen Games Grid Preview Bottom */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="text-[9px] font-bold text-white/40 uppercase">Featured Games</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 rounded-xl bg-[#1E1634] border border-white/5 flex items-center px-2 gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center text-xs">⚔️</div>
                        <div className="text-[9px] font-bold text-white leading-tight">1v1 XO</div>
                      </div>
                      <div className="h-12 rounded-xl bg-[#1E1634] border border-white/5 flex items-center px-2 gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-600/30 flex items-center justify-center text-xs">🎡</div>
                        <div className="text-[9px] font-bold text-white leading-tight">Ring of Future</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar indicator */}
                  <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-2" />
                </div>
              </div>

            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
