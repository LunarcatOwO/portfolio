// Projects showing the user featured projects and a Description
import React, { useEffect, useState } from 'react';
import ContentBox from '../components/ContentBox';

// Define a type for GitHub repository data
interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  stargazers_count: number;
}

const Projects: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://api.github.com/users/lunarcatowo/repos?sort=updated&direction=desc"
        );

        if (!response.ok) {
          throw new Error(
            `GitHub API responded with status: ${response.status}`
          );
        }

        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching GitHub repositories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* GitHub Repositories Section */}
      <ContentBox title={'My Projects'} className='w-full md:w-3/5 mb-10 grainybg'>
        {isLoading ? (
          <p className="text-center text-gray-400">Loading repositories...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <div className="mt-4 max-h-80 overflow-y-auto pr-2 border border-contentBorder rounded-md">
            {repositories.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="block p-3 border-b border-contentBorder last:border-b-0 hover:bg-contentBackground transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-white">{repo.name}</h4>
                  {repo.language && (
                    <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full">
                      {repo.language}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {repo.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Updated: {formatDate(repo.updated_at)}
                </div>
              </a>
            ))}
          </div>
        )}
      </ContentBox>
    </>
  );
};

export default Projects;



