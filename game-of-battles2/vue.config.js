const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // ... other devServer options (e.g., port, host)
    headers: {
      // Set Cache-Control for all assets served by the dev server
      // This tells the browser to cache aggressively for 1 year (31536000 seconds)
      // and not revalidate.
      'Cache-Control': 'public, max-age=31536000',
    },
    // Optionally, if you only want to apply this to specific asset types:
    // You might need to use a custom middleware for more granular control,
    // but setting it globally for static assets is usually fine for dev.
  },
})
