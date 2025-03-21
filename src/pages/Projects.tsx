// Portfolio  Copyright (C) 2025  LunarcatOwO
// This program comes with ABSOLUTELY NO WARRANTY.
// This is free software, and you are welcome to redistribute it
// under certain conditions.
// In accordance with Apache2.0 license as aquired from naterfute
// Projects showing the user featured projects and a Description
import React, { useEffect, useState } from "react";
import ContentBox from "../components/ContentBox";

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
  const [useStaticData, setUseStaticData] = useState(false);
  const username = "lunarcatowo"; // Your GitHub username

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setIsLoading(true);
        // Try to get data from GitHub API first
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&direction=desc`,
          {
            // Add a short timeout since we have a fallback
            signal: AbortSignal.timeout(3000),
          }
        );

        if (!response.ok) {
          throw new Error(
            `GitHub API responded with status: ${response.status}`
          );
        }

        const data = await response.json();
        setRepositories(data);
        setUseStaticData(false);
      } catch (err) {
        console.warn("Falling back to static GitHub repositories data:", err);

        try {
          // Fall back to locally cached data
          const staticResponse = await fetch("/portfolio/github-repos.json");
          if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            setRepositories(staticData);
          } else {
            throw new Error("No static repositories data available");
          }
          setUseStaticData(true);
        } catch (staticError) {
          setError("Error loading repositories. Please try again later.");
          console.error("Error loading static repositories:", staticError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, [username]);

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
      <ContentBox
        title={"My Projects"}
        className="w-full md:w-3/5 mb-20 !bg-bounding-box !bg-opacity-100"
        style={{ backgroundColor: "#1c1319" }}
      >
        {isLoading ? (
          <p className="text-center text-gray-400">Loading repositories...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <>
            {useStaticData && (
              <div className="mb-2 text-right">
                <span className="text-xs text-gray-400">
                  (using cached repository data)
                </span>
              </div>
            )}
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
          </>
        )}
      </ContentBox>
    </>
  );
};

export default Projects;
