# Twin Matrix UI (Frontend)

**[agent.twin3.ai](https://agent.twin3.ai/)** is the frontend interface for the Twin Matrix system, designed to demonstrate how a human-defined identity can be securely transformed into a personalized on-chain Agent capable of acting on the user's behalf.

This repository focuses on the UI and interaction layer, guiding users through identity creation, agent authorization, task execution, and verifiable settlement — without requiring prior knowledge of blockchain or agent systems.

---

## What This Interface Demonstrates

This frontend showcases three core ideas:

- **Human-defined identity**, not inferred identity
- **Personal Agents**, not generic bots
- **Verifiable agent actions**, not opaque automation

The UI is intentionally designed to help first-time users understand what they are doing, what they are authorizing, and why certain actions happen.

---

## High-level User Journey

The UI is structured around a clear, sequential flow:

1. Create and seal identity (Twin Matrix SBT)
2. Authorize and deploy personal Agents
3. Receive and execute tasks via Telegram
4. Review task history and agent activity on the web

Each step is visible, explainable, and reversible.

---

## 1. Identity Creation (Twin Matrix)

The onboarding flow begins by asking the user a simple question:

> *"How would you describe yourself?"*

Instead of surveys or behavioral tracking, the UI uses lightweight, intuitive selections (e.g. sport preferences in the demo) to let users express identity intentionally.

### Design Intent

- Avoid questionnaire fatigue
- Avoid hidden inference
- Treat identity as self-expression, not prediction

### What Happens Behind the UI

Each selection is mapped to an interpretable archetype distribution, which is then composed into a **256-dimensional Twin Matrix vector**.

This vector represents **preference structure**, not behavioral intensity.

Once confirmed, the identity is:

- Minted as a **Soulbound Token (SBT)**
- Stored on-chain as a verifiable identity state
- **Versioned**, allowing future updates without overwriting history

The UI clearly signals when an identity is sealed and immutable unless the user explicitly updates it.

---

## 2. Identity Versions & Transparency

The Identity page allows users to:

- Review their current identity version
- Update preferences
- Mint a new version on-chain

Each update produces a new version, preserving a full historical trail.
**Identity is treated as evolving, not static.**

---

## 3. Agent Creation & Authorization

After identity creation, users can deploy one or more personal Agents.

### Personal Agent Model

Agents are not global bots. Each Agent:

- Is created per user
- Has its own wallet
- Operates only within explicitly granted permissions

### Authorization Model

Identity signals are divided into four quadrants:

| Quadrant | Description |
|----------|-------------|
| Physical | Body & movement data |
| Mental | Cognitive & behavioral patterns |
| Digital | Online & device activity |
| Social | Interpersonal & community signals |

The UI allows users to:

- Choose which quadrant an Agent can access
- Set time or usage limits
- Revoke permissions at any time

### Technical Foundation

- **SBT** defines who the user is
- **ERC-8004** defines which Agent is allowed to act
- Together they form a verifiable **owner–agent relationship**

The frontend visualizes this relationship clearly, without exposing raw contract complexity.

---

## 4. Multi-Agent Support

The dashboard supports multiple Agents per user.

For each Agent, the UI shows:

- Agent address
- Authorization scope
- Wallet balance
- Task history

This design demonstrates that identity is not bound to a single agent, but can be **selectively delegated**.

---

## 5. Task Delivery via Telegram

Tasks are delivered through Telegram, chosen for its:

- Low friction
- Real-time interaction
- Familiar UX

### Task Types

| Type | Description |
|------|-------------|
| **Active Tasks** | Require accept / decline |
| **Passive Signals** | Informational only |

In the demo scenario, tasks simulate brands purchasing anonymized sport behavior insights.

> Users never send raw data.
> Agents act only within authorized identity scopes.

---

## 6. Task Execution & Settlement

When a task is accepted:

1. The Agent executes the task
2. The user confirms completion
3. Payment (e.g. USDT) is transferred directly to the Agent wallet

### Verification

- Transactions are visible on-chain
- Balances update in real time in the UI
- Completed, expired, and declined tasks are all preserved

This demonstrates **verifiable agent-to-agent exchange**, not platform-mediated trust.

---

## 7. Signal Records (Web Dashboard)

While Telegram handles real-time interaction, the web UI serves as a long-term system of record.

Signal Records display:

- Ongoing tasks
- Completed tasks and rewards
- Expired or declined tasks
- Authorization usage history

The dashboard is intentionally **read-focused**, emphasizing transparency and trust over exploration.

---

## Why This Frontend Matters

This UI is not just a visual layer. It demonstrates a shift in how agents should work:

- Agents with **identity provenance**
- Actions with **verifiable authorization**
- Users with **control**, not opacity

**Twin Matrix** provides the identity foundation.
This frontend shows how that identity becomes actionable through personal agents.

---

## Local Development

```sh
git clone https://github.com/gisellelaycc/sweet-ui-magic.git
cd sweet-ui-magic
npm install
npm run dev
```
