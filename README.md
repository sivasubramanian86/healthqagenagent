# HealthQAGenAgent

An AI-driven healthcare software test case generation platform leveraging Google Cloud services and multi-agent systems to automate comprehensive testing of healthcare applications.

## Purpose

HealthQAGenAgent is designed to revolutionize healthcare software testing by automatically generating, executing, and validating test cases for healthcare applications. It ensures thorough coverage of critical healthcare workflows while maintaining compliance with healthcare regulations.

## Architecture Overview

The system is composed of several specialized AI agents that work together to test healthcare applications.

### Components

-   **BugMinerAgent**: Connects to bug tracking systems like Jira and Azure DevOps to fetch recent bug reports. This helps in generating tests that target recently discovered issues.

-   **CodeAnalysisAgent**: Analyzes the application's source code to extract key structural elements such as functions and classes. This information is used to generate targeted and relevant tests.

-   **ValidationAgent**: Executes the generated tests and logs the results, including test outcomes and coverage metrics, to BigQuery for analysis and reporting.

-   **FhirAgent**: Simulates a FHIR (Fast Healthcare Interoperability Resources) server, providing realistic healthcare data for testing purposes.

-   **TestGeneratorAgent**: This is the core agent responsible for generating test plans and the actual test code. It uses information from the other agents to create comprehensive and effective tests.

## Google Cloud Services Used

- **Cloud Run**: Main application deployment
- **Cloud Build**: CI/CD pipeline
- **Cloud Storage**: Test artifacts storage
- **Secret Manager**: Sensitive data management
- **Cloud KMS**: Encryption key management
- **BigQuery**: Test analytics and reporting
- **Cloud Logging**: Centralized logging
- **Cloud Monitoring**: System health monitoring

## Local Development

### Prerequisites

1. Python 3.9+
2. Google Cloud SDK
3. Docker

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/healthqagenagent.git
cd healthqagenagent
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running Locally

1. Start the development server:
```bash
python -m healthqagenagent.main
```

2. Access the dashboard at `http://localhost:8080`

## Cloud Run Deployment

1. Build the container:
```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/healthqagenagent
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy healthqagenagent \
  --image gcr.io/[PROJECT_ID]/healthqagenagent \
  --platform managed \
  --region [REGION] \
  --allow-unauthenticated
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request

### Development Guidelines

- Follow PEP 8 style guide
- Write unit tests for new features
- Document code using Google style docstrings
- Update relevant documentation

### Code Review Process

1. Submit PR with clear description
2. Pass automated tests
3. Get approval from 2 team members
4. Ensure CI/CD pipeline passes

## License

MIT license
