import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BedDouble, Check, ChevronRight, CircleHelp, ClipboardCheck, Clock3, CloudSun, ClipboardList, HeartPulse, KeyRound, LogOut, Moon, Plus, Radio, RefreshCw, Send, Settings2, Shield, Signal, Smartphone, Thermometer, UserPlus, Users, Wind } from 'lucide-react';
import CrewHealthCheckFrame from './CrewHealthCheckFrame.jsx';

const STORAGE_CREW = 'astra-crew';
const STORAGE_SESSION = 'astra-session';
const ASTRONAUTS = [
  { astronaut_id: 'ASTRA-HAIFAA', name: 'Haifaa', call_sign: 'Haifaa', expedition: 'Expedition 09', pin: '5206', devices: ['simulated-wearable-01', 'simulated-pulse-oximeter-01', 'simulated-sleep-monitor-01', 'simulated-environment-sensor-01', 'astronaut-self-assessment'] },
  { astronaut_id: 'ASTRA-DEMO-001', name: 'REEM', call_sign: 'REEM', expedition: 'Expedition 08', pin: '1420', devices: ['simulated-wearable-01', 'simulated-pulse-oximeter-01', 'simulated-sleep-monitor-01', 'simulated-radiation-dosimeter-01', 'simulated-environment-sensor-01', 'astronaut-self-assessment'] },
  { astronaut_id: 'ASTRA-DEMO-002', name: 'MONA', call_sign: 'MONA', expedition: 'Expedition 08', pin: '2605', devices: ['simulated-wearable-01', 'simulated-pulse-oximeter-01', 'simulated-environment-sensor-01', 'astronaut-self-assessment'] },
  { astronaut_id: 'ASTRA-DEMO-003', name: 'ALI', call_sign: 'ALI', expedition: 'Expedition 09', pin: '3142', devices: ['simulated-wearable-01', 'simulated-blood-pressure-01', 'simulated-sleep-monitor-01', 'astronaut-self-assessment'] },
  { astronaut_id: 'ASTRA-DEMO-004', name: 'ZAINAB', call_sign: 'ZAINAB', expedition: 'Expedition 09', pin: '4016', devices: ['simulated-wearable-01', 'simulated-pulse-oximeter-01', 'simulated-sleep-monitor-01', 'simulated-environment-sensor-01', 'astronaut-self-assessment'] },
];
const DEVICES = [
  { id: 'simulated-wearable-01', name: 'Crew wearable', kind: 'Vital signs', metrics: 'Heart rate, skin temperature, respiratory rate', icon: HeartPulse },
  { id: 'simulated-pulse-oximeter-01', name: 'Pulse oximeter', kind: 'Vital signs', metrics: 'SpO₂, pulse rate', icon: Activity },
  { id: 'simulated-blood-pressure-01', name: 'Blood pressure monitor', kind: 'Vital signs', metrics: 'Systolic, diastolic, pulse rate', icon: Activity },
  { id: 'simulated-sleep-monitor-01', name: 'Sleep monitor', kind: 'Sleep', metrics: 'Sleep duration, quality, awakenings', icon: Moon },
  { id: 'simulated-radiation-dosimeter-01', name: 'Radiation dosimeter', kind: 'Space risks', metrics: 'Radiation dose and dose rate', icon: Radio },
  { id: 'simulated-environment-sensor-01', name: 'Environment sensor', kind: 'Space risks', metrics: 'Cabin temperature, humidity, oxygen, CO₂', icon: CloudSun },
  { id: 'astronaut-self-assessment', name: 'Self-assessment', kind: 'Wellbeing', metrics: 'Fatigue, stress, mood, workload, energy', icon: ClipboardList },
];
const METRICS = [
  { key: 'heart_rate', label: 'Heart rate', unit: 'bpm', device: 'simulated-wearable-01', min: 35, max: 180 },
  { key: 'spo2', label: 'SpO₂', unit: '%', device: 'simulated-pulse-oximeter-01', min: 50, max: 100 },
  { key: 'skin_temperature', label: 'Skin temperature', unit: '°C', device: 'simulated-wearable-01', min: 25, max: 45 },
  { key: 'respiratory_rate', label: 'Respiratory rate', unit: 'breaths/min', device: 'simulated-wearable-01', min: 5, max: 50 },
  { key: 'fatigue_score', label: 'Fatigue score', unit: 'score / 5', device: 'astronaut-self-assessment', min: 1, max: 5 },
  { key: 'sleep_duration', label: 'Sleep duration', unit: 'minutes', device: 'simulated-sleep-monitor-01', min: 0, max: 900 },
  { key: 'radiation_dose', label: 'Radiation dose', unit: 'mSv', device: 'simulated-radiation-dosimeter-01', min: 0, max: 100 },
  { key: 'cabin_temperature', label: 'Cabin temperature', unit: '°C', device: 'simulated-environment-sensor-01', min: -50, max: 80 },
  { key: 'systolic_pressure', label: 'Systolic pressure', unit: 'mmHg', device: 'simulated-blood-pressure-01', min: 40, max: 260 },
];
const METRIC_DEFAULTS = { heart_rate: 72, spo2: 98, skin_temperature: 34, respiratory_rate: 16, fatigue_score: 3, sleep_duration: 405, radiation_dose: 0.08, cabin_temperature: 22.4, systolic_pressure: 118 };
const SAMPLE_BUNDLES = {
  'ASTRA-DEMO-001': {
    overall_status: 'review', heart: 72, spo2: 98, sleep: 405, fatigue: 3, cabin: 22.4,
    alerts: [{ id: 'alert-001', severity: 'review', category: 'sleep', reason: "Sleep duration has declined from the astronaut's personal baseline.", recommended_action: 'Complete health self-assessment.' }],
  },
  'ASTRA-DEMO-002': {
    overall_status: 'within_configured_range', heart: 66, spo2: 99, sleep: 438, fatigue: 2, cabin: 22.1,
    alerts: [],
  },
  'ASTRA-DEMO-003': {
    overall_status: 'review', heart: 81, spo2: 97, sleep: 390, fatigue: 4, cabin: null,
    alerts: [{ id: 'alert-003', severity: 'review', category: 'wellbeing', reason: 'A self-assessment is due for this crew member.', recommended_action: 'Complete the daily self-assessment.' }],
  },
  'ASTRA-DEMO-004': {
    overall_status: 'within_configured_range', heart: 74, spo2: 98, sleep: 420, fatigue: 2, cabin: 22.3,
    alerts: [],
  },
};
const SAMPLE_HISTORY = {
  'ASTRA-DEMO-001': [
    ['heart_rate', 72, 'bpm', 'simulated-wearable-01', 'valid'], ['spo2', 98, '%', 'simulated-pulse-oximeter-01', 'valid'], ['sleep_duration', 405, 'minutes', 'simulated-sleep-monitor-01', 'valid'], ['fatigue_score', 3, 'score / 5', 'astronaut-self-assessment', 'valid'], ['radiation_dose', null, 'mSv', 'simulated-radiation-dosimeter-01', 'unknown'],
  ],
  'ASTRA-DEMO-002': [
    ['heart_rate', 66, 'bpm', 'simulated-wearable-01', 'valid'], ['spo2', 99, '%', 'simulated-pulse-oximeter-01', 'valid'], ['respiratory_rate', 15, 'breaths/min', 'simulated-wearable-01', 'valid'], ['cabin_temperature', 22.1, '°C', 'simulated-environment-sensor-01', 'valid'],
  ],
  'ASTRA-DEMO-003': [
    ['heart_rate', 81, 'bpm', 'simulated-wearable-01', 'valid'], ['systolic_pressure', 118, 'mmHg', 'simulated-blood-pressure-01', 'valid'], ['sleep_duration', 390, 'minutes', 'simulated-sleep-monitor-01', 'valid'], ['fatigue_score', 4, 'score / 5', 'astronaut-self-assessment', 'valid'],
  ],
  'ASTRA-DEMO-004': [
    ['heart_rate', 74, 'bpm', 'simulated-wearable-01', 'valid'], ['spo2', 98, '%', 'simulated-pulse-oximeter-01', 'valid'], ['sleep_duration', 420, 'minutes', 'simulated-sleep-monitor-01', 'valid'], ['fatigue_score', 2, 'score / 5', 'astronaut-self-assessment', 'valid'], ['cabin_temperature', 22.3, '°C', 'simulated-environment-sensor-01', 'valid'],
  ],
};
const endpoint = (base, path) => `${base.replace(/\/$/, '')}${path}`;
const readCrew = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_CREW)) || [];
    const samples = ASTRONAUTS.map((sample) => {
      const stored = saved.find((person) => person.astronaut_id === sample.astronaut_id);
      return { ...sample, ...(stored ? { devices: stored.devices || sample.devices } : {}) };
    });
    return [...samples, ...saved.filter((person) => !ASTRONAUTS.some((sample) => sample.astronaut_id === person.astronaut_id))];
  } catch { return ASTRONAUTS; }
};
function makeSamples(astronautId) {
  const base = SAMPLE_BUNDLES[astronautId] || SAMPLE_BUNDLES['ASTRA-DEMO-001'];
  const now = Date.now();
  return (SAMPLE_HISTORY[astronautId] || SAMPLE_HISTORY['ASTRA-DEMO-001']).map(([metric, value, unit, device_id, quality], index) => ({
    observation_id: `sample-${astronautId.slice(-3)}-${index + 1}`, metric, value, unit, device_id, quality, status: value == null ? 'unavailable' : 'measured', measured_at: new Date(now - index * 18 * 60_000).toISOString(),
  }));
}
function simulatedSummary(astronautId) {
  const sample = SAMPLE_BUNDLES[astronautId] || SAMPLE_BUNDLES['ASTRA-DEMO-001'];
  return {
    astronaut_id: astronautId, overall_status: sample.overall_status, last_updated: new Date().toISOString(),
    vital_signs: { heart_rate_bpm: { value: sample.heart, status: 'within_configured_range' }, spo2_pct: { value: sample.spo2, status: 'within_configured_range' } },
    sleep: { sleep_duration_min: { value: sample.sleep, status: sample.sleep < 420 ? 'trend_review' : 'within_configured_range' } },
    space_risks: { radiation_dose: { value: null, status: 'unavailable' }, cabin_temperature: { value: sample.cabin, status: sample.cabin == null ? 'unavailable' : 'within_configured_range' } },
    stress_wellbeing: { fatigue_score: { value: sample.fatigue, scale: 5, status: sample.fatigue > 3 ? 'review' : 'within_configured_range' } },
  };
}
async function loadDashboard(base, astronautId, signal) {
  if (!base) return { summary: simulatedSummary(astronautId), alerts: SAMPLE_BUNDLES[astronautId]?.alerts || [], source: 'simulated' };
  const summaryUrl = new URL(endpoint(base, '/api/v1/health/summary'));
  summaryUrl.searchParams.set('astronaut_id', astronautId);
  const [summaryResponse, alertsResponse] = await Promise.all([fetch(summaryUrl, { signal }), fetch(endpoint(base, '/api/v1/alerts'), { signal })]);
  if (!summaryResponse.ok || !alertsResponse.ok) throw new Error(`API request failed (${summaryResponse.status}/${alertsResponse.status})`);
  const [summary, alertPayload] = await Promise.all([summaryResponse.json(), alertsResponse.json()]);
  return { summary, alerts: alertPayload.alerts ?? [], source: 'live' };
}
async function sendObservation(base, observation) {
  if (!base) return { accepted: true, observation_id: `sim-${Date.now()}`, simulated: true };
  const response = await fetch(endpoint(base, '/api/v1/observations'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(observation) });
  if (!response.ok) throw new Error(`Observation rejected (${response.status})`);
  return response.json();
}
function formatTime(value) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function scoreHealthValues(values) {
  const clamp = (value) => Math.min(100, Math.max(0, value));
  const scores = {
    heart_rate: values.heart_rate == null ? null : clamp(100 - 2 * Math.max(0, 60 - values.heart_rate, values.heart_rate - 100)),
    spo2: values.spo2 == null ? null : clamp((values.spo2 - 90) * 10),
    sleep_duration: values.sleep_duration == null ? null : clamp((values.sleep_duration / 420) * 100),
    fatigue_score: values.fatigue_score == null ? null : clamp(((5 - values.fatigue_score) / 4) * 100),
  };
  const available = Object.values(scores).filter((value) => value != null);
  return {
    scores,
    score: available.length ? Math.round(available.reduce((total, value) => total + value, 0) / available.length) : null,
  };
}

function getHealthScore(summary) {
  const numberFrom = (reading) => {
    if (reading?.value == null || reading.value === '') return null;
    const value = Number(reading.value);
    return Number.isFinite(value) ? value : null;
  };
  const values = {
    heart_rate: numberFrom(summary.vital_signs?.heart_rate_bpm),
    spo2: numberFrom(summary.vital_signs?.spo2_pct),
    sleep_duration: numberFrom(summary.sleep?.sleep_duration_min),
    fatigue_score: numberFrom(summary.stress_wellbeing?.fatigue_score),
  };
  const { scores, score } = scoreHealthValues(values);
  const components = [
    { key: 'heart_rate', label: 'Heart rate', value: values.heart_rate, unit: 'bpm', score: scores.heart_rate },
    { key: 'spo2', label: 'Blood oxygen', value: values.spo2, unit: '%', score: scores.spo2 },
    { key: 'sleep_duration', label: 'Sleep', value: values.sleep_duration, unit: 'min', score: scores.sleep_duration },
    { key: 'fatigue_score', label: 'Fatigue', value: values.fatigue_score, unit: '/ 5', score: scores.fatigue_score },
  ];
  return { components, score };
}

function getHealthHistory(observations) {
  const metricKeys = new Set(['heart_rate', 'spo2', 'sleep_duration', 'fatigue_score']);
  const checksByTime = new Map();
  observations.forEach((observation) => {
    if (!metricKeys.has(observation.metric) || observation.quality !== 'valid' || observation.status !== 'measured') return;
    const time = Date.parse(observation.measured_at);
    const value = Number(observation.value);
    if (!Number.isFinite(time) || observation.value == null || !Number.isFinite(value)) return;
    const check = checksByTime.get(time) || { time, values: {} };
    check.values[observation.metric] = value;
    checksByTime.set(time, check);
  });

  const previousValues = {};
  return [...checksByTime.values()]
    .sort((first, second) => first.time - second.time)
    .map((check) => {
      Object.assign(previousValues, check.values);
      return { time: check.time, score: scoreHealthValues(previousValues).score };
    })
    .filter((check) => check.score != null);
}

function HealthHistoryChart({ observations }) {
  const checks = getHealthHistory(observations);
  const width = 720;
  const height = 220;
  const left = 38;
  const right = 18;
  const top = 16;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const x = (index) => checks.length < 2 ? left + plotWidth / 2 : left + (index / (checks.length - 1)) * plotWidth;
  const y = (score) => top + ((100 - score) / 100) * plotHeight;
  const line = checks.map((check, index) => `${x(index)},${y(check.score)}`).join(' ');
  const timeLabels = [...new Set([0, Math.floor((checks.length - 1) / 2), checks.length - 1])];

  return <section className="health-history" aria-labelledby="health-history-title">
    <div className="health-history__heading">
      <div><h3 id="health-history-title">Health level over checks</h3><p>Each valid reading updates the score; earlier readings carry forward between checks.</p></div>
      <span>{checks.length} {checks.length === 1 ? 'check' : 'checks'}</span>
    </div>
    {checks.length ? <>
      <svg className="health-history__chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="health-history-title health-history-description">
        <desc id="health-history-description">Illustrative health score from 0 to 100 across {checks.length} valid recorded checks. Refer to the score list below for each check's value and time.</desc>
        {[0, 25, 50, 75, 100].map((score) => <g key={score}>
          <line className="health-history__grid" x1={left} x2={width - right} y1={y(score)} y2={y(score)} />
          <text className="health-history__axis-label" x={left - 8} y={y(score) + 3} textAnchor="end">{score}</text>
        </g>)}
        {checks.length > 1 && <polyline className="health-history__line" points={line} />}
        {checks.map((check, index) => <circle className="health-history__point" key={check.time} cx={x(index)} cy={y(check.score)} r="4">
          <title>{`Check ${index + 1}: ${check.score} out of 100 · ${formatTime(check.time)}`}</title>
        </circle>)}
        {timeLabels.map((index) => <text className="health-history__check-label" key={index} x={x(index)} y={height - 10} textAnchor={index === 0 ? 'start' : index === checks.length - 1 ? 'end' : 'middle'}>{`Check ${index + 1}`}</text>)}
      </svg>
      <ol className="health-history__check-list" aria-label="Score at every recorded check">
        {checks.map((check, index) => <li key={check.time}><span>{`Check ${index + 1}`}</span><strong>{check.score}</strong><time dateTime={new Date(check.time).toISOString()}>{formatTime(check.time)}</time></li>)}
      </ol>
    </> : <p className="health-history__empty">No valid health readings have been recorded yet. The graph will appear as scored checks are added.</p>}
  </section>;
}

function MetricCard({ label, value, unit, status, icon: Icon, series, compact = false }) {
  const missing = value == null;
  return <article className={`metric-card${compact ? ' metric-card--compact' : ''}`}>
    <div className="metric-card__top"><span className="metric-icon"><Icon size={17} /></span><span className={`status-dot ${missing ? 'status-dot--muted' : status === 'review' || status === 'trend_review' ? 'status-dot--amber' : ''}`} /></div>
    <p className="metric-label">{label}</p><div className="metric-value-line"><strong className={missing ? 'metric-value metric-value--empty' : 'metric-value'}>{missing ? 'Unavailable' : value}</strong>{!missing && <span className="metric-unit">{unit}</span>}</div>
    {series ? <div className="metric-foot">Illustrative sample trend</div> : <div className="metric-foot">{missing ? 'No measurement received' : String(status || 'Latest reading').replace(/_/g, ' ')}</div>}
  </article>;
}

function HealthScoreChart({ summary, alerts, observations }) {
  const { components, score } = getHealthScore(summary);
  const circumference = 2 * Math.PI * 43;
  const offset = score == null ? circumference : circumference * (1 - score / 100);
  const status = summary.overall_status === 'review' || alerts.length
    ? 'Review recommended'
    : summary.overall_status === 'within_configured_range'
      ? 'Within configured range'
      : 'Status unavailable';
  const scoreTone = score == null ? 'unavailable' : score >= 80 ? 'good' : score >= 60 ? 'watch' : 'low';

  return <section className="health-score-panel" aria-labelledby="health-score-title">
    <div className="health-score-panel__header">
      <div><span className="health-score-panel__eyebrow">CREW HEALTH / INDICATIVE INDEX</span><h2 id="health-score-title">Health score</h2></div>
      <span className={`health-score-panel__status health-score-panel__status--${scoreTone}`}>{status}</span>
    </div>
    <div className="health-score-panel__content">
      <div className="health-score-gauge">
        <svg viewBox="0 0 100 100" role="img" aria-label={score == null ? 'Health score unavailable' : `Illustrative health score ${score} out of 100`}>
          <circle className="health-score-gauge__track" cx="50" cy="50" r="43" />
          {score != null && <circle className={`health-score-gauge__value health-score-gauge__value--${scoreTone}`} cx="50" cy="50" r="43" strokeDasharray={circumference} strokeDashoffset={offset} />}
        </svg>
        <div className="health-score-gauge__label"><strong>{score ?? '—'}</strong><span>{score == null ? 'NO DATA' : 'OUT OF 100'}</span></div>
      </div>
      <div className="health-score-breakdown">
        <div className="health-score-breakdown__heading"><strong>Component breakdown</strong><span>Equal weight</span></div>
        {components.map((component) => <div className="health-score-row" key={component.label}>
          <div className="health-score-row__labels"><span>{component.label}</span><span>{component.value == null ? 'Unavailable' : `${component.value} ${component.unit}`}</span></div>
          <div className="health-score-row__track" role="img" aria-label={`${component.label}: ${component.score == null ? 'unavailable' : `${Math.round(component.score)} out of 100`}`}>
            {component.score != null && <span style={{ width: `${component.score}%` }} />}
          </div>
        </div>)}
      </div>
    </div>
    <p className="health-score-panel__explanation">
      Prototype estimate only—not a medical measure. The score averages available components equally: heart rate scores 100 within 60–100 bpm and loses 2 points per bpm outside that band; oxygen maps 90–100% to 0–100; sleep maps 420 minutes to 100 (capped); fatigue maps 1–5 inversely to 100–0. Missing readings are excluded.
    </p>
    <HealthHistoryChart observations={observations} />
  </section>;
}

function Brand() { return <div className="brand"><span className="brand-mark"><Activity size={20} /></span><span className="brand-name">AstroVital<span>CREW HEALTH</span></span></div>; }

function AuthPage({ mode, setMode, crew, onLogin, onRegister, notice }) {
  const [astronautId, setAstronautId] = useState(crew[0]?.astronaut_id || '');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [draft, setDraft] = useState({ astronaut_id: '', name: '', call_sign: '', expedition: 'Expedition 08', pin: '', devices: ['simulated-wearable-01', 'simulated-pulse-oximeter-01'] });
  const [registerBusy, setRegisterBusy] = useState(false);
  function submitLogin(event) {
    event.preventDefault(); setLoginError('');
    const astronaut = crew.find((item) => item.astronaut_id === astronautId);
    if (!astronaut || astronaut.pin !== pin) { setLoginError('The astronaut ID or demo access code does not match.'); return; }
    onLogin(astronaut);
  }
  function submitRegistration(event) {
    event.preventDefault(); setRegisterError('');
    const astronaut = { ...draft, astronaut_id: draft.astronaut_id.trim().toUpperCase(), name: draft.name.trim(), call_sign: draft.call_sign.trim() || draft.name.trim().split(' ').map((part) => part[0]).join('. ') + '.', devices: [...draft.devices] };
    if (!astronaut.astronaut_id || !astronaut.name || !/^\d{4}$/.test(astronaut.pin)) { setRegisterError('Enter an ID, name, and a 4-digit demo code.'); return; }
    if (crew.some((item) => item.astronaut_id.toLowerCase() === astronaut.astronaut_id.toLowerCase())) { setRegisterError('That astronaut ID is already registered.'); return; }
    if (!astronaut.devices.length) { setRegisterError('Assign at least one simulated device.'); return; }
    setRegisterBusy(true); onRegister(astronaut).catch((error) => setRegisterError(error.message || 'Could not register astronaut.')).finally(() => setRegisterBusy(false));
  }
  function toggleDraftDevice(id) { setDraft((current) => ({ ...current, devices: current.devices.includes(id) ? current.devices.filter((device) => device !== id) : [...current.devices, id] })); }

  return <div className="auth-page"><aside className="auth-visual"><Brand /><div className="auth-visual-copy"><span>CREW HEALTH / FLIGHT SYSTEMS</span><h1>Every signal.<br /><em>In context.</em></h1><p>A shared view of crew readings, device sources, and trends for mission health review.</p></div><div className="auth-orbit"><span className="orbit-ring orbit-ring--one" /><span className="orbit-ring orbit-ring--two" /><span className="orbit-core"><Activity size={31} /></span><span className="orbit-point orbit-point--one" /><span className="orbit-point orbit-point--two" /></div><p className="auth-visual-foot">ASTROVITAL · SIMULATED PROTOTYPE</p></aside>
    <main className="auth-main"><div className="auth-topline"><span>MISSION CONTROL / CREW ACCESS</span><span className="prototype-pill">DEMO ENVIRONMENT</span></div>
      {mode === 'login' ? <section className="auth-card"><div className="auth-kicker"><KeyRound size={15} /> CREW ACCESS</div><h2>Astronaut sign in</h2><p className="auth-intro">Select your crew profile and enter its demo access code.</p><form onSubmit={submitLogin}><label className="field-label" htmlFor="crew-select">Astronaut</label><select id="crew-select" className="text-input" value={astronautId} onChange={(event) => setAstronautId(event.target.value)}>{crew.map((person) => <option value={person.astronaut_id} key={person.astronaut_id}>{person.name} · {person.astronaut_id}</option>)}</select><label className="field-label" htmlFor="crew-pin">4-digit demo code</label><input className="text-input pin-input" id="crew-pin" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="••••" required /><p className="field-help">Demo-only access. This does not provide secure or server-side authentication.</p>{loginError && <div className="form-error" role="alert"><AlertTriangle size={14} />{loginError}</div>}{notice && <div className="auth-notice" role="status">{notice}</div>}<button className="auth-submit" type="submit">Enter crew portal <ArrowRight size={16} /></button></form><div className="demo-codes"><span className="demo-codes-title">SAMPLE CREW ACCESS CODES</span>{crew.slice(0, 5).map((person) => <button key={person.astronaut_id} type="button" onClick={() => { setAstronautId(person.astronaut_id); setPin(person.pin); }}><span>{person.name} <small>{person.astronaut_id}</small></span><code>{person.pin}</code></button>)}</div><button className="auth-switch" onClick={() => setMode('register')}><UserPlus size={15} /> Register astronaut and assign devices</button></section>
      : <section className="auth-card auth-card--register"><div className="auth-kicker"><UserPlus size={15} /> CREW REGISTRY</div><h2>Register astronaut</h2><p className="auth-intro">Create a local demo profile and choose its simulated reading sources.</p><form onSubmit={submitRegistration}><div className="form-two-col"><div><label className="field-label" htmlFor="reg-id">Astronaut ID</label><input id="reg-id" className="text-input" value={draft.astronaut_id} onChange={(event) => setDraft((current) => ({ ...current, astronaut_id: event.target.value }))} placeholder="ASTRA-DEMO-004" required /></div><div><label className="field-label" htmlFor="reg-pin">4-digit demo code</label><input id="reg-pin" className="text-input" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={draft.pin} onChange={(event) => setDraft((current) => ({ ...current, pin: event.target.value }))} placeholder="••••" required /></div></div><div className="form-two-col"><div><label className="field-label" htmlFor="reg-name">Full name</label><input id="reg-name" className="text-input" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Astronaut name" required /></div><div><label className="field-label" htmlFor="reg-callsign">Call sign</label><input id="reg-callsign" className="text-input" value={draft.call_sign} onChange={(event) => setDraft((current) => ({ ...current, call_sign: event.target.value }))} placeholder="A. Name" /></div></div><label className="field-label" htmlFor="reg-expedition">Expedition</label><input id="reg-expedition" className="text-input" value={draft.expedition} onChange={(event) => setDraft((current) => ({ ...current, expedition: event.target.value }))} required /><fieldset className="device-checks"><legend>Assigned simulated devices</legend>{DEVICES.map((device) => <label className="device-check" key={device.id}><input type="checkbox" checked={draft.devices.includes(device.id)} onChange={() => toggleDraftDevice(device.id)} /><span><b>{device.name}</b><small>{device.metrics}</small></span></label>)}</fieldset>{registerError && <div className="form-error" role="alert"><AlertTriangle size={14} />{registerError}</div>}<button className="auth-submit" type="submit" disabled={registerBusy}>{registerBusy ? 'Registering…' : 'Create astronaut profile'} <ArrowRight size={16} /></button></form><button className="auth-switch" onClick={() => setMode('login')}><ArrowRight className="back-arrow" size={15} /> Back to crew sign in</button></section>}
      <div className="auth-disclaimer"><Shield size={15} /><span><b>Prototype only.</b> Profile codes and registrations are stored in this browser. No real identity, medical, or NASA system is connected.</span></div>
    </main>
  </div>;
}

function App() {
  const [crew, setCrew] = useState(readCrew);
  const [activeId, setActiveId] = useState(() => sessionStorage.getItem(STORAGE_SESSION) || '');
  const [page, setPage] = useState(() => sessionStorage.getItem(STORAGE_SESSION) ? (location.hash.slice(1) || 'overview') : 'login');
  const [authMode, setAuthMode] = useState('login');
  const [authNotice, setAuthNotice] = useState('');
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('astra-api-url') || '');
  const [draftUrl, setDraftUrl] = useState(baseUrl);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState('');
  const [observations, setObservations] = useState([]);
  const [observationError, setObservationError] = useState('');
  const [observationBusy, setObservationBusy] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('heart_rate');
  const [observationValue, setObservationValue] = useState('72');
  const [observationQuality, setObservationQuality] = useState('valid');
  const [searchTerm, setSearchTerm] = useState('');
  const astronaut = crew.find((person) => person.astronaut_id === activeId);

  useEffect(() => { localStorage.setItem(STORAGE_CREW, JSON.stringify(crew)); }, [crew]);
  useEffect(() => {
    if (!activeId) return undefined;
    const controller = new AbortController(); setLoading(true); setApiError('');
    loadDashboard(baseUrl, activeId, controller.signal).then(setDashboard).catch((error) => { if (error.name !== 'AbortError') setApiError(error.message || 'Could not connect to API.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [activeId, baseUrl, refreshKey]);
  useEffect(() => { if (!activeId) return; const saved = localStorage.getItem(`astra-observations-${activeId}`); setObservations(saved ? JSON.parse(saved) : makeSamples(activeId)); }, [activeId]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function navigate(nextPage) { setPage(nextPage); location.hash = nextPage; }
  function signIn(person) {
    sessionStorage.setItem(STORAGE_SESSION, person.astronaut_id); setActiveId(person.astronaut_id); setAuthNotice(''); navigate('overview');
  }
  async function registerAstronaut(person) {
    const nextCrew = [...crew, person]; setCrew(nextCrew); localStorage.setItem(STORAGE_CREW, JSON.stringify(nextCrew));
    setAuthMode('login'); setAuthNotice(`${person.call_sign} is registered. Sign in with the demo code you created.`); navigate('login');
  }
  function signOut() { sessionStorage.removeItem(STORAGE_SESSION); setActiveId(''); setDashboard(null); setAuthMode('login'); setAuthNotice(''); navigate('login'); }
  function updateDevices(deviceIds) {
    const nextCrew = crew.map((person) => person.astronaut_id === activeId ? { ...person, devices: deviceIds } : person);
    setCrew(nextCrew); localStorage.setItem(STORAGE_CREW, JSON.stringify(nextCrew)); setToast('Device assignments saved in this browser.');
  }
  function saveApiSettings(event) {
    event.preventDefault(); const nextUrl = draftUrl.trim().replace(/\/$/, ''); localStorage.setItem('astra-api-url', nextUrl); setBaseUrl(nextUrl); setToast('API connection settings saved.');
  }
  async function submitObservation(event) {
    event.preventDefault(); setObservationError('');
    const metric = METRICS.find((item) => item.key === selectedMetric); const value = Number(observationValue);
    if (!Number.isFinite(value) || value < metric.min || value > metric.max) { setObservationError(`Enter a value from ${metric.min} to ${metric.max} ${metric.unit}.`); return; }
    const observation = { astronaut_id: activeId, device_id: metric.device, metric: metric.key, value, unit: metric.unit, measured_at: new Date().toISOString(), source: 'simulated', quality: observationQuality, status: 'measured' };
    setObservationBusy(true);
    try {
      const result = await sendObservation(baseUrl, observation); const saved = { ...observation, observation_id: result.observation_id || `sim-${Date.now()}` };
      const nextObservations = [saved, ...observations]; setObservations(nextObservations); localStorage.setItem(`astra-observations-${activeId}`, JSON.stringify(nextObservations));
      setToast(`${result.simulated ? 'Sample observation recorded' : 'Observation accepted'} · ${saved.observation_id}`); if (baseUrl) setRefreshKey((key) => key + 1);
    } catch (error) { setObservationError(error.message || 'Could not submit observation.'); }
    finally { setObservationBusy(false); }
  }

  if (!activeId || !astronaut || page === 'login' || page === 'register') {
    return <AuthPage mode={page === 'register' ? 'register' : authMode} setMode={(mode) => { setAuthMode(mode); navigate(mode); }} crew={crew} onLogin={signIn} onRegister={registerAstronaut} notice={authNotice} />;
  }

  const summary = dashboard?.summary || simulatedSummary(activeId);
  const alerts = dashboard?.alerts || [];
  const heart = summary.vital_signs?.heart_rate_bpm;
  const oxygen = summary.vital_signs?.spo2_pct;
  const sleep = summary.sleep?.sleep_duration_min;
  const fatigue = summary.stress_wellbeing?.fatigue_score;
  const radiation = summary.space_risks?.radiation_dose;
  const cabin = summary.space_risks?.cabin_temperature;
  const metricDevices = DEVICES.filter((device) => astronaut.devices.includes(device.id));
  const availableMetrics = METRICS.filter((metric) => astronaut.devices.includes(metric.device));
  const filteredObservations = observations.filter((item) => `${item.metric} ${item.device_id} ${item.quality} ${item.observation_id}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const pageTitles = { overview: 'Crew overview', vitals: 'Vital signs', wellbeing: 'Sleep & wellbeing', 'health-check': 'Crew health check', environment: 'Space environment', devices: 'Device assignments', observations: 'Observations', alerts: 'Active alerts', register: 'Register astronaut', settings: 'API settings' };

  function renderOverview() {
    const status = summary.overall_status || 'review';
    return <><section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> CREW HEALTH MONITOR <span className="mission-tag">SIMULATION</span></div><h1>Good afternoon, <em>{astronaut.call_sign}</em></h1><p className="page-subtitle">{astronaut.expedition} <span>·</span> {activeId}</p></div><div className="heading-actions"><div className="updated"><Clock3 size={14} /> Updated {formatTime(summary.last_updated)}</div><button className="primary-button" onClick={() => navigate('observations')}><Plus size={16} /> Add observation</button></div></section>
      {(apiError || loading) && <div className={`notice ${apiError ? 'notice--error' : ''}`} role={apiError ? 'alert' : 'status'}>{apiError ? <><AlertTriangle size={16} /><span><b>API unavailable.</b> {apiError} Displayed sample values remain illustrative.</span><button className="text-button" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button></> : <><RefreshCw className="is-spinning" size={16} /><span>Connecting to health summary…</span></>}</div>}
      <HealthScoreChart summary={summary} alerts={alerts} observations={observations} />
      <section className="status-banner"><div className="status-banner__icon"><AlertTriangle size={19} /></div><div className="status-banner__copy"><div className="status-overline">OVERALL STATUS <span className="status-chip">{status.replace(/_/g, ' ')}</span></div><strong>{status === 'review' ? 'Review recommended' : 'Sample status received'}</strong><p>{alerts.length ? `${alerts.length} pattern${alerts.length === 1 ? '' : 's'} flagged for human review.` : 'No active alerts returned for this astronaut.'}</p></div><div className="status-banner__meta"><span>LAST CHECK</span><strong>{formatTime(summary.last_updated)}</strong></div><button className="banner-link" onClick={() => navigate('alerts')}>View alerts <ArrowUpRight size={15} /></button></section>
      <section className="section-block"><div className="section-heading"><div><span className="section-index">01</span><h2>Vital signs</h2></div><button className="subtle-link page-link-button" onClick={() => navigate('vitals')}>View details <ArrowRight size={14} /></button></div><div className="metric-grid metric-grid--vitals"><MetricCard label="Heart rate" value={heart?.value} unit="bpm" status={heart?.status} icon={HeartPulse} /><MetricCard label="Blood oxygen" value={oxygen?.value} unit="% SpO₂" status={oxygen?.status} icon={CloudSun} /><MetricCard label="Pulse rate" value={null} unit="bpm" status="unavailable" icon={Radio} /></div></section>
      <div className="lower-grid"><section className="section-block"><div className="section-heading"><div><span className="section-index">02</span><h2>Sleep & wellbeing</h2></div><button className="subtle-link page-link-button" onClick={() => navigate('wellbeing')}>View details <ArrowRight size={14} /></button></div><div className="metric-grid metric-grid--two"><MetricCard compact label="Sleep duration" value={sleep?.value} unit="min" status={sleep?.status} icon={Moon} /><MetricCard compact label="Fatigue score" value={fatigue?.value} unit="/ 5" status={fatigue?.status} icon={Activity} /></div></section><section className="section-block"><div className="section-heading"><div><span className="section-index">03</span><h2>Space environment</h2></div><button className="subtle-link page-link-button" onClick={() => navigate('environment')}>View details <ArrowRight size={14} /></button></div><div className="risk-list"><RiskRow label="Radiation dose" device="Dosimeter data" value={radiation?.value == null ? null : `${radiation.value} mSv`} status={radiation?.status} icon={Radio} /><RiskRow label="Cabin temperature" device="Environment sensor" value={cabin?.value == null ? null : `${cabin.value} °C`} status={cabin?.status} icon={CloudSun} /></div></section></div>
      <section className="section-block"><div className="section-heading"><div><span className="section-index">04</span><h2>Recent alerts</h2><span className="alert-total">{alerts.length}</span></div><button className="subtle-link page-link-button" onClick={() => navigate('alerts')}>All alerts <ArrowRight size={14} /></button></div><AlertList alerts={alerts.slice(0, 2)} /></section>
    </>;
  }

  function renderVitals() {
    const bp = observations.find((item) => item.metric === 'systolic_pressure');
    return <><PageIntro eyebrow="CREW HEALTH / VITALS" title="Vital signs" description="Latest simulated device readings for this astronaut." /><div className="detail-grid"><MetricCard label="Heart rate" value={heart?.value} unit="bpm" status={heart?.status} icon={HeartPulse} /><MetricCard label="Blood oxygen" value={oxygen?.value} unit="% SpO₂" status={oxygen?.status} icon={CloudSun} /><MetricCard label="Skin temperature" value={latestValue('skin_temperature')} unit="°C" status="sample" icon={Thermometer} /><MetricCard label="Respiratory rate" value={latestValue('respiratory_rate')} unit="breaths/min" status="sample" icon={Wind} /><MetricCard label="Blood pressure" value={bp?.value ?? null} unit="mmHg systolic" status={bp?.status || 'unavailable'} icon={Activity} /><MetricCard label="Pulse rate" value={null} unit="bpm" status="unavailable" icon={Radio} /></div><InfoStrip>Values and status labels are illustrative prototype data, not clinical thresholds.</InfoStrip></>;
  }
  function latestValue(metricName) { return observations.find((item) => item.metric === metricName)?.value ?? null; }

  function renderWellbeing() {
    return <><PageIntro eyebrow="CREW HEALTH / RECOVERY" title="Sleep & wellbeing" description="Self-assessment and sleep monitor sample readings." /><div className="detail-grid"><MetricCard label="Sleep duration" value={sleep?.value} unit="minutes" status={sleep?.status} icon={Moon} /><MetricCard label="Sleep quality" value={latestValue('sleep_quality') ?? 'Unavailable'} unit={latestValue('sleep_quality') == null ? '' : '/ 5'} status="illustrative" icon={BedDouble} /><MetricCard label="Fatigue score" value={fatigue?.value} unit="/ 5" status={fatigue?.status} icon={Activity} /><MetricCard label="Stress score" value={latestValue('stress_score') ?? null} unit="/ 5" status="unavailable" icon={Activity} /></div><section className="content-panel"><PanelHeading index="01" title="Wellbeing check-in" /><p className="panel-copy">Self-assessment data is shown only when submitted. Missing check-ins are not considered normal.</p><div className="assessment-row"><div><b>Daily self-assessment</b><span>Fatigue and energy check-in</span></div><span className="state-tag">{fatigue?.value == null ? 'Not assessed' : 'Sample recorded'}</span></div><button className="primary-button" onClick={() => navigate('observations')}><Plus size={15} /> Record assessment</button></section></>;
  }

  function renderEnvironment() {
    return <><PageIntro eyebrow="MISSION SYSTEMS / ENVIRONMENT" title="Space environment" description="Environmental and radiation sources assigned to this crew profile." /><div className="environment-grid"><EnvironmentCard title="Radiation dose" metric={radiation} unit="mSv" icon={Radio} device="simulated-radiation-dosimeter-01" /><EnvironmentCard title="Cabin temperature" metric={cabin} unit="°C" icon={Thermometer} device="simulated-environment-sensor-01" /><EnvironmentCard title="Humidity" metric={latestMetric('humidity')} unit="%" icon={CloudSun} device="simulated-environment-sensor-01" /><EnvironmentCard title="Oxygen level" metric={latestMetric('oxygen_level')} unit="%" icon={Wind} device="simulated-environment-sensor-01" /><EnvironmentCard title="CO₂ level" metric={latestMetric('co2_level')} unit="ppm" icon={CloudSun} device="simulated-environment-sensor-01" /></div><InfoStrip>Unavailable and unassigned measurements remain explicitly unavailable; absence is never interpreted as normal.</InfoStrip></>;
  }
  function latestMetric(metricName) { return observations.find((item) => item.metric === metricName) || { value: null, status: 'unavailable' }; }

  function renderDevices() {
    return <><PageIntro eyebrow="CREW REGISTRY / SOURCES" title="Device assignments" description={`Choose which simulated devices send readings for ${astronaut.call_sign}.`} /><div className="device-toolbar"><div className="data-source-indicator"><span /> {metricDevices.length} devices assigned</div><span className="illustrative-label">LOCAL DEMO PROFILE</span></div><div className="device-assignment-grid">{DEVICES.map((device) => { const assigned = astronaut.devices.includes(device.id); const Icon = device.icon; return <label className={`device-assignment ${assigned ? 'is-assigned' : ''}`} key={device.id}><input type="checkbox" checked={assigned} onChange={() => updateDevices(assigned ? astronaut.devices.filter((id) => id !== device.id) : [...astronaut.devices, device.id])} /><span className="device-assignment-icon"><Icon size={18} /></span><span className="device-assignment-copy"><b>{device.name}</b><small>{device.kind} · {device.metrics}</small><code>{device.id}</code></span><span className="assignment-state">{assigned ? <><Check size={13} /> Assigned</> : 'Not assigned'}</span></label>; })}</div><InfoStrip>Assignment changes are saved in this browser only. A connected API must enforce device-to-astronaut authorization server-side.</InfoStrip></>;
  }

  function renderObservations() {
    const metric = availableMetrics.find((item) => item.key === selectedMetric) || availableMetrics[0];
    return <><PageIntro eyebrow="CREW DATA / OBSERVATIONS" title="Observations" description="Review recent readings or submit a simulated device measurement." action={<button className="primary-button" onClick={() => document.getElementById('new-observation')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Plus size={15} /> New observation</button>} /><section className="content-panel observation-panel" id="new-observation"><PanelHeading index="01" title="Submit observation" /><form className="observation-form" onSubmit={submitObservation}><div><label className="field-label" htmlFor="observation-metric">Metric and assigned device</label><select id="observation-metric" className="text-input" value={selectedMetric} disabled={!availableMetrics.length} onChange={(event) => { setSelectedMetric(event.target.value); setObservationValue(String(METRIC_DEFAULTS[event.target.value])); }}>{availableMetrics.map((item) => <option key={item.key} value={item.key}>{item.label} · {item.device}</option>)}</select></div><div><label className="field-label" htmlFor="observation-value">Value {metric ? `(${metric.unit})` : ''}</label><input id="observation-value" className="text-input" type="number" step="any" value={observationValue} disabled={!metric} onChange={(event) => setObservationValue(event.target.value)} /></div><div><label className="field-label" htmlFor="observation-quality">Quality</label><select id="observation-quality" className="text-input" value={observationQuality} onChange={(event) => setObservationQuality(event.target.value)}><option value="valid">Valid</option><option value="poor_signal">Poor signal</option><option value="invalid">Invalid</option><option value="unknown">Unknown</option></select></div><button className="primary-button observation-submit" type="submit" disabled={observationBusy || !metric}>{observationBusy ? 'Sending…' : <><Send size={15} /> Submit</>}</button></form>{!availableMetrics.length && <p className="form-error"><AlertTriangle size={14} /> Assign a device before submitting an observation.</p>}{observationError && <p className="form-error" role="alert"><AlertTriangle size={14} />{observationError}</p>}<p className="panel-copy">The record uses source `simulated` and status `measured`; it is not a clinical record.</p></section><section className="content-panel"><div className="table-heading"><PanelHeading index="02" title="Recent readings" /><label className="search-field"><span className="sr-only">Filter observations</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Filter observations" /></label></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Metric</th><th>Value</th><th>Device</th><th>Quality</th><th>Time</th></tr></thead><tbody>{filteredObservations.map((item) => <tr key={item.observation_id}><td><b>{item.metric.replace(/_/g, ' ')}</b><small>{item.observation_id}</small></td><td>{item.value == null ? <span className="unavailable-text">Unavailable</span> : `${item.value} ${item.unit}`}</td><td><code>{item.device_id}</code></td><td><span className={`quality-tag quality-tag--${item.quality}`}>{item.quality}</span></td><td>{formatTime(item.measured_at)}</td></tr>)}</tbody></table>{!filteredObservations.length && <div className="empty-state">No observations match this filter.</div>}</div></section></>;
  }

  function renderSettings() {
    return <><PageIntro eyebrow="MISSION SYSTEMS / CONNECTION" title="API settings" description="Configure a compatible AstroVital prototype API. Leave empty to use sample data." /><section className="content-panel settings-panel"><PanelHeading index="01" title="API connection" /><form onSubmit={saveApiSettings}><label className="field-label" htmlFor="api-url">API base URL</label><input id="api-url" className="text-input" type="url" placeholder="https://your-api.example" value={draftUrl} onChange={(event) => setDraftUrl(event.target.value)} /><div className="endpoint-list"><span>GET <code>/api/v1/health/summary?astronaut_id=...</code></span><span>GET <code>/api/v1/alerts</code></span><span>POST <code>/api/v1/observations</code></span></div><button className="primary-button" type="submit"><Check size={15} /> Save connection</button></form><div className="dialog-footnote"><CircleHelp size={14} /> The API server must allow this site origin through CORS. Demo logins and assignments are browser-local, not API-authenticated.</div></section></>;
  }

  const pageContent = page === 'health-check'
    ? <><PageIntro eyebrow="CREW HEALTH / SELF-ASSESSMENT" title="Crew health check" description="Complete a private, simulated self-assessment for this mission." /><CrewHealthCheckFrame /></>
    : page === 'overview' ? renderOverview()
      : page === 'vitals' ? renderVitals()
        : page === 'wellbeing' ? renderWellbeing()
          : page === 'environment' ? renderEnvironment()
            : page === 'devices' ? renderDevices()
              : page === 'observations' ? renderObservations()
                : page === 'alerts' ? <><PageIntro eyebrow="CREW HEALTH / REVIEW QUEUE" title="Active alerts" description="Patterns returned by the sample API for human review." /><AlertList alerts={alerts} expanded /></>
                  : page === 'settings' ? renderSettings()
                    : renderOverview();

  const navItems = [
    { id: 'overview', label: 'Crew overview', icon: Activity }, { id: 'vitals', label: 'Vital signs', icon: HeartPulse }, { id: 'wellbeing', label: 'Sleep & wellbeing', icon: Moon }, { id: 'health-check', label: 'Crew health check', icon: ClipboardCheck }, { id: 'environment', label: 'Space environment', icon: Shield }, { id: 'devices', label: 'Device assignments', icon: Smartphone }, { id: 'observations', label: 'Observations', icon: ClipboardList }, { id: 'alerts', label: 'Alerts', icon: Bell }, { id: 'settings', label: 'API settings', icon: Settings2 },
  ];
  return <div className="app-shell"><aside className="sidebar"><Brand /><div className="sidebar-section-label">MISSION CONTROL</div><nav className="side-nav" aria-label="Main navigation">{navItems.map(({ id, label, icon: Icon }) => <button className={`side-nav__item ${page === id ? 'is-active' : ''}`} key={id} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={17} /> {label}{id === 'alerts' && <span className="nav-count">{alerts.length}</span>}</button>)}<button className={`side-nav__item ${page === 'register' ? 'is-active' : ''}`} onClick={() => { setAuthMode('register'); navigate('register'); }}><UserPlus size={17} /> Register astronaut</button></nav><div className="sidebar-spacer" /><div className="crew-mini"><div className="crew-avatar">{astronaut.call_sign.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</div><div><strong>{astronaut.name}</strong><span>{astronaut.expedition}</span></div></div><button className="sidebar-logout" onClick={signOut}><LogOut size={15} /> Sign out</button><div className="sidebar-foot"><span className="live-pip" /> Prototype environment</div></aside><main className="main-content"><header className="topbar"><div className="breadcrumb">MISSIONS <span>/</span> {astronaut.expedition.toUpperCase()} <span>/</span> <b>{(pageTitles[page] || 'Crew overview').toUpperCase()}</b></div><div className="topbar-actions"><div className={`connection ${dashboard?.source === 'live' ? 'connection--live' : ''}`}><span />{dashboard?.source === 'live' ? 'API connected' : 'Simulated feed'}</div><button className="icon-button" aria-label="Refresh page data" title="Refresh" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}><RefreshCw className={loading ? 'is-spinning' : ''} size={17} /></button><button className="avatar-button" aria-label="Sign out" title="Sign out" onClick={signOut}>{astronaut.call_sign.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</button></div></header><div className="page-wrap">{pageContent}<footer className="disclaimer"><Shield size={15} /><span><b>Prototype notice</b> Values, thresholds, alerts, and recommendations are simulated or illustrative. AstroVital is not clinically validated or a diagnostic system. The demo login and device assignments are local browser data.</span></footer></div></main>{toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}</div>;
}

function PageIntro({ eyebrow, title, description, action }) { return <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow} <span className="mission-tag">SIMULATION</span></div><h1>{title}</h1><p className="page-subtitle">{description}</p></div>{action && <div className="heading-actions">{action}</div>}</section>; }
function PanelHeading({ index, title }) { return <div className="section-heading"><div><span className="section-index">{index}</span><h2>{title}</h2></div></div>; }
function InfoStrip({ children }) { return <div className="info-strip"><CircleHelp size={15} /><span>{children}</span></div>; }
function RiskRow({ label, device, value, status, icon: Icon }) { return <div className="risk-row"><div className="risk-icon risk-icon--mint"><Icon size={16} /></div><div className="risk-copy"><strong>{label}</strong><span>{device}</span></div><div className={`risk-value ${value == null ? 'risk-value--muted' : ''}`}>{value ?? 'Unavailable'}<small>{value == null ? 'No data received' : String(status || '').replace(/_/g, ' ')}</small></div></div>; }
function EnvironmentCard({ title, metric, unit, icon: Icon, device }) { const available = metric?.value != null; return <article className="environment-card"><span className="metric-icon"><Icon size={17} /></span><span className="environment-name">{title}</span><strong>{available ? `${metric.value} ${unit}` : 'Unavailable'}</strong><small>{available ? String(metric.status || 'measured').replace(/_/g, ' ') : 'No data received'}</small><code>{device}</code></article>; }
function AlertList({ alerts, expanded = false }) { return alerts.length ? <div className="alert-stack">{alerts.map((alert) => <article className="alert-row" key={alert.id}><div className="alert-severity"><span /><b>{alert.severity}</b></div><div className="alert-body"><div className="alert-category">{alert.category} <span>·</span> {alert.id}</div><p>{alert.reason}</p><div className="recommendation"><Check size={14} /><span><b>Suggested next step</b> {alert.recommended_action}</span></div>{expanded && <div className="alert-explainer">Illustrative rule-based pattern. Review the source readings and complete the recommended check-in.</div>}</div></article>)}</div> : <div className="empty-alerts"><Check size={17} /> No active alerts for this astronaut.</div>; }

export default App;
