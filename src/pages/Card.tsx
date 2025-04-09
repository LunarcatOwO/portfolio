// Portfolio  Copyright (C) 2025  LunarcatOwO
// This program comes with ABSOLUTELY NO WARRANTY.
// This is free software, and you are welcome to redistribute it
// under certain conditions.
// In accordance with Apache2.0 license as aquired from naterfute
import React, { useState, useEffect } from "react";
import ContentBox from "../components/ContentBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import "../border.css";

interface GitHubProfile {
  avatar_url: string;
  name?: string;
  bio?: string;
}

const Card: React.FC = () => {
  const [profileData, setProfileData] = useState<GitHubProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useStaticData, setUseStaticData] = useState(false);
  const username = "lunarcatowo"; // Your GitHub username

  useEffect(() => {
    const fetchGitHubProfile = async () => {
      try {
        // Try to get data from GitHub API first
        const response = await fetch(`https://api.github.com/users/${username}`, {
          // Add a short timeout since we have a fallback
          signal: AbortSignal.timeout(3000)
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setProfileData(data);
        setUseStaticData(false);
      } catch (error) {
        console.warn("Falling back to static GitHub profile data:", error);
        
        try {
          // Fall back to locally cached data
          const staticResponse = await fetch('/github-profile.json');
          if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            setProfileData(staticData);
          } else {
            throw new Error("No static profile data available");
          }
          setUseStaticData(true);
        } catch (staticError) {
          console.error("Error loading static profile:", staticError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitHubProfile();
  }, [username]);

  // Determine the avatar URL based on whether we're using static data or not
  const getAvatarUrl = () => {
    if (!profileData) return "/pfp.png";
    if (useStaticData) {
      // Use the locally cached image to avoid hotlinking
      return process.env.NODE_ENV === 'development' 
        ? profileData.avatar_url 
        : "/github-avatar.jpg";
    }
    return profileData.avatar_url;
  };

  return (
    <>
      <div className="md:flex sm:flex-col justify-center items-center w-full mt-10">
        <ContentBox className="card-with-corner-glow sm:w-4/5 md:w-2/5 mb-20 bg-black [background:linear-gradient(45deg,#291d29,theme(colors.black)_50%,#291d29)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.primary)_86%,_theme(colors.pink.300)_90%,_theme(colors.primary)_94%,_theme(colors.slate.600/.48))_border-box] border border-transparent animate-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/20 rounded-full blur-xl -mr-8 -mt-8 z-0"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full blur-xl -ml-8 -mb-8 z-0"></div>
          <div className="relative z-10">
            <div className="flex flex-row space-x-3">
              <a
                href={`https://github.com/${username}`}
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
              {useStaticData && (
                <span className="text-xs text-gray-400 mt-1 self-center">
                  (cached profile)
                </span>
              )}
            </div>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
            >
              {isLoading ? (
                <div className="rounded-full w-32 h-32 mb-4 mx-auto bg-gray-700 animate-pulse"></div>
              ) : (
                <img
                  src={getAvatarUrl()}
                  alt="My Profile"
                  className="rounded-full w-32 h-32 mb-4 mx-auto"
                  onError={(e) => {
                    // If image loading fails, fall back to the default
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = "/pfp.png";
                  }}
                />
              )}
            </a>
            <p className="text-center">
              <p>
                {profileData?.bio || `I'm ${profileData?.name || username}, a random student developer.`}
              </p>
            </p>
          </div>
        </ContentBox>
      </div>

      <p className="flex justify-center items-center w-full mb-10 font-medium text-5xl font-extrabold">
        About Me
      </p>
    </>
  );
};

export default Card;
