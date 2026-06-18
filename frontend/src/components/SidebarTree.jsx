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
    };

    const handleSelectedItemChange = (event, itemId) => {
        if(itemId && onNodeSelect){
            onNodeSelect(parseInt(itemId, 10));
        }
    };
    return(
        <Box sx={{width: '100%', maxWidth:300, bgcolor: 'Background.paper', p:1}}>
            <Typography variant="h6" sx={{pl: 1, mb: 2, fontWeight: 'bold'}}>
                Содержание
            </Typography>
            <SimpleTreeView
            selectItems={activeId ? activeId.toString() : null}
            onSelectedItemsChange={handleSelectedItemsChange}
            >
                {renderTreeNodes(treeData)}
            </SimpleTreeView>
        </Box>
    );
}