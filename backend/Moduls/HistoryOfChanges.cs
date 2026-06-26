using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Egov.Models;

[Table("history_of_changes")]
public class HistoryOfChanges
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("article_id")]
    public int ArticleId { get; set; }
    
    [ForeignKey(nameof(ArticleId))]
    public Article Article { get; set; } = null!;

    [Required]
    [Column("old_content")]
    public required string OldContent { get; set; }

    [Column("editor_id")]
    public int EditorId { get; set; }
    
    [ForeignKey(nameof(EditorId))]
    public User Editor { get; set; } = null!;

    [Column("changed_at")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime ChangedAt { get; set; }
}
