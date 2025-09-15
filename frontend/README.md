## Frontend Local Testing

To run the HealthQAGenAgent frontend locally with Firebase Hosting and a mock API:

```bash
cd frontend
npm install firebase-tools express
node mock-server.js &
firebase emulators:start --only hosting
```

- This starts the mock API server on port 5001.
- Firebase Hosting serves the frontend on http://localhost:5000.
- Clicking "Generate Tests" in the browser will POST to the mock endpoint and display the result.

**Verification:**
- Open http://localhost:5000 in your browser.
- Click "Generate Tests".
- You should see: "Mock tests generated".
- No GCP dependencies required for this demo.
