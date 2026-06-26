namespace Egov.DTOs;

public class SidebarResponseDto
{
    public List<ArticleMenuDto> Tree { get; set; } = new List<ArticleMenuDto>();
    public List<string> ExpandedIds { get; set; } = new List<string>();
}
