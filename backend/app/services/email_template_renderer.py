from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Tuple, Dict, Any

from jinja2 import Environment, FileSystemLoader, select_autoescape, StrictUndefined, TemplateError, UndefinedError
import html2text as html2text_lib

from ..config.settings import settings

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "email_templates")


class EmailTemplateRenderer:
    def __init__(self) -> None:
        self.env = Environment(
            loader=FileSystemLoader(TEMPLATES_DIR),
            autoescape=select_autoescape(["html", "xml"]),
            enable_async=False,
            trim_blocks=True,
            lstrip_blocks=True,
            undefined=StrictUndefined if settings.EMAIL_TEMPLATE_STRICT else None,
        )

        # Simple i18n support (EN only for now)
        i18n_path = os.path.join(TEMPLATES_DIR, "i18n", "en.json")
        if os.path.exists(i18n_path):
            with open(i18n_path, "r", encoding="utf-8") as f:
                self.i18n_en = json.load(f)
        else:
            self.i18n_en = {}

    def _build_context(self, locale: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        base_context = {
            "brand_name": settings.BRAND_NAME,
            "brand_logo_url": settings.BRAND_LOGO_URL or None,
            "support_email": settings.BRAND_SUPPORT_EMAIL or None,
            "year": str(datetime.utcnow().year),
            "t": self.i18n_en,  # only EN now
        }
        # Variables from caller override defaults
        base_context.update(variables or {})
        return base_context

    def render(self, template_name: str, locale: str, variables: Dict[str, Any]) -> Tuple[str, str, str]:
        """
        Returns (html, text, subject)
        - Uses layouts/base.html.j2 wrapping the specific template via {% block content %}
        - Generates text via html2text if not provided explicitly
        """
        context = self._build_context(locale, variables)

        # Subject from i18n if available: t.subjects.<template_name>
        subject = None
        subjects = self.i18n_en.get("subjects") if isinstance(self.i18n_en, dict) else None
        if isinstance(subjects, dict):
            raw_subject = subjects.get(template_name)
            if isinstance(raw_subject, str):
                subject = raw_subject

        # Render HTML by including the partial template inside base layout
        # We expect concrete templates in root, e.g., password_reset.html.j2
        try:
            content_tpl = self.env.get_template(f"{template_name}.html.j2")
        except Exception:
            raise ValueError(f"Template not found: {template_name}.html.j2")
        try:
            content_html = content_tpl.render(**context)
        except (TemplateError, UndefinedError) as e:
            # Try to extract missing variable name
            msg = str(e)
            if 'is undefined' in msg:
                # e.g., 'user_name' is undefined
                missing = msg.split('"')[1] if '"' in msg else None
                if missing:
                    raise ValueError(f"Missing template variable: {missing}")
            raise ValueError(f"Template render error: {msg}")

        try:
            base_tpl = self.env.get_template("layouts/base.html.j2")
        except Exception:
            raise ValueError("Base layout not found: layouts/base.html.j2")
        try:
            full_html = base_tpl.render(**{**context, "content": content_html})
        except (TemplateError, UndefinedError) as e:
            msg = str(e)
            if 'is undefined' in msg:
                missing = msg.split('"')[1] if '"' in msg else None
                if missing:
                    raise ValueError(f"Missing template variable: {missing}")
            raise ValueError(f"Template render error: {msg}")

        # action_url sanity (if provided)
        action_url = context.get('action_url')
        if action_url is not None:
            if not (isinstance(action_url, str) and (action_url.startswith('http://') or action_url.startswith('https://'))):
                raise ValueError("Invalid action_url: must be absolute http/https URL")

        # Convert HTML -> text
        html2text = html2text_lib.HTML2Text()
        html2text.ignore_links = False
        html2text.ignore_images = True
        html2text.body_width = 0
        # TEXT generation mode
        mode = (settings.EMAIL_TEXT_MODE or 'auto').lower()
        text: str
        if mode == 'explicit':
            # require explicit .txt.j2
            txt_path = f"{template_name}.txt.j2"
            try:
                txt_tpl = self.env.get_template(txt_path)
            except Exception:
                raise ValueError("Plain text part missing (EMAIL_TEXT_MODE=explicit)")
            try:
                text = txt_tpl.render(**context)
            except (TemplateError, UndefinedError) as e:
                msg = str(e)
                if 'is undefined' in msg:
                    missing = msg.split('"')[1] if '"' in msg else None
                    if missing:
                        raise ValueError(f"Missing template variable: {missing}")
                raise ValueError(f"Text template render error: {msg}")
            if not text or not text.strip():
                raise ValueError("Plain text part missing (EMAIL_TEXT_MODE=explicit)")
        else:
            # auto mode → try explicit, else html2text
            txt_template = None
            try:
                txt_template = self.env.get_template(f"{template_name}.txt.j2")
            except Exception:
                txt_template = None
            if txt_template is not None:
                try:
                    text = txt_template.render(**context)
                except (TemplateError, UndefinedError) as e:
                    msg = str(e)
                    if 'is undefined' in msg:
                        missing = msg.split('"')[1] if '"' in msg else None
                        if missing:
                            raise ValueError(f"Missing template variable: {missing}")
                    raise ValueError(f"Text template render error: {msg}")
            else:
                try:
                    html2text = html2text_lib.HTML2Text()
                    html2text.ignore_links = False
                    html2text.ignore_images = True
                    html2text.body_width = 0
                    text = html2text.handle(full_html)
                except Exception:
                    raise ValueError("Plain text generation failed")
                if not text or not text.strip():
                    raise ValueError("Plain text generation failed")

        # Subject required
        if not subject and not context.get('subject'):
            raise ValueError("Subject is required")
        final_subject = subject or str(context.get('subject'))
        if not final_subject or not str(final_subject).strip():
            raise ValueError("Subject is required")

        return full_html, text, final_subject


email_template_renderer = EmailTemplateRenderer()


