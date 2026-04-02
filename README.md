<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3f484d7f-65d2-48c3-b4c3-45329c2b7c0f

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env](.env) to your valid Gemini API key:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Create API key" to generate a new one
   - Copy the key and paste it in the `.env` file as the value for `GEMINI_API_KEY`
   - **Note:** API keys can expire. If you get an "API key expired" error, create a new one using the link above
3. Run the app:
   `npm run dev`
