import React, { useState, useEffect } from "react";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Typography } from '@mui/material';

export function SidebarTree({ treeData, activeId, onNodeSelect, expandedItems }) {
    // Внутреннее состояние для управления раскрытыми узлами
    const [expanded, setExpanded] = useState([]);

    // 🟢 ИСПРАВЛЕНО: Раскрываем папки только при смене статьи (activeId). 
    // Это предотвратит автоматическое схлопывание при ручных кликах.
    useEffect(() => {
        if (Array.isArray(expandedItems) && expandedItems.length > 0) {
            setExpanded(expandedItems);
        }
    }, [activeId]); // Сюда передаем ТОЛЬКО activeId, убираем expandedItems из зависимостей

    const renderTreeNodes = (nodes) => {
        if (!Array.isArray(nodes)) return null;
        
        return nodes.map((node) => {
            const currentId = node.id !== undefined ? node.id : node.Id;
            const currentTitle = node.title || node.Title || "Без названия";
            const currentChildren = node.children || node.Children;

            if (currentId === undefined) return null;

            return (
                <TreeItem
                    key={currentId}
                    itemId={currentId.toString()}
                    label={currentTitle}
                    sx={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        '& .MuiTreeItem-content': {
                            py: '6px',
                            borderRadius: '4px',
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
                                fontWeight: 'bold',
                            }
                        }
                    }}
                >
                    {Array.isArray(currentChildren) && currentChildren.length > 0
                        ? renderTreeNodes(currentChildren)
                        : null}
                </TreeItem>
            );
        });
    };

    const handleSelectedItemsChange = (event, itemId) => {
        if (itemId && onNodeSelect) {
            onNodeSelect(parseInt(itemId, 10));
        }
    };

    const handleExpandedItemsChange = (event, itemIds) => {
        setExpanded(itemIds);
    };

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', p: 2 }}>
            <Typography 
                variant="subtitle2" 
                sx={{ pl: 1, mb: 1.5, fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}
            >
                Содержание
            </Typography>
            
            <SimpleTreeView
                selectedItems={activeId ? activeId.toString() : null}
                onSelectedItemsChange={handleSelectedItemsChange}
                expandedItems={expanded}
                onExpandedItemsChange={handleExpandedItemsChange}
            >
                {renderTreeNodes(treeData)}
            </SimpleTreeView>
        </Box>
    );
}
