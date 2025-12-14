import html
from scoring.module import ScoreModule


class SortItOut(ScoreModule):
    def check_answer(self, log):
        # Get the question data (JSON dict) for this item_id
        question = self.get_question_by_item_id(log.item_id)
        if not question:
            # No matching question – safest to treat as 0
            return 0

        answers = question.get("answers", [])

        # Handle both ORM Log objects and dict-like logs
        text = log.text if hasattr(log, "text") else log.get("text", "")

        # ensure string values are in parity. The answer value (coming from the qset) may include html entities.
        log_sanitized = html.unescape(str(text).lower().strip())

        for answer in answers:
            answer_text = str(answer.get("text", ""))
            answer_value = answer.get("value", 0)

            answer_sanitized = html.unescape(answer_text.lower().strip())

            if log_sanitized == answer_sanitized:
                # value in qset is usually numeric or numeric string
                try:
                    return int(answer_value)
                except (TypeError, ValueError):
                    return 0

        # no matches
        return 0
