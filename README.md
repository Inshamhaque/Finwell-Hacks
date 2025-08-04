# Finwell / FinBot Personal Finance Suite

A dark-themed personal finance web app combining:

- Progressive onboarding & account linking  
- JWT authentication with “remember me”  
- Financial dashboard with charts and AI stock suggestions  
- Receipt OCR extraction and transaction creation  
- Conversational AI assistant (FinBot) powered by OpenAI using contextual prompts  
- Educational tracks and quizzes to improve users’ financial literacy  
- Consistent navy/indigo gradient UI with skeleton loaders and markdown-rendered replies  

---

## Table of Contents

1. [Key Features](#key-features)  
2. [Architecture Overview](#architecture-overview)  
3. [Directory / Component Breakdown](#directory--component-breakdown)  
4. [Getting Started](#getting-started)  
5. [Environment Variables](#environment-variables)  
6. [Backend API Contracts](#backend-api-contracts)  
7. [Styling & Theme](#styling--theme)  
8. [Skeleton Loaders](#skeleton-loaders)  
9. [Educational Tracks & Quiz](#educational-tracks--quiz)  
10. [Security Considerations](#security-considerations)  
11. [Development Workflow / Scripts](#development-workflow--scripts)  
12. [Future Enhancements](#future-enhancements)  
13. [Troubleshooting](#troubleshooting)  
14. [License](#license)

---

## Key Features

- **Onboarding flow**: Multi-step signup (`StepOne`, `StepTwo`, `StepThree`) collecting basic info, financial preferences, and account selection with prefill support from existing session.  
- **Authentication**: Sign-in with “remember me” and JWT persisted in `localStorage`.  
- **Dashboard**: Displays current balance, credited/debited totals, recent transactions, spending categories, investment performance, and AI stock recommendations.  
- **FinBot Chat**: Frontend-only OpenAI integration (GPT-4 Turbo) that builds prompts from selected account context and renders answers with markdown (`react-markdown` + `remark-gfm`).  
- **OCR Receipt Scanner**: Upload receipt images, extract structured transaction details via backend OCR, allow manual corrections, and submit transactions.  
- **AI Stock Suggestions**: Backend-provided stock recommendations displayed with reasoning, risk level, and metadata.  
- **Educational Tracks & Quiz**: Financial education modules where users can take quizzes to assess and improve their understanding.  
- **Theme**: Unified dark/navy gradient aesthetic with rounded cards, accent gradients, focus states, and responsive layout.  
- **Skeleton loaders**: Improve perceived performance for metrics, forms, and content while data is loading.

---

## Architecture Overview

- **Frontend**: React application using functional components/hooks, styled via utility classes (Tailwind-style) with no external config modifications required.  
- **Backend**: REST API managing authentication, user profiles, accounts, transactions, OCR parsing, stock recommendations, and user education progress/quiz evaluation.  
- **AI Integration**: Direct frontend call to OpenAI for FinBot, using user/account context to shape responses.  
- **Persistence**: JWT, selected account, and remembered email stored in `localStorage`.  

---

## Directory / Component Breakdown

### Authentication / Onboarding

- `Signin.jsx` — Login form with “remember me”; saves JWT.  
- `Signup.jsx` — Oversees multi-step sign-up.  
  - `StepOne.jsx` — Name, email, password.  
  - `StepTwo.jsx` — Financial preferences (budget, investment skill).  
  - `StepThree.jsx` — Account selection or linking with prefill support.

### Dashboard

- `FinancialDashboard.jsx` — Overview of finances: balance, transactions, spending vs budget, investment performance, stock suggestions, and embedded `ChatBot`.

### Chat Assistant

- `ChatBot.jsx` — Builds system prompt from user context, sends question to OpenAI, displays markdown-rich responses.

### OCR Scanner

- `OCRReceiptScanner.jsx` — Upload receipts, run OCR, edit extracted transaction, assign categories, and submit to backend.

### Education & Quiz

- Components/pages managing educational tracks, presenting lessons/tips, and rendering quizzes to capture user knowledge and progress.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)  
- Backend server running with required endpoints  
- OpenAI API key (for FinBot prototype)

### Installation

```bash
# Clone or unzip the repository
cd /Finwell-Hacks

# Install dependencies for both frontend and server
cd frontend
npm install

cd ../server
npm install
