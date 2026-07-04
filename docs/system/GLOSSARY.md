# CardVerse Glossary

**Document ID:** CV-SYS-010
**Version:** 1.0.0
**Status:** Frozen
**Classification:** System
**Owner:** Mostafa & ChatGPT
**Created:** 2026-07-04
**Last Updated:** 2026-07-04

---

## Table of Contents

1. Purpose
2. Platform Terms
3. Gameplay Terms
4. Technical Terms
5. Architecture Terms
6. References
7. Version History

---

## 1. Purpose

This document provides a centralized dictionary of all terms used across the CardVerse project.

Its purpose is to ensure consistent understanding and usage of terminology across all documentation and communication.

Every term should be defined only once in this document. Other documents should reference this glossary instead of duplicating definitions.

**This document is the single source of truth for terminology.**

---

## 2. Platform Terms

### CardVerse

The complete gaming platform ecosystem. Includes all games, services, infrastructure and documentation.

### Platform

The shared infrastructure and services that support all games. Includes authentication, profiles, friends, matchmaking, economy, etc.

### Game

A specific card game implemented on the platform (e.g., Hokm, Shelem).

### Module

A self-contained component with a single responsibility. Modules communicate through well-defined interfaces.

### Monorepo

A single repository containing multiple projects and modules.

---

## 3. Gameplay Terms

### Match

A complete competitive session consisting of one or more Hands.

### Hand

A single round of a card game. In Hokm, a Hand consists of up to 13 Tricks.

### Trick

One complete cycle in which every player plays exactly one card.

### Leading Suit

The suit of the first card played in a Trick. All subsequent players must follow this suit if possible.

### Trump Suit (Hokm)

The suit selected by the Hakem that outranks all other suits for the duration of the Hand.

### Dealer

The player responsible for dealing the cards to all players.

### Hakem

The player responsible for selecting the Trump Suit. The Hakem has special authority in the game.

### Hand Point

The score awarded after winning a Hand.

### Kooti

A victory in which the losing team wins zero Tricks. Worth 2 Hand Points.

### Hakem Kooti

A Kooti achieved by the Hakem's team. Worth 3 Hand Points.

### Bam

A victory achieved by winning all thirteen Tricks in a Hand. Immediately ends the Match.

### AI Replacement

A temporary AI-controlled player that replaces a disconnected player until they reconnect or the timeout expires.

---

## 4. Technical Terms

### Frozen Document

A document that has been reviewed, approved and should not be modified without formal approval. Changes require updating the Version History.

### Operational Document

A document that is expected to evolve throughout the project lifecycle. Examples: PROJECT_STATUS.md, DECISION_LOG.md.

### Technical Debt

The cost of additional rework caused by choosing an easy solution now instead of a better approach that would take longer.

### Single Source of Truth

The principle that every concept should have exactly one authoritative document.

### Documentation First

The principle that documentation must be created before implementation begins.

### Server Authoritative

The principle that the server is the only trusted source of game state. Clients never determine gameplay outcomes.

---

## 5. Architecture Terms

### Modular Monolith

A single deployment containing multiple modules that are logically independent but share the same runtime.

### Microservice Ready

Architecture designed so that modules can be extracted into independent services in the future without significant redesign.

### Domain-Driven Design (DDD)

An approach that models software to match business domains.

### Hexagonal Architecture

An architecture that isolates business logic from infrastructure and external services.

### Layer

A logical grouping of modules with similar responsibilities. CardVerse has four layers: Platform, Engine, Game and Shared.

### Domain Event

A significant business occurrence that other modules may react to.

---

## 6. References

Related documents:

- README.md
- PROJECT_DNA.md
- PROJECT_RULES.md
- CARDVERSE_INDEX.md
- ARCHITECTURE.md
- PRODUCT_BIBLE.md
- RULEBOOK.md

---

## 7. Version History

| Version | Date       | Description                    |
|---------|------------|--------------------------------|
| 1.0.0   | 2026-07-04 | Initial glossary established   |

---

**Document Status:** Frozen

This document is the authoritative source for all terminology used in the CardVerse project.

Every term should be defined only once in this document.

Changes to this document require updating the Version History.