namespace Egov.DTOs;

public class ArticleMenuDto
{
    public int Id{get; set;}
    public string Title{get; set;} = null!;
    public int? ParentId{get; set;}

    public List<ArticleMenuDto> Children {get; set;} = new();
}