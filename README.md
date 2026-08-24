# Leftover Chef

Leftover Chef is a React and Express web app that uses Google Gemini to suggest recipes from ingredients the user already has.

## Requirements

- Node.js 20 or newer
- npm
- A Google Gemini API key

This is a Node.js project. The `requirements.txt` file is included for environments that look for a dependency manifest, but there are no Python packages to install. JavaScript dependencies are listed in `package.json`.

## Run the project

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add the `GEMINI_API_KEY` environment variable using one of the methods below.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the preview provided by Replit. The development server listens on port `5000`.

## Add the Gemini API key

### Replit

Use a Replit Secret so the key is not stored in the source code:

1. Open the **Secrets** tool in the workspace.
2. Create a secret named `GEMINI_API_KEY`.
3. Paste your Google Gemini API key as the value.
4. Restart the application workflow.

The server reads the key with `process.env.GEMINI_API_KEY`. Do not put the key in a React component, commit it to Git, or paste it into `README.md`.

For this project, `GEMINI_API_KEY` is already configured as a Replit Secret. If recipe generation reports that the key is not configured, check that the secret name is spelled exactly as shown and restart the workflow.

### Local terminal

For a one-time local run, set the key only for the command:

```bash
GEMINI_API_KEY="your-gemini-api-key" npm run dev
```

Or export it for the current terminal session:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
npm run dev
```

Replace `your-gemini-api-key` with a key created in Google AI Studio. Never commit a real key to the repository.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install JavaScript dependencies |
| `npm run dev` | Start the development server |
| `npm run check` | Run the TypeScript type checker |
| `npm run build` | Build the client and production server |
| `npm run start` | Start the production build |

## How it works

1. Enter ingredients in the chat input.
2. The browser sends them to `POST /api/recipes`.
3. The Express server sends a structured recipe request to Gemini.
4. The server validates Gemini's response before returning recipes to the browser.

## Project structure

```text
client/       React frontend
server/       Express server and Gemini integration
shared/       Shared validation schemas and types
package.json  Node.js dependencies and scripts
```

## Troubleshooting

- **`GEMINI_API_KEY is not configured`**: Add or correct the Replit Secret, then restart the workflow.
- **Recipe generation fails**: Confirm the Gemini key is active and that the server has network access to the Gemini API.
- **The preview is blank**: Make sure `npm run dev` is running and the application is using port `5000`.