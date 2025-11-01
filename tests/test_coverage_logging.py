from agents.validation import ValidationAgent


def test_log_results_no_error():
    v = ValidationAgent()
    results = {"passed": 1, "total": 1, "coverage": 100.0}
    # Should not raise
    v.log_results(results)
    assert True
