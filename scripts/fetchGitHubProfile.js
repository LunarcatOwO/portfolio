const fs = require('fs');
const https = require('https');
const path = require('path');

const username = 'lunarcatowo';

console.log('Fetching GitHub data for', username);

// Function to download an image
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
        console.log(`Image downloaded to ${filepath}`);
      });
    }).on('error', err => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
};

// Function to make a GitHub API request
const githubApiRequest = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'GitHub-Profile-Fetcher'
      }
    };

    const req = https.request(options, res => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', async () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`GitHub API responded with status: ${res.statusCode}`));
        }
        
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', error => {
      reject(error);
    });
    
    req.end();
  });
};

// Fetch GitHub profile
const fetchProfile = async () => {
  try {
    // Fetch user profile
    console.log('Fetching user profile...');
    const profile = await githubApiRequest(`/users/${username}`);
    
    // Save profile data to JSON file
    const profileOutputPath = path.join(__dirname, '../public/github-profile.json');
    fs.writeFileSync(profileOutputPath, JSON.stringify(profile, null, 2));
    console.log(`Profile data saved to ${profileOutputPath}`);
    
    // Download avatar image
    if (profile.avatar_url) {
      const avatarOutputPath = path.join(__dirname, '../public/github-avatar.jpg');
      await downloadImage(profile.avatar_url, avatarOutputPath);
    }

    // Fetch repositories
    console.log('Fetching repositories...');
    const repos = await githubApiRequest(`/users/${username}/repos?sort=updated&direction=desc&per_page=100`);
    
    // Save repositories data to JSON file
    const reposOutputPath = path.join(__dirname, '../public/github-repos.json');
    fs.writeFileSync(reposOutputPath, JSON.stringify(repos, null, 2));
    console.log(`Repositories data saved to ${reposOutputPath}`);

    // Extract languages from repositories
    console.log('Processing languages...');
    const languageCount = {};
    
    for (const repo of repos) {
      if (repo.language && repo.language !== 'null') {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    }

    // Sort languages by frequency
    const sortedLanguages = Object.keys(languageCount).sort(
      (a, b) => languageCount[b] - languageCount[a]
    );
    
    // Save languages data to JSON file
    const languagesOutputPath = path.join(__dirname, '../public/github-languages.json');
    fs.writeFileSync(languagesOutputPath, JSON.stringify(sortedLanguages, null, 2));
    console.log(`Languages data saved to ${languagesOutputPath}`);

    return { profile, repos, sortedLanguages };
  } catch (error) {
    throw error;
  }
};

// Run the fetch operation
fetchProfile()
  .then(() => {
    console.log('GitHub data fetched successfully');
  })
  .catch(error => {
    console.error('Error fetching GitHub data:', error);
    process.exit(1);
  });