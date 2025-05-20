import React, { useState, useEffect } from "react";
import RedditAvatar from "../../images/reddit-avatar.png";
export type CommentData = {
  author: string;
  text: string;
  children?: CommentData[];
  path?: CommentData[];
};
// Recursive TreeNode component
const CommentNode: React.FC<{
  node: CommentData;
  onClick: Function;
  path?: CommentData[];
}> = ({ node, onClick, path = [] }) => {
  const currentPath = [...path, node];

  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  });

  return (
    <div
      className={`ml-4 mt-2 transition-all duration-800 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="items-center flex">
        <img className="w-8 h-8 rounded-full" src={RedditAvatar.src} />
        <div className="text-base text-neutral-800 font-semibold p-2">
          {node.author}
        </div>
      </div>
      <button
        className="text-sm text-neutral-700 text-left border border-white hover:bg-gray-300"
        onClick={() => onClick(currentPath)}
      >
        {node.text}
      </button>
      {node.children && (
        <div className="ml-4 border-l pl-4">
          {node.children.map((child, index) => (
            <CommentNode
              key={index}
              node={child}
              onClick={onClick}
              path={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TreeProps {
  data: CommentData;
  onClick: (comments: CommentData[]) => Promise<void>;
}

const CommentTree: React.FC<TreeProps> = ({ data, onClick }) => {
  return (
    <div className="p-4">
      <CommentNode node={data} onClick={onClick} />
    </div>
  );
};

export default CommentTree;
