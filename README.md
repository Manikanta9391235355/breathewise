# BreatheWise — AI-Powered Urban Air Quality & Family Health Assistant
### *Breathe smarter. Live healthier.*

> **"Know what the air is doing. Know what to do next."**  
> Developed for **PromptWars Virtual Challenge 06: Urban Air Quality Assistant**.

[![Live Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Production-000000?style=for-the-badge&logo=vercel)](https://breathewise-amber.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Manikanta9391235355/breathewise)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Air_Quality_&_Weather-4CAF50?style=for-the-badge)](https://open-meteo.com)

**Live Production URL:** [https://breathewise-amber.vercel.app](https://breathewise-amber.vercel.app)  
**Official GitHub Repository:** [https://github.com/Manikanta9391235355/breathewise](https://github.com/Manikanta9391235355/breathewise)  
**High-Definition Demo Video (720p HD):** [https://breathewise-amber.vercel.app/breathewise-demo.webm](https://breathewise-amber.vercel.app/breathewise-demo.webm)

---

## 1. Executive Summary & Product Vision

Severe winter smog, crop residue burning, and vehicular emissions subject millions of families across urban India and global metropolitan areas to hazardous particulate matter ($PM_{2.5}$ and $PM_{10}$). Most existing tools are either passive dashboards showing alarming red numbers or generic chatbots that give unhelpful platitudes like *"wear a mask"*.

**BreatheWise** is an action-oriented, environmental health intelligence platform. It bridges the gap between atmospheric science and daily life by translating complex meteorological and pollutant indices into:
1. **Low-emission daily routines** (safe non-motorized transit vs. diesel corridors).
2. **Diurnal outdoor activity windows** (identifying midday dispersion lulls).
3. **Clean Air Home Lab** (budget-aware indoor protections like wet mopping, kitchen exhaust protocols, and bedroom sealing).
4. **Honest, transparent impact metrics** (separating real sensor measurements, dispersion models, and qualitative exposure avoidance without fabricated numbers).

---

## 2. Visual Design System

Designed around a signature **Forest and Sage** high-end editorial aesthetic:
- **Color Palette:**
  - `Forest (#01472e)`: Primary brand identity and dark editorial text.
  - `Cream (#fefae0)`: Warm, inviting primary background.
  - `Sage (#ccd5ae)` & `Olive (#e9edc9)`: Soft contrasting section containers.
  - `Moss (#a3b18a)`: Secondary highlights and subtle accents.
  - **Calibrated Pollution Accents:** Good (`#2d6a4f`), Moderate (`#c8963e`), Poor (`#d97706`), Severe (`#9b2226`).
- **Typography:**
  - Display Font: **Anton** (massive, condensed editorial headline typography, `15vw - 23vw` hero headlines).
  - Body Font: **Inter** (high legibility, balanced line heights).
  - Utility Labels: Monospace uppercase with letter spacing `0.2em - 0.3em`.
- **Texture & Radius:**
  - Fixed SVG procedural noise overlay (`opacity: 0.04`, pointer-events non-blocking).
  - Generous organic curvature: `5rem` section containers, `2.5rem` cards, and pill-shaped interactive triggers.

---

## 3. Core Feature Architecture

### A. Air Intelligence Dashboard
- **US EPA AQI Standard (0–500):** Real-time calibrated index calculated using official EPA piecewise breakpoints.
- **Micro-Pollutant Sensors:** Real-time readings for $PM_{2.5}$, $PM_{10}$, $NO_2$, $O_3$, $CO$, and $SO_2$.
- **24-Hour Diurnal Forecast Trend:** Interactive Recharts area chart capturing the daily morning temperature inversion peak and midday thermal dispersion.
- **Dynamic Family Interpretation:** Automated contextual insights for children, seniors, and asthma sufferers.

### B. AI Daily Action Planner
- Server-side route powered by **Google Gemini API** (`gemini-2.5-flash`).
- Generates 6–8 structured daily interventions divided into **MORNING**, **MIDDAY**, **EVENING**, and **NIGHT**.
- Detailed attributes: *Action, Why It Matters, Expected Benefit, Effort, Cost, Qualitative Impact, and Completion state*.
- Graceful offline/demo mode with calibrated rules when no API key is provided.

### C. Smart Outdoor Activity Window
- 24-hour hour-by-hour timeline categorized into:
  - `BETTER OPTION` (diurnal dispersion lulls)
  - `USE CAUTION` (accumulating particles)
  - `LIMIT OUTDOOR ACTIVITY` (morning/nocturnal inversion peaks)
- **Scientific Reality Check:** Clarifies that relative lulls are not guarantees of clean air during severe regional smog.
- Practical indoor exercise alternatives (yoga mobility, bodyweight circuits, living room games).

### D. Clean Air Home Lab
- **Ventilation:** When to seal balconies vs. when to cross-ventilate.
- **Cooking Hygiene:** Running exhaust chimneys 1 min prior and 5 min after cooking; tadka/frying mitigation.
- **Cleaning Protocols:** Wet mopping and damp dusting to prevent particle resuspension (avoiding stiff brooms).
- **Filtration Tiers:** Zero-cost draft blockers, DIY MERV-13 box fans, and CADR True HEPA specifications.
- **Bedroom Sanctuary:** Nighttime door sealing for the critical 11 PM – 5 AM nocturnal smog peak.
- Persistent interactive habit checklist.

### E. Low-Emission Daily Routine
- Non-judgmental, safety-first routine planner.
- Advises against cycling/jogging on heavy diesel truck avenues during high smog.
- Batching errands, zero-idling at school gates, and metro adoption.

### F. Impact Tracker & Scientific Honesty Policy
- Explicit **3-Tier Data Architecture**:
  1. *Actual Measurements:* Direct sensor readings from Open-Meteo & Copernicus.
  2. *Model Estimates:* Diurnal boundary layer calculations.
  3. *Qualitative Impact:* Peer-reviewed exposure avoidance without fabricated percentage reductions or bogus life expectancy gains.
- Weekly consistency visualizer and local storage persistence.

### G. Ask BreatheWise (Conversational Assistant)
- Context-aware AI chat with real-time access to user location, current AQI, and household vulnerabilities.
- Quick prompt chips, message history persistence, and built-in medical disclaimers.

### H. Community Mode & Notifications
- *"Small actions. Cleaner neighborhoods."* civic challenges (Zero-idling zones, corridor wet-mopping drives, metro shifts).
- In-app notification center for inversion alerts and upcoming ventilation windows.

---

## 4. Technology Stack & API Integrations

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Server-side rendering, streaming, fast routing |
| **Language** | TypeScript 5.6 | Full type safety across environmental models |
| **Styling** | Tailwind CSS 3.4 | Forest/Sage editorial design system & custom utilities |
| **Icons** | Lucide React | High-contrast modern iconography |
| **Charts** | Recharts 2.15 | Responsive SVG diurnal area charts |
| **Generative AI** | Google Gemini API | Server-side route handler with structured JSON schemas |
| **Air Quality** | Open-Meteo Air Quality API | Real-time CAMS / Copernicus atmospheric data |
| **Weather** | Open-Meteo Weather API | Temperature, humidity, wind speed, and dispersion |
| **Geocoding** | Open-Meteo Geocoding API | Global and Indian city coordinates resolution |
| **Storage** | Browser LocalStorage | Local client persistence (zero database required) |

---

## 5. Local Setup & Execution

### Prerequisites
- Node.js (v18 or higher recommended; tested on v24.14.0)
- npm or yarn

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/breathewise.git
   cd breathewise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
   *(Note: BreatheWise runs in graceful Demo Mode if no key is configured).*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 6. Vercel Deployment Instructions

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In the project settings, configure the environment variable:
   - `GEMINI_API_KEY`: Your Gemini API Key
   - `GEMINI_MODEL`: `gemini-2.5-flash`
4. Click **Deploy**. Next.js App Router will automatically build and deploy the edge-ready static and server-rendered routes.

---

## 7. Safety, Ethics, and Transparency

- **Non-Clinical Guidance:** BreatheWise is an environmental health awareness platform, not a medical device. It encourages consultation with qualified medical professionals for clinical symptoms.
- **Data Transparency Badges:** Every air quality display is clearly watermarked with its operational status (`LIVE DATA`, `FORECAST`, or `DEMO DATA`).
- **No Fabricated Stats:** We explicitly avoid computing unvalidated numerical health promises or carbon grams saved, adhering strictly to scientific integrity.
