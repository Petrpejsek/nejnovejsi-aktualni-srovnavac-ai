# Email templates

Minimal transactional templates with strict rendering.

See also: `docs/email/PROD_CHECKLIST.md` for production verification steps.

## Required variables per template

- password_reset
  - action_url (absolute http/https URL)
- verify_email
  - action_url (absolute http/https URL)
- generic_notice
  - message (string)
  - action_url (optional, absolute URL)

## Subject
- Must be provided via `i18n/en.json` in `subjects.<template>` or explicitly via renderer context `subject`.
- If missing → error "Subject is required".

## Text part
- Controlled via `EMAIL_TEXT_MODE`:
  - `explicit`: The file `<template>.txt.j2` is mandatory for ALL templates and must render non-empty text. If missing or empty → error "Plain text part missing (EMAIL_TEXT_MODE=explicit)".
  - `auto` (default): If `<template>.txt.j2` does not exist, text is generated from HTML via `html2text`. If generation fails or is empty → error "Plain text generation failed".

## Strict mode
- If `EMAIL_TEMPLATE_STRICT=true` (default), renderer uses Jinja2 StrictUndefined.
- Missing variables cause error like `Missing template variable: user_name`.

## Notes
- Brand fields are optional: `BRAND_NAME`, `BRAND_LOGO_URL`, `BRAND_SUPPORT_EMAIL`.
- Keep templates in EN only for now.
