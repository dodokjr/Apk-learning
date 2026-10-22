import { useCallback, useEffect, useState } from 'react';
import { COUNTRY_CODE } from '../config';
import { getCountryTimes, getWorldTimes } from '../service/api';
import type { TimeZoneItem } from '../types';
import { INDONESIA_ZONES, WORLD_ZONES, type Zone } from '../utils/time';

export type SyncStatus = 'loading' | 'ok' | 'error';

const fromStatic = (zones: Zone[]): TimeZoneItem[] =>
  zones.map((z) => ({ key: z.timeZone, city: z.city, label: z.label, timeZone: z.timeZone }));

interface State {
  status: SyncStatus;
  error: string | null;
  indonesia: TimeZoneItem[];
  world: TimeZoneItem[];
  offsetMs: number; // selisih waktu server terhadap jam perangkat
  syncedAt: Date | null;
}

const RESYNC_MS = 5 * 60 * 1000;
const MAX_OFFSET_MS = 24 * 60 * 60 * 1000;

const messageOf = (reason: unknown): string =>
  reason instanceof Error ? reason.message : 'Terjadi kesalahan sistem.';

export function useWorldTime() {
  const [state, setState] = useState<State>({
    status: 'loading',
    error: null,
    indonesia: fromStatic(INDONESIA_ZONES),
    world: fromStatic(WORLD_ZONES),
    offsetMs: 0,
    syncedAt: null,
  });
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: s.status === 'ok' ? 'ok' : 'loading' }));

    const sentAt = Date.now();
    Promise.allSettled([getCountryTimes(COUNTRY_CODE), getWorldTimes()]).then(([id, world]) => {
      if (cancelled) return;
      const receivedAt = Date.now();
      const deviceMid = (sentAt + receivedAt) / 2; // kompensasi latensi jaringan

      const idZones = id.status === 'fulfilled' ? id.value : null;
      const worldZones = world.status === 'fulfilled' ? world.value : null;

      const instant = [...(idZones ?? []), ...(worldZones ?? [])].find((z) => z.instant)?.instant;
      const rawOffset = instant ? instant.getTime() - deviceMid : 0;
      const offsetMs = Math.abs(rawOffset) < MAX_OFFSET_MS ? rawOffset : 0;

      const firstError =
        id.status === 'rejected' ? messageOf(id.reason) : world.status === 'rejected' ? messageOf(world.reason) : null;

      setState((prev) => ({
        status: firstError ? 'error' : 'ok',
        error: firstError,
        indonesia: idZones && idZones.length ? idZones : fromStatic(INDONESIA_ZONES),
        world: worldZones && worldZones.length ? worldZones : fromStatic(WORLD_ZONES),
        offsetMs,
        syncedAt: id.status === 'fulfilled' || world.status === 'fulfilled' ? new Date() : prev.syncedAt,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), RESYNC_MS);
    return () => clearInterval(id);
  }, []);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}