<div align="center">
  <br />
  <img src="https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Telegram%20Bot-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <br />

  # 🛡️ Alfareza.site | C2 Security Architecture
  **An elite Next.js 14 web application fortified with a real-time, zero-latency Telegram Security Operations Center.**

</div>

## 🚀 Overview

This repository houses the source code for [alfareza.site](https://alfareza.site), engineered as a secure, mission-critical application. Rather than relying on traditional admin dashboards, this project pushes the absolute limits of webhook integrations by building an exclusive **Command & Control (C2) interface directly inside Telegram**. 

This system intercepts malicious web traffic and instantly dispatches raw, zero-latency attack vectors to a private Telegram channel. From there, administrators can execute 2-step verified mitigations entirely from their mobile devices.

---

## 💎 Core Capabilities

### 🪤 Adaptive Honeypots & Zero-Latency Alerts
- **Intrusion Detection:** Intercepts automated scanners and malicious bots targeting sensitive directories (e.g., `/.env`, `/wp-admin`, `.git`).
- **Zero-Latency Dispatch:** Bypasses heavy AI analysis to deliver deterministic, hardcoded tactical alerts instantly to Telegram, ensuring sub-second response times.
- **Explicit Block Status:** Alerts include immediate visual confirmation of IP block status alongside quick-action mitigation buttons.
- **Automated Logging:** Writes all honeypot triggers into PostgreSQL (`activity_logs`) for long-term auditing.

### 🎛️ Interactive Telegram C2 Dashboard 
Invoking the `/menu` command renders a dynamic, stateful UI displaying your entire site's infrastructure in real time:
- 📊 **Large-Scale Accurate Analytics:** Uses optimized Supabase aggregations (`count: exact`) to bypass standard PostgREST 1K row limits, delivering precise real-time traffic stats directly to the C2 dashboard.
- ⚙️ **Maintenance Toggles:** A stateful button that reflects (ON) or (OFF)—allowing you to instantly freeze frontend functionality.
- 📋 **Audit Viewers:** Fetches your `activity_logs` directly into Telegram to read the last 5 high-profile backend actions.

### 🛡️ 2-Step Verified Destructive Mitigations
Mistake-proof design. Every destructive action forces a secondary confirmation (`⚠️ Are you sure?`) via Telegram Inline Keyboards:
- 🔓 **Unblock IPs Natively:** Security alerts arrive with an inline `[🔓 Unblock IP]` button to instantly forgive IP bans.
- 🗑️ **Delete / Curate Messages:** Inbox curation with dedicated `✅ Mark Read` / `🔴 Mark Unread` and `🗑 Delete` workflows, backed by deep routing logic so users never lose their menu state.

### 📬 Real-Time Public Contact Bridge
- **Triage Pings:** Submissions from the Next.js frontend are instantly forwarded to the SOC channel.
- **Workflow State Management:** Provides `[📖 Read Message]`, `[👀 Ignore]`, and deletion shortcuts to prioritize critical communications without logging into the Supabase portal.

---

## 🏗️ Architecture Flow

```mermaid
graph TD
    A[Public Next.js Frontend] -->|Contact Form Submission| B(API: /api/contact)
    B -->|Insert Row| C[(Supabase db: messages)]
    B -.->|Real-time Triage Prompt| D[Telegram SOC Channel]
    
    E[Malicious Bot Activity] -->|Honeypot Trigger| F[(Supabase db: activity_logs)]
    F -.->|Webhook Post| G(API: /api/webhooks/security-alert)
    G -->|Extract Metadata| J[Format Native Alert]
    J -.->|Dispatches Native Alert| D
    
    D -->|/menu Command| I(API: /api/telegram/webhook)
    I <-->|Fetch Stats & Validate States| C
    I -.->|Renders C2 Dashboard| D
````

-----

## ⚙️ Environment Configuration

To run the SOC locally or on Vercel, duplicate `.env.example` as `.env.local` and configure your API tokens. Note: The `SUPABASE_SERVICE_ROLE_KEY` is strictly required to bypass frontend RLS and execute automated C2 workflows securely.

```bash
# .env.example

# ------------- SUPABASE -----------------
NEXT_PUBLIC_SUPABASE_URL="[https://your-project-id.supabase.co](https://your-project-id.supabase.co)"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-schema-key"
SUPABASE_SERVICE_ROLE_KEY="your-secret-service-role-key"
SUPABASE_WEBHOOK_SECRET="your-custom-secret-string" 

# -------------- TELEGRAM ----------------
TELEGRAM_BOT_TOKEN="your-botfather-token"
TELEGRAM_CHAT_ID="your-private-channel-id"
```

## 🔒 Security Posture

  - **Pre-flight Payload Dropping:** All C2 callback queries securely cast and strictly evaluate the incoming requests against `TELEGRAM_CHAT_ID`, silently dropping unauthenticated probes.
  - **Secret Gateway Validation:** PostgreSQL outbound webhooks rely entirely on `x-webhook-secret` headers before firing localized Node.js routines.
  - **Stateless Session Immunity:** Because this operates on direct Telegram session hashes and WAF layers, the C2 server natively deflects XSS or CSRF session-hijacking attempts common in traditional SSR admin wrappers.

\<br /\>
\<div align="center"\>
\<i\>Deployed onto the edge with Vercel • Secured by Supabase.\</i\>
\</div\>