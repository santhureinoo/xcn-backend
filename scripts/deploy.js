const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set the working directory to the script's directory
const scriptDir = path.dirname(__filename);
const projectDir = path.join(scriptDir, '..');
process.chdir(projectDir);

console.log('Starting local build process...');
console.log('Working directory:', process.cwd());

// Helper function to copy directories recursively
function copyDirSync(src, dest) {
  console.log(`Copying directory from ${src} to ${dest}`);
  if (!fs.existsSync(src)) {
    console.log(`Source directory ${src} does not exist`);
    return;
  }
  
  fs.mkdirSync(dest, { recursive: true });
 const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
 console.log(`Finished copying directory from ${src} to ${dest}`);
}

// Helper function to copy files
function copyFileSync(src, dest) {
  console.log(`Copying file from ${src} to ${dest}`);
  if (!fs.existsSync(src)) {
    console.log(`Source file ${src} does not exist`);
    return;
  }
  fs.copyFileSync(src, dest);
  console.log(`Finished copying file from ${src} to ${dest}`);
}

// Helper function to remove a directory recursively
function removeDirSync(dir) {
  console.log(`Removing directory: ${dir}`);
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist`);
    return;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (let entry of entries) {
    const entryPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      removeDirSync(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  }
  
  fs.rmdirSync(dir);
  console.log(`Finished removing directory: ${dir}`);
}

try {
  // 1. Run the build
  console.log('1. Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Create deployment directory
  const deployDir = path.join(projectDir, 'deploy');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  
  // 3. Copy necessary files to deployment directory
  console.log('2. Preparing deployment package...');
  
  // Copy dist folder
  console.log('Checking for dist folder...');
  if (fs.existsSync('dist')) {
    console.log('dist folder found, copying...');
    copyDirSync('dist', path.join(deployDir, 'dist'));
    console.log('  - Copied dist folder');
    
    // Remove the deploy directory from the copied dist folder
    const copiedDeployDir = path.join(deployDir, 'dist', 'deploy');
    if (fs.existsSync(copiedDeployDir)) {
      console.log('Removing deploy directory from copied dist folder...');
      removeDirSync(copiedDeployDir);
      console.log('  - Removed deploy directory from copied dist folder');
    }
 } else {
    console.log('  - Warning: dist folder not found');
  }
  
  // Copy prisma folder
 console.log('Checking for prisma folder...');
 if (fs.existsSync('prisma')) {
    console.log('prisma folder found, copying...');
    copyDirSync('prisma', path.join(deployDir, 'prisma'));
    console.log('  - Copied prisma folder');
  } else {
    console.log('  - Warning: prisma folder not found');
  }
  
  // Copy .env if it exists
  console.log('Checking for .env file...');
  if (fs.existsSync('.env')) {
    console.log('.env file found, copying...');
    copyFileSync('.env', path.join(deployDir, '.env'));
    console.log('  - Copied .env file');
  }
  
 console.log('3. Creating deployment package.json...');
  
  // Create a simplified package.json for deployment
  const packageJsonContent = fs.readFileSync('./package.json', 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  
  const deployPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    author: packageJson.author,
    private: packageJson.private,
    license: packageJson.license,
    scripts: {
      start: "node dist/main",
      "db:migrate": "npx prisma migrate deploy",
      "db:seed": "npx prisma db seed"
    },
    dependencies: packageJson.dependencies
  };
  
  // Add prisma configuration if it exists
  if (packageJson.prisma) {
    deployPackageJson.prisma = packageJson.prisma;
  }
  
  fs.writeFileSync(
    path.join(deployDir, 'package.json'),
    JSON.stringify(deployPackageJson, null, 2)
  );
  
  console.log('  - Created deployment package.json');
  
  // Copy README.md to deploy directory
  const readmeSource = path.join(__dirname, 'README.md');
  const readmeDest = path.join(deployDir, 'README.md');
  if (fs.existsSync(readmeSource)) {
    copyFileSync(readmeSource, readmeDest);
    console.log('  - Copied README.md');
  } else {
    // Create a basic README if one doesn't exist
    const readmeContent = `# Deployment Package

This directory contains the built files for deployment to RENDER. The application has been pre-built locally to avoid memory issues on RENDER's free tier.

## Deployment Instructions

1. Commit these files to your repository
2. Connect your repository to RENDER
3. Set up your RENDER service with the following configuration:
   - Build command: \`npm install\`
   - Start command: \`npm start\`
4. Add your environment variables in the RENDER dashboard
5. Deploy!

## What's Included

- \`dist/\`: Compiled application files
- \`prisma/\`: Database schema and migrations
- \`package.json\`: Simplified package file with only runtime dependencies
- \`.env\`: Environment variables (if applicable)

## Database Migrations

After deployment, you may need to run database migrations:

\`\`\`bash
npm run db:migrate
\`\`\`

If you have seed data:

\`\`\`bash
npm run db:seed
\`\`\`

## Notes

- This deployment package was created locally to avoid memory issues on RENDER's free tier
- The build process has already been completed, so RENDER only needs to install dependencies and start the application
`;
    fs.writeFileSync(readmeDest, readmeContent);
    console.log('  - Created README.md');
 }
  
  console.log('\nDeployment package created successfully!');
 console.log('Deployment files are in the "deploy" directory.');
  console.log('\nTo deploy to RENDER:');
  console.log('1. Navigate to the deploy directory: cd deploy');
  console.log('2. Commit the files to your repository');
  console.log('3. Deploy to RENDER');
  
} catch (error) {
  console.error('Deployment preparation failed:', error.message);
  process.exit(1);
}