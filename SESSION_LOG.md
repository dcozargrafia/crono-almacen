# Session Log - Crono-Almacén

> Track of learning sessions and project progress

---

## Session 1 - 2024-12-11

### Objective
Project setup and define working methodology with Claude as tutor.

### Completed
- [x] Explored existing project structure (NestJS auth starter)
- [x] Defined project purpose: timing equipment warehouse management
- [x] Clarified domain concepts (Device vs Product)
- [x] Created CLAUDE.md with project instructions
- [x] Created SESSION_LOG.md for session tracking
- [x] Defined coding conventions (English code, Spanish commits)
- [x] Agreed on TDD approach for testing
- [x] Agreed on feature branch workflow

### Decisions Made
- **API responses in English**: Frontend will handle translations
- **Soft delete**: For most entities
- **Audit fields**: Include createdBy/updatedBy
- **Architecture**: Keep standard NestJS pattern, don't overcomplicate
- **Testing**: TDD approach, focus on learning well over coverage numbers

### Current State
- Auth module implemented (register, login, JWT, roles)
- Single entity: Usuario (User)
- No other modules implemented yet

### Pending / Next Session
- [ ] Design data model for Devices
- [ ] Discuss relationships between entities
- [ ] Start implementing Device module with TDD

### Questions / Doubts
- Device serial number format to define
- Can a device be in multiple rentals simultaneously? (probably not, but confirm)
- What states can a device have? (available, rented, sold, in repair, retired?)

---

<!-- Template for new sessions:

## Session N - YYYY-MM-DD

### Objective
[What we plan to accomplish]

### Completed
- [ ] Task 1
- [ ] Task 2

### Decisions Made
- Decision 1: reason

### Pending / Next Session
- [ ] Item 1

### Questions / Doubts
- Question 1

-->
