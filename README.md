## Test framework choices 

This framework uses **Playwright with TypeScript** to cover backend API testing in a fast, deterministic, and CI-friendly way.

## 📦 What You Need

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- Git Installed
- A code editor like [VS Code](https://code.visualstudio.com/)

## 🚀 Project Execution


### Steps:
To run the project locally, do the following:

- Clone the project to a local machine: Open a terminal, copy and paste 
`git clone https://github.com/LatifatAbdullahi/VitaHealthTestAutomation` and hit the Enter button
- Navigate into the project and run `npm install`
- Install browsers with `npx playwright install`

- Run the test with `npx playwright tests/spec/api`
- Generate an html report with `npx playwright show-report`




- **Layered structure (clients / schema / helpers / specs)**  
  Separating API clients, contract validation, helpers, and test specs keeps tests readable and reduces duplication. Specs focus on *behavior*, not implementation details.

- **API-first testing via Playwright’s request context**  
  Playwright’s built-in API testing avoids extra dependencies, runs quickly in CI, and allows timing assertions for lightweight non-functional checks.

- **Runtime contract validation**  
  Lightweight schema assertions are used to catch breaking API changes early without introducing heavy validation libraries. This balances safety with maintainability.

- **Risk-based automation**  
  Happy paths (feed load, pagination) and high-risk edges (invalid cursor, empty feed, backend errors) are automated to protect core functionality, while avoiding over-automation of low-signal cases.

- **Multiple request contexts via fixtures**  
  Dedicated API contexts (normal user, empty-feed user, fault-injection user) make tests deterministic and eliminate environment coupling inside specs.

- **CI-focused by design**  
  Tests are fast, isolated, and deterministic, making them suitable for running on every pull request. Flaky scenarios (real faults, perf variability) are gated or explicitly controlled.

Overall, the framework prioritizes **clarity, stability, and signal over volume**, reflecting a senior QA approach to automation and release readiness.
