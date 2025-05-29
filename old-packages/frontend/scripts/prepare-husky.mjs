// This script is used to install husky in a way that works with both CommonJS and ES modules
// It's designed to be resilient in CI environments where husky might not be needed

async function setupHusky() {
  try {
    // Try to import husky as an ES module
    const husky = await import('husky');
    
    // If we get here, husky is available as an ES module
    console.log('Setting up husky hooks...');
    await husky.install();
    console.log('Husky hooks installed successfully');
  } catch (error) {
    // Handle different error types
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('Husky not found, skipping hook installation');
      return;
    }
    
    if (error.code === 'ERR_REQUIRE_ESM') {
      console.log('Husky is an ES module but we tried to require it, skipping hook installation');
      return;
    }
    
    if (error.code === 'ENOENT' && error.message.includes('.husky')) {
      console.log('Husky directory not found, skipping hook installation');
      return;
    }
    
    // For any other error, log it but don't fail the script
    console.error('Error setting up husky:', error.message);
  }
}

// Run the setup function
setupHusky().catch(error => {
  console.error('Unexpected error:', error);
  // Don't exit with error code to avoid breaking CI
});
