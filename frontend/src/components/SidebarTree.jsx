import React from "react";
import {SimpleTreeView } from '@mui/x-tree-view/TreeItem';
import {TreeItem } from '@mui/x-tree-view/TreeItem';
import {Box, Typography } from '@mui/material';

export function SidebarTree({treeData, activeId, onNodeSelect}){
    const renderTreeNodes = (nodes) =>{
        return nodes.map((node) => (
            <TreeItem
            key={node.id}
            itemId={node.id.toString()}
            label={node.title}
            >
                {Array.isArray(node.children) && node.children.length > 0
                ? renderTreeNodes(node.children)
            :null}
            </TreeItem>
        ));
    }
}