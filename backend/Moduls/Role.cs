using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Egov.Models
{
    [Table("roles")]
    public class Role
    {
        [Key]
        [Column("id")]
        public int Id{get; set;}

        [Required]
        [MaxLength(50)]
        [Column("name")]
        public required string Name {get; set;} = "";

        [Column("description")]
        public string Description{get; set;} = "";

        public List<Permission> Permissions { get; set; } = new();

    }
}