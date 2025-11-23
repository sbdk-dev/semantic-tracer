# Semantic Tracer: Project Overview

**Objective**: To create a reference implementation of a local-first semantic layer for AI-powered analytics.

This document provides a high-level overview of the Semantic Tracer project, its core features, and the technology stack.

---

## Core Features

### 1. Local-First Semantic Layer
- **No data leaves your machine**: All data processing and visualization happens locally.
- **dbt Semantic Layer Integration**: Seamlessly connects to your existing dbt semantic models.
- **Snowflake Integration**: Directly queries Snowflake to pull metadata and lineage information.

### 2. AI-Powered Analytics
- **Natural Language to SQL**: Aims to provide a conversational interface for data exploration (future goal).
- **Automated Lineage Visualization**: Automatically generates lineage diagrams from dbt and Snowflake metadata.

### 3. Interactive Visualization
- **React Flow Canvas**: A highly interactive and customizable canvas for visualizing data lineage.
- **Custom Nodes**: Different node types for different semantic layer components (e.g., metrics, dimensions, entities).
- **Dynamic Layouts**: Automatic layout of complex lineage graphs.

---

## Technology Stack

- **Frontend**: Vite + React 18, TypeScript
- **Visualization**: React Flow v11+
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend (Local)**: Tauri (Rust)
- **AI Integration**: Anthropic Claude API (for future development)
- **Analytics**: PostHog (for usage analytics)