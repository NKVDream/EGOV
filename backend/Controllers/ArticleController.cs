using Microsoft.EntityFrameworkCore;
using Egov.Models;
using Egov.Data;
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Article>>> GetArticles()
    {
        return await _context.Articles
            .Include(a => a.Author)
            .Include(a => a.Categories)
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Article>> GetArticle(int id)
    {
        var article = await _context.Articles
            .Include(a => a.Author)
            .Include(a => a.Categories)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            return NotFound(new { message = $"Статья с ID {id} не найдена." });
        }

        return article;
    }

    [HttpPost]
    public async Task<ActionResult<Article>> CreateArticle(Article article)
    {
        if (string.IsNullOrWhiteSpace(article.Title) || string.IsNullOrWhiteSpace(article.Content))
        {
            return BadRequest(new { message = "Tittle and content cant be empty" });
        }

        var authorExists = await _context.Users.AnyAsync(u => u.Id == article.AuthorId);
        if (!authorExists)
        {
            return BadRequest(new { message = "Указанный автор (User) не существует." });
        }


        article.CreatedAt = DateTime.UtcNow;
        article.UpdatedAt = DateTime.UtcNow;

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutArticle(int id, Article updatedArticle)
    {
        if (id != updatedArticle.Id)
        {
            return BadRequest(new { message = "ID в URL не совпадает с ID в теле запроса." });
        }

        var originalArticle = await _context.Articles.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);// Находим оригинальную статью в БД без отслеживания, чтобы зафиксировать старый текст
        if (originalArticle == null)
        {
            return NotFound(new { message = $"Статья для обновления с ID {id} не найдена." });
        }

        if (string.IsNullOrWhiteSpace(updatedArticle.Title) || string.IsNullOrWhiteSpace(updatedArticle.Content))
        {
            return BadRequest(new { message = "Заголовок и содержимое не могут быть пустыми." });
        }

        if (originalArticle.Content != updatedArticle.Content)// Если текст статьи изменился, логируем старую версию в историю изменений
        {
            var historyEntry = new HistoryOfChanges
            {
                ArticleId = originalArticle.Id,
                OldContent = originalArticle.Content,
                EditorId = updatedArticle.AuthorId, // Принимаем автора запроса как редактора
                ChangedAt = DateTime.UtcNow
            };
            
            _context.HistoryOfChanges.Add(historyEntry);
        }

        updatedArticle.UpdatedAt = DateTime.UtcNow;
        
        _context.Entry(updatedArticle).State = EntityState.Modified;
        
        _context.Entry(updatedArticle).Property(x => x.CreatedAt).IsModified = false;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await ArticleExists(id)) return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null)
        {
            return NotFound(new { message = $"Article with ID {id} hasnt been found" });
        }

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();

        return NoContent();
    }


    private async Task<bool> ArticleExists(int id)
    {
        return await _context.Articles.AnyAsync(e => e.Id == id);
    }
}
