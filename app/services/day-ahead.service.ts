import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface DayAheadPoint {
  timestamp: string;
  value: number;
}

export interface EventWindow {
  start: Date;
  end: Date;
  maxPoint: DayAheadPoint;
  startIndex: number;
  endIndex: number;
}

@Injectable({ providedIn: 'root' })
export class DayAheadService {
  private http = inject(HttpClient);

  getSchedule(): Observable<DayAheadPoint[]> {
    return this.http.get<unknown>('assets/mock/day-ahead.json').pipe(
      map((res) => {
        const raw = Array.isArray(res) ? res : (res as any)?.data;
        if (!Array.isArray(raw)) {
          return [];
        }
        return raw
          .map((entry: any) => {
            const timestamp =
              entry?.timestamp ??
              entry?.Timestamp ??
              entry?.time ??
              entry?.datetime ??
              entry?.dateTime ??
              '';
            const value =
              entry?.value ??
              entry?.kWh ??
              entry?.dayAheadSchedule ??
              entry?.DayAheadSchedule ??
              entry?.['Day Ahead Schedule'] ??
              0;
            return {
              timestamp: String(timestamp),
              value: Number(value),
            };
          })
          .filter((entry: DayAheadPoint) => entry.timestamp);
      })
    );
  }

  computeEventWindow(points: DayAheadPoint[], upBlocks = 4, downBlocks = 3): EventWindow | null {
    if (!points.length) {
      return null;
    }

    const sorted = points
      .slice()
      .map((entry) => ({
        ...entry,
        parsed: this.parseTimestamp(entry.timestamp),
      }))
      .sort((a, b) => {
        const at = a.parsed?.getTime() ?? 0;
        const bt = b.parsed?.getTime() ?? 0;
        return at - bt;
      });

    let maxIndex = 0;
    let maxValue = Number.NEGATIVE_INFINITY;
    sorted.forEach((entry, index) => {
      if (entry.value > maxValue) {
        maxValue = entry.value;
        maxIndex = index;
      }
    });

    const startIndex = Math.max(0, maxIndex - upBlocks);
    const endIndex = Math.min(sorted.length - 1, maxIndex + downBlocks);
    const start = sorted[startIndex].parsed ?? this.parseTimestamp(sorted[startIndex].timestamp);
    const end = sorted[endIndex].parsed ?? this.parseTimestamp(sorted[endIndex].timestamp);
    if (!start || !end) {
      return null;
    }

    return {
      start,
      end,
      maxPoint: {
        timestamp: sorted[maxIndex].timestamp,
        value: sorted[maxIndex].value,
      },
      startIndex,
      endIndex,
    };
  }

  private parseTimestamp(timestamp: string): Date | null {
    const parsed = new Date(String(timestamp).replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  }
}
