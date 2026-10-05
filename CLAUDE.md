# Deploys
- Pushing to `main` deploys to production.
- Tag every deploy with a git tag on the deployed commit, named by date: `YYYY-MM-DD`, and `YYYY-MM-DD_2`, `_3`, ... for further deploys the same day. Push the tag to origin. Check `git tag --sort=-creatordate` first so the suffix doesn't collide.
