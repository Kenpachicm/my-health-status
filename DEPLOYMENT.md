# Deployment Guide

## Fixing SSL Protocol Errors on Mobile Devices

To ensure share links work correctly on mobile devices, you must configure the `VITE_APP_URL` environment variable with your production domain.

### Setup Instructions

1. **Set Environment Variable**

   In your deployment platform (Netlify, Vercel, etc.), add the following environment variable:

   ```
   VITE_APP_URL=https://your-actual-domain.com
   ```

   Replace `your-actual-domain.com` with your actual production domain.

2. **Examples by Platform**

   **Netlify:**
   - Go to Site settings > Environment variables
   - Add: `VITE_APP_URL` = `https://your-domain.netlify.app`

   **Vercel:**
   - Go to Project Settings > Environment Variables
   - Add: `VITE_APP_URL` = `https://your-domain.vercel.app`

   **Custom Domain:**
   - Use your custom domain: `https://app.myhealthstatus.com`

3. **Redeploy**

   After setting the environment variable, trigger a new deployment for the changes to take effect.

### How It Works

The share URL generation now:
- Uses `VITE_APP_URL` environment variable if set
- Falls back to `window.location.origin` with HTTPS enforcement
- Ensures all share links use HTTPS protocol
- Prevents SSL protocol errors on mobile devices

### Verification

After deployment:
1. Create a new share from the dashboard
2. Copy the generated share link
3. Verify it starts with `https://` and uses your correct domain
4. Test the link on a mobile device

### Troubleshooting

If you still encounter SSL errors:
- Ensure your domain has a valid SSL certificate
- Check that your hosting platform serves content over HTTPS
- Verify the `VITE_APP_URL` environment variable is set correctly
- Clear browser cache and try again
