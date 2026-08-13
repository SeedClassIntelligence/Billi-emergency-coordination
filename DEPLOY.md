# Deploying Billi — the whole checklist

Everything here runs in **Google Cloud Shell** (the terminal button in
console.cloud.google.com). It is already authenticated, so nothing needs
installing locally. Project **`billi-503602`**, account
**`legaltriggerframework@gmail.com`** — not the other Google account.

Live service: **billi-platform**, region **us-central1**
<https://billi-platform-467802610371.us-central1.run.app>

---

## The short version

```bash
git checkout -B master origin/master && git pull
```

then build, then deploy, then warm it. Each step below is one paste.

---

## 1. Get the code Cloud Shell will build

```bash
cd ~/Billi-emergency-coordination && git checkout -B master origin/master && git pull && git log --oneline -3
```

Check the top commit matches what you expect. If it doesn't, nothing after
this point is deploying what you think it is.

## 2. Find the image path you're already using

Don't guess this — ask the running service:

```bash
gcloud run services describe billi-platform --region us-central1 --format='value(spec.template.spec.containers[0].image)'
```

Copy what it prints. It looks like `gcr.io/billi-503602/billi-platform` or a
`...-docker.pkg.dev/...` path. That exact string is `<IMAGE>` below.

## 3. Build

```bash
gcloud builds submit --tag <IMAGE>
```

Takes a few minutes and streams the build log live. If it fails, the reason is
in that stream — `gcloud builds log` tends to come back empty, so read it here.

## 4. Deploy

```bash
gcloud run deploy billi-platform --image <IMAGE> --region us-central1 --allow-unauthenticated
```

`--image` carries the existing environment variables forward unchanged. That
means a redeploy will **not** fix a bad key, and also will not wipe the Twilio
credentials.

## 5. Confirm the new code is actually live

```bash
curl -s https://billi-platform-467802610371.us-central1.run.app/landing.html | grep -c "6 Live Demonstrations"
```

`1` means the six-scenario build is serving. `0` means the deploy didn't take.

## 6. Confirm Gemini is live *on the deployed host*

A working local `.env` proves nothing about Cloud Run — the key gets there a
completely different way. This once ran for days on the literal placeholder
string `YOUR_GEMINI_API_KEY` with every AI card quietly serving its fallback.

```bash
curl -s -X POST https://billi-platform-467802610371.us-central1.run.app/api/v1/context/summarize -H "Content-Type: application/json" -d '{"incidentId":"PROBE","protectedPerson":{"name":"Maya Johnson","age":11},"timelineEvents":[{"event":"Maya: Help me!"}]}'
```

Look for `"aiProvider":"gemini-live"` and an `"aiModel"` naming the model.
`"deterministic-fallback"` coming back in under a second means no successful
model call happened — bad key, or quota spent.

---

## Before judging or recording

**Keep an instance warm.** Cold start is ~40 seconds of gateway errors while
the 13 internal services boot. A judge opening a cold link sees an error page.

```bash
gcloud run services update billi-platform --region us-central1 --min-instances=1
```

Set it back to `--min-instances=0` afterwards. This is the only setting here
that costs money while idle.

**When you upgrade Gemini to a paid tier**, point both model tiers at the same
premium model — no code change, no rebuild:

```bash
gcloud run services update billi-platform --region us-central1 --update-env-vars GEMINI_MODEL_PRIMARY=gemini-3.5-flash,GEMINI_MODEL_LIGHT=gemini-3.5-flash
```

**To replace the Gemini key**, always use a prompt rather than pasting the key
into a command — `-s` keeps it off screen and out of the transcript, and
`--update-env-vars` merges instead of replacing the whole env set the way
`--set-env-vars` would:

```bash
read -s -p "Paste Gemini key: " K && echo && gcloud run services update billi-platform --region us-central1 --update-env-vars GEMINI_API_KEY="$K"
```

---

## If the build fails on permissions

This project was never bootstrapped through the normal Cloud Run console flow,
so the default compute service account
(`467802610371-compute@developer.gserviceaccount.com`) has had to be granted
roles one at a time as each failure surfaced: `roles/storage.objectViewer`
(source upload), `roles/artifactregistry.writer` (image push),
`roles/logging.logWriter` (build logs). All three are already granted. If a
new one appears, the error names the exact role — grant that one and re-run.
