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
    }
}