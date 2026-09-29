# 01 Codebase Cartography

This module teaches you to move through Buildgum deliberately. The repository is small, so the skill is not memorizing many files; the skill is recognizing ownership boundaries before the app grows.

Read in order:

1. [`01-system-map.md`](01-system-map.md)
2. [`02-file-reading-order.md`](02-file-reading-order.md)
3. [`03-domain-glossary.md`](03-domain-glossary.md)
4. [`04-runtime-and-tooling-map.md`](04-runtime-and-tooling-map.md)
5. [`05-key-flows.md`](05-key-flows.md)

Core discipline: every time you read a component, ask what it owns, what it imports, what data shape it expects, what side effects it performs, and what would break if that shape changed.
