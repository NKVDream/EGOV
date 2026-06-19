import React from "react";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Typography } from '@mui/material';

export function SidebarTree({ treeData, activeId, onNodeSelect }) {
    
    // Рекурсивная функция для построения бесконечного дерева элементов
    const renderTreeNodes = (nodes) => {
        if (!Array.isArray(nodes)) return null;
        
        return nodes.map((node) => (
            <TreeItem
                key={node.id}
                itemId={node.id.toString()}
                label={node.title}
            >
                {Array.isArray(node.children) && node.children.length > 0
                    ? renderTreeNodes(node.children)
                    : null}
            </TreeItem>
        ));
    };

    // Исправлено имя функции: теперь оно совпадает с пропсом в SimpleTreeView
    const handleSelectedItemsChange = (event, itemId) => {
        if (itemId && onNodeSelect) {
            onNodeSelect(parseInt(itemId, 10));
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 300, bgcolor: 'background.paper', p: 1, borderRight: '1px solid #e0e0e0', height: '100vh' }}>
            <Typography variant="h6" sx={{ pl: 1, mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                Содержание
            </Typography>
            
            <SimpleTreeView
                selectedItems={activeId ? activeId.toString() : null} // Исправлено с selectItems на selectedItems
                onSelectedItemsChange={handleSelectedItemsChange}
            >
                {renderTreeNodes(treeData)}
            </SimpleTreeView>
        </Box>
    );
}
