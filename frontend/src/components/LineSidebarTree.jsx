import React from "react";
import { Box, Typography } from '@mui/material';

export function LineSidebarTree({ treeData, onNodeSelect }) {
    
    const renderNodesFlat = (nodes) => {
        if (!Array.isArray(nodes)) return null;
        
        return nodes.map((node, index) => {
            const currentId = node.id !== undefined ? node.id : node.Id;
            const currentTitle = node.title || node.Title || "Без названия";
            const currentChildren = node.children || node.Children;

            if (currentId === undefined) return null;

            const isLast = index === nodes.length - 1;

            return (
                <Box key={currentId} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }}>
                    
                    {/* СТРОКА ЭЛЕМЕНТА */}
                    <Box 
                        onClick={() => onNodeSelect && onNodeSelect(currentId)}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            position: 'relative', 
                            minHeight: '32px',
                            cursor: 'pointer',
                            pl: '24px',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                '& .node-text': { color: '#1976d2' }
                            }
                        }}
                    >
                        {/*ВЕРТИКАЛЬНАЯ ЛИНИЯ-СТВОЛ ДЛЯ ТЕКУЩЕГО ЭЛЕМЕНТА */}
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                left: 0, 
                                top: 0, 
                                height: isLast ? '16px' : '100%', 
                                width: '1px', 
                                backgroundColor: '#cbd5e1',
                                zIndex: 1
                            }} 
                        />

                        {/*ГОРИЗОНТАЛЬНАЯ ВЕТОЧКА И ТОЧКА-УЗЕЛ */}
                        <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', left: 0, zIndex: 2 }}>
                            <Box sx={{ width: '12px', height: '1px', backgroundColor: '#cbd5e1' }} />
                            <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                        </Box>

                        {/* Текст названия статьи */}
                        <Typography 
                          className="node-text"
                          variant="body2" 
                          sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
                        >
                          {currentTitle}
                        </Typography>
                    </Box>

                    {/* РЕНДЕР ПОДСТАТЕЙ СЛЕДУЮЩЕГО УРОВНЯ */}
                    {Array.isArray(currentChildren) && currentChildren.length > 0 && (
                        <Box 
                            sx={{ 
                                pl: '20px',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: isLast ? '16px' : 0,
                                    width: '1px',
                                    backgroundColor: isLast ? 'transparent' : '#cbd5e1',
                                    zIndex: 1
                                }
                            }}
                        >
                            {renderNodesFlat(currentChildren)}
                        </Box>
                    )}

                </Box>
            );
        });
    };

    if (!Array.isArray(treeData) || treeData.length === 0) return null;

    return (
        <Box 
            sx={{ 
                width: '100%', 
                boxSizing: 'border-box', 
                pt: 0.5,
                pl: '8px',
                position: 'relative'
            }}
        >
            {renderNodesFlat(treeData)}
        </Box>
    );
}
