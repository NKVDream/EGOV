using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Egov.Models;

[Table("articles")]
public class Article
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("title")]
    public required string Title { get; set; }

    [Required]
    [Column("content")]
    public required string Content { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }


    [Column("author_id")]
    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public ICollection<Category> Categories { get; set; } = new List<Category>();
}