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
  ExternalLink,
  Layers,
  Check,
  X
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
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const GRADIENT_PRESETS = [
  { name: 'Purple Royale', start: '#8B5CF6', end: '#6D28D9' },
  { name: 'Cyber Blue', start: '#3B82F6', end: '#1D4ED8' },
  { name: 'Emerald Mint', start: '#10B981', end: '#047857' },
  { name: 'Sunset Amber', start: '#F59E0B', end: '#D97706' },
  { name: 'Crimson Flame', start: '#EF4444', end: '#B91C1C' },
  { name: 'Dark Nebula', start: '#1E293B', end: '#0F172A' }
];

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('HOT OFFER');
  const [ctaText, setCtaText] = useState('PLAY NOW');
  const [targetRoute, setTargetRoute] = useState('/games/xo');
  const [gradientStart, setGradientStart] = useState('#8B5CF6');
  const [gradientEnd, setGradientEnd] = useState('#6D28D9');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim()) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await adminService.createPromotion({
        title: title.trim(),
        subtitle: subtitle.trim(),
        badgeText: badgeText.trim() || 'SPECIAL',
        ctaText: ctaText.trim() || 'PLAY NOW',
        targetRoute: targetRoute.trim() || '/games',
        gradientStart,
        gradientEnd,
        displayOrder: parseInt(displayOrder, 10) || 1
      });

      if (res.success) {
        setSuccessMsg('Promotion banner created and published to mobile app carousel!');
        setShowModal(false);
        setTitle('');
        setSubtitle('');
        setBadgeText('HOT OFFER');
        await fetchPromotions();
      } else {
        setErrorMsg(res.message || 'Failed to create promotion');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error creating promotion');
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
    if (!confirm(`Are you sure you want to remove promotion "${name}"?`)) return;

    try {
      const res = await adminService.deletePromotion(id);
      if (res.success) {
        await fetchPromotions();
      } else {
        alert(res.message || 'Failed to delete promotion');
      }
    } catch (err: any) {
      alert(`Error deleting promotion: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Promotions & App Hero Banners</h1>
            <Badge variant="mint">Live Carousel Sync</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Manage real-time promotional banners, cashback cards, and bonus campaigns displayed on the mobile app home screen
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
          size="sm"
          className="rounded-xl px-4"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Add New Banner</span>
        </Button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-status-positive/20 bg-status-positive/10 p-3.5 text-xs text-status-positive font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-status-negative/20 bg-status-negative/10 p-3.5 text-xs text-status-negative font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hero Carousel Live Mobile App Simulation Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent-primary" />
            <span>Active Mobile App Carousel Preview</span>
          </h2>
          <span className="text-[11px] text-text-tertiary">Live render as seen by mobile players</span>
        </div>

        {loading ? (
          <div className="flex h-36 items-center justify-center rounded-2xl bg-surface-base border border-border-muted">
            <Loader2 className="h-6 w-6 animate-spin text-accent-primary" />
          </div>
        ) : promotions.filter((p) => p.is_active).length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-2xl bg-surface-base border border-dashed border-border-default text-xs text-text-tertiary">
            No active banners. Click "Add New Banner" to publish one.
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
                  className="relative shrink-0 w-80 h-36 rounded-2xl p-4 text-white shadow-md flex flex-col justify-between overflow-hidden border border-white/10"
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-wider text-amber-300 border border-white/10">
                      {p.badge_text || 'HOT'}
                    </span>
                    <span className="text-[10px] font-mono text-white/70">#{p.display_order}</span>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-sm font-bold leading-snug drop-shadow-sm">{p.title}</h3>
                    <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">{p.subtitle}</p>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-white/60">{p.target_route}</span>
                    <button className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider transition-fast flex items-center gap-1">
                      <span>{p.cta_text}</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Promotions Management Cards Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-text-secondary" />
            <span>All Configured Banners ({promotions.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((p) => {
            const isToggling = togglingId === p.id;
            return (
              <Card
                key={p.id}
                className={`p-4 space-y-3 border transition-all ${
                  p.is_active ? 'border-border-default bg-surface-raised' : 'border-border-muted bg-surface-base opacity-75'
                }`}
              >
                {/* Top Row: Color Preview & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ background: `linear-gradient(135deg, ${p.gradient_start}, ${p.gradient_end})` }}
                      className="h-5 w-8 rounded border border-white/20 shadow-sm"
                    />
                    <Badge variant={p.is_active ? 'positive' : 'neutral'}>
                      {p.is_active ? 'ACTIVE ON APP' : 'HIDDEN'}
                    </Badge>
                  </div>

                  <span className="text-[11px] font-mono text-text-tertiary">Order: {p.display_order}</span>
                </div>

                {/* Banner Info */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-accent-primary bg-accent-primary/10 px-1.5 py-0.5 rounded">
                      {p.badge_text}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary mt-1">{p.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{p.subtitle}</p>
                </div>

                {/* Routing & Action Info */}
                <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary pt-2 border-t border-border-muted">
                  <span>Action: {p.cta_text}</span>
                  <span>Route: {p.target_route}</span>
                </div>

                {/* Actions: Toggle & Delete */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleToggle(p.id, p.is_active)}
                    disabled={isToggling}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-fast ${
                      p.is_active
                        ? 'border-status-warning/40 text-status-warning hover:bg-status-warning/10'
                        : 'border-status-positive/40 text-status-positive hover:bg-status-positive/10'
                    }`}
                  >
                    {isToggling ? 'Updating...' : p.is_active ? 'Hide Banner' : 'Activate Banner'}
                  </button>

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

      {/* Create Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 space-y-5 bg-surface-raised border border-border-default shadow-2xl rounded-2xl">
            
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-primary" />
                <h3 className="text-base font-semibold text-text-primary">Create App Promo Banner</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-secondary font-medium mb-1">Banner Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🎁 ₹100 Weekend Cash Drop"
                  required
                  className="w-full h-8 rounded-lg border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Deposit ₹500 and get instant 20% winnings match"
                  required
                  className="w-full h-8 rounded-lg border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary font-medium mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. HOT, 30X, BONUS"
                    className="w-full h-8 rounded-lg border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary font-medium mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. PLAY NOW, CLAIM"
                    className="w-full h-8 rounded-lg border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary font-medium mb-1">Target Screen Route</label>
                  <select
                    value={targetRoute}
                    onChange={(e) => setTargetRoute(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border-default bg-surface-base px-2 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  >
                    <option value="/games/xo">⚔️ XO 1v1 Battle</option>
                    <option value="/games/ring">🎡 Ring of Future</option>
                    <option value="/wallet">💰 Wallet / Add Cash</option>
                    <option value="/profile">👤 Profile Screen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-secondary font-medium mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    min="1"
                    max="99"
                    className="w-full h-8 rounded-lg border border-border-default bg-surface-base px-2.5 font-mono text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  />
                </div>
              </div>

              {/* Gradient Color Themes */}
              <div>
                <label className="block text-text-secondary font-medium mb-1.5">Theme Gradient Color</label>
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
                        gradientStart === g.start ? 'ring-2 ring-accent-primary ring-offset-2 border-white' : 'border-white/20'
                      }`}
                    >
                      {gradientStart === g.start && <Check className="h-3 w-3" />}
                      <span>{g.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
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
                  Publish to App
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
