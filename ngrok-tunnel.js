const ngrok = require('ngrok');

(async () => {
  try {
    // Replace 8081 with your actual Metro port if different
    const url = await ngrok.connect({ 
      addr: 8081,
      proto: 'http',
    });
    console.log(`🚀 ngrok tunnel established at: ${url}`);
  } catch (err) {
    console.error('❌ Error starting ngrok tunnel:', err);
    process.exit(1);
  }
})();