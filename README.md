# LunarcatOwO's Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. This portfolio automatically fetches and displays GitHub repositories, programming languages, and profile information.

## Features

- **Dynamic GitHub Integration**: Automatically fetches and displays your GitHub profile, repositories, and programming languages
- **Fallback System**: Uses cached data when GitHub API is unavailable
- **Modern UI**: Clean interface with animated content boxes and loading effects
- **Responsive Design**: Fully responsive layout that works on mobile and desktop
- **Background Animation**: Custom matrix-style rain animation
- **Docker Support**: Ready for containerization

## Looks

See https://lunarcatowo.space

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/lunarcatowo/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The site will be available at [http://localhost:3000](http://localhost:3000)

### Configuration

- Update the GitHub username in Projects.tsx, Experience.tsx, and Card.tsx to fetch your own GitHub data
- Modify the homepage URL in package.json to match your GitHub Pages URL

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `build` directory.

## Deployment

### GitHub Pages

This project is set up for automatic deployment to GitHub Pages:

1. Push changes to the main branch
2. GitHub Actions will automatically build and deploy the site
3. Your site will be available at https://yourusername.github.io/portfolio

### Docker Deployment

You can also deploy using Docker:

```bash
# Build the Docker image
docker build -t portfolio .

# Run the container
docker run -p 80:80 portfolio
```

## Project Structure

- pages - Main page components (Card, Projects, Experience, Contact)
- components - Reusable UI components
- public - Static assets and HTML template
- scripts - Utility scripts including GitHub data fetching
- workflows - CI/CD pipeline configuration

## Local GitHub Data Cache

To fetch and cache GitHub data locally:

```bash
node scripts/fetchGitHubProfile.js
```

This creates cache files in the public directory that are used as fallbacks if the GitHub API is unavailable.

## Technologies

- React
- TypeScript
- Tailwind CSS
- FontAwesome icons
- GitHub API
- Docker

## License

This project is dual-licensed:
- Code structure and setup is under Apache License 2.0 (as acquired from naterfute)
- Custom components and implementations are under GNU General Public License v3.0

See the LICENSE and LICENSE_APACHE files for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- Created by [LunarcatOwO](https://github.com/lunarcatowo)
- Original framework based on work by [naterfute](https://github.com/naterfute)