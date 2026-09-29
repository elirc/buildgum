# Maintainer Communication

## Ask For Help Without Outsourcing Thinking

Good question shape:

```md
I am working on [ticket]. I traced [files/lines]. I expected [behavior], but saw [behavior]. I tried [checks]. My current hypothesis is [hypothesis]. Does this seem like the right boundary?
```

## Bug Report Template

```md
## Summary

## Reproduction
1. 

## Expected

## Actual

## Evidence
- File/line:
- Screenshot/log:

## Possible cause

## Willing to submit PR?
```

## Feature Proposal Template

```md
## Problem

## User value

## Proposed behavior

## Existing anchors

## Risks

## Test plan
```

## Responding To Review

Good:

> Thanks, agreed. I changed the parser to validate an array of strings and added a malformed-storage test plan. I left product ID existence filtering in the existing derived cart path.

Avoid:

> fixed

## Respectful Disagreement

Use evidence:

> I see the concern about abstraction. My reason for extracting this helper is testability around checkout totals. The function would be pure and used only from `Checkout`; if that still feels premature, I can keep it local and add tests after the harness lands.
