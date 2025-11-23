# Semantic Tracer

📦 **Public Archive - November 2025**

This project is being archived as a complete reference implementation of a local-first semantic layer for AI-powered analytics. It demonstrates best practices for MCP integration, dbt semantic bridging, and extending data pipeline infrastructure.

---

## Overview

Semantic Tracer is a local-first application for visualizing and exploring dbt semantic layers. It connects directly to your dbt project and Snowflake account to provide a real-time, interactive lineage graph of your metrics, dimensions, and entities.

## Features

-   **Local-First**: Your data and semantic models never leave your machine.
-   **dbt Semantic Layer Integration**: Connects to your existing `semantic_models.yml` file.
-   **Snowflake Integration**: Queries Snowflake for metadata and lineage information.
-   **Interactive Lineage Graph**: Uses React Flow to create a dynamic and explorable graph of your semantic layer.
-   **Tauri Backend**: A lightweight Rust backend ensures performance and security.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Application
```bash
npm run tauri:dev
```

### 3. Run Tests
```bash
npm test
```

## Tech Stack

| Category      | Technology          | Purpose                       |
|---------------|---------------------|-------------------------------|
| **Frontend**  | React 18 + TypeScript | UI framework                  |
| **Build**     | Vite 5              | Fast dev server & bundler       |
| **Canvas**    | React Flow 11       | Diagram rendering             |
| **Backend**   | Tauri (Rust)        | Local-first application shell |
| **State**     | Zustand 4           | State management              |
| **Styling**   | Tailwind CSS 3      | Utility-first CSS             |
| **Testing**   | Vitest + Playwright | Unit/E2E tests                |


## Project Structure

```
.
├── semantic-tracer/
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   └── tests/
├── src/
│   ├── components/
│   │   ├── Lineage/
│   │   └── ...
│   └── ...
├── src-tauri/
│   └── ...
└── ...
```
