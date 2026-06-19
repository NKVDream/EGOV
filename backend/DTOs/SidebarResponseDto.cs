// В файле Egov/DTOs/SidebarResponseDto.cs
namespace Egov.DTOs;

public class SidebarResponseDto
{
    // Обязательно инициализируем списки по умолчанию, чтобы бэкенд не вернул null
    public List<ArticleMenuDto> Tree { get; set; } = new List<ArticleMenuDto>();
    public List<string> ExpandedIds { get; set; } = new List<string>();
}
