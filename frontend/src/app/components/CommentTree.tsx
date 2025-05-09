import React from "react";

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

  return (
    <div className="ml-4 mt-2">
      <div className="text-base">{node.author}</div>
      <button
        className="text-sm text-left border border-white hover:border-blue-400"
        // onClick={() => {
        //   console.log("Path to this comment:");
        //   console.log(currentPath.map((n) => n.text));
        // }}
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
