using System.Text.Json.Serialization;

namespace Egov.DTOs;

public class ArticleCreateDto
{
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public int AuthorId { get; set; }
    public int? ParentId { get; set; }
    public List<int> CategoryIds { get; set; } = new List<int>();

    [JsonPropertyName("virtualMachineIds")] 
    public List<int> VirtualMachineIds { get; set; } = new List<int>();
}
