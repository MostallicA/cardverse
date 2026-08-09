# CardVerse Product Bible

**Document ID:** CV-1001
**Version:** 0.4.0
**Status:** Frozen
**Classification:** Business
**Owner:** Mostafa
**Created:** 2026-06-26
**Last Updated:** 2026-08-09

---

## Table of Contents

0. Product Scope
1. Project Identity
2. Game Modes
3. Player Identity & Progression
4. Social System
5. Economy
6. Game Flow
7. Future Roadmap
8. Glossary
9. References
10. Version History

---

## 0. Product Scope

### Purpose

This document defines the business vision, product requirements, gameplay features and long-term direction of CardVerse. Every architectural, database and implementation decision must remain consistent with this document.

---

### Version 1.0 (In Scope)

#### Core Platform

- User Authentication
- Google Sign-In
- Guest Mode
- Player Profile
- Friends System
- Private Chat
- Notifications
- Match History

#### Gameplay

- Hokm (including Sars, Nars, Tak Nars sub-modes)
- Practice Mode
- Friendly Match
- Ranked Match
- AI Bot Replacement (with team disconnection rules)
- Reconnect System

#### Competitive

- Ranking System
- Matchmaking
- Fair Play Score
- Statistics
- XP & Level
- Seasonal Rating

#### Economy

- Coins
- Cosmetic Shop
- Daily Rewards
- Weekly Missions
- Achievements

---

### Planned

These features are already part of the product vision but are not included in Version 1.0.

- Tournament System
- Battle Pass
- Spectator Mode
- Voice Messages
- Advanced Avatar Builder
- Premium Currency (Gems)

---

### Future

Future card games, in priority order:

1. Bidel
2. Shelem
3. Haft Khabis
4. Bank (21)
5. Pasur (11)
6. Poker

**Note:** Nars, Tak Nars, and Sars are **not** separate games — they are rule sub-modes selectable by the Hakem within Hokm itself. See RULEBOOK.md Section 6.

Other future expansions:

- Guild System
- Cross Game Progression
- Mobile Native Applications

---

### Out of Scope

The following features are intentionally excluded from Version 1.0.

- Pay-to-Win Mechanics
- NFT Integration
- Cryptocurrency
- User Generated Card Rules
- Community Hosted Servers

---

## 1. Project Identity

### Product Name

CardVerse

---

### Vision

Build a scalable, modular and extensible online card game platform capable of supporting multiple traditional card games while delivering a competitive, enjoyable and fair multiplayer experience.

---

### Mission

Create a long-term gaming platform that begins with Hokm and evolves into a complete ecosystem where every card game shares the same infrastructure, account system, social features, matchmaking and backend services.

---

### Product Philosophy

CardVerse is a platform, not a single game.

Every feature should be designed to be reusable across future card games.

New games must reuse existing infrastructure whenever possible instead of introducing isolated systems.

---

### Core Principles

- Performance First
- Security by Design
- Fair Play
- Modular Architecture
- Scalability
- Maintainability
- Cross Platform
- Consistent User Experience
- Data Driven Decisions
- Long-term Sustainability

---

### Product Pillars

#### Fair Competition

Winning must always depend on player skill rather than purchased advantages.

#### Fast Multiplayer Experience

Players should reach gameplay with minimum waiting time while maintaining matchmaking quality.

#### Social Experience

CardVerse is designed around playing with friends as much as playing competitively.

#### Long-term Progression

Players should always have meaningful progression through levels, rankings, achievements and cosmetics.

#### Extensible Architecture

Every new game should require minimal backend changes by reusing existing platform services.

---

### Success Metrics

The platform should continuously measure:

- Match Completion Rate
- Matchmaking Time
- Daily Active Users
- Monthly Active Users
- Player Retention
- Fair Play Score Distribution
- Crash Rate
- Average Match Duration
- Reconnect Success Rate
- Player Satisfaction

---

### Product Constraints

CardVerse must never sacrifice fairness, maintainability or security in order to deliver short-term features.

Every new feature must satisfy the following conditions:

- Improves player experience.
- Does not introduce technical debt.
- Fits the modular architecture.
- Can be maintained over the long term.

---

## 2. Game Modes

### Purpose

This chapter defines every supported gameplay mode available in CardVerse Version 1.0 and establishes the rules that govern player participation, matchmaking and rewards.

---

### 2.1 Guest Mode

**Status:** V1

Guest Mode allows players to experience CardVerse without creating a permanent account.

#### Characteristics

- No permanent progression
- No ranked matchmaking
- No achievements
- No seasonal rewards
- No cloud synchronization
- Limited customization

Guest players may upgrade to a Google Account at any time. After upgrading, all supported progress is migrated to the permanent account.

---

### 2.2 Practice Mode

**Status:** V1

Practice Mode allows players to improve their skills by competing against AI-controlled opponents.

#### Characteristics

- Single Player
- Adjustable AI Difficulty
- No Rank Changes
- No Fair Play Impact
- Reduced Rewards
- Learning Environment

Practice matches are intended for learning and testing strategies.

---

### 2.3 Friendly Match

**Status:** V1

Friendly Matches allow players to create private rooms and play with invited friends.

#### Characteristics

- Private Lobby
- Invite System
- No Rank Changes
- No Competitive Rewards
- Match Statistics Recorded Separately
- Custom Room Settings

Future versions may support spectators.

---

### 2.4 Ranked Match

**Status:** V1

Ranked Match is the primary competitive mode of CardVerse.

#### Characteristics

- Automatic Matchmaking
- Skill-Based Pairing
- Rank Progression
- Fair Play Monitoring
- Full Statistics Tracking
- Coin Rewards
- Seasonal Rating Updates

Only Ranked Matches affect competitive rankings.

---

### 2.5 Tournament

**Status:** Planned

Tournament Mode provides organized competitive events.

#### Planned Features

- Scheduled Events
- Bracket Management
- Registration
- Exclusive Rewards
- Seasonal Championships
- Live Match Tracking

Tournament rules will be defined in a future version.

---

### 2.6 Bot Replacement

**Status:** V1

To preserve match integrity, inactive or disconnected players are temporarily replaced by AI.

#### Team Disconnection Rules

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

#### Bot Scenarios

| Scenario | Real Players | Bots | Description                             |
| -------- | ------------ | ---- | --------------------------------------- |
| 1        | 4            | 0    | Full human game                         |
| 2        | 3            | 1    | One player disconnected                 |
| 3        | 2            | 2    | Each team has one bot                   |
| 4        | 1            | 3    | Early phase - one human with three bots |
| 5        | 0            | 4    | Development/testing only                |

#### Bot Limits

- Maximum bots per match: **3 bots** (when only 1 human player)
- Bots **never share a team** with each other (maximum 1 bot per team)
- Bots are **per-match instances** (no global limit)
- Bots must be **invisible** to users in scenarios 2-4

#### Invisible Bots

In early phases (low player count), bots may replace real players.

**Requirements:**

- No "BOT" label or indicator
- No grayscale avatar
- Natural player names
- Realistic response delays
- Human-like behavior (occasional mistakes)
- Users must NOT know they are playing with bots

---

### Matchmaking Rules

The matchmaking service attempts to create fair and balanced matches using the following priority:

1. Similar Skill Rating
2. Similar Fair Play Score
3. Similar Network Latency
4. Similar Geographic Region
5. Waiting Time

If a suitable match cannot be found, search criteria gradually expand while maintaining competitive fairness.

---

### General Rules

All multiplayer modes must comply with the following principles:

- Fair Play
- Secure Match Validation
- Server Authority
- Reliable Reconnection
- Anti-Abuse Protection
- Consistent Match Results

These principles apply regardless of the selected game mode.

---

## 3. Player Identity & Progression

### Purpose

This chapter defines player identity, account management, progression systems and long-term player development throughout the CardVerse platform.

---

### 3.1 Account Types

**Status:** V1

CardVerse supports the following account types.

#### Guest Account

- Instant access
- No registration required
- Limited progression
- Local data storage
- Can be upgraded to a permanent account

#### Google Account

- Cloud synchronization
- Permanent progression
- Friends system
- Competitive matchmaking
- Achievements
- Statistics
- Cross-device access

Guest accounts can be upgraded without losing supported progress.

---

### 3.2 Player Profile

Every player owns a unique profile.

#### Profile Information

- Player ID
- Username
- Avatar
- Avatar Frame
- Country Flag
- Level
- Rank
- Current Status
- Join Date
- Last Online
- Bio (Planned)

---

### Username Rules

**Status:** V1

- Unique across the platform
- 3–20 characters
- Letters and numbers supported
- Underscore allowed
- No offensive words
- No reserved system names
- Case-insensitive uniqueness

Usernames may become changeable in future versions.

---

### 3.3 Progression

Player progression consists of several independent systems.

#### Experience (XP)

Players earn XP through gameplay. XP increases Player Level and Profile Progress. XP never decreases.

#### Level

Represents overall player experience. Level does not affect gameplay balance. Level rewards may include: Cosmetics, Titles, Profile Frames, Coins.

#### Competitive Rank

**Status:** V1

Competitive Rank represents player skill. Only Ranked Matches modify Competitive Rank.

#### Seasonal Rating

**Status:** V1

Each competitive season maintains an independent rating. Season resets do not affect lifetime statistics.

---

### 3.4 Player Statistics

Statistics are permanently stored.

#### General Statistics

- Total Matches
- Wins
- Losses
- Win Rate
- Disconnect Rate
- Average Match Duration

#### Hokm Statistics

- Hokm Kooti
- Kooti
- Bam
- Total Tricks
- Cards Played

Additional games introduce their own statistics.

---

### 3.5 Achievements

**Status:** V1

Achievements reward important milestones.

Examples:

- First Victory
- 10 Wins
- 100 Wins
- Tournament Champion
- Fair Player
- Veteran Player
- First Ranked Win
- Daily Login Streak

Achievements may unlock: Coins, Badges, Titles, Cosmetic Items.

---

### 3.6 Fair Play Score

**Status:** V1

Every player owns a Fair Play Score. Default Score: 100

The score changes based on player behavior.

**Positive Actions:**

- Completing Matches
- Fair Conduct
- Successful Reconnection
- No Reports

**Negative Actions:**

- Rage Quit
- AFK
- Disconnect
- Match Throwing
- Confirmed Reports

A low Fair Play Score may result in:

- Reduced matchmaking priority
- Tournament restrictions
- Temporary competitive limitations

Fair Play never affects gameplay mechanics.

---

### 3.7 Rewards

Players may receive rewards from:

- Ranked Matches
- Daily Rewards
- Weekly Missions
- Achievements
- Seasonal Rewards
- Events

Rewards may include: XP, Coins, Badges, Cosmetics, Titles.

---

### 3.8 Player Status

The platform tracks the player's current state.

Available States:

- Online
- Offline
- Away
- In Lobby
- Matchmaking
- In Match

Player status is synchronized across supported platform services.

---

### General Principles

Player identity systems must satisfy the following requirements:

- Secure
- Persistent
- Cross-platform
- Scalable
- Privacy-aware
- Independent from gameplay balance

No progression system may provide competitive gameplay advantages.

---

## 4. Social System

### Purpose

This chapter defines all player-to-player social interactions available within the CardVerse platform.

---

### 4.1 Friends System

**Status:** V1

Players can build and manage a personal friends list.

#### Features

- Send Friend Request
- Accept Request
- Reject Request
- Cancel Pending Request
- Remove Friend
- Search Players
- Favorite Friends (Planned)

#### Friend Rules

- Friendship requires mutual acceptance.
- Duplicate requests are not allowed.
- Blocked players cannot become friends.
- Friend relationships are synchronized across all supported games.

---

### 4.2 Player Profile

**Status:** V1

Every player profile displays public information.

#### Public Information

- Avatar
- Avatar Frame
- Username
- Country Flag
- Level
- Competitive Rank
- Player ID
- Online Status

#### Planned Information

- Bio
- Favorite Game
- Showcase Achievements
- Profile Themes

#### Profile Actions

Players may:

- Send Friend Request
- Invite to Match
- Send Message
- Report Player
- Block Player

---

### 4.3 Private Chat

**Status:** V1

Private chat is available only between friends.

#### Features

- Text Messages
- Emoji Support
- Sticker Support (Future)

#### Chat Restrictions

Chat is disabled:

- During active gameplay
- Between blocked users

Future versions may introduce optional voice messaging.

---

### 4.4 Presence System

**Status:** V1

Player presence is updated in real time.

Available States: Online, Offline, Away, In Lobby, Matchmaking, In Match.

Presence information is visible only according to the user's privacy settings.

---

### 4.5 Notifications

**Status:** V1

The platform delivers real-time notifications.

#### Notification Types

- Friend Request
- Friend Accepted
- Match Invitation
- Daily Reward
- Achievement Unlocked
- Mission Completed
- Season Reward
- System Announcement
- Teammate Disconnection
- Match Forfeit

Players may individually enable or disable supported notification categories.

---

### 4.6 Invite System

**Status:** V1

Players may invite friends directly into private matches.

Invitation flow:

1. Send Invitation
2. Accept or Decline
3. Join Lobby
4. Ready Check
5. Match Start

Expired invitations are automatically removed.

---

### 4.7 Block System

**Status:** V1

Players can block unwanted users.

Blocked players:

- Cannot send messages
- Cannot send invitations
- Cannot send friend requests
- Are excluded from friend suggestions

Blocking does not affect existing match history.

---

### 4.8 Report System

**Status:** V1

Players may report inappropriate behavior.

#### Report Categories

- Cheating
- Offensive Username
- Harassment
- AFK
- Match Throwing
- Spam

Reports are reviewed by automated systems and may be escalated for manual review when necessary.

False reporting may negatively affect the reporter's Fair Play Score.

---

### Privacy Principles

CardVerse respects player privacy.

Players control visibility of:

- Online Status
- Last Seen
- Friend Requests
- Match Invitations

Additional privacy controls may be introduced in future releases.

---

### General Principles

The social system must remain:

- Secure
- Privacy-aware
- Cross-platform
- Scalable
- Moderated
- Independent of gameplay balance

Social features must enhance community interaction without affecting competitive fairness.

---

## 5. Economy

### Purpose

This chapter defines the economic systems of CardVerse, including currencies, rewards, cosmetic content and monetization principles.

---

### 5.1 Economy Philosophy

CardVerse follows a **Free-to-Play** model.

The platform must never introduce Pay-to-Win mechanics.

Competitive fairness always has higher priority than monetization.

---

### 5.2 Currencies

#### Coins

**Status:** V1

Coins are the primary in-game currency.

Players earn Coins through gameplay and spend them on cosmetic content.

Sources of Coins:

- Ranked Match Victories
- Daily Rewards
- Weekly Missions
- Seasonal Rewards
- Achievements
- Events
- Tournament Rewards (Future)

#### Gems

**Status:** Planned

Gems are the premium currency.

Possible Sources:

- Real Money Purchases
- Promotional Events
- Seasonal Rewards

Gems are never required to remain competitive.

---

### 5.3 Shop

**Status:** V1

The in-game shop offers cosmetic items.

#### Categories

- Avatars
- Avatar Frames
- Card Backs
- Table Themes
- Profile Decorations
- Emotes
- Titles

#### Future Categories

- Sticker Packs
- Sound Packs
- Animated Cosmetics

---

### 5.4 Cosmetic Rules

Cosmetic items may change:

- Appearance
- Animations
- Profile Presentation

Cosmetics must never affect:

- Gameplay
- Card Distribution
- Matchmaking
- AI Behavior
- Player Statistics

---

### 5.5 Daily Rewards

**Status:** V1

Players receive login rewards once per day.

Possible Rewards: Coins, XP, Cosmetic Items, Limited-Time Bonuses.

Future versions may introduce login streak bonuses.

---

### 5.6 Missions

**Status:** V1

Mission System encourages continuous engagement.

#### Daily Missions

Reset every day.

#### Weekly Missions

Reset every week.

#### Seasonal Missions

Available during active seasons.

Mission Rewards: Coins, XP, Cosmetics, Titles.

---

### 5.7 Achievements

Achievements reward important milestones.

Examples: First Victory, 100 Wins, Fair Player, Ranked Champion, Veteran Player.

Achievement rewards may include: Coins, Badges, Titles, Exclusive Cosmetics.

---

### 5.8 Battle Pass

**Status:** Planned

Battle Pass provides seasonal progression.

Possible Features:

- Free Track
- Premium Track
- Exclusive Cosmetics
- Seasonal Missions
- Bonus Rewards

Battle Pass content remains cosmetic only.

---

### 5.9 Seasonal Rewards

At the end of each season, players may receive rewards based on:

- Final Rank
- Seasonal Rating
- Fair Play Score
- Participation

Rewards may include: Coins, Titles, Frames, Exclusive Cosmetics.

---

### 5.10 Monetization Principles

**Allowed:**

- Cosmetic Purchases
- Optional Premium Features
- Battle Pass
- Profile Customization

**Not Allowed:**

- Pay-to-Win
- Gameplay Advantages
- Stronger Cards
- Better Matchmaking
- Increased Win Probability

---

### Economy Balance Principles

The economy must remain:

- Fair
- Sustainable
- Transparent
- Rewarding
- Long-term

Players who never spend real money must still be able to enjoy the complete competitive experience.

---

### General Principles

Every economic feature must satisfy the following requirements:

- Competitive Fairness
- Transparent Rewards
- No Hidden Advantages
- Long-Term Sustainability
- Positive Player Experience

The economy exists to support player engagement and platform sustainability—not to influence competitive outcomes.

---

## 6. Game Flow

### Purpose

This chapter defines the complete lifecycle of a match, from player login to reward distribution and post-match actions.

---

### 6.1 High-Level Flow

The standard player journey is:

1. Launch Game
2. Authentication
3. Main Menu
4. Select Game Mode
5. Matchmaking or Private Lobby
6. Match Found
7. Ready Check
8. Match Start
9. Gameplay
10. Match End
11. Result Processing
12. Rewards
13. Return to Lobby

---

### 6.2 Authentication

**Status:** V1

Supported methods: Guest Login, Google Sign-In.

After authentication, player data is synchronized before entering the main menu.

---

### 6.3 Main Menu

The Main Menu provides access to:

- Play
- Friends
- Profile
- Shop
- Missions
- Achievements
- Settings

Future versions may introduce additional sections.

---

### 6.4 Match Creation

**Ranked Match:** The matchmaking service automatically searches for suitable opponents.

**Friendly Match:** The host creates a private lobby and invites friends.

**Practice Match:** A local or server-managed AI match is created immediately.

---

### 6.5 Matchmaking

**Status:** V1

Matchmaking prioritizes:

1. Similar Skill Rating
2. Similar Fair Play Score
3. Similar Network Latency
4. Similar Geographic Region
5. Waiting Time

Search parameters gradually expand to reduce queue times while maintaining fairness.

---

### 6.6 Lobby

Before the match begins, players enter a lobby.

Lobby responsibilities:

- Display participants
- Verify player readiness
- Synchronize game configuration
- Handle invitations
- Prepare game session

The lobby is authoritative and synchronized by the server.

---

### 6.7 Ready Check

All participants must confirm readiness.

If a player does not respond before the timeout:

- The player is removed from the queue, or
- The lobby is cancelled, depending on the selected game mode.

---

### 6.8 Gameplay

During gameplay, the platform is responsible for:

- Player synchronization
- Turn management
- Network recovery
- Disconnect handling
- Rule enforcement
- Anti-cheat validation

Game-specific rules are defined in the corresponding RuleBook.

---

### 6.9 Reconnection

**Status:** V1

If a player disconnects:

- Their seat is reserved (if teammate chooses to continue)
- A temporary AI replaces them
- The player may reconnect within the configured timeout
- Control returns automatically after reconnection

If the timeout expires or teammate forfeits, the AI completes the match.

---

### 6.10 Match Completion

When the match ends, the platform:

- Determines the winner
- Validates match integrity
- Records the final result

Game-specific scoring is handled by the game engine.

---

### 6.11 Reward Processing

After validation, eligible rewards are distributed.

Possible rewards include: XP, Coins, Achievement Progress, Mission Progress, Seasonal Progress.

Only valid matches generate rewards.

---

### 6.12 Statistics Update

The platform updates:

- Match History
- Win/Loss Record
- Rank
- Seasonal Rating
- Fair Play Score
- Lifetime Statistics

Statistics are stored permanently.

---

### 6.13 Post-Match Options

Players may choose to:

- Return to Main Menu
- Start Matchmaking Again
- Invite Friends
- View Match Results
- Open Player Profiles

Future versions may support: Rematch Voting, Replay Viewer, Match Sharing.

---

### General Principles

The complete game flow must be:

- Predictable
- Reliable
- Recoverable
- Secure
- Fair
- Consistent

Every multiplayer session must produce a single validated result that is recorded by the platform.

---

## 7. Future Roadmap

### Purpose

This chapter outlines the long-term vision of CardVerse beyond Version 1.0.

The roadmap serves as strategic guidance only and does not define implementation priorities.

---

### Version 1.0

**Platform:**

- Authentication
- Google Sign-In
- Guest Mode
- Friends System
- Private Chat
- Player Profiles
- Notifications

**Gameplay:**

- Hokm (including Sars, Nars, Tak Nars)
- Practice Mode
- Friendly Match
- Ranked Match
- AI Replacement (with team disconnection)
- Reconnect System

**Progression:**

- XP
- Level
- Competitive Rank
- Seasonal Rating
- Fair Play Score
- Achievements

**Economy:**

- Coins
- Cosmetic Shop
- Daily Rewards
- Weekly Missions

---

### Planned Releases

#### Competitive

- Tournament System
- Spectator Mode
- Replay System
- Match History Viewer

#### Social

- Voice Messages
- Guild System
- Team System
- Community Events

#### Customization

- Avatar Builder
- Animated Cosmetics
- Premium Themes
- Advanced Profiles

#### Economy

- Gems
- Battle Pass
- Seasonal Shop
- Limited-Time Events

#### Platform Expansion

- Native Android Application
- Native iOS Application
- Additional Authentication Providers
- Cross-Platform Synchronization

---

### Future Games

The CardVerse platform is designed to support multiple traditional card games.

Planned games, in priority order:

1. **Bidel**
2. **Shelem**
3. **Haft Khabis**
4. **Bank (21)**
5. **Pasur (11)**
6. **Poker** (requires its own dedicated engine — see ARCHITECTURE.md)

Additional games may be added without fundamental architectural changes, provided they follow the same Platform-First rule (PROJECT_DNA.md).

---

### Product Principles

Future development must continue to follow the project's core principles.

Every new feature must:

- Improve player experience.
- Preserve competitive fairness.
- Reuse existing platform infrastructure.
- Maintain architectural consistency.
- Avoid unnecessary complexity.

---

## 8. Glossary

### Platform Terms

**CardVerse** — The complete gaming platform ecosystem. Includes all games, services, infrastructure and documentation.

**Platform** — The shared infrastructure and services that support all games. Includes authentication, profiles, friends, matchmaking, economy, etc.

**Game** — A specific card game implemented on the platform (e.g., Hokm, Shelem).

**Module** — A self-contained component with a single responsibility. Modules communicate through well-defined interfaces.

**Monorepo** — A single repository containing multiple projects and modules.

---

### Gameplay Terms

**Match** — A complete competitive session consisting of one or more Hands.

**Hand** — A single round of a card game. In Hokm, a Hand consists of up to 13 Tricks.

**Trick** — One complete cycle in which every player plays exactly one card.

**Leading Suit** — The suit of the first card played in a Trick. All subsequent players must follow this suit if possible.

**Trump Suit (Hokm)** — The suit selected by the Hakem that outranks all other suits for the duration of the Hand.

**Dealer** — The player responsible for dealing the cards to all players.

**Hakem** — The player responsible for selecting the Trump Suit. The Hakem has special authority in the game.

**Hand Point** — The score awarded after winning a Hand.

**Kooti** — A victory in which the losing team wins zero Tricks. Worth 2 Hand Points.

**Hakem Kooti** — A Kooti achieved by the Hakem's team. Worth 3 Hand Points.

**Bam** — A victory achieved by winning all thirteen Tricks in a Hand. Immediately ends the Match.

**AI Replacement** — A temporary AI-controlled player that replaces a disconnected player until they reconnect or the timeout expires.

---

### Technical Terms

**Frozen Document** — A document that has been reviewed, approved and should not be modified without formal approval. Changes require updating the Version History.

**Operational Document** — A document that is expected to evolve throughout the project lifecycle. Examples: DASHBOARD.md.

**Technical Debt** — The cost of additional rework caused by choosing an easy solution now instead of a better approach that would take longer.

**Single Source of Truth** — The principle that every concept should have exactly one authoritative document.

**Documentation First** — The principle that documentation must be created before implementation begins.

**Server Authoritative** — The principle that the server is the only trusted source of game state. Clients never determine gameplay outcomes.

---

### Architecture Terms

**Modular Monolith** — A single deployment containing multiple modules that are logically independent but share the same runtime.

**Microservice Ready** — Architecture designed so that modules can be extracted into independent services in the future without significant redesign.

**Domain-Driven Design (DDD)** — An approach that models software to match business domains.

**Hexagonal Architecture** — An architecture that isolates business logic from infrastructure and external services.

**Layer** — A logical grouping of modules with similar responsibilities. CardVerse has four layers: Platform, Engine, Game and Shared.

**Domain Event** — A significant business occurrence that other modules may react to.

---

## 9. References

Related documents:

- README.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- RULEBOOK.md
- PROJECT_RULES.md
- PROJECT_DNA.md
- CARDVERSE_INDEX.md
- DASHBOARD.md

---

## 10. Version History

| Version | Date       | Description                                                                                                                                                                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-06-30 | Initial Enterprise Foundation                                                                                                                                                                                                                        |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                                                                                                                                                                                                                       |
| 0.2.0   | 2026-07-07 | Updated Glossary section with comprehensive terminology                                                                                                                                                                                              |
| 0.3.0   | 2026-07-12 | corrected future game roadmap to priority order (Bidel, Shelem, Haft Khabis, Bank/21, Pasur/11, Poker); clarified Nars/Tak Nars/Sars are Hokm sub-modes, not separate games; aligned Bot Replacement section with finalized RULEBOOK.md online rules |
| 0.4.0   | 2026-08-09 | Added team disconnection rules, bot scenarios (0-3 bots), invisible bots for early phases, bot limits (max 3 per match, never share a team), teammate decision flow, and updated notification types                                                  |

---

**Document Status:** Frozen

This document is the authoritative business specification for CardVerse.

All architectural, database, API and implementation decisions must remain consistent with this document.

Changes to this document require updating the Version History.
