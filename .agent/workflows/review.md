---
description: follow-up on PR reviews and comments
---

This workflow helps you address feedback on a Pull Request by fetching comments and proposed changes, then guiding you through the implementation of fixes or responses.

// turbo-all

1. Identify the current Pull Request.
2. Fetch reviews and comments using `gh pr view --json reviews,comments`.
3. Analyze the feedback and prioritize items that need code changes.
4. For each feedback item:
   - If it's a code suggestion, apply it or propose an alternative.
   - If it's a question, provide an answer.
   - If it's a request for changes, implement the necessary modifications.
5. Summarize the changes made in response to the review.
6. (Optional) Reply to comments using `gh pr comment` or `gh pr review --comment`.
7. Delete reviews & comments files that you retrieved
8. Create commit(s) for changes
9. Update remote branch

### Example Command

```bash
gh pr view --json reviews,comments
```
