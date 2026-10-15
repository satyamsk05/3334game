'use client';
import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  Gift,
  Zap,
  Gamepad2,
  Flame,
  RefreshCw,
  Coins
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface TaskMission {
  id: string;
  title: string;
  description: string;
  category: string; // REWARD or MISSION
  type: string;     // DAILY_CHECKIN, PLAY_GAMES, BET_AMOUNT, DEPOSIT, WIN_GAMES
  targetCount: number;
  rewardChips: number; // In paise (chips)
  dayNumber: number;
  active: boolean;
  sortOrder: number;
  created_at?: string;
}

export default function TasksAdminPage() {
  const [tasks, setTasks] = useState<TaskMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskMission | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MISSION',
    type: 'PLAY_GAMES',
    targetCount: 5,
    rewardRupees: 10,
    dayNumber: 0,
    sortOrder: 1,
    active: true
  });

  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getTasks();
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openAddModal = (category: string = 'MISSION') => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category,
      type: category === 'REWARD' ? 'DAILY_CHECKIN' : 'PLAY_GAMES',
      targetCount: 1,
      rewardRupees: 5,
      dayNumber: category === 'REWARD' ? 1 : 0,
      sortOrder: tasks.length + 1,
      active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskMission) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      type: task.type,
      targetCount: task.targetCount,
      rewardRupees: task.rewardChips / 100,
      dayNumber: task.dayNumber,
      sortOrder: task.sortOrder,
      active: task.active
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        id: editingTask?.id || '',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        targetCount: Number(formData.targetCount),
        rewardChips: Math.round(Number(formData.rewardRupees) * 100),
        dayNumber: Number(formData.dayNumber),
        sortOrder: Number(formData.sortOrder),
        active: formData.active
      };

      await adminService.saveTask(payload);
      setSuccess(editingTask ? 'Task updated successfully!' : 'New task created successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setIsModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setError(null);
      await adminService.deleteTask(id);
      setSuccess('Task deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchTasks();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete task');
    }
  };

  const handleToggleActive = async (task: TaskMission) => {
    try {
      const updated = { ...task, active: !task.active };
      await adminService.saveTask(updated);
      fetchTasks();
    } catch (err: any) {
      setError('Failed to update status');
    }
  };

  const checkinTasks = tasks.filter((t) => t.category === 'REWARD');
  const missionTasks = tasks.filter((t) => t.category === 'MISSION');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary flex items-center gap-2">
            <CheckSquare className="text-amber-400" size={28} />
            Tasks & Daily Missions Management
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Dynamically configure daily check-in rewards and gameplay missions for Android app & web clients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchTasks} disabled={loading} className="gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button onClick={() => openAddModal('MISSION')} className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold">
            <Plus size={16} />
            Add Mission
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border border-border-default flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Gift size={24} />
          </div>
          <div>
            <div className="text-xs text-text-secondary font-medium">Daily Check-in Days</div>
            <div className="text-2xl font-bold text-text-primary">{checkinTasks.length} Days</div>
          </div>
        </Card>

        <Card className="p-4 border border-border-default flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-xs text-text-secondary font-medium">Active Missions</div>
            <div className="text-2xl font-bold text-text-primary">{missionTasks.filter((t) => t.active).length}</div>
          </div>
        </Card>

        <Card className="p-4 border border-border-default flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Coins size={24} />
          </div>
          <div>
            <div className="text-xs text-text-secondary font-medium">Total Check-in Pool</div>
            <div className="text-2xl font-bold text-text-primary">
              ₹{checkinTasks.reduce((acc, cur) => acc + cur.rewardChips / 100, 0)}
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 1: 7-Day Check-in Rewards */}
      <Card className="p-6 border border-border-default space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Gift className="text-amber-400" size={20} />
              7-Day Daily Check-in Streak Rewards
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Rewards given consecutively from Day 1 to Day 7.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => openAddModal('REWARD')} className="gap-1 text-xs">
            <Plus size={14} /> Add Check-in Day
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-default text-text-secondary text-xs uppercase">
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Reward</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {checkinTasks.map((task) => (
                <tr key={task.id} className="hover:bg-surface-strong/40">
                  <td className="py-3 px-4 font-bold text-text-primary">Day {task.dayNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-text-primary">{task.title}</div>
                    <div className="text-xs text-text-secondary">{task.description}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-400">₹{task.rewardChips / 100}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(task)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        task.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {task.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(task)}>
                      <Edit2 size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={15} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECTION 2: Gameplay Missions */}
      <Card className="p-6 border border-border-default space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Gamepad2 className="text-emerald-400" size={20} />
              Gameplay & Action Missions
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Live tasks players complete daily through gameplay, wagering, or recharging.
            </p>
          </div>
          <Button size="sm" onClick={() => openAddModal('MISSION')} className="gap-1 bg-amber-500 text-black font-bold text-xs">
            <Plus size={14} /> Add Mission
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-default text-text-secondary text-xs uppercase">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Mission Title</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Reward</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {missionTasks.map((task) => (
                <tr key={task.id} className="hover:bg-surface-strong/40">
                  <td className="py-3 px-4 font-mono text-xs text-text-secondary">{task.type}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-text-primary">{task.title}</div>
                    <div className="text-xs text-text-secondary">{task.description}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-text-primary">
                    {task.type === 'BET_AMOUNT' ? `₹${task.targetCount / 100}` : task.targetCount}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">+₹{task.rewardChips / 100}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(task)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        task.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {task.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(task)}>
                      <Edit2 size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={15} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-lg p-6 border border-border-strong bg-surface-raised space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary">
              {editingTask ? 'Edit Task' : 'Create New Task / Mission'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Play 5 Rounds"
                  className="w-full px-3 py-2 bg-surface-strong border border-border-default rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Play 5 games in Dragon vs Tiger"
                  className="w-full px-3 py-2 bg-surface-strong border border-border-default rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-strong border border-border-default rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="MISSION">MISSION (Tasks)</option>
                    <option value="REWARD">REWARD (Check-in)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-strong border border-border-default rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="PLAY_GAMES">PLAY_GAMES</option>
                    <option value="BET_AMOUNT">BET_AMOUNT</option>
                    <option value="WIN_GAMES">WIN_GAMES</option>
                    <option value="DEPOSIT">DEPOSIT</option>
                    <option value="DAILY_CHECKIN">DAILY_CHECKIN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    {formData.type === 'BET_AMOUNT' ? 'Target (Paise / Chips)' : 'Target Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.targetCount}
                    onChange={(e) => setFormData({ ...formData, targetCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface-strong border border-border-default rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Reward (₹ Rupees)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={formData.rewardRupees}
                    onChange={(e) => setFormData({ ...formData, rewardRupees: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface-strong border border-border-default rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {formData.category === 'REWARD' && (
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Streak Day Number (1-7)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.dayNumber}
                    onChange={(e) => setFormData({ ...formData, dayNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface-strong border border-border-default rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded-sm border-border-default bg-surface-strong text-amber-500"
                />
                <label htmlFor="activeCheck" className="text-sm font-medium text-text-primary">
                  Active & Visible to Players
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Task'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
