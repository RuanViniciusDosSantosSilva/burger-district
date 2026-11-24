import { site } from '@/config/site';

/** Data/hora atual no fuso de São Paulo, independente do fuso do visitante. */
function nowSP() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return { day: days.indexOf(get('weekday')), minutes: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10) };
}

const toMin = (h: string) => {
  const [a, b] = h.split(':').map(Number);
  return a * 60 + b;
};

export function todayIndex() {
  return nowSP().day;
}

/** Retorna se está aberto agora, considerando expedientes que passam da meia-noite. */
export function openStatus(): { open: boolean; label: string } {
  const { day, minutes } = nowSP();
  const today = site.hours.find((h) => h.day === day)!;
  const yesterday = site.hours.find((h) => h.day === (day + 6) % 7)!;

  if (yesterday.open && yesterday.close && toMin(yesterday.close) < toMin(yesterday.open) && minutes < toMin(yesterday.close)) {
    return { open: true, label: `Aberto até ${yesterday.close}` };
  }
  if (today.open && today.close) {
    const o = toMin(today.open);
    const c = toMin(today.close);
    const crosses = c < o;
    if (minutes >= o && (crosses || minutes < c)) return { open: true, label: `Aberto até ${today.close}` };
    if (minutes < o) return { open: false, label: `Abre hoje às ${today.open}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = site.hours.find((h) => h.day === (day + i) % 7)!;
    if (d.open) return { open: false, label: `Abre ${i === 1 ? 'amanhã' : d.label.toLowerCase()} às ${d.open}` };
  }
  return { open: false, label: 'Fechado' };
}
