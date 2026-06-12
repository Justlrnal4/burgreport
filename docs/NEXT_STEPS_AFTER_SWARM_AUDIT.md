# BurgReport — Immediate Next Steps (Post Swarm Audit)

All local repo work has been committed where possible.

## What Has Been Done Automatically
- Committed + pushed `LOVABLE_PROMPT_PACK.md` and updated `REMEDIATION_BRIEF_2026-05-29.md` in the main burgreport repo.
- Made and committed honest updates to the BurgReport portfolio deep-dive page in justinerwin-com (on local branch `feat/lab-builds-add-teetimebuddy`).

## What You Still Need to Do Manually

### 1. Lovable Frontend Updates (Highest Impact)
- Open the file: `docs/LOVABLE_UPDATE_PROMPTS_READY_TO_PASTE.md`
- Copy the prompts one by one into your Lovable project for burgreport.com
- Publish the changes
- This directly fixes the "Powered by Wine-Searcher" and "LIVE" badge overclaims.

### 2. Railway + RLS (Technical Blocker)
1. Go to Supabase → Project Settings → API
2. Copy the **service_role** key (the long `eyJ...` one)
3. In Railway → BurgReport project → Variables:
   - Add `SUPABASE_SERVICE_KEY` = the service_role key
4. Redeploy the backend
5. In Supabase SQL Editor, run the verification queries from:
   `supabase/migrations/20260527000000_rls_policies.sql` (bottom of the file)

### 3. Portfolio Screenshots
- After Lovable changes are live, take fresh screenshots of real results
- Replace the old demo images in:
  - `~/projects/justinerwin-com/public/burgreport/`
  - Any copies in your Obsidian vault

### 4. Handle the justinerwin-com Branch
You are currently on branch `feat/lab-builds-add-teetimebuddy`.
The BurgReport honesty updates are committed locally there.

Options:
- Switch to main and cherry-pick: `git checkout main && git cherry-pick 7111c84`
- Or push the feature branch and open a PR
- Or force the change onto main if you're okay with it

### 5. Optional Cleanup (Recommended)
- Delete or move the 664MB legacy archive: `~/projects/burgreport-archive/`
- Remove the stray empty git: `rm -rf ~/projects/.git`

---

Run the Lovable prompts first — this gives the biggest credibility win.
