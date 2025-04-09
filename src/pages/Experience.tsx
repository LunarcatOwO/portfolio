// Portfolio  Copyright (C) 2025  LunarcatOwO
// This program comes with ABSOLUTELY NO WARRANTY.
// This is free software, and you are welcome to redistribute it
// under certain conditions.
// In accordance with Apache2.0 license as aquired from naterfute
import React, { useEffect, useState } from "react";
import ContentBox from "../components/ContentBox";
import ProjectBox from "../components/ProjectBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPython,
  faRust,
  faJs,
  faCss,
  faHtml5,
  faJava,
  faPhp,
  faSwift,
  faCuttlefish, // For C/C++
  faDocker,
  faReact,
} from "@fortawesome/free-brands-svg-icons";

// Language to icon mapping
const languageIcons = {
  Python: faPython,
  JavaScript: faJs,
  TypeScript: faJs,
  Rust: faRust,
  HTML: faHtml5,
  CSS: faCss,
  Java: faJava,
  PHP: faPhp,
  Swift: faSwift,
  C: faCuttlefish,
  "C++": faCuttlefish,
  "C#": faCuttlefish,
  Dockerfile: faDocker,
  React: faReact,
  // Add more mappings as needed
};

// Language to color mapping (using your theme colors)
const languageColors = {
  Python: {
    primary: "pythonPrimary",
    secondary: "pythonSecondary",
  },
  JavaScript: {
    primary: "typescriptPrimary",
    secondary: "typescriptSecondary",
  },
  TypeScript: {
    primary: "typescriptPrimary",
    secondary: "typescriptSecondary",
  },
  Rust: {
    primary: "rustPrimary",
    secondary: "rustSecondary",
  },
  // Default for other languages
  default: {
    primary: "accent",
    secondary: "white",
  },
};

// Define a type for GitHub repository data
interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  stargazers_count: number;
  private?: boolean;
}

const Experience: React.FC = () => {
  const [languages, setLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useStaticData, setUseStaticData] = useState(false);
  const username = "lunarcatowo"; // Your GitHub username

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        const allRepos: Repository[] = [];
        
        // Try to get user repos from GitHub API first
        const userReposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=100`,
          {
            signal: AbortSignal.timeout(3000),
          }
        );

        if (!userReposResponse.ok) {
          throw new Error(
            `GitHub API responded with status: ${userReposResponse.status}`
          );
        }

        const userRepos = await userReposResponse.json();
        allRepos.push(...userRepos);
        
        // Fetch organizations the user belongs to
        const orgsResponse = await fetch(
          `https://api.github.com/users/${username}/orgs`,
          {
            signal: AbortSignal.timeout(3000),
          }
        );
        
        if (orgsResponse.ok) {
          const orgs = await orgsResponse.json();
          
          // For each organization, fetch its repositories
          await Promise.all(orgs.map(async (org) => {
            try {
              const orgReposResponse = await fetch(
                `https://api.github.com/orgs/${org.login}/repos?per_page=100`,
                {
                  signal: AbortSignal.timeout(3000),
                }
              );
              
              if (orgReposResponse.ok) {
                const orgRepos = await orgReposResponse.json();
                // Filter to only include public repos
                const publicOrgRepos = orgRepos.filter(repo => !repo.private);
                allRepos.push(...publicOrgRepos);
              }
            } catch (orgError) {
              console.warn(`Error fetching repos for org ${org.login}:`, orgError);
            }
          }));
        }

        // Extract languages from all repositories and count occurrences
        const languageCount: { [key: string]: number } = {};

        for (const repo of allRepos) {
          if (repo.language && repo.language !== "null") {
            languageCount[repo.language] =
              (languageCount[repo.language] || 0) + 1;
          }
        }

        // Sort languages by frequency
        const sortedLanguages = Object.keys(languageCount).sort(
          (a, b) => (languageCount[b] ?? 0) - (languageCount[a] ?? 0)
        );

        setLanguages(sortedLanguages);
        setUseStaticData(false);
      } catch (error) {
        console.warn("Falling back to static GitHub languages data:", error);

        try {
          // Fall back to locally cached data
          const staticResponse = await fetch("/github-languages.json");
          if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            setLanguages(staticData);
          } else {
            throw new Error("No static languages data available");
          }
          setUseStaticData(true);
        } catch (staticError) {
          setError("Error loading language data. Please try again later.");
          console.error("Error loading static languages:", staticError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, [username]);

  // Generate CSS classes for hover effect based on language
  const getLanguageClass = (language: string) => {
    const colors = languageColors[language] || languageColors.default;
    return `hover:[background:linear-gradient(45deg,#172033,theme(colors.gray.600)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.${colors.secondary})_80%,_theme(colors.${colors.primary})_86%,_theme(colors.${colors.primary})_90%,_theme(colors.${colors.primary})_94%,_theme(colors.${colors.secondary}))_border-box] hover:border hover:border-transparent hover:animate-border`;
  };

  return (
    <>
      <ContentBox
        title={"My Experience"}
        className="w-full md:w-3/5 mb-20 !bg-bounding-box !bg-opacity-100"
        style={{ backgroundColor: "#1c1319" }}
      >
        {isLoading ? (
          <p className="text-center text-gray-400">Loading languages...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <>
            {useStaticData && (
              <div className="mb-4">
                <span className="text-xs text-gray-400">
                  (using cached language data)
                </span>
              </div>
            )}
            <div className="space-y-5">
              {languages.map((language) => (
                <ProjectBox
                  key={language}
                  className={getLanguageClass(language)}
                  language=""
                >
                  {languageIcons[language] ? (
                    <FontAwesomeIcon
                      icon={languageIcons[language]}
                      className="mr-4"
                    />
                  ) : null}
                  {language}
                </ProjectBox>
              ))}
            </div>
          </>
        )}
      </ContentBox>
    </>
  );
};

export default Experience;
