> [!WARNING]
> 📦 **Public Archive - November 2025**
>
> This project is being archived as a complete reference implementation of a local-first application for visualizing and exploring dbt semantic layers. It demonstrates best practices for MCP integration, dbt semantic bridging, and extending data pipeline infrastructure.

# Semantic Tracer

<p align="center">
  <strong>A local-first application for visualizing and exploring dbt semantic layers.</strong>
  <br />
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a> •
  <a href="#contact">Contact</a>
</p>

---

## Overview

Semantic Tracer is a local-first application for visualizing and exploring dbt semantic layers. It connects directly to your dbt project and Snowflake account to provide a real-time, interactive lineage graph of your metrics, dimensions, and entities.

The primary goal of this project is to provide a reference implementation for local-first semantic layer visualization and lineage tracing. It demonstrates best practices for MCP integration, bridging with dbt semantics, and extending data pipeline infrastructure.

## Features

-   **Local-First**: Your data and semantic models never leave your machine, ensuring security and privacy.
-   **dbt Semantic Layer Integration**: Connects seamlessly to your existing `semantic_models.yml` file.
-   **Snowflake Integration**: Queries Snowflake for metadata and lineage information to build a comprehensive view.
-   **Interactive Lineage Graph**: Utilizes React Flow to create a dynamic and explorable graph of your semantic layer.
-   **Tauri Backend**: A lightweight Rust backend provides high performance and a secure application shell.
-   **Enhanced Data Exploration**: Provides tools to better understand and explore your semantic layer.

## Getting Started

Follow these steps to get Semantic Tracer up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Rust](https://www.rust-lang.org/tools/install)
-   [pnpm](https://pnpm.io/installation)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/sbdk-dev/semantic-tracer.git
    cd semantic-tracer
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

### Configuration

To connect Semantic Tracer to your dbt project and Snowflake account, you'll need to configure the following:

1.  **dbt Project**: Ensure your dbt project is properly configured with a `semantic_models.yml` file.
2.  **Snowflake**: Set up the necessary environment variables for Snowflake authentication.

## Usage

Once the application is running, you can:

-   **Explore the graph**: Navigate the interactive lineage graph to understand relationships between metrics, dimensions, and entities.
-   **Inspect nodes**: Click on nodes to view detailed information and metadata.
-   **Search**: Use the search functionality to find specific elements within your semantic layer.

## Tech Stack

| Category      | Technology                | Purpose                               |
| ------------- | ------------------------- | ------------------------------------- |
| **Frontend**  | React 18 + TypeScript   | UI framework for building the interface |
| **Build**     | Vite 5                    | Fast development server and bundler   |
| **Canvas**    | React Flow 11             | Library for rendering interactive diagrams |
| **Backend**   | Tauri (Rust)              | Framework for building local-first applications |
| **State**     | Zustand 4                 | State management for React            |
| **Styling**   | Tailwind CSS 3            | Utility-first CSS framework           |
| **Testing**   | Vitest + Playwright       | Unit and end-to-end testing           |

## Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── Audit/
│   │   ├── Catalog/
│   │   ├── Lineage/
│   │   ├── Search/
│   │   └── Setup/
│   ├── services/
│   └── types/
├── src-tauri/
│   ├── src/
│   │   ├── lineage/
│   │   └── parsers/
│   └── ...
└── ...
```

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any questions or inquiries, please reach out to the project maintainers.

