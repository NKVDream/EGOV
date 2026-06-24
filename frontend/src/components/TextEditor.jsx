import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import { Box } from '@mui/material';
import ImageResize from 'quill-image-resize-module-react';

const ImageFormat = Quill.import('formats/image');
class CustomImageFormat extends ImageFormat {
  static formats(domNode) {
    const formats = super.formats(domNode);
    if (domNode.hasAttribute('width')) formats.width = domNode.getAttribute('width');
    if (domNode.hasAttribute('height')) formats.height = domNode.getAttribute('height');
    return formats;
  }
  format(name, value) {
    if (name === 'width' || name === 'height') {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
// Регистрируем обновленный формат картинок вместо старого стандартного
Quill.register(CustomImageFormat, true);

// Регистрируем поддержку инлайн-стилей выравнивания
const Alignment = Quill.import('formats/align');
Quill.register(Alignment, true);

// Регистрируем модуль изменения размера картинок в системе Quill
Quill.register('modules/imageResize', ImageResize);

export default function TextEditor({ value, onChange, placeholder = 'Введите текст статьи...' }) {
  
  // Настройка кнопок на панели инструментов (Toolbar)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], 
      ['bold', 'italic', 'underline', 'strike'], 
      [{ 'color': [] }, { 'background': [] }], 
      [{ 'list': 'ordered' }, { 'list': 'bullet' }], 
      [{ 'align': [] }], 
      ['link', 'image'], 
      ['clean'] 
    ],
    // Настройки плагина трансформации картинок
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
      toolbarStyles: {
        backgroundColor: '#1e293b',
        border: 'none',
        color: '#ffffff',
        borderRadius: '4px',
        padding: '4px'
      },
      toolbarButtonStyles: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ffffff',
        cursor: 'pointer',
        padding: '4px 8px'
      },
      toolbarButtonActiveStyles: {
        backgroundColor: '#3b82f6',
        borderRadius: '2px'
      }
    }
  };

  // Настройка поддерживаемых форматов данных
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align', 
    'link', 'image',
    'width',
    'height'
  ];


     return (
    <Box 
      sx={{ 
        width: '100%', 
        backgroundColor: '#ffffff', 
        borderRadius: '4px',
        border: '1px solid #ccc',
        overflow: 'hidden',
        '& .ql-toolbar': {
          border: 'none !important',
          borderBottom: '1px solid #ccc !important',
          backgroundColor: '#f8fafc',
        },
        '& .ql-container': {
          border: 'none !important',
          minHeight: '350px', 
          fontFamily: 'inherit',
          fontSize: '1.05rem',
        },
        '& .ql-editor': {
          minHeight: '350px',
          lineHeight: '1.6',
          // Стили картинок внутри редактора
          '& img': {
            maxWidth: '100%',
            height: 'auto', // Оставляем auto для автоматического сохранения пропорций по высоте
            borderRadius: '4px',
            margin: '10px 0',
            display: 'inline-block' 
          },
          '& .ql-align-center': {
            textAlign: 'center',
            display: 'block',
            margin: '10px auto !important'
          },
          '& .ql-align-right': {
            textAlign: 'right',
            display: 'block',
            margin: '10px 0 10px auto !important'
          },
          '& .ql-align-left': {
            textAlign: 'left',
            display: 'block',
            margin: '10px auto 10px 0 !important'
          }
        }
      }}
    >
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </Box>
  );
}
