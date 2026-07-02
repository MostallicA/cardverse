# CardVerse RuleBook

**Document ID:** CV-8001  
**Version:** 0.1.0  
**Status:** Frozen  
**Classification:** Technical  
**Owner:** Mostafa & ChatGPT  
**Created:** 2026-06-26  
**Last Updated:** 2026-07-01

---

# Table of Contents

1. RuleBook Overview

2. General Rule Principles

3. Hokm Classic

4. Match Rules

5. Illegal Actions

6. AI Rule Compliance

7. Future Games

8. Glossary

9. References

10. Version History

---

# 1. RuleBook Overview

## Purpose

This document defines the official gameplay rules implemented by the CardVerse platform.

It acts as the single authoritative source for every game rule, scoring rule, gameplay restriction and validation requirement used by the Game Engine.

Any implementation related to gameplay must remain fully consistent with this document.

---

## Scope

This document defines:

* Official gameplay rules
* Match flow rules
* Hand rules
* Trick rules
* Scoring rules
* Validation rules
* Illegal move handling
* AI gameplay compliance

Implementation details of the game engine are documented separately in **ARCHITECTURE.md**.

---

## Rule Authority

Whenever a gameplay conflict occurs, this document has higher priority than implementation.

If implementation and this document disagree, the implementation must be updated.

---

# 2. General Rule Principles

The following principles apply to every game implemented within CardVerse.

---

## Server Authority

The server is the only authoritative source of game state.

Clients never validate gameplay.

---

## Rule Validation

Every move is validated by the Game Engine before being accepted.

Invalid moves are rejected.

---

## Deterministic Gameplay

Given the same game state and player actions, every match must always produce the same result.

---

## Fair Play

Rules must never favor a specific player.

Randomness exists only where officially required.

---

## AI Compliance

AI players follow exactly the same gameplay rules as human players.

Bots never receive hidden information or special privileges.

---

## Future Compatibility

Additional card games must extend this document without modifying the rules of existing games.

---

# 3. Hokm Classic

## Purpose

This chapter defines the official rules of Hokm as implemented by the CardVerse platform.

All gameplay logic, validation rules, AI behavior and match execution must follow these rules exactly.

---

## 3.1 Overview

Hokm is a four-player partnership trick-taking card game played with a standard 52-card deck.

Two teams compete to win Hands by capturing Tricks.

The game continues until one team reaches the required number of Hands to win the Match.

---

## 3.2 Objective

The objective of each Hand is to win at least seven Tricks.

Winning additional Tricks beyond seven has no additional value except where defined by special scoring rules.

---

## 3.3 Players

Each match consists of exactly four players.

The game cannot begin with fewer or more than four participants.

Supported participants include:

* Human Players
* AI Players
* AI Replacement Players

---

## 3.4 Teams

Players form two permanent partnerships.

Team A

* South
* North

Team B

* East
* West

Partners always sit opposite each other.

Partnerships remain unchanged throughout the Match.

---

## 3.5 Seating

Player seating follows a fixed clockwise order.

Clockwise Order:

South
-> West
-> North
-> East
-> South

Turn order always follows this clockwise rotation.

---

## 3.6 Deck

Hokm uses one standard 52-card deck.

No Jokers are used.

### Suit Types

* Spades
* Hearts
* Diamonds
* Clubs

### Card Ranking (Highest to Lowest)

A
K
Q
J
10
9
8
7
6
5
4
3
2

Suit ranking does not exist outside the selected Trump Suit.

---

## 3.7 Match Structure

A Match consists of one or more Hands.

Each Hand consists of thirteen Tricks.

Each Trick consists of exactly four played cards.

Every card is played exactly once during a Hand.

---

## 3.8 Winning the Match

A Match ends when one team reaches the required number of Hands according to the official scoring rules defined in Chapter 7.

---

## 3.9 Dealer Selection

The first Dealer of a Match is selected randomly.

For every subsequent Hand, the Dealer rotates clockwise unless modified by the official Hokm rules.

The Dealer is responsible only for dealing the cards.

The Dealer does not automatically become the Hakem except where explicitly defined by the game rules.

---

## 3.10 Hakem Selection

At the beginning of a new Match, the first Dealer also becomes the first Hakem.

The Hakem remains Hakem until their team loses a Hand.

When the Hakem's team loses a Hand, the Hakem role transfers to the opposing team according to the official Hokm rules.

The new Hakem becomes the player seated to the right of the previous Hakem.

---

## 3.11 Initial Deal

Before selecting the Trump Suit, the Dealer distributes five cards to each player.

Cards are dealt clockwise, beginning with the player to the Dealer's right.

After receiving the initial five cards, only the Hakem may inspect their cards.

No other player may view additional cards before the Trump Suit has been selected.

---

## 3.12 Trump Selection

After reviewing the initial five cards, the Hakem selects one suit as the Trump Suit (Hokm).

The selected Trump Suit remains active for the entire Hand.

The Trump Suit cannot be changed after the remaining cards have been dealt.

---

## 3.13 Main Deal

After the Trump Suit has been selected, the Dealer distributes the remaining cards.

Each player must finish the deal with exactly thirteen cards.

No player may receive additional cards after the deal has been completed.

The dealing procedure must always preserve the original clockwise order.

---

## 3.14 Beginning the First Trick

The Hakem plays the first card of the first Trick.

Play continues clockwise.

Every subsequent Trick begins with the player who won the previous Trick.

---

## 3.15 Turn Order

Players take turns in clockwise order.

Each player plays exactly one card per Trick.

A player cannot skip a turn.

A player cannot play more than one card during the same Trick.

---

## 3.16 Following Suit

The first card played in a Trick determines the Leading Suit.

Every subsequent player must follow the Leading Suit if they hold at least one card of that suit.

Following Suit is mandatory.

---

## 3.17 Unable to Follow Suit

If a player has no card belonging to the Leading Suit, they may play:

* Any card from another suit.
* A Trump card.

The player is free to choose either option.

---

## 3.18 Trump Rules

The selected Trump Suit has priority over every non-trump suit.

If one or more Trump cards are played during a Trick:

* The highest-ranked Trump card wins the Trick.

If no Trump card is played:

* The highest-ranked card of the Leading Suit wins the Trick.

---

## 3.19 Winning a Trick

The winner of each Trick:

* Collects the four played cards.
* Receives one Trick.
* Starts the next Trick.

Exactly one player wins every Trick.

---

## 3.20 Trick Completion

A Trick ends immediately after the fourth valid card has been played.

No additional actions may occur before the Trick winner has been determined.

The Game Engine validates the Trick before the next Trick begins.

---

## 3.21 Hand Completion

A Hand ends when one of the following conditions is met:

* All thirteen Tricks have been completed.
* A Bam victory condition has been achieved.

The Hand result is validated before scoring is calculated.

---

# 4. Match Rules

## 4.1 Hand Victory

A team wins a Hand immediately after winning seven Tricks.

The remaining Tricks are not played.

The Hand ends immediately and scoring is calculated.

---

## 4.2 Standard Victory

If both teams win at least one Trick before the Hand ends:

* The winning team receives one Hand Point.

This is the standard scoring outcome.

---

## 4.3 Kooti

A Kooti occurs when the losing team fails to win any Trick.

Conditions:

* Winning Team: 7 Tricks
* Losing Team: 0 Tricks

The winning team receives:

* Two Hand Points.

---

## 4.4 Hakem Kooti

A Hakem Kooti occurs when:

* The Hakem's team wins the Hand.
* The opposing team wins zero Tricks.

The winning team receives:

* Three Hand Points.

Hakem Kooti replaces the normal Kooti score.

Both scores are never awarded simultaneously.

---

## 4.5 Bam

A Bam occurs when one team wins all thirteen Tricks.

The Match immediately ends regardless of the current Match score.

A Bam is the highest possible victory.

Statistics for Bam must be recorded permanently.

---

## 4.6 Match Victory

A Match ends when one team reaches the configured Match score.

The default Match score is defined by the game configuration.

The winning team is declared the Match Winner.

---

## 4.7 Statistics Recording

After every completed Hand, the platform records:

* Hand Winner
* Tricks Won
* Hand Points Earned
* Kooti (if applicable)
* Hakem Kooti (if applicable)
* Bam (if applicable)

After every completed Match, the platform records:

* Match Winner
* Match Duration
* Player Statistics
* Team Statistics
* Fair Play Metrics

Only validated Matches may update permanent statistics.

---

# 5. Illegal Actions

## Purpose

This chapter defines actions that violate the official rules of Hokm.

Illegal actions are rejected by the Game Engine before they can affect the game state.

---

## 5.1 Playing Out of Turn

A player may play a card only during their assigned turn.

Attempting to play before or after the assigned turn is prohibited.

The action is rejected.

---

## 5.2 Failure to Follow Suit

If a player possesses at least one card of the Leading Suit, they must play one of those cards.

Playing a different suit while still holding the Leading Suit is illegal.

The action is rejected.

---

## 5.3 Playing an Invalid Card

A player may only play a card currently held in their hand.

Playing:

* A non-existent card
* A duplicated card
* A previously played card

is prohibited.

The action is rejected.

---

## 5.4 Multiple Card Submission

A player may submit only one card during a single turn.

Submitting multiple cards is prohibited.

The Game Engine accepts only one valid action.

---

## 5.5 Late Actions

Actions received after the player's turn has expired are ignored.

The Game Engine determines the appropriate continuation according to the timeout rules.

---

## 5.6 Client Manipulation

Clients are not permitted to alter:

* Game State
* Card Ownership
* Trick Results
* Match Results
* Turn Order

The server validates every action independently.

Client-side modifications have no authority.

---

## 5.7 Invalid Match State

Player actions are accepted only while the Match is in a valid playable state.

Actions submitted during:

* Match Initialization
* Match Completion
* Disconnection Recovery
* Server Validation

are rejected unless explicitly allowed by the Game Engine.

---

## Rule Enforcement

Every illegal action must:

* Be rejected.
* Leave the game state unchanged.
* Be recorded in the server logs when appropriate.

Illegal actions must never modify the official Match state.

---

# 6. AI Rule Compliance

## Purpose

This chapter defines how AI-controlled players must behave within the CardVerse platform.

AI players must follow exactly the same gameplay rules as human players.

The AI never receives gameplay advantages.

---

## 6.1 Rule Compliance

AI players must comply with every rule defined in this RuleBook.

The AI may never:

* Ignore turn order.
* Ignore the Leading Suit.
* Access hidden information.
* Play unavailable cards.
* Modify game state.

---

## 6.2 Information Access

AI players have access only to information that would be visible to a human player.

Visible information includes:

* Their own hand
* Previously played cards
* Current Trick
* Completed Tricks
* Public Match State

The AI must never access:

* Opponents' hands
* Future card order
* Internal server state
* Hidden game information

---

## 6.3 Decision Making

AI decisions must always be based on legal game information.

Difficulty levels may influence strategy, but never the game rules.

All AI difficulty levels follow identical gameplay rules.

---

## 6.4 AI Replacement

When a player disconnects, the Game Engine may temporarily assign an AI Replacement.

The AI immediately assumes control of the disconnected player's hand.

If the player reconnects within the allowed timeout:

* Control returns to the original player.
* The AI immediately stops making decisions.

If the timeout expires:

* The AI completes the remainder of the Hand.

---

## 6.5 Fairness

AI players must never receive:

* Better cards
* Hidden information
* Modified probabilities
* Special game rules

Every AI decision must remain subject to the same validation rules as human players.

---

## General Principles

AI behavior must always remain:

* Fair
* Predictable
* Rule-Compliant
* Server-Validated

The AI is another player—not another game mode.

---

# 7. Future Games

## Purpose

This chapter defines how additional card games will be incorporated into the CardVerse platform.

The architectural principles defined in this RuleBook apply to every supported game.

Each game introduces its own gameplay rules while reusing the shared platform infrastructure.

---

## Planned Games

Future supported games include:

* Shelem
* Haft Khabis
* Nars
* Tak Nars
* Sars

Additional games may be introduced in future releases.

---

## Rule Isolation

Each game maintains its own independent rule set.

Game-specific rules must never modify or interfere with the rules of another game.

Every game should be implemented as an isolated module within the platform architecture.

---

## Shared Platform Rules

All games reuse the same platform services, including:

* Authentication
* Matchmaking
* Player Profiles
* Friends
* Statistics
* Achievements
* Economy
* Notifications

Only gameplay rules differ between games.

---

## Long-Term Goal

CardVerse is designed as a multi-game platform.

Adding a new card game should require only a new game module and its corresponding RuleBook chapter, without modifying the existing platform infrastructure.

---

# 8. Glossary

| Term              | Definition                                                            |
| ----------------- | --------------------------------------------------------------------- |
| Match             | A complete competitive session consisting of one or more Hands.       |
| Hand              | A single round of Hokm that ends when its victory conditions are met. |
| Trick             | One complete cycle in which every player plays one card.              |
| Leading Suit      | The suit of the first card played in a Trick.                         |
| Trump Suit (Hokm) | The suit selected by the Hakem that outranks all other suits.         |
| Dealer            | The player responsible for dealing the cards.                         |
| Hakem             | The player responsible for selecting the Trump Suit.                  |
| Hand Point        | The score awarded after winning a Hand.                               |
| Kooti             | A victory in which the losing team wins zero Tricks.                  |
| Hakem Kooti       | A Kooti achieved by the Hakem's team.                                 |
| Bam               | A victory achieved by winning all thirteen Tricks.                    |
| AI Replacement    | A temporary AI-controlled player replacing a disconnected player.     |

---

# 9. References

Related documents:

* README.md
* CARDVERSE_INDEX.md
* PRODUCT_BIBLE.md
* ARCHITECTURE.md
* DATABASE.md
* API.md
* PROJECT_RULES.md
* PROJECT_DNA.md
* DECISION_LOG.md

---

# 10. Version History

| Version | Date       | Description                    |
| ------- | ---------- | ------------------------------ |
| 0.1.0   | 2026-06-30 | Initial Enterprise Foundation  |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed |

---

This document defines the official gameplay rules for every card game implemented within the CardVerse platform.

All gameplay implementations, AI behavior, multiplayer synchronization and match validation must remain consistent with this RuleBook.

Changes to this document require updating the Version History.

Before changing any gameplay rule, consult **DECISION_LOG.md** and record the decision if it affects existing behavior or future compatibility.