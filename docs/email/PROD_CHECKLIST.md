# Email PROD Checklist

Use this brief checklist after deploying transactional email templates.

1) DNS & Domain
- DKIM/SPF for `comparee.ai` verified in Postmark (Sender Signatures/Domains)
- Postmark domain status: Verified

2) Streams
- Transactional stream `outbound` exists and is active

3) Production ENV
- EMAIL_PROVIDER=postmark
- EMAIL_FROM=noreply@comparee.ai
- POSTMARK_SERVER_TOKEN=*** (set)
- POSTMARK_MESSAGE_STREAM=outbound
- EMAIL_TEXT_MODE=explicit
- EMAIL_TEMPLATE_STRICT=true
- Base URL vars set (e.g. `PYTHON_API_URL=https://comparee.ai/api/python` or `NEXT_PUBLIC_API_BASE_URL=https://comparee.ai/api`)

4) Restart services
- pm2 restart comparee-nextjs
- (if separate backend) pm2 restart comparee-backend

5) Admin UI checks
- /admin/email-templates → Preview returns valid HTML + TEXT (no errors)
- Send test → delivered, visible in Postmark Activity (MessageID present)

6) Headers (delivery)
- In mailbox (e.g., Gmail → Show original): DKIM=pass, SPF=pass

7) Bounces
- Not handled yet (webhooks planned later), but Postmark Activity should show Delivered

8) Strict templates
- Intentionally remove a required variable in Preview → expect 400 with clear message
