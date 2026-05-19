using Microsoft.EntityFrameworkCore;
using Egov.Models;
using Egov.Data;
using Egov.DTOs;
using Microsoft.AspNetCore.Mvc;

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

    //Возвращает ArticleReadDto
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ArticleReadDto>>> GetArticles()
    {
        var articles = await _context.Articles
            .Include(a => a.Author)
            .Include(a => a.Categories)
            .AsNoTracking()
            .ToListAsync();

        var articleDtos = articles.Select(a => new ArticleReadDto // Трансформируем модели БД в безопасные DTO
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
    public async Task<ActionResult<ArticleReadDto>> CreateArticle(ArticleCreateDto dto)
    {
        var author = await _context.Users.FindAsync(dto.AuthorId);// Проверяем автора
        if (author == null)
        {
            return BadRequest(new { message = "Указанный автор не существует." });
        }

        var article = new Article// Создаем модель статьи из DTO
        {
            Title = dto.Title,
            Content = dto.Content,
            AuthorId = dto.AuthorId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (dto.CategoryIds.Any())// Подтягиваем категории из БД по переданным ID и связываем со статьей
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
}
