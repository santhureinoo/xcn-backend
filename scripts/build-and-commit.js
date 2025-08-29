const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set the working directory to the script's directory
const scriptDir = path.dirname(__filename);
const projectDir = path.join(scriptDir, '..');
process.chdir(projectDir);

console.log('Starting build and commit process...');
console.log('Working directory:', process.cwd());

try {
  // 1. Run the build
  console.log('1. Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Check if dist folder exists
  console.log('2. Checking for dist folder...');
  if (!fs.existsSync('dist')) {
    console.error('Error: dist folder not found after build');
    process.exit(1);
  }
  
  console.log('Build completed successfully!');
  
  // 3. Show git status
  console.log('3. Current git status:');
  execSync('git status --porcelain', { stdio: 'inherit' });
  
  // 4. Add dist folder to git
  console.log('4. Adding dist folder to git...');
  execSync('git add dist', { stdio: 'inherit' });
  
  // 5. Add prisma folder to git (if not already tracked)
  console.log('5. Adding prisma folder to git...');
  execSync('git add prisma', { stdio: 'inherit' });
  
  // 6. Show git status again
  console.log('6. Updated git status:');
  execSync('git status', { stdio: 'inherit' });
  
  console.log('\nBuild and commit preparation completed successfully!');
  console.log('\nTo commit and push the built files:');
  console.log('1. Run: git commit -m "Build application"');
  console.log('2. Run: git push');
  
} catch (error) {
  console.error('Build and commit preparation failed:', error.message);
  process.exit(1);
}