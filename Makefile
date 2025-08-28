.PHONY: check-prod-env

check-prod-env:
	bash scripts/validate-prod-env.sh .env.production

.PHONY: smoke-reset-request smoke-reset-confirm smoke-verify-request smoke-verify-confirm

smoke-reset-request:
	BASE_URL?=https://comparee.ai
	EMAIL?=
	BASE_URL=$(BASE_URL) EMAIL=$(EMAIL) bash scripts/smoke/reset-request.sh $(EMAIL)

smoke-reset-confirm:
	BASE_URL?=https://comparee.ai
	TOKEN?=
	NEW_PASSWORD?=
	BASE_URL=$(BASE_URL) TOKEN=$(TOKEN) NEW_PASSWORD=$(NEW_PASSWORD) bash scripts/smoke/reset-confirm.sh $(TOKEN) $(NEW_PASSWORD)

smoke-verify-request:
	BASE_URL?=https://comparee.ai
	EMAIL?=
	BASE_URL=$(BASE_URL) EMAIL=$(EMAIL) bash scripts/smoke/verify-request.sh $(EMAIL)

smoke-verify-confirm:
	BASE_URL?=https://comparee.ai
	TOKEN?=
	BASE_URL=$(BASE_URL) TOKEN=$(TOKEN) bash scripts/smoke/verify-confirm.sh $(TOKEN)


