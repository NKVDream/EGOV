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

    [HttpGet("suggestions")]
    public async Task<IActionResult> GetSuggestions([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return Ok(Array.Empty<object>()); // Возвращаем пустой массив

        try
        {
            var suggestions = await _context.Articles
                .Where(a => EF.Functions.ILike(a.Title, $"%{query}%"))
                .Select(a => new { a.Id, a.Title }) // Извлекаем И Id, И Title
                .Take(5)
                .ToListAsync();

            return Ok(suggestions); // Возвращает JSON: [{"id": 1, "title": "Квантунская армия"}]
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }




    [HttpGet]
    public async Task<ActionResult<IEnumerable<ArticleReadDto>>> GetArticles()
    {
        var articles = await _context.Articles
            .Where(a => a.ParentId == null)
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
            ParentId = article.ParentId,
            Categories = article.Categories.Select(c => c.Name).ToList()
        };

        return Ok(articleDto);
    }

    [HttpGet("{id}/sidebar")]
    public async Task<ActionResult<List<ArticleMenuDto>>> GetSidebarTree(int id)
    {
        var current = await _context.Articles.FindAsync(id);
        if(current == null) return NotFound(new {message = "Статья не найдена"});

        int rootId = current.Id;

        while(current.ParentId != null)
        {
            current = await _context.Articles.FindAsync(current.ParentId);
            if (current != null) rootId = current.Id;
        }

        var rawArticles = await _context.Articles
            .FromSqlRaw(@"
                WITH RECURSIVE ArticleTree AS (
                SELECT id, title, parent_id, FROM articles WHERE id = {0}
                UNION ALL
                SELECT a.id, a.title, a.parent_id
                FROM articles a
                INNER JOIN ArticleTree at ON a.parent_id = at.id
                )
                SELECT id, title, parent_id, '' as content, NOW() as created_at, NOW() as updated_at, 0 as author_id
                FROM ArticleTree", rootId)
            .Select(a => new ArticleMenuDto
            {
                Id = a.Id,
                Title = a.Title,
                ParentId = a.ParentId
            })
            .ToListAsync();

        var dict = rawArticles.ToDictionary(a => a.Id);
        var rootNodes = new List<ArticleMenuDto>();

        foreach(var item in rawArticles)
        {
            if(item.ParentId == null || !dict.ContainsKey(item.ParentId.Value))
            {
                rootNodes.Add(item);
            }
            else
            {
                dict[item.ParentId.Value].Children.Add(item);
            }
        }
        return Ok(rootNodes);
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
            ParentId = dto.ParentId,
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
        article.ParentId = dto.ParentId;
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

    [HttpGet("{id}/history")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetArticleHistory(int id)
    {
        // Проверяем, существует ли сама статья
        if (!await _context.Articles.AnyAsync(a => a.Id == id))
        {
            return NotFound(new { message = $"Статья с ID {id} не найдена." });
        }

        // Загружаем историю изменений, включая имя редактора для вывода в React
        var history = await _context.HistoryOfChanges
            .Where(h => h.ArticleId == id)
            .Include(h => h.Editor) // Убедитесь, что в модели HistoryOfChanges настроен Navigation Property к User
            .OrderByDescending(h => h.ChangedAt) // Свежие изменения будут первыми в списке
            .Select(h => new
            {
                Id = h.Id,
                Content = h.OldContent, // Передаем старый текст как контент версии
                ChangedAt = h.ChangedAt,
                EditorName = h.Editor != null ? h.Editor.Name : "Администратор"
              })
            .ToListAsync();

        return Ok(history);
    }

    [HttpPost("rollback/{historyId}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RollbackArticle(int historyId)
    {
        // Находим слепок истории
        var historyEntry = await _context.HistoryOfChanges
            .FirstOrDefaultAsync(h => h.Id == historyId);

        if (historyEntry == null)
        {
            return NotFound(new { message = $"Запись в истории с ID {historyId} не найдена." });
        }

        // Находим оригинальную статью, к которой относится этот слепок
        var article = await _context.Articles.FindAsync(historyEntry.ArticleId);
        if (article == null)
        {
            return NotFound(new { message = "Оригинальная статья для этой версии больше не существует." });
        }

        // Перед тем как перетереть текущие данные, сохраняем их текущее состояние в историю.
        // Это позволит админу вернуться назад, если он откатился по ошибке!
        if (article.Content != historyEntry.OldContent)
        {
            var currentTextBackup = new HistoryOfChanges
            {
                ArticleId = article.Id,
                OldContent = article.Content,
                EditorId = historyEntry.EditorId, // Фиксируем, кто инициировал откат
                ChangedAt = DateTime.UtcNow
            };
            _context.HistoryOfChanges.Add(currentTextBackup);
        }

        // Накатываем старый текст на статью
        article.Content = historyEntry.OldContent;
        article.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Статья успешно восстановлена к выбранной версии." });
    }

}
