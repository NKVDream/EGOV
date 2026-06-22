import React from "react";
import { Box, Typography } from '@mui/material';

export function LineSidebarTree({ treeData, onNodeSelect }) {
    
    // Чистый рекурсивный рендер схемы на стандартных HTML-блоках (Box) без MUI TreeView
    const renderNodesFlat = (nodes, isRoot = true) => {
        if (!Array.isArray(nodes)) return null;
        
        return nodes.map((node, index) => {
            const currentId = node.id !== undefined ? node.id : node.Id;
            const currentTitle = node.title || node.Title || "Без названия";
            const currentChildren = node.children || node.Children;

            if (currentId === undefined) return null;

            const isLast = index === nodes.length - 1;

            return (
                <Box key={currentId} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }}>
                    
                    {/* СТРОКА С КНОПКОЙ СТАТЬИ */}
                    <Box 
                        onClick={() => onNodeSelect && onNodeSelect(currentId)}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            position: 'relative', 
                            minHeight: '36px',
                            cursor: 'pointer',
                            pl: '36px',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                '& .node-text': { color: '#1976d2' }
                            }
                        }}
                    >
                        {/* ВЕРТИКАЛЬНАЯ ЛИНИЯ-СТВОЛ */}
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                left: '16px', 
                                top: 0, 
                                height: isLast ? '18px' : '100%', // Срезаем хвост у последнего элемента
                                width: '1px', 
                                backgroundColor: '#cbd5e1',
                                zIndex: 1
                            }} 
                        />
                        
                        {/* 🟢 ГОРИЗОНТАЛЬНАЯ ВЕТОЧКА И ТОЧКА-УЗЕЛ */}
                        <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '16px', zIndex: 2 }}>
                            <Box sx={{ width: '12px', height: '1px', backgroundColor: '#cbd5e1' }} />
                            <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                        </Box>

                        {/* Текст названия статьи */}
                        <Typography 
                          className="node-text"
                          variant="body2" 
                          sx={{ color: '#1e293b', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' }}
                        >
                          {currentTitle}
                        </Typography>
                    </Box>

                    {/* РЕНДЕР ПОДСТАТЕЙ СЛЕДУЮЩЕГО УРОВНЯ (если они есть) */}
                    {Array.isArray(currentChildren) && currentChildren.length > 0 && (
                        <Box sx={{ pl: '20px', position: 'relative' }}>
                            {renderNodesFlat(currentChildren, false)}
                        </Box>
                    )}

                </Box>
            );
        });
    };

    if (!Array.isArray(treeData) || treeData.length === 0) return null;

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', pt: 0.5 }}>
            {renderNodesFlat(treeData, true)}
        </Box>
    );
}
