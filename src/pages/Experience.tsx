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

// April Fools fun alternative skills
const aprilFoolsSkills = [
  "Underwater Basket Weaving",
  "Professional Yodeling",
  "Extreme Ironing",
  "Competitive Tea Brewing",
  "Cloud Watching",
  "Professional Pillow Fighting",
  "Extreme Origami",
  "Bubble Wrap Popping",
  "Professional Napping",
  "Rubber Duck Debugging"
];

const Experience: React.FC = () => {
  const [languages, setLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useStaticData, setUseStaticData] = useState(false);
  const [isAprilFools, setIsAprilFools] = useState(false);
  const username = "lunarcatowo"; // Your GitHub username

  // Check if it's April 1st or 2nd for April Fools joke
  useEffect(() => {
    const today = new Date();
    const month = today.getMonth(); // 0-indexed, so 3 is April
    const day = today.getDate();
    
    if (month === 3 && (day === 1 || day === 2)) {
      setIsAprilFools(true);
    }
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        
        // Skip real API fetch if it's April Fools day
        if (isAprilFools) {
          // Use joke skills instead of real languages
          setLanguages(aprilFoolsSkills);
          setIsLoading(false);
          return;
        }
        
        // Try to get data from GitHub API first
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=100`,
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

        const repos = await response.json();

        // Extract languages from repositories and count occurrences
        const languageCount: { [key: string]: number } = {};

        for (const repo of repos) {
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
          const staticResponse = await fetch(
            "/github-languages.json"
          );
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
  }, [username, isAprilFools]);

  // Generate CSS classes for hover effect based on language
  const getLanguageClass = (language: string) => {
    if (isAprilFools) {
      return `hover:[background:linear-gradient(45deg,#142952,theme(colors.blue.900)_50%,#142952)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.yellow.400/.6)_80%,_theme(colors.blue.400)_86%,_theme(colors.yellow.300)_90%,_theme(colors.blue.400)_94%,_theme(colors.yellow.400/.6))_border-box] hover:border hover:border-transparent hover:animate-border`;
    }
    const colors = languageColors[language] || languageColors.default;
    return `hover:[background:linear-gradient(45deg,#172033,theme(colors.gray.600)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.${colors.secondary})_80%,_theme(colors.${colors.primary})_86%,_theme(colors.${colors.primary})_90%,_theme(colors.${colors.primary})_94%,_theme(colors.${colors.secondary}))_border-box] hover:border hover:border-transparent hover:animate-border`;
  };

  return (
    <>
      <ContentBox
        title={isAprilFools ? "My Alternative Skills" : "My Experience"}
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
              🎭 April Fools! Here are my REAL skills... 🎭
            </span>
          </div>
        )}
        
        {isLoading ? (
          <p className="text-center text-gray-400">Loading languages...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <>
            {useStaticData && !isAprilFools && (
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
                  className={`${getLanguageClass(language)} ${isAprilFools ? "!bg-blue-800/50" : ""}`}
                  language=""
                >
                  {isAprilFools ? (
                    <span className="mr-4 text-yellow-300">✨</span>
                  ) : languageIcons[language] ? (
                    <FontAwesomeIcon
                      icon={languageIcons[language]}
                      className="mr-4"
                    />
                  ) : null}
                  <span className={isAprilFools ? "text-yellow-200 font-comic" : ""}>
                    {language}
                  </span>
                  {isAprilFools && (
                    <span className="ml-auto text-blue-200 text-sm italic">
                      Master Level
                    </span>
                  )}
                </ProjectBox>
              ))}
            </div>
            
            {isAprilFools && (
              <p className="text-sm text-blue-200 mt-6 italic text-center">
                PS: Don't worry, I'll be back to serious coding tomorrow! 😉
              </p>
            )}
          </>
        )}
      </ContentBox>
    </>
  );
};

export default Experience;
