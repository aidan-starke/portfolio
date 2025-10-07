# Deployment Guide - Cloudflare Pages

This guide walks you through deploying your portfolio to Cloudflare Pages using GitHub Actions.

## Prerequisites

- GitHub repository set up and pushed
- Cloudflare account (free tier works)
- Both backend services accessible (TaskManager and CLAI APIs)

## Step 1: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** in the left sidebar
3. Click **Create application** → **Pages** tab
4. Click **Connect to Git**
5. Authorize Cloudflare to access your GitHub account
6. Select your `portfolio` repository
7. Configure build settings:
   - **Production branch**: `main`
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave blank)
8. Click **Save and Deploy**

## Step 2: Get Cloudflare Credentials

### Account ID

1. In Cloudflare Dashboard, go to **Workers & Pages**
2. Your **Account ID** is displayed on the right sidebar
3. Copy this value

### API Token

1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template or create custom with:
   - **Permissions**:
     - Account → Cloudflare Pages → Edit
   - **Account Resources**:
     - Include → Your account
4. Click **Continue to summary** → **Create Token**
5. Copy the token (you won't see it again!)

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   **Secret 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: [paste your API token]

   **Secret 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: [paste your Account ID]

## Step 4: Configure Environment Variables

In Cloudflare Dashboard:

1. Go to **Workers & Pages** → Select your **portfolio** project
2. Click **Settings** → **Environment variables**
3. Add the following variables for **Production**:

   | Variable Name       | Value                                                        |
   | ------------------- | ------------------------------------------------------------ |
   | `VITE_TASK_API_URL` | Your TaskManager API URL (e.g., `https://your-task-api.com`) |
   | `VITE_CLAI_API_URL` | Your CLAI API URL (e.g., `https://your-clai-api.com`)        |

4. Click **Save**

**Important:** Replace `localhost` URLs with your deployed backend URLs or proxy endpoints.

## Step 5: Deploy

### Automatic Deployment (via GitHub Actions)

1. Push to `main` branch:

   ```bash
   git add .
   git commit -m "Setup Cloudflare deployment"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Install dependencies
   - Build the project
   - Deploy to Cloudflare Pages

3. Check deployment status:
   - Go to **Actions** tab in your GitHub repo
   - Watch the deployment progress

### Manual Deployment (Alternative)

```bash
# Install Wrangler CLI
pnpm add -D wrangler

# Login to Cloudflare
pnpm wrangler login

# Deploy
pnpm wrangler pages deploy dist --project-name=portfolio
```

## Step 6: Verify Deployment

1. Go to **Workers & Pages** → **portfolio** in Cloudflare Dashboard
2. Click on the latest deployment
3. Click the deployment URL (e.g., `portfolio.pages.dev`)
4. Verify your site is live!

## CORS Configuration (Important!)

Since your frontend will be calling backend APIs from a different domain, you need to configure CORS:

### For TaskManager API (C#)

Add Cloudflare Pages domain to allowed origins:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowCloudflare",
        policy => policy.WithOrigins("https://portfolio.pages.dev")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});
```

### For CLAI API (Rust/Axum)

Add CORS middleware with your Cloudflare domain:

```rust
use tower_http::cors::CorsLayer;

let cors = CorsLayer::new()
    .allow_origin("https://portfolio.pages.dev".parse::<HeaderValue>().unwrap())
    .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
    .allow_headers(Any);
```

## Custom Domain (Optional)

1. In Cloudflare Pages project settings
2. Go to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `portfolio.yourdomain.com`)
5. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

- Check GitHub Actions logs for errors
- Verify all dependencies are in `package.json`
- Ensure `pnpm-lock.yaml` is committed

### Environment Variables Not Working

- Redeploy after adding environment variables
- Variables are only available at build time (prefixed with `VITE_`)
- Check spelling matches exactly: `VITE_TASK_API_URL`

### API Calls Fail

- Check browser console for CORS errors
- Verify backend CORS configuration includes Cloudflare domain
- Ensure backend APIs are accessible from internet (not localhost)
- Check environment variables are set correctly

### 404 on Routes

Cloudflare Pages handles SPAs automatically, but if you get 404s:

1. Create `public/_redirects` file:

   ```
   /* /index.html 200
   ```

## Development vs Production

**Development** (localhost):

- Uses `.env` file with `localhost` URLs
- Direct connection to local backends

**Production** (Cloudflare):

- Uses environment variables from Cloudflare Dashboard
- Connects to deployed/public backend APIs
- Requires CORS configuration

## Next Steps

- Set up staging environment in Cloudflare
- Configure preview deployments for PRs
- Set up monitoring and analytics
- Consider Cloudflare Workers for API proxying (if backends are internal)
