import RedditIcon from "../../images/reddit-icon.png";
import RedditAvatar from "../../images/reddit-avatar.png";
import { useState } from "react";
type TopBarProps = {
  url: string;
  username: string;
  setUrl: (e: string) => void; // React.Dispatch<React.SetStateAction<string>>;
  handleFetchClick: () => void;
  handleLogin: () => void;
  handleLogout: () => void;
};

const TopBar: React.FC<TopBarProps> = ({
  url,
  username,
  setUrl,
  handleFetchClick,
  handleLogin,
  handleLogout,
}) => {
  return (
    <div className="items-center fixed flex top-0 justify-between w-full z-50 bg-slate-100 text-neutral-800 p-2 shadow">
      <div className="flex justify-center">
        <img className="w-8 h-8" src={RedditIcon.src} />
        <h1 className="text-lg font-semibold px-4 pt-1">
          Reddit Moderation Dashboard
        </h1>
      </div>
      <div className="">
        <input
          type="text"
          placeholder="Enter Reddit URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-4 w-[60ch] py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-left"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFetchClick();
            }
          }}
        />
      </div>

      <div className="flex justify-center text-neutral-800">
        <img className="w-8 h-8 rounded-full" src={RedditAvatar.src} />
        <h1 className="text-lg font-semibold px-4 pt-1">{username}</h1>
        <button
          className="text-lg font-semibold px-4 pt-1 hover:bg-gray-300"
          onClick={() => {
            if (username == "") {
              handleLogin();
            } else {
              handleLogout();
            }
          }}
        >
          {username == "" ? "Login" : "Logout"}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
