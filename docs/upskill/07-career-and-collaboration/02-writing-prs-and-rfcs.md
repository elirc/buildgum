# Writing PRs And RFCs

## PR Description Template

```md
## What changed
- 

## Why
- 

## How tested
- [ ] npm run check
- [ ] npm run build
- [ ] Manual UI path:

## Screenshots / notes

## Risks
- 

## Follow-ups
- 
```

## Commit Messages

Use specific verbs:

- `Add cart storage parser`
- `Extract checkout total helper`
- `Document production checkout risks`

Avoid vague messages:

- `fix stuff`
- `changes`
- `update app`

## When To Write An RFC

Write an RFC when a change commits the project to a boundary or migration:

- Real checkout/payment provider.
- Auth and roles.
- Database schema.
- Routing architecture.
- Test/CI tooling.
- Design system extraction.

## RFC Template

```md
# RFC: [Title]

## Problem

## Goals

## Non-goals

## Current state
Include file anchors, for example `src/App.tsx:344-348`.

## Proposal

## Alternatives considered

## Risks and mitigations

## Migration plan

## Test plan

## Rollout and rollback

## Open questions
```
