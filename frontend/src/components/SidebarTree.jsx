import React from "react";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Typography } from '@mui/material';

export function SidebarTree({ treeData, activeId, onNodeSelect }) {
    
    // Рекурсивный рендер элементов дерева
    const renderTreeNodes = (nodes) => {
        if (!Array.isArray(nodes)) return null;
        
        return nodes.map((node) => (
            <TreeItem
                key={node.id}
                itemId={node.id.toString()}
                label={node.title}
                sx={{
                    // 🟢 Нижняя полупрозрачная линия под каждым пунктом для читаемости
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    '& .MuiTreeItem-content': {
                        py: '6px', // Делаем пункты повыше и просторнее
                        borderRadius: '4px',
                        '&.Mui-selected': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
                            fontWeight: 'bold',
                        }
                    },
                    // Увеличиваем отступ для вложенных детей, чтобы дерево не сливалось
                    '& .MuiTreeItem-iconContainer': {
                        marginRight: '4px',
                    }
                }}
            >
                {Array.isArray(node.children) && node.children.length > 0
                    ? renderTreeNodes(node.children)
                    : null}
            </TreeItem>
        ));
    };

    const handleSelectedItemsChange = (event, itemId) => {
        if (itemId && onNodeSelect) {
            onNodeSelect(parseInt(itemId, 10));
        }
    };

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', p: 2 }}>
            <Typography 
                variant="subtitle2" 
                sx={{ 
                    pl: 1, 
                    mb: 1.5, 
                    fontWeight: 'bold', 
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                }}
            >
                Содержание
            </Typography>
            
            <SimpleTreeView
                selectedItems={activeId ? activeId.toString() : null}
                onSelectedItemsChange={handleSelectedItemsChange}
                sx={{
                    '& .MuiTreeItem-root': {
                        mt: '2px'
                    }
                }}
            >
                {renderTreeNodes(treeData)}
            </SimpleTreeView>
        </Box>
    );
}
