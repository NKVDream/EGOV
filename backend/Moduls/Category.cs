
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Egov.Models;

[Table("categories")]
public class Category
{
    [Key]
    [Column("id")]
    public int Id{get; set;}

    [Required]
    [Column("name")]
    public required string Name{get; set;}

    [Column("description")]
    public string Description{get; set;} ="";

    public List<Article> Articles { get; set; } = new();
}
