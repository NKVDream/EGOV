using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Egov.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public required string Name { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("email")]
    public required string Email { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("password_hash")]
    public required string PasswordHash { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [ForeignKey(nameof(RoleId))]
    public Role Role { get; set; } = null!;

    // Навигационное свойство: один пользователь (админ) может написать много статей
    public List<Article> Articles { get; set; } = new();
}

