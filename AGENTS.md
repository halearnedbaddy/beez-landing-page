<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Compose the Features page from the feature tabs, TrustSection, and BuiltOnSection as sibling sections; redirect retired hash addresses to Features so existing links still work.
- Load Google Maps once through a browser-only async callback loader; keep expansion overlays as illustrative targets, not live business activity, because no activity feed is connected.
- Keep footer destinations in one navigation group, location as plain text, and only actionable contact/app links; omit unavailable legal and social destinations to avoid dead links.
- Organise app code as src/features/<module> (sell, discover, ride, track, wallet, admin, auth) plus src/shared and src/marketing, mirroring the module boundaries in docs/production-architecture.md on Lovable's stack.
- Merchant shops start pending and owners can never change their own status (DB trigger); approval belongs to the admin module.
