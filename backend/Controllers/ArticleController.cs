using Microsoft.EntityFrameworkCore;
using Egov.Models;
using Egov.Data;
using Egov.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Egov.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticleController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ArticleController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ArticleReadDto>>> GetArticles()
    {
        var articles = await _context.Articles
            .Include(a => a.Author)
            .Include(a => a.Categories)
            .ToListAsync();

        var articleDtos = articles.Select(a => new ArticleReadDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt,
            AuthorId = a.AuthorId,
            AuthorName = a.Author?.Name ?? "Неизвестный автор",
            Categories = a.Categories.Select(c => c.Name).ToList()
        });

        return Ok(articleDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ArticleReadDto>> GetArticle(int id)
    {
        var article = await _context.Articles
            .Include(a => a.Author)
            .Include(a => a.Categories)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            return NotFound(new { message = $"Статья с ID {id} не найдена." });
        }

        var articleDto = new ArticleReadDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt,
            AuthorId = article.AuthorId,
            AuthorName = article.Author?.Name ?? "Неизвестный автор",
            Categories = article.Categories.Select(c => c.Name).ToList()
        };

        return Ok(articleDto);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ArticleReadDto>> CreateArticle(ArticleCreateDto dto)
    {
        var author = await _context.Users.FindAsync(dto.AuthorId);
        if (author == null)
        {
            return BadRequest(new { message = "Указанный автор не существует." });
        }

        var article = new Article
        {
            Title = dto.Title,
            Content = dto.Content,
            AuthorId = dto.AuthorId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (dto.CategoryIds.Any())
        {
            var categories = await _context.Categories
                .Where(c => dto.CategoryIds.Contains(c.Id))
                .ToListAsync();
            
            article.Categories = categories;
        }

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        var responseDto = new ArticleReadDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt,
            AuthorId = article.AuthorId,
            AuthorName = author.Name,
            Categories = article.Categories.Select(c => c.Name).ToList()
        };

        return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, responseDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutArticle(int id, ArticleCreateDto dto)
    {
        var article = await _context.Articles
            .Include(a => a.Categories)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            return NotFound(new { message = $"Статья для обновления с ID {id} не найдена." });
        }

        if (article.Content != dto.Content)//Логируем старый контент в историю изменений, если текст поменялся
        {
            var historyEntry = new HistoryOfChanges
            {
                ArticleId = article.Id,
                OldContent = article.Content,
                EditorId = dto.AuthorId, // Пользователь, приславший изменения, становится редактором
                ChangedAt = DateTime.UtcNow
            };
            _context.HistoryOfChanges.Add(historyEntry);
        }

        article.Title = dto.Title;
        article.Content = dto.Content;
        article.UpdatedAt = DateTime.UtcNow;

        article.Categories.Clear(); // Сбрасываем старые связи
        if (dto.CategoryIds.Any())
        {
            var categories = await _context.Categories
                .Where(c => dto.CategoryIds.Contains(c.Id))
                .ToListAsync();
            
            article.Categories = categories;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await ArticleExists(id)) return NotFound();
            throw;
        }

        return NoContent(); // 204 Успешно обновлено
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null)
        {
            return NotFound(new { message = $"Статья с ID {id} не найдена." });
        }

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();

        return NoContent(); // 204 Успешно удалено
    }

    private async Task<bool> ArticleExists(int id)
    {
        return await _context.Articles.AnyAsync(e => e.Id == id);
    }
}
