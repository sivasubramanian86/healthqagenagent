from common.security import redact_pii, deny_real_phi_in_tests


def test_redact_email_and_phone():
    txt = "Contact patient at john.doe@example.com or +1 (555) 123-4567 on 2021-01-01"
    red = redact_pii(txt)
    assert "REDACTED_EMAIL" in red
    assert "REDACTED_PHONE" in red
    assert "REDACTED_DATE" in red


def test_deny_real_phi_raises():
    txt = "SSN: 123-45-6789"
    try:
        deny_real_phi_in_tests(txt)
        assert False, "Expected ValueError"
    except ValueError:
        assert True