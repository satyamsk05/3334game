# AGENT RULES

## 1. THINK BEFORE CODING

Do not start coding immediately.

First understand:
- What the user wants
- Current architecture
- Existing implementation
- Dependencies and callers
- Root cause of the problem
- Possible side effects

Never guess.

If something is unclear or multiple interpretations exist:
- State the assumption
- Check the code/evidence
- Ask only when genuinely necessary
- Do not silently choose an interpretation

If the requested approach is unnecessarily complicated, say so and suggest the simpler approach before implementing.

---

## 2. SIMPLICITY FIRST

Use the minimum code required to solve the actual problem.

Do NOT:
- Over-engineer
- Add unnecessary abstractions
- Add unnecessary configuration
- Add unnecessary dependencies
- Build speculative features
- Create abstractions for one-time use
- Rewrite working code without a reason

Prefer:
- Existing project patterns
- Existing libraries already in the project
- Small, readable implementations
- Simple solutions over clever solutions

If 100 lines can solve something that would otherwise become 300 lines, prefer the simpler solution.

---

## 3. SURGICAL CHANGES

Change only what is required.

Do NOT:
- Refactor unrelated code
- Rename unrelated files
- Change UI unnecessarily
- Change comments unnecessarily
- Reformat unrelated files
- Delete unrelated dead code
- "Improve" code that is outside the current task

Every changed line should have a reason connected to the current task.

If unrelated problems are discovered:
- Record them
- Do not fix them during the current task

Only clean up imports, variables, or functions made unused by YOUR changes.

---

## 4. GOAL-DRIVEN EXECUTION

Every non-trivial task must have a measurable success condition.

Instead of:

"Fix the bug."

Use:

"Reproduce the bug → implement the fix → run the relevant test → verify the bug no longer occurs."

For multi-step work:

PLAN
→ IMPLEMENT
→ TEST
→ VERIFY
→ COMPLETE

Do not declare success because the code looks correct.

Success requires evidence.

---

## 5. ONE PROBLEM AT A TIME

For audits, migrations and bug fixing use:

FIXED → TEST → PASS → NEXT

Workflow:

1. Select ONE problem.
2. Inspect it completely.
3. Identify the root cause.
4. Make the smallest correct fix.
5. Run relevant tests.
6. Verify the result.
7. If PASS → continue to the next problem.
8. If FAIL → stay on the current problem and fix it.
9. Never move forward with a failed verification.

Continue automatically unless a real ambiguity requires user input.

---

## 6. EVIDENCE FIRST

Never invent findings.

Every audit finding must contain:

PROBLEM
EXACT FILE
EXACT ROOT CAUSE
EVIDENCE
IMPACT
EXACT FIX
TEST
RESULT

If something cannot be confirmed from the available source/code/runtime:

UNCONFIRMED — REQUIRES RUNTIME VERIFICATION

Do not present assumptions as facts.

---

## 7. UNDERSTAND EXISTING CODE BEFORE REPLACING IT

Before rewriting or replacing an existing implementation:

- Find all callers
- Find all dependencies
- Check data flow
- Check state ownership
- Check error handling
- Check tests
- Check runtime behavior when relevant

Do not replace an implementation simply because another approach looks cleaner.

---

## 8. PRESERVE EXISTING BEHAVIOR

Unless the task explicitly requires behavior changes:

Existing:
- UI
- navigation
- APIs
- game rules
- wallet behavior
- authentication behavior
- animations
- user flows

must remain unchanged.

A refactor should not silently become a feature change.

---

## 9. ARCHITECTURE & FILE MOVES

For architecture migrations:

Move ONE logical unit at a time.

For each move:

MOVE
→ UPDATE IMPORTS/REFERENCES
→ COMPILE
→ TEST
→ VERIFY
→ GRAPHIFY UPDATE
→ NEXT

Do not perform a giant migration in one operation.

---

## 10. GRAPHIFY

Use Graphify as the project's structural knowledge graph.

Before major changes:
- Inspect existing graph/context.

After structural changes:
- Update Graphify.

Do not repeatedly rediscover the entire repository when existing graph information already answers the question.

---

## 11. PERFORMANCE

When investigating performance, measure before changing.

Check where relevant:

- Main-thread work
- Compose recomposition
- Lazy layouts
- Image decoding
- Bitmap sizes
- Memory cache
- Disk cache
- WebView cache
- Rive/Lottie rendering
- Coroutines
- Network calls
- WebSocket processing
- Memory leaks
- Startup time
- Frame drops
- APK size
- Baseline Profile
- CPU/GPU usage

Do not claim "faster" or "smooth" without evidence.

---

## 12. STORAGE & CACHING

Prefer Android app-specific storage and cache mechanisms.

Use appropriate:
- Memory cache
- Disk cache
- App cache
- App-specific files
- Local persistence

Do not request storage permissions unless the actual feature requires them.

Do not permanently store temporary data.

Sensitive information must not be stored as plaintext.

---

## 13. SECURITY

Security is important, but do not turn every task into an unrelated security refactor.

When security is relevant, verify:

- Authentication
- Authorization/RBAC
- Session handling
- JWT validation
- User identity binding
- WebSocket authorization
- Server-authoritative game state
- Wallet/financial integrity
- Payment flows
- Rate limiting
- CORS
- CSP
- WebView security
- TLS/SSL
- Secrets
- PII/logging
- Database access
- Admin security
- Android permissions

Never trust security-sensitive values supplied by the client without server verification.

---

## 14. TESTING

Run the smallest relevant test first.

Then run broader verification when appropriate.

### Backend
- Unit tests
- Integration tests
- Security tests
- TypeScript build

### Android
- Compile
- Unit tests
- Instrumentation tests when relevant
- Debug/release build when relevant

### Runtime
When source inspection cannot prove behavior:
- Test the actual runtime behavior
- Record the result

Never say:

"Fixed"

before verification.

---

## 15. NO UNREQUESTED FEATURES

Do not add features just because they might be useful.

Do not:
- Add UI features
- Add permissions
- Add analytics
- Add dependencies
- Add configuration
- Add APIs
- Add abstractions

unless required by the task or clearly justified.

---

## 16. KEEP THE USER'S GOAL ABOVE THE IMPLEMENTATION

The requested implementation is not always the actual goal.

Understand the desired outcome.

If there is a simpler or safer way to achieve the same outcome:

1. Explain it briefly.
2. Let the user choose when the decision materially changes the project.
3. Otherwise use the simpler approach when it is clearly within scope.

---

## 17. WHEN YOU FIND A BETTER APPROACH

Before making a major architectural or implementation decision:

BETTER APPROACH:
Why:
Trade-off:
Impact:

Then proceed with the appropriate approach.

Do not blindly follow a technically inferior implementation when a materially better solution is obvious.

---

## 18. RELEASE / PRODUCTION CHECK

Before declaring production-ready, verify relevant areas:

- Release build
- R8/ProGuard
- Debug code
- Secrets
- HTTPS/WSS
- WebView
- Permissions
- Crash handling
- Logging
- Database migrations
- Wallet consistency
- Realtime reliability
- Backup/recovery
- Rate limiting
- Admin security
- Performance

Only mark an item verified when evidence exists.

---

## 19. STATUS FORMAT

Keep progress concise.

Use:

FIXED → TEST → PASS → NEXT

or:

FIXED → TEST → FAIL → RETRY

For audit findings:

PROBLEM → EVIDENCE → FIX → TEST → RESULT

At the end:

CRITICAL: X
HIGH: X
MEDIUM: X
LOW: X
UNCONFIRMED: X

Do not generate unnecessary long explanations.

---

## 20. FINAL PRINCIPLE

Think first.

Keep it simple.

Change the minimum.

Do not guess.

Do not over-engineer.

Do not touch unrelated code.

Define success.

Test it.

Verify it.

Then move to the next problem.