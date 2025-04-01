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

// April Fools joke projects
const aprilFoolsProjects: Repository[] = [
  {
    id: 1,
    name: "CatMemeGenerator3000",
    html_url: "https://github.com/lunarcatowo",
    description: "Advanced AI that generates cat memes based on your mood. Trained on 10 billion cat pictures.",
    language: "CatScript",
    updated_at: new Date().toISOString(),
    stargazers_count: 9999
  },
  {
    id: 2,
    name: "QuantumToaster",
    html_url: "https://github.com/lunarcatowo",
    description: "Toast bread in multiple dimensions simultaneously. Butter applied in the 4th dimension for maximum coverage.",
    language: "BreadML",
    updated_at: new Date().toISOString(),
    stargazers_count: 8765
  },
  {
    id: 3,
    name: "NapOptimizer",
    html_url: "https://github.com/lunarcatowo",
    description: "Scientifically calculates the perfect nap duration based on your caffeine intake, sleep debt, and meeting schedule.",
    language: "ZzzScript",
    updated_at: new Date().toISOString(),
    stargazers_count: 5432
  },
  {
    id: 4,
    name: "UnicornPixelArt",
    html_url: "https://github.com/lunarcatowo",
    description: "Procedurally generates pixel art of unicorns riding rainbows in space. NFT integration coming soon!",
    language: "GlitterSharp",
    updated_at: new Date().toISOString(),
    stargazers_count: 7654
  },
  {
    id: 5,
    name: "RubberDuckDebugger",
    html_url: "https://github.com/lunarcatowo",
    description: "AI-powered rubber duck that actually responds to your code explanations with sarcastic quacks.",
    language: "QuackScript",
    updated_at: new Date().toISOString(),
    stargazers_count: 4321
  }
];

const Projects: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useStaticData, setUseStaticData] = useState(false);
  const [isAprilFools, setIsAprilFools] = useState(false);
  const [isReadyToFetch, setIsReadyToFetch] = useState(false);
  const username = "lunarcatowo"; // Your GitHub username

  // Check if it's April 1st or 2nd for April Fools joke
  useEffect(() => {
    const today = new Date();
    const month = today.getMonth(); // 0-indexed, so 3 is April
    const day = today.getDate();
    
    // Force April Fools mode for testing - set to false in production
    const forceAprilFools = false;
    
    if (forceAprilFools || (month === 3 && (day === 1 || day === 2))) {
      setIsAprilFools(true);
    }
    
    // Signal that we're ready to fetch data
    setIsReadyToFetch(true);
  }, []);

  useEffect(() => {
    // Only fetch data after we've checked the date
    if (!isReadyToFetch) return;
    
    const fetchRepositories = async () => {
      try {
        setIsLoading(true);
        
        // IMPORTANT: This check must happen here, as a direct check
        if (isAprilFools) {
          console.log("April Fools mode activated - showing joke projects");
          setRepositories(aprilFoolsProjects);
          setIsLoading(false);
          return;
        }
        
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
          const staticResponse = await fetch("/github-repos.json");
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
  }, [username, isAprilFools, isReadyToFetch]);

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
        title={isAprilFools ? "My Incredible Projects" : "My Projects"}
        className={`w-full md:w-3/5 mb-20 ${
          isAprilFools 
            ? "!bg-blue-900/80"
            : "!bg-bounding-box !bg-opacity-100"
        }`}
        style={{ backgroundColor: isAprilFools ? "#142952" : "#1c1319" }}
      >
        {isAprilFools && (
          <div className="mb-4">
            <span className="text-xs text-yellow-200 animate-pulse">
              🎭 April Fools! Check out my "totally real" projects... 🎭
            </span>
          </div>
        )}
      
        {isLoading ? (
          <p className="text-center text-gray-400">Loading repositories...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <>
            {useStaticData && !isAprilFools && (
              <div className="mb-2 text-right">
                <span className="text-xs text-gray-400">
                  (using cached repository data)
                </span>
              </div>
            )}
            <div className={`mt-4 max-h-80 overflow-y-auto pr-2 border ${
              isAprilFools ? "border-blue-700" : "border-contentBorder"
            } rounded-md`}>
              {repositories.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`block p-3 border-b ${
                    isAprilFools ? "border-blue-700 last:border-b-0 hover:bg-blue-800/60" : "border-contentBorder last:border-b-0 hover:bg-contentBackground"
                  } transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className={`font-semibold ${isAprilFools ? "text-yellow-200 font-comic" : "text-white"}`}>
                      {repo.name}
                    </h4>
                    {repo.language && (
                      <span className={`text-xs px-2 py-1 ${
                        isAprilFools ? "bg-blue-700 text-yellow-200" : "bg-gray-800 text-gray-300"
                      } rounded-full`}>
                        {repo.language}
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className={`text-sm ${
                      isAprilFools ? "text-blue-200" : "text-gray-400"
                    } mt-1 line-clamp-2`}>
                      {repo.description}
                    </p>
                  )}
                  <div className={`text-xs ${
                    isAprilFools ? "text-blue-300" : "text-gray-500"
                  } mt-2 flex justify-between`}>
                    <span>Updated: {formatDate(repo.updated_at)}</span>
                    {isAprilFools && (
                      <span className="text-yellow-300">★ {repo.stargazers_count}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
            
            {isAprilFools && (
              <p className="text-sm text-blue-200 mt-6 italic text-center">
                PS: Don't worry, my real projects will be back tomorrow! 😉
              </p>
            )}
          </>
        )}
      </ContentBox>
    </>
  );
};

export default Projects;
