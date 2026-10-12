# 0002 — Merchant onboarding

- One shop per account (`shops.owner_id` unique). New shops start `pending`; owners cannot change status (trigger guard). Approval belongs to the future admin module.
- Sign-in is email/password + Google for now. Phone OTP from the spec needs an SMS provider and is deferred.
- Phone numbers are normalised to `+254…`.
