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
    const userRepos = await githubApiRequest(`/users/${username}/repos?sort=updated&direction=desc&per_page=100`);
    
    // Create a combined repositories array
    const allRepos = [...userRepos];
    
    // Fetch organizations the user belongs to
    console.log('Fetching organizations...');
    const orgs = await githubApiRequest(`/users/${username}/orgs`);
    
    // Fetch repositories for each organization
    for (const org of orgs) {
      console.log(`Fetching repositories for organization: ${org.login}...`);
      try {
        const orgRepos = await githubApiRequest(`/orgs/${org.login}/repos?per_page=100`);
        // Filter to include only public repos
        const publicOrgRepos = orgRepos.filter(repo => !repo.private);
        allRepos.push(...publicOrgRepos);
        console.log(`Added ${publicOrgRepos.length} public repositories from ${org.login}`);
      } catch (orgError) {
        console.warn(`Error fetching repos for org ${org.login}:`, orgError);
      }
    }
    
    // Sort all repositories by update date
    allRepos.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
    // Save repositories data to JSON file
    const reposOutputPath = path.join(__dirname, '../public/github-repos.json');
    fs.writeFileSync(reposOutputPath, JSON.stringify(allRepos, null, 2));
    console.log(`All repositories data (${allRepos.length} repos) saved to ${reposOutputPath}`);

    // Extract languages from all repositories
    console.log('Processing languages...');
    const languageCount = {};
    
    for (const repo of allRepos) {
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

    return { profile, repos: allRepos, sortedLanguages };
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