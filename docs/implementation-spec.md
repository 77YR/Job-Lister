# Local-First Job Discovery & Resume Intelligence

## Implementation Specification

**Status:** Implementation specification
**Primary implementation target:** V1
**Repository:** Public GitHub repository
**Deployment model:** Local/self-hosted; no developer-operated public service
**Job provider:** JobsPipe
**AI in V1:** None
**V1 cost target:** $0 application cost; each user supplies their own free JobsPipe API key

---

# 1. Product Definition

The application is a **local-first job discovery and opportunity-ranking tool**.

The user provides:

* A PDF resume
* Desired employment type
* Salary requirements
* Location / remote preferences
* Maximum acceptable posting age
* Optional search preferences

The application:

1. Extracts structured information from the resume.
2. Retrieves job listings through JobsPipe.
3. Normalizes the job information.
4. Applies explicit user filters.
5. Matches the candidate's skills and experience against jobs.
6. Separately evaluates job freshness/opportunity.
7. Produces a ranked list of jobs worth investigating.
8. Links the user to the original job listing.

The application is **not** an autonomous applicant, AI resume writer, or LinkedIn replacement.

Its purpose is:

> **Help the user find the jobs that are worth spending time applying to.**

---

# 2. V1 Scope — Hard Boundary

**V1 consists ONLY of Milestones 0–4.**

```text id="k8c5jw"
V1
├── Milestone 0 — Foundation
├── Milestone 1 — Resume → Profile
├── Milestone 2 — JobsPipe Retrieval
├── Milestone 3 — Deterministic Matching
└── Milestone 4 — Opportunity Ranking
```

## V1 explicitly contains no AI.

Do not implement:

* LLM integration
* OmniRoute integration
* AI resume extraction
* AI job parsing
* AI match explanations
* Semantic embeddings
* Semantic skill matching
* AI-generated resumes

If a feature can be implemented deterministically, it must be implemented deterministically.

An agent must **not** interpret future AI functionality as unfinished V1 work.

---

# 3. Post-V1 Scope

The following are future possibilities and require explicit project-owner approval.

## Milestone 5 — Optional AI Enhancement

Potential:

* AI-assisted resume interpretation
* AI-assisted job interpretation
* AI-generated explanations
* Semantic matching
* OmniRoute integration

## Milestone 6 — Personal Workflow

Potential:

* Saved jobs
* Ignored jobs
* Search presets
* Notes
* Application tracking
* Alerts

## Milestone 7 — Resume Builder

Potential:

* Reusable experience blocks
* Project blocks
* Skill blocks
* Job-specific resume generation
* Resume preview
* PDF export

None of these should begin automatically after V1.

---

# 4. Core Design Principles

## 4.1 Deterministic first

The core application must work without an AI service.

```text id="c0k5sh"
Resume
 ↓
Local extraction
 ↓
Structured profile
 ↓
JobsPipe
 ↓
Normalized jobs
 ↓
Deterministic filtering
 ↓
Deterministic matching
 ↓
Opportunity ranking
 ↓
Results
```

This makes the system predictable, explainable, cheap, and easy for another agent to continue developing.

---

## 4.2 Local-first

Personal information persists locally but must not leave the user's machine except where explicitly required by an external operation.

Local data includes:

* Resume files
* Extracted resume text
* Candidate profile
* Preferences
* Locally cached jobs
* Future saved-job/application information

There is no required cloud backend.

---

## 4.3 No shared credentials

Every installation/user supplies their **own JobsPipe API key**.

The repository must never contain:

* A shared JobsPipe key
* A developer API key
* Hardcoded credentials
* User credentials
* Personal data

Setup documentation must explicitly explain how the user supplies their own key.

---

# 5. JobsPipe Cost Constraint

JobsPipe's free allocation is a **hard V1 constraint**.

The relevant accounting unit is **jobs returned**, not search requests.

Therefore:

> A search returning 100 jobs consumes substantially more quota than a search returning 10 jobs.

The application must optimize for useful results per returned job.

The project does not assume unlimited free usage.

---

# 6. Explicit Quota Guardrails

To make quota behavior testable, V1 uses these initial guardrails:

### Per search session

**Maximum 50 jobs may be retrieved.**

A "search session" means one user-initiated search/refresh operation, including all JobsPipe result pulls caused by that operation.

### Daily target

**The application should target no more than 200 returned jobs per calendar day.**

This is a safety target rather than a mechanism for bypassing provider limits.

### Monthly target

The application should target **no more than 800 returned jobs per month**, leaving approximately 20% of the nominal 1,000-job free allocation as a safety margin.

These numbers are intentionally configurable.

They are starting guardrails, not claims that these are mathematically optimal.

If later testing shows that another allocation is more useful, change the configuration and update this specification.

### Hard behavior

The application must never intentionally exceed the configured per-search limit.

If a search would exceed the configured budget:

1. Reduce the requested result count, or
2. Ask the user whether to continue only if the remaining quota is known and sufficient.

Never silently exceed the guardrail.

---

# 7. JobsPipe Preview Before Retrieval

JobsPipe's free preview/masked-result functionality should be used wherever supported.

The intended flow is:

```text id="p0w1xr"
User Search
    ↓
JobsPipe Preview
    ↓
Estimate candidate count
    ↓
┌─────────────────────────────┐
│ Too many results?            │
│ Narrow search/filter first   │
└──────────────┬──────────────┘
               ↓
       Full result retrieval
```

Preview requests and zero-result searches should not be treated as consuming the same job-return quota as full result retrieval.

The application should use preview information to avoid blindly requesting oversized result sets.

### Example

If a query estimates:

```text
1,400 possible jobs
```

the application should **not** simply request 50 and stop.

It should first consider narrowing through available provider filters such as:

* Job type
* Location
* Recency
* Search terms
* Other relevant JobsPipe filters

The goal is to obtain a useful candidate set without wasting the free allocation.

---

# 8. Search Strategy

Searches should be broad enough to discover relevant jobs but narrow enough to respect quota.

The application should generate a **small number of deliberate queries**, not one query per skill.

Bad:

```text id="08p6c0"
Python
Java
React
SQL
AWS
Docker
...
```

Better:

```text id="4o3i7k"
Software Engineer Intern
Backend Engineer Intern
Full Stack Engineer Intern
```

Provider-side filters should be used where they reduce irrelevant returned jobs.

Local filtering remains responsible for candidate-specific matching.

---

# 9. Quota Tracking and Caching

The application should locally track:

* Jobs retrieved
* Search sessions
* Approximate current-month usage
* Approximate daily usage
* Configured limits
* Cached result age

If exact provider quota information is unavailable, local usage should be tracked conservatively.

### Caching behavior

Repeated searches should reuse fresh local results where possible.

Examples:

```text id="r3zv5n"
Same query + same filters shortly afterward
→ use cache
```

```text id="3c4j9w"
User changes only local matching preferences
→ re-rank cached jobs
```

```text id="ly6s8m"
User explicitly requests fresh listings
→ perform new JobsPipe retrieval if quota permits
```

The user should not consume quota merely to change a local filter.

---

# 10. High-Level Architecture

```text id="lv4hgu"
┌──────────────────────────────────────────────┐
│                    Browser                   │
│                                              │
│  Resume │ Preferences │ Results │ Profile    │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│              Local Application               │
├──────────────────────────────────────────────┤
│ Resume Processing                            │
│ Profile Management                           │
│ JobsPipe Integration                         │
│ Job Normalization                            │
│ Deduplication                                │
│ Filtering                                    │
│ Matching                                     │
│ Opportunity Ranking                          │
│ Quota Tracking                               │
│ Local Persistence                            │
└──────────────┬────────────────┬───────────────┘
               │                │
       ┌───────▼────────┐ ┌─────▼───────────┐
       │ Local Database │ │ External Service │
       │                │ │                  │
       │ Profile        │ │ JobsPipe         │
       │ Jobs           │ │                  │
       │ Preferences    │ │                  │
       │ Usage          │ │                  │
       └────────────────┘ └──────────────────┘
```

There is no developer-operated backend.

---

# 11. Core Domain Objects

## UserProfile

Contains:

* Skills
* Education
* Experience
* Projects
* Certifications
* Candidate level
* Graduation information where applicable

The profile becomes the candidate's structured source of truth.

---

## SearchPreferences

Contains:

* Internship/full-time
* Part-time/full-time
* Salary range
* Location
* Remote/hybrid/on-site preference
* Maximum posting age
* Optional keywords

Hard requirements and preferences must be distinguishable.

---

## JobPosting

Normalized representation of a job.

Conceptually:

* Internal ID
* Provider
* Original job URL
* Title
* Company
* Description
* Location
* Remote status
* Employment type
* Salary
* Posting timestamp
* Seniority
* Skills/requirements
* Raw provider information where useful

The rest of the application must not depend directly on the JobsPipe response schema.

---

## MatchResult

Contains:

* Match score
* Opportunity score
* Final score
* Matched skills
* Missing skills
* Experience fit
* Education fit
* Requirement conflicts
* Ranking factors

---

# 12. Resume Processing — V1

The V1 resume pipeline is local and deterministic.

```text id="l9s9qf"
PDF
 ↓
Local text extraction
 ↓
Structured parsing
 ↓
UserProfile
 ↓
User review/edit
 ↓
Local persistence
```

AI is not permitted as a required dependency for this milestone.

The parser should handle imperfect layouts defensively.

The user must be able to correct extracted information.

---

# 13. Skill Normalization and Hierarchy

Skill normalization is required in Milestone 1.

Examples:

```text id="ly6r24"
Postgres → PostgreSQL
JS → JavaScript
React.js → React
```

V1 must also support a **small deterministic skill hierarchy** where relationships are useful.

Examples:

```text id="n6o3i6"
Spring Boot
 └── Java
```

```text id="2v4h31"
PyTorch
 └── Python
```

This does **not** mean that every skill must have a manually constructed hierarchy.

The implementation should provide a maintainable mechanism for representing known parent/child relationships.

Do not introduce embeddings or semantic similarity.

### Milestone 1 requirement

Skill normalization **and basic hierarchical relationships** are both part of the required V1 profile/matching foundation.

---

# 14. Job Retrieval Pipeline

```text id="h0d7wv"
SearchPreferences
       ↓
Preview query
       ↓
Estimate result count
       ↓
Narrow if necessary
       ↓
Quota check
       ↓
Full JobsPipe retrieval
       ↓
Normalized JobPosting objects
       ↓
Deduplication
       ↓
Local cache
       ↓
Hard filtering
```

JobsPipe is the only provider implemented in V1.

---

# 15. JobsPipe Adapter

The system should contain a provider boundary:

```text id="qz7d5j"
JobProvider
    ↓
JobsPipe implementation
```

The adapter is responsible for:

* Authentication
* Provider-specific parameters
* Preview requests
* Full retrieval
* Provider errors
* Response parsing
* Conversion into JobPosting objects

The rest of the application operates on normalized jobs.

Do not implement additional providers during V1.

---

# 16. Job Normalization

Normalize:

* Titles
* Company names
* Locations
* Remote status
* Employment type
* Salary
* Dates
* Seniority
* Skills
* URLs

Provider-specific quirks belong inside the provider/normalization boundary.

---

# 17. Deduplication

Use progressively weaker deterministic identifiers:

1. Reliable provider ID
2. Canonical job URL
3. Company + normalized title + location
4. Additional deterministic signals if required

Do not add semantic similarity merely for deduplication.

---

# 18. Hard Filtering

Explicit requirements are evaluated before scoring.

Examples:

```text id="5d0bax"
Internship only
→ reject incompatible positions
```

```text id="m6jvws"
Remote required
→ reject known on-site positions
```

```text id="z3v9c5"
Salary minimum
→ reject jobs clearly below threshold
```

```text id="6c1s4f"
Maximum age = 48 hours
→ reject older jobs
```

A job violating an explicit hard constraint cannot receive a high ranking merely because other characteristics are attractive.

---

# 19. Deterministic Matching

Initial weighted model:

| Factor                   |   Weight |
| ------------------------ | -------: |
| Required skill coverage  |      35% |
| Preferred skill coverage |      15% |
| Experience-level fit     |      15% |
| Education fit            |      10% |
| Employment-type fit      |      10% |
| Salary fit               |       5% |
| Location fit             |       5% |
| Recency                  |       5% |
| **Total**                | **100%** |

Weights must be centralized and configurable.

The scoring system must preserve intermediate values so the application can explain a result without AI.

---

# 20. Match Score vs Opportunity Score

## Match Score

> How well does this candidate fit the job?

## Opportunity Score

> How attractive is this job to pursue right now?

Opportunity signals may include:

* Posting age
* Applicant count when reliably available
* Freshness
* Other deterministic information

Applicant counts must never be invented or inferred as fact.

If unavailable, the UI should say so.

---

# 21. Final Ranking

The final result combines:

```text id="4d2zli"
Candidate Fit
+
Current Opportunity
```

The exact formula remains configurable.

Example:

```text id="n5z5c7"
92% Match
Posted 3 hours ago

Strong matches:
✓ Python
✓ Java
✓ SQL
✓ REST APIs

Potential gap:
✗ AWS

Opportunity:
🔥 Very recent
```

The system assists the user's decision; it does not apply automatically.

---

# 22. Local Persistence

A lightweight local database such as SQLite is appropriate.

Persistent data may include:

* UserProfile
* SearchPreferences
* JobPosting records
* Cached searches
* Usage/quota tracking
* Future user workflow data

Persistence is intentional.

The privacy boundary is **not "nothing touches disk."**

The privacy boundary is:

> **Personal information remains local and is never accidentally committed to or distributed through the public repository.**

---

# 23. Public Repository Boundary

The GitHub repository is intended to be public.

It must never contain:

* Resume files
* Extracted resume text
* User profiles
* Search history
* Personal job data
* Local database files
* API keys
* Environment secrets
* Generated personal documents
* Machine-specific configuration

Repository configuration must explicitly exclude local/private artifacts.

Safe examples and documentation may be committed.

---

# 24. User Interface

## Onboarding

* Explain local-first behavior
* Explain JobsPipe dependency
* Explain that the user supplies their own free JobsPipe API key
* Configure the local key
* Upload resume
* Review profile

## Search

Allow:

* Internship/full-time
* Part/full-time
* Salary
* Location
* Remote preference
* Maximum posting age
* Optional keywords

## Results

Display:

* Title
* Company
* Location
* Posting age
* Salary when available
* Match score
* Opportunity indicator
* Matched skills
* Missing skills
* Original listing link

## Profile

Allow editing of:

* Skills
* Experience
* Education
* Other extracted information

---

# 25. Explicit Non-Goals for V1

Do **not** build:

* AI/LLM integration
* OmniRoute integration
* Semantic matching
* Vector databases
* RAG
* Autonomous applications
* Automatic application submission
* LinkedIn scraping
* Multiple job providers
* Public hosted SaaS infrastructure
* Shared API credentials
* Account/authentication infrastructure
* AI-generated applicant counts
* AI-generated resumes
* Resume tailoring
* Agent swarms

These exclusions are intentional architectural decisions.

---

# 26. Milestone 0 — Foundation

## Goal

The application can run locally with safe configuration and clean boundaries.

## Required

* Frontend
* Local backend
* Local persistence
* JobsPipe configuration
* User-provided JobsPipe API key
* Safe secret handling
* Repository privacy boundaries
* Basic error handling
* Current-state documentation
* Public-repository license selection

## Goal Point

A fresh user can:

1. Clone the repository.
2. Follow setup instructions.
3. Provide their own JobsPipe key.
4. Start the application locally.

No developer-operated service is required.

---

# 27. Milestone 1 — Resume → Profile

## Goal

Turn a PDF resume into an editable local UserProfile.

## Required

* PDF upload
* Local text extraction
* Structured parsing
* Skill normalization
* Basic skill hierarchy
* Experience extraction
* Education extraction
* User review/editing
* Local persistence

## Goal Point

The application has a useful structured candidate profile independent of the original PDF.

---

# 28. Milestone 2 — JobsPipe Retrieval

## Goal

Retrieve useful fresh jobs while explicitly respecting the free quota.

## Required

* Search preferences
* JobsPipe adapter
* Preview before full retrieval where supported
* Bounded result requests
* Maximum **50 returned jobs per search session**
* Daily target of **≤200 returned jobs**
* Monthly target of **≤800 returned jobs**
* Provider-side filtering
* Normalization
* Deduplication
* Local caching
* Usage tracking
* Quota-aware behavior
* Clear quota/error states

## Goal Point

A documented test search demonstrates that the application can retrieve and cache jobs while staying within the configured quota guardrails.

---

# 29. Milestone 3 — Deterministic Matching

## Goal

Determine which retrieved jobs fit the candidate without AI.

## Required

* Hard filters
* Skill normalization
* Skill hierarchy
* Required/preferred skill distinction
* Experience matching
* Education matching
* Location matching
* Salary matching
* Match scoring
* Explainable score components

## Goal Point

A user can upload a resume, search for jobs, and receive meaningful matches with **AI completely disabled/nonexistent**.

---

# 30. Milestone 4 — Opportunity Ranking

## Goal

Prioritize jobs worth pursuing now.

## Required

* Freshness scoring
* Opportunity scoring
* Final ranking
* Applicant data when available
* Ranking explanations
* Freshness indicators
* Clear match/opportunity separation

## Goal Point

**V1 is complete.**

The application fulfills its core promise:

> Find relevant, fresh jobs and help the user prioritize where to spend their application effort.

---

# 31. Post-V1 Milestones

These require explicit project-owner approval.

## Milestone 5 — AI Enhancement

Potential:

* OmniRoute
* AI-assisted extraction
* AI job interpretation
* Match explanations
* Semantic matching

The deterministic system remains the foundation.

## Milestone 6 — Personal Workflow

Potential:

* Saved jobs
* Ignored jobs
* Notes
* Search presets
* Application tracking
* Alerts

## Milestone 7 — Resume Builder

Potential:

```text id="e7l6qx"
Career Profile
├── Skills
├── Education
├── Experience Blocks
├── Project Blocks
└── Other Blocks
```

Generated resumes must remain grounded in user-provided information.

---

# 32. Verification and Definition of Done

A milestone cannot be marked complete solely because an agent believes the implementation works.

Every completed milestone requires:

1. **Automated verification where practical**

   * Unit/integration tests for deterministic logic.
2. **One documented end-to-end smoke test**

   * A real local run through the milestone's primary workflow.
3. **Current-state update**

   * Record the test performed and its result.
4. **No known blocking regression**

   * Existing milestone functionality must still work.
5. **Scope verification**

   * Confirm that no prohibited V1 feature was introduced.

The current-state document should record at minimum:

```text id="qihqbr"
Milestone:
Date:
Test performed:
Expected result:
Observed result:
Known limitations:
```

This creates a verifiable handoff between agents.

A future agent should be able to trust a completed milestone because there is evidence supporting the completion claim.

---

# 33. Agentic Development Rules

Before modifying the repository, an agent must determine:

1. Current milestone
2. Current goal
3. Completed functionality
4. Immediate task
5. Relevant architectural boundaries
6. Whether the requested work is in scope

The agent must not:

* Add AI because it appears convenient
* Add infrastructure without necessity
* Add another provider
* Use shared credentials
* Circumvent JobsPipe limits
* Commit personal data
* Rewrite unrelated architecture
* Implement future milestones early
* Replace deterministic logic with an opaque model

When uncertain:

> **Choose the smallest implementation that satisfies the current milestone while preserving the established architecture.**

If the requested work conflicts with this specification, surface the conflict instead of silently changing the architecture.

---

# 34. Current-State Handoff Document

The repository must maintain a concise document separate from this specification.

It should contain:

```text id="j3r1p5"
Current milestone:
Current goal:
Completed:
In progress:
Known issues:
Architectural decisions:
Next task:
Blocked by:

Latest verification:
Test performed:
Expected result:
Observed result:
```

This specification answers:

> **What are we building and why?**

The current-state document answers:

> **Where are we right now, and what has actually been verified?**

An agent joining halfway through development should need these documents—not the previous conversation—to understand the project.

---

# 35. Public Repository License

Before V1 release, the repository must contain an explicit open-source license selected by the project owner.

Until a license is selected, documentation may describe the project as public-source code, but agents must not assume that "public GitHub repository" automatically means unrestricted public use.

---

# 36. Final V1 Architecture

```text id="5j9y5r"
                         USER
                          │
                          ▼
                     Resume PDF
                          │
                          ▼
                Local Text Extraction
                          │
                          ▼
                 Structured Profile
                          │
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
      User Preferences             Profile
             │                         │
             └────────────┬────────────┘
                          ▼
                   Search Planning
                          │
                          ▼
                  JobsPipe Preview
                          │
                          ▼
                  Quota / Count Check
                          │
                          ▼
                   JobsPipe Retrieval
                          │
                          ▼
                  Job Normalization
                          │
                          ▼
                    Deduplication
                          │
                          ▼
                    Local Cache
                          │
                          ▼
                    Hard Filters
                          │
                          ▼
                 Match Calculation
                          │
                          ▼
               Opportunity Ranking
                          │
                          ▼
                 Ranked Job Results
                          │
                          ▼
                    USER DECISION
```

There is intentionally:

* **No AI**
* **No cloud backend**
* **One job provider**
* **No shared API key**
* **No autonomous application system**
* **No quota circumvention**
* **No personal data in the public repository**

---

# 37. Architectural North Star

The project should remain a small, understandable application whose usefulness comes primarily from **good data processing, good filtering, and good ranking**.

The intended progression is:

```text id="m9p6e0"
Reliable local data
      ↓
Structured candidate profile
      ↓
Fresh job retrieval
      ↓
Correct filtering
      ↓
Explainable matching
      ↓
Opportunity-aware ranking
      ↓
Useful product
      ↓
Optional intelligence later
```

Not:

```text id="9q2f4d"
LLM
 ↓
LLM
 ↓
LLM
 ↓
LLM
 ↓
hope the result works
```

V1 is successful when a user can clone the repository, provide their own free JobsPipe credentials, upload a resume, specify what they want, and receive a useful prioritized set of fresh job opportunities **without AI, a paid application service, a developer-operated backend, or personal information leaving their computer**.

The agent is the executor, not the architect.

**Preserve the decisions in this document, advance one milestone at a time, verify each milestone with evidence, and do not solve problems the project has deliberately chosen not to have yet.**
