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

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Active";

    // 🟢 ИСПРАВЛЕНО: Коллекция статей для бесконечной связи «многие-ко-многим»
    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
}
