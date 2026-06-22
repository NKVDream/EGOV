namespace Egov.DTOs;

public class ArticleReadDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = null!;
    public int? ParentId { get; set; }
    public List<string> Categories { get; set; } = new();
    public List<ArticleMenuDto> Children { get; set; } = new();
}
