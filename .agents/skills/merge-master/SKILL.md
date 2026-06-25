---
name: merge-master
description: Use when a completed local work branch has already passed internal verification and needs to be merged into master with branch cleanup
---

# Merge Master

## Overview

Merge a verified work branch into `master`, verify the merged result, then remove the local work branch. Do not push unless the user explicitly requests it.

## Preconditions

- The implementation is committed on a non-`master` branch.
- Internal tests, lint, and build relevant to the change have already passed, or must be run before merging.
- The worktree is clean.
- The user has explicitly requested merge/cleanup or this skill was called by another approved skill.

## Procedure

1. Announce that `merge-master` is being used.
2. Check `git status --short`, current branch, and `git branch --merged master`.
3. If verification evidence is missing, run the relevant project checks from `AGENTS.md` and area docs before merge.
4. Switch to `master`.
5. Merge the work branch into `master`.
6. Run a focused verification on the merged result.
7. Delete only the local branch that was just merged with `git branch -d`.
8. Report current branch, HEAD SHA, deleted branch, verification commands, and push status.

## Safety Rules

- Never delete a branch that is not merged into `master`.
- Never force-delete with `git branch -D` unless the user explicitly confirms it.
- Never delete remote branches unless the user explicitly asks.
- Never push unless the user explicitly asks.
- If merge conflicts occur, stop and report the conflicted files.

## Quick Reference

| Step | Command |
| --- | --- |
| Check state | `git status --short` |
| Current branch | `git rev-parse --abbrev-ref HEAD` |
| Switch base | `git switch master` |
| Merge | `git merge <work-branch>` |
| Delete local branch | `git branch -d <work-branch>` |

