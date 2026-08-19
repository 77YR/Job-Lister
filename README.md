# JobLister

Local-first job discovery and opportunity-ranking tool.

## Overview

JobLister helps you find relevant job opportunities by:
- Extracting structured information from your resume
- Retrieving fresh job listings through JobsPipe
- Matching your skills and experience against jobs
- Ranking opportunities by fit and freshness

**Privacy-first:** All personal data stays on your machine. No cloud backend required.

## Prerequisites

- Node.js 18+ and npm
- A free JobsPipe API key ([Get one here](https://jobspipe.com))

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd JobLister
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your JobsPipe API key

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and add your JobsPipe API key:

```
JOBSPIPE_API_KEY=your_actual_api_key_here
```

**Important:** Never commit your `.env` file or share your API key.

### 4. Start the application

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:3000`
- Frontend on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

## Project Status

**Current Milestone:** Milestone 0 (Foundation) ✅

### Completed
- ✅ Project scaffolding
- ✅ Local backend with health checks
- ✅ Frontend with routing
- ✅ SQLite database initialization
- ✅ Environment variable management
- ✅ Privacy boundaries (.gitignore)

### Upcoming Milestones

- **Milestone 1:** Resume → Profile (PDF extraction, skill normalization)
- **Milestone 2:** JobsPipe Retrieval (job search with quota management)
- **Milestone 3:** Deterministic Matching (skill/experience matching)
- **Milestone 4:** Opportunity Ranking (freshness scoring)

See `docs/implementation-spec.md` for full V1 scope.

## Architecture

```
JobLister/
├── src/
│   ├── client/          # React frontend
│   ├── server/          # Express backend
│   ├── shared/          # Shared types/constants
│   └── db/              # SQLite database
├── docs/                # Specification documents
└── local-data/          # Local database (git-ignored)
```

## Development Commands

```bash
# Start development servers (frontend + backend)
npm run dev

# Start backend only
npm run dev:server

# Start frontend only
npm run dev:client

# Build for production
npm run build

# Run production build
npm run start
```

## Privacy & Data

All personal information stays local:
- Resume files
- Extracted profiles
- Job search history
- Cached job listings

The repository excludes all personal data via `.gitignore`.

## V1 Design Principles

1. **Deterministic-first:** Core functionality works without AI
2. **Local-first:** Personal data never leaves your machine
3. **No shared credentials:** Each user supplies their own API key
4. **Quota-aware:** Respects JobsPipe free tier limits

## License

See [LICENSE](./LICENSE) file.

## Contributing

This project follows the implementation specification in `docs/implementation-spec.md`.

Before making changes:
1. Read `docs/implementation-spec.md`
2. Check `docs/current-state.md` for current status
3. Follow the milestone sequence (no skipping ahead)
4. Preserve deterministic implementations (no unnecessary AI)

## Support

For issues or questions, please refer to:
- Implementation spec: `docs/implementation-spec.md`
- Current state: `docs/current-state.md`
- Project instructions: `CLAUDE.md`
