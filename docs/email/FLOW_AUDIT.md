# Email Flow Audit

This document maps existing or expected transactional email flows to code locations and required template data. It is static documentation – no runtime changes were made.

## Legend
- Flow: Business event
- File & line: Absolute path and approximate line(s) of relevant code
- Handler/Function: Primary function/method
- Trigger: HTTP route/method or internal call
- Templates: Expected email templates
- Template vars: Variables passed into template (required)
- Subject key: i18n key in `backend/app/email_templates/i18n/en.json` (if present)
- URL pattern: Expected web URL (https)
- Throttle: Throttling/Idempotence (present or suggestion)
- Notes: Risks / TODOs / gaps

---

## Summary Table

| Flow | File & line | Handler/Function | Trigger | Templates | Template vars | Subject key | URL pattern | Throttle/Idempotence | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Password Reset – Request | nenalezeno | nenalezeno | nenalezeno | `password_reset` | `action_url` (+ optional `user_name`) | `subjects.password_reset` | `https://comparee.ai/auth/reset?token=...` | navrh: 3/min/IP+user | V repu není tok resetu; UI má placeholder tlačítko (viz snippet) |
| Password Reset – Confirm | nenalezeno | nenalezeno | nenalezeno | `password_reset` | `action_url` | `subjects.password_reset` | `https://comparee.ai/auth/reset?token=...` | navrh: idempotent token | Nedefinováno |
| Verify Email – Request | nenalezeno | nenalezeno | nenalezeno | `verify_email` | `action_url` | `subjects.verify_email` | `https://comparee.ai/auth/verify?token=...` | navrh: 3/min/email | Nedefinováno |
| Verify Email – Confirm | nenalezeno | nenalezeno | nenalezeno | `verify_email` | `action_url` | `subjects.verify_email` | `https://comparee.ai/auth/verify?token=...` | navrh: idempotent token | Nedefinováno |
| Welcome Email | nenalezeno | nenalezeno | nenalezeno | `generic_notice` (dočasně) | `message`, optional `action_url` | missing | `https://comparee.ai/...` | navrh: once per signup | Nedefinováno |
| Company/Team Invite | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message`, `action_url` | missing | `https://comparee.ai/company/invite?token=...` | navrh: 3/min | Nedefinováno |
| Company Role Change | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message` | missing | n/a | n/a | Nedefinováno |
| Billing – Invoice Paid | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message`, `action_url` (invoice URL) | missing | invoice URL | navrh: idempotent | Stripe knihovna existuje, ale tok mailu nenalezen |
| Billing – Payment Failed | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message`, `action_url` (update payment) | missing | billing URL | navrh: 1/h | Stripe přítomen, ale žádný email tok |
| Trial Ending | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message`, optional `action_url` | missing | `https://comparee.ai/...` | navrh: once/day | Nenalezeno |
| Subscription Updated/Canceled | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message` | missing | n/a | idempotent | Nenalezeno |
| Content – Export Ready | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message`, `action_url` (download) | missing | download URL | navrh: idempotent | Nenalezeno |
| Content – Import Failed | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message` | missing | n/a | n/a | Nenalezeno |
| Moderation Notice | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message` | missing | n/a | n/a | Nenalezeno |
| Contact/Support Confirmation | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message` | missing | n/a | n/a | Nenalezeno |
| Admin – Critical Error Alert | nenalezeno | nenalezeno | nenalezeno | `generic_notice` | `message` | missing | n/a | rate limit | V `lib/translation/processor.ts` pouze TODO komentář |

---

## Code Snippets (context)

### Password Reset placeholder (UI)
```12:18:components/LoginForm.tsx
          <button
            type="button"
            onClick={() => {}} // TODO: Implement password reset
            className="text-sm text-gradient-primary hover:opacity-80 transition-opacity"
          >
            Forgot password?
          </button>
```

### Email template renderer (expects concrete templates)
```62:71:backend/app/services/email_template_renderer.py
        # Render HTML by including the partial template inside base layout
        # We expect concrete templates in root, e.g., password_reset.html.j2
        try:
            content_tpl = self.env.get_template(f"{template_name}.html.j2")
        except Exception:
            raise ValueError(f"Template not found: {template_name}.html.j2")
```

### Available templates and i18n keys
```1:24:backend/app/email_templates/i18n/en.json
{
  "subjects": {
    "password_reset": "Reset your password",
    "verify_email": "Verify your email",
    "generic_notice": "Important notice"
  },
  "headings": {
    "password_reset": "Reset your password",
    "verify_email": "Verify your email",
    "generic_notice": "Notice"
  },
  "messages": {
    "password_reset_intro": "You requested to reset your password.",
    "verify_email_intro": "Please confirm your email address to continue.",
    "link_expires": "If the button does not work, copy the link below:",
    "ignore_if_not_you": "If you did not request this, you can ignore this email."
  },
  "buttons": {
    "reset_password": "Reset password",
    "verify_email": "Verify email",
    "view_details": "View details"
  }
}
```

### Admin test endpoints for templates
```1:38:backend/app/api/admin_email_test.py
router = APIRouter(prefix="/admin/email", tags=["admin-email"])
...
@router.post("/preview-template", response_model=TemplatePreviewResponse)
async def preview_template(...):
    ...

@router.post("/send-template-test", response_model=EmailTestResponse)
async def send_template_test(...):
    ...
```

### Webhooks – Postmark (bounces/complaints)
```15:30:backend/app/api/webhooks_postmark.py
@router.post("/webhooks/postmark")
async def webhooks_postmark(request: Request):
    if not settings.WEBHOOKS_ENABLED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Webhooks disabled")
    raw = await request.body()
    signature = request.headers.get("X-Postmark-Signature")
    ...
```

### Admin – List/Get bounces (Postmark API)
```13:34:backend/app/api/admin_email_events.py
POSTMARK_API = "https://api.postmarkapp.com"
TIMEOUT = 5.0
...
@router.get("/bounces")
async def list_bounces(...):
    ...

@router.get("/bounces/{bounce_id}")
async def get_bounce(...):
    ...
```

---

## Prioritization
- P1 (connect now): Password Reset (request + confirm), Verify Email (request + confirm)
- P2: Team/Company invites; Billing emails (invoice paid/failed, receipts) – Stripe integrace existuje, ale žádné email hooks nenalezeny
- P3: Welcome email, moderation notices, export/import notifications, support confirmations

## Throttle/Idempotence recommendations
- Password Reset/Verify Email: throttle 3/min per email/IP; tokens one-time, expiring 15–30 min; idempotent confirm
- Invites: 3/min per inviter; token expiry 7–14 days
- Billing: provider webhooks + idempotent send; daily summary fallback
