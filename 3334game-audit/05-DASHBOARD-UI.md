# 05 — Dashboard UI (`admin-panel/src/app/page.tsx`)

## Problems

### 1. Race Condition on Range Switch / Sync (P2)

```ts
useEffect(() => {
  fetchLiveMetrics(range);
}, [range]);
```

Rapid clicks on 24h / 7d / 30d / Sync can finish out of order → wrong stats shown.

**Fix options:**

**A. AbortController (native)**

```ts
useEffect(() => {
  const controller = new AbortController();
  let cancelled = false;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboardStats(range); // ideally pass signal
      if (!cancelled) {
        if (res.success && res.data) setStats(res.data);
        else setError(res.message || 'Failed');
      }
    } catch (err: any) {
      if (!cancelled && err.name !== 'CanceledError') {
        setError(err.message || 'Telemetry connection error');
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  load();
  return () => {
    cancelled = true;
    controller.abort();
  };
}, [range]);
```

**B. Better: TanStack Query**

```ts
const { data, error, isLoading, refetch } = useQuery({
  queryKey: ['dashboard', range],
  queryFn: () => adminService.getDashboardStats(range),
  staleTime: 30_000,
});
```

### 2. Generic Error Message (P2)

```ts
setError(err.response?.data?.message || err.message || 'Telemetry connection error');
```

After fixing `api.ts` (see file 02), use:

```ts
setError(err.message || 'Failed to load dashboard');
```

And show different UI for network vs permission:

```tsx
{error && (
  <div className="...">
    <AlertCircle />
    <span>{error}</span>
    {isNetworkError && (
      <Button size="sm" onClick={() => fetchLiveMetrics(range)}>Retry</Button>
    )}
  </div>
)}
```

### 3. Large Monolithic Component (P3)

~500+ lines. Split into:

- `DashboardHeader` (title + range + sync)
- `OverviewCards` (GGR, players, balances, payout queue)
- `RecentActivityTable`
- `PendingActions`

Easier testing and less re-renders.

### 4. Hardcoded "95.0% Target RTP" (P3)

```tsx
<span>... 95.0% Target RTP</span>
```

Should come from `stats` or system settings API.

---

## Suggested Improved Fetch Pattern

```ts
const [range, setRange] = useState<'24h' | '7d' | '30d' | 'all'>('30d');
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isNetwork, setIsNetwork] = useState(false);
const [stats, setStats] = useState<any>(null);

const fetchLiveMetrics = useCallback(async (selectedRange = range) => {
  try {
    setLoading(true);
    setError(null);
    setIsNetwork(false);
    const res = await adminService.getDashboardStats(selectedRange);
    if (res.success && res.data) {
      setStats(res.data);
    } else {
      setError(res.message || 'Failed to fetch dashboard metrics');
    }
  } catch (err: any) {
    setIsNetwork(!!err.isNetwork);
    setError(err.message || 'Telemetry connection error');
  } finally {
    setLoading(false);
  }
}, [range]);

useEffect(() => {
  fetchLiveMetrics(range);
}, [range, fetchLiveMetrics]);
```

---

## Loading & Empty States

- Show skeleton cards while `loading`
- If `stats` is null and not loading → show empty state + retry
- Disable range buttons while loading (optional)
