(() => {
  const cfg = window.TRIP_SUPABASE_CONFIG;
  const status = document.getElementById('accountStatus');
  const plansKey = 'tokyo-trip-plans-v1';
  const expensesKey = 'tokyo-trip-expenses-v1';
  const memoKey = 'tokyo-trip-memo-v1';
  const dayIds = ['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-01'];
  const say = message => { if (status) status.textContent = message; };
  if (!cfg?.url || !cfg?.publishableKey || !window.supabase?.createClient) {
    say('Supabase connection not ready · Supabase 연결을 준비하지 못했습니다');
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.publishableKey);
  let syncing = false;
  let applyingRemote = false;
  let watching = false;
  let subscribed = false;
  let timer;
  let refreshTimer;
  const safeJson = (text, fallback) => { try { return JSON.parse(text) ?? fallback; } catch { return fallback; } };

  async function loadSharedData() {
    applyingRemote = true;
    try {
      const [plansResult, expensesResult, memoResult] = await Promise.all([
        client.from('trip_plans').select('trip_date,items').eq('trip_id', cfg.tripId),
        client.from('trip_expenses').select('items').eq('trip_id', cfg.tripId).maybeSingle(),
        client.from('trip_memos').select('content').eq('trip_id', cfg.tripId).maybeSingle()
      ]);
      for (const result of [plansResult, expensesResult, memoResult]) if (result.error) throw result.error;
      if (plansResult.data?.length) {
        const byDate = Object.fromEntries(plansResult.data.map(row => [row.trip_date, row.items || []]));
        localStorage.setItem(plansKey, JSON.stringify(byDate));
      }
      if (expensesResult.data) localStorage.setItem(expensesKey, JSON.stringify(expensesResult.data.items || []));
      if (memoResult.data) localStorage.setItem(memoKey, memoResult.data.content || '');
      if (typeof renderPlans === 'function') renderPlans();
      if (typeof renderLedger === 'function') renderLedger();
      const memo = document.getElementById('freeMemo');
      if (memo) memo.value = localStorage.getItem(memoKey) || '';
    } finally { applyingRemote = false; }
  }

  async function writeSharedData(key) {
    if (syncing) return;
    syncing = true;
    try {
      if (key === plansKey) {
        const plans = safeJson(localStorage.getItem(plansKey), {});
        await Promise.all(dayIds.map(async date => {
          const { error } = await client.from('trip_plans').upsert({ trip_id: cfg.tripId, trip_date: date, items: plans[date] || [], updated_at: new Date().toISOString() }, { onConflict: 'trip_id,trip_date' });
          if (error) throw error;
        }));
      } else if (key === expensesKey) {
        const { error } = await client.from('trip_expenses').upsert({ trip_id: cfg.tripId, items: safeJson(localStorage.getItem(expensesKey), []), updated_at: new Date().toISOString() }, { onConflict: 'trip_id' });
        if (error) throw error;
      } else if (key === memoKey) {
        const { error } = await client.from('trip_memos').upsert({ trip_id: cfg.tripId, content: localStorage.getItem(memoKey) || '', updated_at: new Date().toISOString() }, { onConflict: 'trip_id' });
        if (error) throw error;
      }
      say('Changes shared · 변경 사항을 공유했습니다');
    } catch (error) {
      say(`Save failed: ${error.message} · 저장 실패: ${error.message}`);
    } finally { syncing = false; }
  }

  function watchLocalChanges() {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (!applyingRemote && this === localStorage && [plansKey, expensesKey, memoKey].includes(key)) {
        clearTimeout(timer);
        timer = setTimeout(() => writeSharedData(key), 500);
      }
    };
  }

  function subscribeToChanges() {
    if (subscribed) return;
    subscribed = true;
    client.channel(`trip-${cfg.tripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_plans', filter: `trip_id=eq.${cfg.tripId}` }, refreshFromRemote)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_expenses', filter: `trip_id=eq.${cfg.tripId}` }, refreshFromRemote)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_memos', filter: `trip_id=eq.${cfg.tripId}` }, refreshFromRemote)
      .subscribe();
  }

  function refreshFromRemote() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => loadSharedData().catch(error => say(`Sync failed: ${error.message} · 동기화 실패: ${error.message}`)), 300);
  }

  (async () => {
    try {
      await loadSharedData();
      if (!watching) { watchLocalChanges(); watching = true; }
      subscribeToChanges();
      say('Shared online · sign-in not required · 로그인 없이 공유 중');
    } catch (error) {
      say(`Connection failed: ${error.message} · 연결 실패: ${error.message}`);
    }
  })();
})();
