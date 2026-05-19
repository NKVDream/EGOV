using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Egov.Models;
using Egov.Data;

namespace Egov.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoryController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories
            .Include(c => c.Articles) // Показываем, какие статьи привязаны к категории
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Articles)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound(new { message = $"Категория с ID {id} не найдена." });
        }

        return category;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        if (string.IsNullOrWhiteSpace(category.Name))
        {
            return BadRequest(new { message = "Название категории не может быть пустым." });
        }

        var nameExists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());// Проверяем уникальность имени
        if (nameExists)
        {
            return BadRequest(new { message = $"Категория с названием '{category.Name}' уже существует." });
        }

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategory(int id, Category updatedCategory)
    {
        if (id != updatedCategory.Id)
        {
            return BadRequest(new { message = "ID в URL не совпадает с ID в теле запроса." });
        }

        if (string.IsNullOrWhiteSpace(updatedCategory.Name))
        {
            return BadRequest(new { message = "Название категории не может быть пустым." });
        }

        var nameExists = await _context.Categories // Проверяем, не занято ли новое имя другой категорией
            .AnyAsync(c => c.Name.ToLower() == updatedCategory.Name.ToLower() && c.Id != id);
            
        if (nameExists)
        {
            return BadRequest(new { message = $"Другая категория уже использует название '{updatedCategory.Name}'." });
        }

        _context.Entry(updatedCategory).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await CategoryExists(id)) return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Articles) // Загружаем статьи, чтобы проверить их наличие
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound(new { message = $"Категория с ID {id} не найдена." });
        }

        // ЗАЩИТА ОШИБКИ RESTRICT: 
        // Если к категории привязаны статьи, не даем ее удалить, пока админ не уберет ее из статей.
        if (category.Articles.Any())
        {
            return BadRequest(new { 
                message = $"Нельзя удалить категорию '{category.Name}', так как к ней привязано {category.Articles.Count} статей. Сначала отредактируйте статьи." 
            });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> CategoryExists(int id)
    {
        return await _context.Categories.AnyAsync(e => e.Id == id);
    }
}
