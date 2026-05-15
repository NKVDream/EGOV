using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Egov.Models
{
    [Table("permissions")]
    public class Permission
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("name")]
        public required string Name { get; set; }

        [MaxLength(255)]
        [Column("description")]
        public string? Description { get; set; }

        // Обратная навигационная связь с ролями
        public List<Role> Roles { get; set; } = new();
    }
}
