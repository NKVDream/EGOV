using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Egov.Models;

[Table("virtual_machines")]
public class VirtualMachine
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    [Column("ip_address")]
    public string IpAddress { get; set; } = null!;

    [MaxLength(255)]
    [Column("os")]
    public string? OS { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Active";

    // Внешний ключ на статью-подсистему (может быть null если VM общая)
    [Column("article_id")]
    public int? ArticleId { get; set; }
    
    public virtual Article? Article { get; set; }
}
