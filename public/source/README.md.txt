# AstroVital Crew Health Portal

Responsive prototype dashboard for simulated astronaut health observations.

The visual theme follows the [NASA Space Apps brand guidelines](https://www.spaceappschallenge.org/brand/): the published blue palette, a restrained neon-yellow accent, white content surfaces, and Overpass/Fira Sans typography. AstroVital retains its own identity and does not use NASA Space Apps logos.

## Portal pages

- Astronaut sign-in and registration
- Crew overview, vital signs, sleep and wellbeing, and space environment
- Crew health self-assessment, including body-map readings, symptom checks, emergency guidance, and flight-surgeon message drafts
- Per-astronaut simulated device assignments
- Observation history and simulated observation submission
- Active alerts and API settings

Existing `ASTRA-DEMO` profile IDs are retained for compatibility with saved demo data and API integrations.

## Illustrative health score

The overview displays an illustrative 0–100 estimate, not a medical measure. It is the equally weighted average of available component scores: heart rate scores 100 within 60–100 bpm and loses 2 points per bpm outside that band; blood oxygen maps 90–100% to 0–100; sleep duration maps 420 minutes to 100 and is capped there; and fatigue maps a 1–5 score inversely to 100–0. Missing readings are excluded from the average. The score is a prototype visualization, not a clinically validated assessment or diagnostic tool.

The overview trend plots the score at every recorded, valid check for those same components. Each check updates the recorded component and carries forward earlier valid readings for the other components; poor-signal, invalid, unavailable, unrelated, and undated observations are omitted. Sample history is illustrative and does not represent clinical data.

Sample crew profiles can sign in with these demo codes:

| Astronaut | ID | Demo code |
| --- | --- | --- |
| REEM | `ASTRA-DEMO-001` | `1420` |
| MONA | `ASTRA-DEMO-002` | `2605` |
| ALI | `ASTRA-DEMO-003` | `3142` |
| ZAINAB | `ASTRA-DEMO-004` | `4016` |

New registrations, demo codes, device assignments, and locally submitted observations are stored in the current browser only. This login is for prototype navigation, not security; it does not authenticate against a server or protect health data.

The crew health self-assessment is a standalone page embedded in the portal. Its readings and message drafts are illustrative, remain in page memory, and are not sent to a medical team. Emergency guidance is a prototype and is not a substitute for mission procedures or medical care.

## Run locally

Install Node.js, then run:

```powershell
npm install
npm run dev
```

Use the settings icon in the dashboard to set a compatible API base URL. Leave it empty to use the built-in illustrative data. The API server must allow browser requests from the dashboard origin (CORS).

## Source download

Browse and download individual source files from the public [AstroVital source directory](https://astra-health-monitor.vercel.app/source/). Files are served as `.txt` downloads to make them easier to share through email. An optional [AstroVital source bundle](https://astra-health-monitor.vercel.app/astrovital-source-code.zip) is also available; it includes the app source, the embedded health-check page, package manifests, this README, and the AstroVital SVG design sheet, but excludes generated dependencies and deployment metadata.

## APIs used

The dashboard uses the proposed AstroVital prototype API only when an API base URL is configured. With the URL empty, it uses built-in simulated data and does not make network API requests.

| Method and path | Purpose | Expected response |
| --- | --- | --- |
| `GET /api/v1/health/summary?astronaut_id=<id>` | Fetch one astronaut's latest status and grouped readings | Summary object with `astronaut_id`, `overall_status`, `last_updated`, `vital_signs`, `sleep`, `space_risks`, and `stress_wellbeing` |
| `GET /api/v1/alerts` | Fetch active review alerts | `{ "alerts": [...] }` with severity, category, reason, and recommended action |
| `POST /api/v1/observations` | Submit one simulated observation | `{ "accepted": true, "observation_id": "..." }` |

The observation POST body contains `astronaut_id`, `device_id`, `metric`, `value`, `unit`, `measured_at`, `source`, `quality`, and `status`. The dashboard sends `source: "simulated"` and `status: "measured"`. Quality values are `valid`, `poor_signal`, `invalid`, or `unknown`.

## How to enhance it

1. Add a backend with real user authentication and server-side astronaut/device authorization. The current demo PINs and profiles are browser-local and are not secure credentials.
2. Persist observations and device assignments in a database; add pagination and filtering to observation history.
3. Validate observation schemas and units on the server, reject unauthorized device/astronaut pairs, and keep unavailable, stale, and invalid readings distinct from normal measurements.
4. Add versioned, explainable trend rules and return the rule/source metadata with every alert; keep recommendations subject to human review.
5. Add API contract tests, request/error monitoring, audit logging, retention controls, and privacy/security review before handling real personal or health data.

These proposed endpoints are not official NASA or medical-device APIs. All prototype data, trends, thresholds, alerts, and recommendations are simulated or illustrative. AstroVital is not clinically validated and is not a diagnostic system.