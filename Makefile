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


.PHONY: pm2-list pm2-restart pm2-restart-all pm2-logs

pm2-list:
	pm2 ls || pm2 status

pm2-restart:
	@[ -n "$(PROC)" ] || (echo "Set PROC=<pm2_name>"; exit 2)
	@if [ "$(UPDATE_ENV)" = "true" ]; then \
	  bash scripts/pm2-restart.sh $(PROC) --update-env; \
	else \
	  bash scripts/pm2-restart.sh $(PROC); \
	fi

pm2-restart-all:
	bash scripts/pm2-restart.sh all

pm2-logs:
	@[ -n "$(PROC)" ] || (echo "Set PROC=<pm2_name>"; exit 2)
	@[ -n "$(N)" ] || N=50; pm2 logs --lines $$N | cat

