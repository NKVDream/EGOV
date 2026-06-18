using Microsoft.EntityFrameworkCore;
using Egov.Models;

namespace Egov.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
        
    }

    public DbSet<User>Users{get; set;}
    public DbSet<Category>Categories{get; set;}
    public DbSet<Article>Articles{get; set;}
    public DbSet<Permission> Permissions{get;set;}
    public DbSet<Role>Roles{get; set;}
    public DbSet<HistoryOfChanges>HistoryOfChanges{get; set;}

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Article>()
        .HasOne(a => a.Parent)
        .WithMany(a => a.Children)
        .HasForeignKey(a => a.ParentId)
        .OnDelete(DeleteBehavior.Cascade);
        
    modelBuilder.Entity<Article>()
        .HasMany(a => a.Categories)
        .WithMany(c => c.Articles)
        .UsingEntity<Dictionary<string, object>>(
            "ArticleCategoryJoin",
            j => j
                .HasOne<Category>()
                .WithMany()
                .HasForeignKey("category_id") 
                .HasPrincipalKey(c => c.Id),
            j => j
                .HasOne<Article>()
                .WithMany()
                .HasForeignKey("article_id") 
                .HasPrincipalKey(a => a.Id),
            j => j
                .ToTable("article_category") 
        );
}

}