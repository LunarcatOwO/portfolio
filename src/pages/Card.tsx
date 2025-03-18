import React, { useEffect, useState } from "react";
import ContentBox from "../components/ContentBox";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import Logo from "../components/icons/Pyro";

import "../border.css";

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

const Card: React.FC = () => {
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
      <div className="md:flex sm:flex-col justify-center items-center w-full mt-10">
        <ContentBox className="sm:w-4/5 md:w-2/5 mb-20 bg-black [background:linear-gradient(45deg,#172033,theme(colors.black)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] border border-transparent animate-border">
          <div className="flex flex-row space-x-3">
            <a
              href="https://github.com/lunarcatowo"
              target="_blank"
              rel="noreferrer"
              className="mb-4"
            >
              <FontAwesomeIcon
                icon={faGithub}
                size="2x"
                className="text-white"
              />
            </a>
            <a
              href="https://pyro.engineering/team/nate/"
              target="_blank"
              rel="noreferrer"
              className="mb-4"
            >
              <Logo className="h-6 w-6" />
            </a>
          </div>
          <a
            href="https://github.com/lunarcatowo"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/pfp.png"
              alt="My Profile"
              className="rounded-full w-32 h-32 mb-4 mx-auto"
            />
          </a>
          <p className="text-center">
            <p>
              I'm Naterfute, a software dev located in the USA, with a love for
              backend work.
            </p>
            Currently the public maintainer for the{" "}
            <a
              href="https://github.com/pyrohost/pyrodactyl"
              target="_blank"
              rel="noreferrer"
              className="text-red-700 hover:text-red-800"
            >
              Pyrodactyl
            </a>{" "}
            repo.
          </p>

          {/* GitHub Projects Section */}
          <h3 className="text-xl font-bold mt-6 mb-3">
            Latest GitHub Projects
          </h3>
          {isLoading ? (
            <p className="text-center text-gray-400">Loading repositories...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <div className="mt-4 max-h-60 overflow-y-auto pr-2 border border-contentBorder rounded-md">
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
      </div>

      <p className="flex justify-center items-center w-full mb-10 font-medium text-5xl font-extrabold ">
        About Me
      </p>
    </>
  );
};

export default Card;
