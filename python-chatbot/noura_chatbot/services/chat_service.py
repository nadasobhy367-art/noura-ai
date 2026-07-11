import json
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class ChatService:
    def __init__(self, config: dict):
        self.config = config
        self.quick_actions = [
            {"icon": "🧠", "label": "Cancer Awareness", "query": "Tell me about early cancer detection"},
            {"icon": "📋", "label": "How to Upload", "query": "How do I upload a scan for analysis?"},
            {"icon": "📊", "label": "Results Info", "query": "How do I view my analysis results?"},
            {"icon": "📅", "label": "Appointments", "query": "How do I schedule an appointment?"},
            {"icon": "🔒", "label": "Privacy", "query": "Is my data secure and private?"},
            {"icon": "💬", "label": "Contact Doctor", "query": "How do I contact my doctor?"},
        ]

    def get_mode(self) -> str:
        return "live-ai" if self.config["OPENROUTER_API_KEY"] else "demo-fallback"

    def utc_now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def get_quick_actions(self) -> list[dict]:
        return self.quick_actions

    def reply(self, message: str, history: list[dict]) -> tuple[int, dict]:
        if not self.config["OPENROUTER_API_KEY"]:
            return 200, {
                "ok": True,
                "reply": self.build_demo_medical_reply(message),
                "source": "demo-fallback",
                "mode": self.get_mode(),
            }

        return self.ask_openrouter(message, history)

    def build_demo_medical_reply(self, message: str) -> str:
        normalized = (message or "").lower()

        knowledge_map = [
            (
                ("upload", "scan", "رفع", "فحص"),
                "يمكنك رفع الفحص من صفحة Upload ثم متابعة النتيجة من Results. "
                "تأكد من اختيار الملف الصحيح، وإرفاق أي ملاحظات لازمة، ثم راجع الطبيب بعد ظهور التحليل.",
            ),
            (
                ("result", "analysis", "نتيجة", "تحليل", "confidence"),
                "يمكنك مراجعة النتائج من صفحة Results أو Patient Dashboard. "
                "النظام يوضح ملخص التحليل ونسبة الثقة، لكن التفسير النهائي لأي نتيجة طبية يجب أن يكون مع طبيب مختص.",
            ),
            (
                ("appointment", "schedule", "موعد", "حجز"),
                "يمكنك استخدام صفحة Appointments لحجز أو متابعة المواعيد. "
                "ولو احتجت مراجعة سريعة، استخدم الرسائل للتواصل مع الفريق الطبي.",
            ),
            (
                ("doctor", "message", "contact", "رسالة", "طبيب", "تواصل"),
                "يمكنك التواصل مع الطبيب من صفحة Messages داخل النظام. "
                "ولو كانت هناك أعراض عاجلة أو ألم شديد، الأفضل التواصل الطبي المباشر فورًا.",
            ),
            (
                ("privacy", "secure", "security", "خصوصية", "امان", "آمن"),
                "النظام مصمم ليكون آمنًا ويعتمد على حماية للبيانات داخل المنصة. "
                "لكن دائمًا تأكد من تسجيل الخروج وعدم مشاركة الحساب مع أي شخص آخر.",
            ),
            (
                ("cancer", "سرطان", "ورم"),
                "الاكتشاف المبكر مهم جدًا في متابعة السرطان عمومًا. "
                "الفحوصات الدورية ومراجعة الطبيب عند وجود أعراض أو تاريخ مرضي تساعد في التدخل المبكر، وهذه معلومات عامة وليست تشخيصًا نهائيًا.",
            ),
            (
                ("help", "support", "مساعدة", "help center"),
                "يمكنني مساعدتك في الاستخدام العام للنظام مثل رفع الفحوصات، قراءة النتائج، الرسائل، المواعيد، والخصوصية. "
                "ولو سؤالك طبي، سأعطيك معلومات عامة مع التنبيه للرجوع للطبيب المختص.",
            ),
        ]

        for keywords, response in knowledge_map:
            if any(keyword in normalized for keyword in keywords):
                return response

        return (
            "أنا في وضع المساعدة التجريبية الآن لأن مزود الذكاء الاصطناعي غير مضبوط على السيرفر. "
            "أقدر أوضح معلومات عامة عن النظام والفحوصات والنتائج، لكن القرار الطبي النهائي دائمًا يكون مع طبيب مختص."
        )

    def build_medical_messages(self, message: str, history: list[dict]) -> list[dict]:
        return [
            {
                "role": "system",
                "content": (
                    "You are Noura AI Medical Assistant. "
                    "Provide concise, supportive medical guidance in Arabic or English based on the user's language. "
                    "Do not provide final diagnoses or prescribe medication. "
                    "When discussing results, explain that a physician must confirm any medical decision. "
                    "You can also explain how to use the Noura AI system including upload, results, appointments, privacy, and messaging."
                ),
            },
            *[
                {
                    "role": "user" if item.get("role") == "user" else "assistant",
                    "content": str(item.get("content") or ""),
                }
                for item in history
            ],
            {"role": "user", "content": str(message or "")},
        ]

    def ask_openrouter(self, message: str, history: list[dict]) -> tuple[int, dict]:
        payload = json.dumps(
            {
                "model": self.config["OPENROUTER_MODEL"],
                "messages": self.build_medical_messages(message, history),
                "temperature": 0.4,
                "max_tokens": 600,
            }
        ).encode("utf-8")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.config['OPENROUTER_API_KEY']}",
            "HTTP-Referer": self.config["OPENROUTER_SITE_URL"],
            "X-Title": self.config["OPENROUTER_APP_NAME"],
        }

        req = Request(
            self.config["OPENROUTER_API_URL"],
            data=payload,
            headers=headers,
            method="POST",
        )

        try:
            with urlopen(req, timeout=45) as response:
                data = json.loads(response.read().decode("utf-8"))
                reply = (
                    data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "لم أستطع فهم سؤالك، حاول صياغته بشكل آخر.")
                )
                return 200, {
                    "ok": True,
                    "reply": reply,
                    "source": "openrouter",
                    "mode": self.get_mode(),
                }
        except HTTPError as error:
            body = error.read().decode("utf-8", errors="ignore")
            return error.code, {
                "ok": False,
                "code": (
                    "AI_UNAUTHORIZED"
                    if error.code in (401, 403)
                    else "AI_RATE_LIMIT"
                    if error.code == 429
                    else "AI_REQUEST_FAILED"
                ),
                "message": body or "AI request failed",
                "provider": "openrouter",
            }
        except URLError as error:
            return 502, {
                "ok": False,
                "code": "AI_UPSTREAM_UNAVAILABLE",
                "message": str(error.reason),
                "provider": "openrouter",
            }
