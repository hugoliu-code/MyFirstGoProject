import React from "react";

// Define the type for a tree node
type TreeNodeData = {
  label: string;
  children?: TreeNodeData[];
};

// Recursive TreeNode component
const TreeNode: React.FC<{ node: TreeNodeData }> = ({ node }) => {
  return (
    <div className="ml-4 mt-2">
      <div className="font-medium">{node.label}</div>
      {node.children && (
        <div className="ml-4 border-l pl-4">
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

// Sample usage
const treeData: TreeNodeData = {
  label: "Root",
  children: [
    {
      label: "Child 1",
      children: [{ label: "Grandchild 1" }, { label: "Grandchild 2" }],
    },
    { label: "Child 2" },
  ],
};

const Tree: React.FC = () => {
  return (
    <div className="p-4">
      <TreeNode node={treeData} />
    </div>
  );
};

export default Tree;
