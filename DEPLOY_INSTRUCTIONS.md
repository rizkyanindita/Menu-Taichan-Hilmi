# 🚀 How to Deploy to Vercel

Your application build was successful! Follow these steps to deploy to Vercel.

## 1. Run the Deployment Command
Open your terminal and run:

```bash
npx vercel
```

- If asked to install Vercel CLI, say **Yes** (`y`).
- If asked to log in, follow the instructions in the browser.
- Use default settings for most questions (just hit Enter):
    - Set up and deploy? **Yes**
    - Which scope? (Select your account)
    - Link to existing project? **No**
    - Project name? (Press Enter)
    - Directory? (Press Enter for `./`)
    - **IMPORTANT:** When asked "Want to modify default build settings?", say **No**.

## 2. Add Environment Variables (CRITICAL)
Your app needs Firebase to work. After the command finishes (or during setup if you prefer), go to the **Vercel Dashboard** > **Settings** > **Environment Variables** and add these (copy exact values from your `.env` file):

| Variable Name |
|All of these are required|
| `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` |

## 3. Redeploy (if needed)
If you added the environment variables *after* the first deployment, you must redeploy for them to take effect:

```bash
npx vercel --prod
```
