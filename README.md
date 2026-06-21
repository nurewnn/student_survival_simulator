# 🍳 How Cooked Are You? — Student Survival Simulator

> **A 14-week Malaysian university semester simulator powered by a Mamdani Fuzzy Logic Controller and Google Gemini AI.**

---

## 📖 Overview

**"How Cooked Are You?"** is a interactive student life simulator designed to model the messy, non-linear realities of surviving a university semester. While traditional academic performance trackers rely on rigid binary scales, this project implements a custom-built **Mamdani Fuzzy Inference System (FIS)** in JavaScript. 

It maps four subjective, overlapping inputs (Assignment Load, Sleep Hours, Wallet Balance, and Stress Level) to calculate a crisp **Student Survival Score** and determines if you are a **Thriving student** or an **Academic Victim**.

To add flavor, the simulator features roleplay interactions with a strict **Malaysian WhatsApp Mother** and a **Gen-Z Roommate**, powered dynamically by **Google Gemini 2.5 Flash**.

---

## 🛠️ Tech Stack & Architecture

- **Core Logic:** Pure JavaScript (Mamdani Fuzzy Inference Engine from scratch)
- **Frontend UI:** HTML5, Tailwind CSS (Liquid Glassmorphism), Custom CSS Canvas (dynamic visualization of membership functions & defuzzification curves), FontAwesome Icons
- **Backend Server:** Node.js (Vanilla HTTP/HTTPS server with zero external routing dependencies)
- **Generative AI:** Google Gemini 2.5 Flash API via secure backend proxy

---

## 🧠 Fuzzy Logic Model Design

The core of the simulator is the **Mamdani Fuzzy Logic Controller (FLC)** defined in [fuzzyEngine.js](file:///c:/Users/aniss/OneDrive/Documents/isp568/fuzzyEngine.js). It handles fuzzification, rule evaluation, aggregation, and defuzzification.

### 1. Fuzzy Variable Scopes & Membership Functions
We define triangular and trapezoidal membership functions (MF) for each variable:

| Variable | Range | Linguistic Sets & Shapes |
| :--- | :--- | :--- |
| **Assignment Load** | 0 - 100 | **Light** (Trapezoid: `[0,0,20,45]`) <br> **Packed** (Triangular: `[30,50,50,70]`) <br> **Overloaded** (Trapezoid: `[55,80,100,100]`) |
| **Sleep Hours** | 0 - 12 | **Zombie** (Trapezoid: `[0,0,3,5]`) <br> **Functioning** (Triangular: `[4,6,7,9]`) <br> **WellRested** (Trapezoid: `[8,10,12,12]`) |
| **Wallet Balance** | 0 - 100 | **Broke** (Trapezoid: `[0,0,15,35]`) <br> **Surviving** (Triangular: `[25,45,55,75]`) <br> **Stable** (Trapezoid: `[65,80,100,100]`) |
| **Stress Level** | 0 - 100 | **Chilling** (Trapezoid: `[0,0,25,45]`) <br> **Concerned** (Triangular: `[35,55,65,80]`) <br> **Screaming** (Trapezoid: `[70,85,100,100]`) |
| **Survival Score (Output)** | 0 - 100 | **AcademicVictim** `[0,0,10,25]` <br> **DeepFried** `[20,35,45,55]` <br> **Cooked** `[45,55,65,75]` <br> **HangingInThere** `[65,75,85,90]` <br> **Thriving** `[85,90,100,100]` |

### 2. Rule Base (81 Mamdani Rules)
Rather than hardcoding all 81 logical strings, the rules are generated programmatically by calculating an algebraic weight score from the combination of input states:
$$\text{Score} = \text{WorkloadWeight} + \text{SleepWeight} + \text{WalletWeight} + \text{StressWeight}$$
The system runs through all 81 permutations, evaluating their firing strengths ($\min$ operator) and combining them to form the aggregated output curve ($\max$ operator).

### 3. Defuzzification (Centroid Method)
The crisp output survival score is calculated using the **Center of Gravity (Centroid)** formula:
$$Z_{\text{COG}} = \frac{\sum_{i=0}^{100} z_i \cdot \mu_A(z_i)}{\sum_{i=0}^{100} \mu_A(z_i)}$$

---

## 🎮 Strategic Mini-Games

If your stats are failing, you can head over to the **Restoration Hub** to play three interactive canvas-based mini-games to recover your parameters:
1. **Maggi Chef (Reflex):** Catch ingredients (eggs, noodles) in your cup while avoiding cockroaches. Replenishes Wallet & reduces Hunger.
2. **Finals Crammer (Typing):** Speed-type falling fuzzy logic terms to absorb lecture slides. Reduces your active Assignment Load.
3. **Sleep Sheep (Clicking):** Tap on soft-glowing cosmic sheep to quiet your brain and sleep. Restores Sleep Hours & lowers Stress.

---

## 🤖 LLM-Fuzzy AI Advisor (Google Gemini)

Integrating real-time LLM reactions allows the game state to come alive:
- **Ask Mum (Malaysian WhatsApp Mother):** Strict yet loving advice. Speaks in classic Manglish/Bahasa Rojak (`lah`, `anak`, `makan`, `pergi tidur`).
- **Gen-Z Roommate:** Reacts instantly to your weekly choices in campus slang (`koyak`, `weyh`, `Zus Coffee`, `passenger`, `slay`).

---

## 🚀 Setup & Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A **Google Gemini API Key** (Get one for free at [Google AI Studio](https://aistudio.google.com/)).

### Installation
1. Clone this repository (or update your remote URL if cloned):
   ```bash
   git clone https://github.com/nurewnn/<YOUR-RENAMED-REPO-NAME>.git
   cd <YOUR-RENAMED-REPO-NAME>
   ```

2. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📸 Screenshots & UI

The interface uses a state-of-the-art cinematic dark mode featuring **Liquid Glassmorphism**, dynamic hover glows, a custom canvas representing active rules, and responsive layouts.

- **Welcome Landing:** Video-driven intro setup.
- **Dynamic Fuzzification Scope:** In-situ visual rendering of membership functions.
- **AI Mother Console:** Interactive WhatsApp-styled dialog box.
