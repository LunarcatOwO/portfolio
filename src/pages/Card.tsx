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
  const username = "lunarcatowo"; // Your GitHub username

  useEffect(() => {
    const fetchGitHubProfile = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) {
          throw new Error(`GitHub API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching GitHub profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitHubProfile();
  }, [username]);

  return (
    <>
      <div className="md:flex sm:flex-col justify-center items-center w-full mt-10">
        <ContentBox className="sm:w-4/5 md:w-2/5 mb-20 bg-black [background:linear-gradient(45deg,#172033,theme(colors.black)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] border border-transparent animate-border">
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
                src={profileData?.avatar_url || "/pfp.png"}
                alt="My Profile"
                className="rounded-full w-32 h-32 mb-4 mx-auto"
              />
            )}
          </a>
          <p className="text-center">
            <p>
              {profileData?.bio || "I'm LunarcatOwO, a random student developer."}
            </p>
          </p>
        </ContentBox>
      </div>

      <p className="flex justify-center items-center w-full mb-10 font-medium text-5xl font-extrabold">
        About Me
      </p>
    </>
  );
};

export default Card;
