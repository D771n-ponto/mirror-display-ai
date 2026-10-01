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

- Leads are inserted directly from the public client (anon INSERT-only RLS); reads/updates require the `admin` role via `has_role`. Why: no public read path to PII.
- First authenticated user to open /admin becomes admin via `claim_first_admin()` RPC. Why: bootstrap without hardcoded credentials.
- Admin WhatsApp number lives in `src/lib/config.ts` (overridable by VITE_WHATSAPP_NUMBER). Why: single editable source.
