# CardVerse RuleBook — Hokm

**Document ID:** CV-2001
**Version:** 0.3.0
**Status:** Frozen
**Classification:** Core
**Owner:** Mostafa
**Created:** 2026-06-27
**Last Updated:** 2026-08-09

---

## Table of Contents

1. Overview
2. Players & Table Layout
3. The Deck
4. Determining the First Hakem
5. Dealing Procedure
6. Hokm Declaration
7. Card Ranking (All Modes)
8. Gameplay Rules
9. Scoring Hierarchy (Trick → Set → Match)
10. Special Round Outcomes (Kooti, Hakem Kooti, Bam)
11. Hakem Rotation
12. Online-Specific Rules (Timers, Disconnection)
13. Team Play & Bot Scenarios
14. Open Items (Not Yet Decided)
15. References
16. Version History

---

## 1. Overview

### Purpose

This document defines the complete, authoritative rules of Hokm — including its three sub-modes (Saras, Naras, Tak Naras) — as implemented on the CardVerse platform.

This is the single source of truth for gameplay rules. Any implementation must conform exactly to this document. If code behavior and this document disagree, this document is correct and the code must be fixed.

### Scope

CardVerse Version 1 ships with **Hokm only**. Hokm includes four sub-modes selectable by the Hakem:

- Hokm (classic, trump suit)
- Saras
- Naras
- Tak Naras

Other card games (Bidel, Shelem, Haft Khabis, Bank/21, Pasur/11, Poker) are planned for future releases and are out of scope for this document. Each future game will receive its own dedicated rulebook chapter or document when development begins.

### Players

Hokm is played by exactly 4 players in CardVerse Version 1. Two-player and three-player variants exist traditionally but are not supported in Version 1.

---

## 2. Players & Table Layout

### Teams

Players form two fixed teams of 2 players each for the duration of a Match.

### Seating

Teammates always sit **directly opposite** one another at the table (e.g. seats 1 & 3 are one team, seats 2 & 4 are the other team). Opponents sit adjacent to each other.

### Turn Direction

All turn order — dealing, bidding/declaring Hokm, and playing cards — proceeds **counter-clockwise**, without exception. This includes the rotation of the Hakem role between rounds.

---

## 3. The Deck

A standard 52-card deck is used, with 4 suits:

- Khesht (Diamonds) — red
- Pik (Spades) — black
- Del (Hearts) — red
- Khaj (Clubs) — black

Each suit has 13 cards: 2, 3, 4, 5, 6, 7, 8, 9, 10, J (Sarbaz), Q (Bibi), K (Shah), A (Ace).

Each player receives exactly 13 cards per round (52 ÷ 4 players).

---

## 4. Determining the First Hakem

Because CardVerse is an online platform, the first Hakem of a Match is selected **fully at random** by the system (there is no physical card-cutting step). Traditional in-person methods — such as dealing one card to each player and giving the role to whoever draws the first Ace — are replaced by this randomization.

For all subsequent rounds within the same Match, the Hakem role is determined by the rotation rule in **Section 11**, not by random selection.

---

## 5. Dealing Procedure

Dealing happens in two blocked phases, always counter-clockwise starting from the Hakem.

### Phase 1 — Initial 5 Cards

Each player receives **5 cards at once** (not one at a time), in this order:

1. Hakem — 5 cards
2. Player to Hakem's right — 5 cards
3. Next player (counter-clockwise) — 5 cards
4. Last player — 5 cards

### Hokm Declaration Window

After Phase 1, the Hakem has **~20 seconds** to declare Hokm (see Section 6) based only on these 5 cards. If the Hakem does not declare within this window, the system selects a mode/suit at random on the Hakem's behalf.

### Phase 2 — Remaining 8 Cards

After Hokm is declared, two more blocked rounds of **4 cards each** are dealt (same counter-clockwise order, starting from the Hakem again), for a total of 8 additional cards per player.

**Total per player: 5 + 4 + 4 = 13 cards.**

Cards are always presented sorted in the player's hand.

---

## 6. Hokm Declaration

The Hakem **declares** Hokm (does not "play" or "bid" it) by selecting exactly one of the following 7 options:

- Khesht (trump suit)
- Pik (trump suit)
- Del (trump suit)
- Khaj (trump suit)
- Saras
- Naras
- Tak Naras

The choice is entirely up to the Hakem's judgment and strategy — typically the suit in which the Hakem holds the strongest/most cards, if choosing a trump suit.

---

## 7. Card Ranking (All Modes)

### 7.1 Classic Hokm (trump suit declared)

Within any non-trump suit, from highest to lowest:

**A, K, Q(Bibi), J(Sarbaz), 10, 9, 8, 7, 6, 5, 4, 3, 2**

The trump suit outranks all other suits entirely: **every card of the trump suit beats every card of every non-trump suit**, even the trump suit's own 2 beats the Ace of any non-trump suit. Within the trump suit itself, the same ranking order applies (A highest ... 2 lowest, but all of them above any non-trump card).

### 7.2 Saras

Identical ranking to classic Hokm (A, K, Q, J, 10...2, highest to lowest) — but **no trump suit exists**. No suit outranks another; only the led suit matters for winning a trick.

### 7.3 Naras

Ranking is fully reversed from classic: **2 is the highest card, then 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, and A is the lowest.** No trump suit exists.

### 7.4 Tak Naras

Same reversed order as Naras, except the Ace moves to the top: **A is highest, then 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, and K is the lowest.** No trump suit exists.

### Summary Table

| Mode           | Ranking (highest → lowest)                            | Trump suit exists? |
| -------------- | ----------------------------------------------------- | ------------------ |
| Hokm (classic) | Trump suit beats all; within any suit: A,K,Q,J,10...2 | Yes                |
| Saras          | A,K,Q,J,10...2 (same as classic, no trump)            | No                 |
| Naras          | 2,3,4...10,J,Q,K,A                                    | No                 |
| Tak Naras      | A,2,3,4...10,J,Q,K                                    | No                 |

---

## 8. Gameplay Rules

### Starting a Trick

The Hakem leads the first trick of the round by playing any card of their choice. After that, whoever won the previous trick leads the next one.

### Turn Order Within a Trick

Play proceeds counter-clockwise starting from whoever leads.

### Following Suit

Players must follow the led suit if they hold a card of that suit.

### When a Player Cannot Follow Suit

- **In classic Hokm (trump suit exists):** the player may either "cut" (play a trump-suit card, which will win the trick unless another player cuts with a higher trump card) or discard (play any other irrelevant card, which cannot win).
- **In Saras / Naras / Tak Naras (no trump suit exists):** cutting is not possible at all. A player without the led suit may only discard any other card; that card can never win the trick regardless of its rank. Only cards of the led suit can ever win a trick in these modes.

### Winning a Trick

The highest-ranked card of the led suit wins, unless a trump card was played (classic Hokm only), in which case the highest trump card played wins instead. The 4 cards of the trick are collected by whichever team played the winning card — this group of 4 cards is called a **Trick**.

---

## 9. Scoring Hierarchy (Trick → Set → Match)

CardVerse uses three nested units of scoring. This hierarchy must be used consistently across all documentation and code — do not use "Trick," "Set/Round," and "Match" interchangeably.

Trick = 4 cards, won by one team (13 Tricks make up one Round)
↓
Set/Round = a team reaches 7 Tricks won (a team needs 7 Sets to win)
↓
Match = a team reaches 7 Sets/Rounds (this ends the game)

- A **Trick** is the 4 cards played in a single turn cycle, won by one team.
- A **Set** (also called a **Round**) is complete once one team has won 7 of the 13 Tricks available in that Round. The winning team is awarded Set points as defined in Section 10.
- A **Match** is won by whichever team is first to accumulate 7 Sets.

---

## 10. Special Round Outcomes (Kooti, Hakem Kooti, Bam)

| Outcome         | Condition                                                                                              | Sets Awarded                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **Normal win**  | A team wins 7 Tricks; the opposing team has won at least 1 Trick                                       | 1 Set                                                                                       |
| **Kooti**       | The Hakem's team wins 7 Tricks while the opposing team wins 0 Tricks (7–0)                             | 2 Sets                                                                                      |
| **Hakem Kooti** | The team opposing the Hakem wins 7 Tricks while the Hakem's team wins 0 Tricks (7–0 against the Hakem) | 3 Sets                                                                                      |
| **Bam**         | One team wins all 13 Tricks in the Round (13–0)                                                        | The Match ends immediately; that team wins the entire Match, regardless of prior Set scores |

---

## 11. Hakem Rotation

- If the Hakem's team **wins** the Round (Set), the same player remains Hakem for the next Round.
- If the Hakem's team **loses** the Round (Set), the Hakem role passes to the player counter-clockwise to the right of the current Hakem, who then declares Hokm for the next Round.

---

## 12. Online-Specific Rules (Timers, Disconnection)

These rules exist because CardVerse is played online and must handle inactivity, disconnection, and abuse gracefully. They are gameplay-adjacent but are implemented by Engine-layer modules (see ARCHITECTURE.md — Timer Manager, Disconnect Manager, Bot Manager) rather than by the core rule engine itself. They are recorded here so the full player-facing behavior is documented in one place.

### Hokm Declaration Timer

The Hakem has ~20 seconds to declare Hokm after receiving their first 5 cards. If this timer expires, the system randomly selects a mode/suit on the Hakem's behalf.

### Turn Timer

Each player has ~8 seconds to play a card on their turn. If the timer expires, the system automatically plays a random **valid** card on the player's behalf (i.e. respecting follow-suit rules).

### Inactivity / Auto-Kick

- A counter tracks **consecutive** missed turns (turns where the timer expired) per player.
- The counter is **consecutive, not cumulative** — if a player plays their turn before the counter reaches the limit, the counter resets to zero.
- If a player misses **3 consecutive turns**, they are removed from the table on the 4th missed turn.

---

## 13. Team Play & Bot Scenarios

### 13.1 Team Disconnection Rules

In CardVerse, Hokm is a team game (2 vs 2). When a player disconnects:

1. **Notification:** The teammate receives a notification:

   > "Your teammate has left the game. Do you want to continue?"

2. **Teammate Decision:** The teammate can choose:
   - **Continue:** A bot replaces the disconnected player.
   - **Forfeit:** The match ends immediately. The opposing team wins.

3. **Bot Assignment:** If the teammate chooses to continue:
   - A bot takes over the disconnected player's seat.
   - The bot follows the same rules as the original player.
   - The bot's avatar must be hidden (no "BOT" label).

### 13.2 Bot Scenarios

| Scenario | Real Players | Bots | Description                             |
| -------- | ------------ | ---- | --------------------------------------- |
| 1        | 4            | 0    | Full human game                         |
| 2        | 3            | 1    | One player disconnected                 |
| 3        | 2            | 2    | Each team has one bot                   |
| 4        | 1            | 3    | Early phase - one human with three bots |
| 5        | 0            | 4    | Development/testing only                |

### 13.3 Bot Limits

- Maximum bots per match: **3 bots** (when only 1 human player)
- Bots **never share a team** with each other (maximum 1 bot per team)
- Bots are **per-match instances** (no global limit)
- Bots must be **invisible** to users in scenarios 2-4

### 13.4 Invisible Bots

In early phases (low player count), bots may replace real players.

**Requirements:**

- No "BOT" label or indicator
- No grayscale avatar
- Natural player names
- Realistic response delays
- Human-like behavior (occasional mistakes)
- Users must NOT know they are playing with bots

---

## 14. Open Items (Not Yet Decided)

The following details are intentionally left open for now, per a deliberate decision to avoid speculative development before the core game is playable. They should be resolved via playtesting/trial-and-error before Version 1 ships, and this section must be updated (moved into the relevant section above) once decided:

1. Does a Hokm-declaration timeout count toward the Hakem's own consecutive-inactivity counter, or is it tracked separately?
2. Exact coin penalty amount for being auto-kicked from a table.
3. Any additional "unwritten" professional-play conventions for bots (e.g. a bot should not play a stronger card than necessary when its partner is already winning the Trick). A full Bot AI behavior specification is planned as a separate document (see AI/Bot section of ARCHITECTURE.md) once core gameplay exists.

---

## 15. References

Related documents:

- CARDVERSE_INDEX.md
- PRODUCT_BIBLE.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- PROJECT_RULES.md
- PROJECT_DNA.md

---

## 16. Version History

| Version | Date       | Description                                                                                                                                                                                                                                                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-06-30 | Initial RuleBook foundation                                                                                                                                                                                                                                                                                       |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                                                                                                                                                                                                                                                                                    |
| 0.2.0   | 2026-07-12 | Full rewrite: corrected card ranking for all 4 modes, corrected dealing math (5+4+4=13), clarified Trick/Set/Match hierarchy, moved Saras/Naras/Tak Naras from "Future Games" into Hokm sub-modes, added Online-Specific Rules section (timers, disconnection, auto-kick, bot takeover), added Open Items section |
| 0.3.0   | 2026-08-09 | Added Team Play & Bot Scenarios section: team disconnection rules, teammate notification, continue/forfeit decision, bot scenarios (0-3 bots), invisible bots for early phases, bot limits (max 3 per match, never share a team)                                                                                  |

---

**Document Status:** Frozen

This document defines the official and complete rules of Hokm (including Saras, Naras, and Tak Naras) for the CardVerse platform. All game engine and rule-execution code must remain consistent with this document.

Changes to this document require updating the Version History.
