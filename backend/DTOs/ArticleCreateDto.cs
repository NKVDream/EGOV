using System.ComponentModel.DataAnnotations;

namespace Egov.DTOs;

public class ArticleCreateDto
{
    [Required(ErrorMessage = "Заголовок обязателен для заполнения")]
    [MaxLength(255)]
    public string Title { get; set; } = null!;

    [Required(ErrorMessage = "Содержимое статьи не может быть пустым")]
    public string Content { get; set; } = null!;

    [Required]
    public int AuthorId { get; set; }

    public int? ParentId{get; set;}

    public List<int> CategoryIds { get; set; } = new();

    public List<int> VirtualMachineIds { get; set; } = new List<int>();

}
