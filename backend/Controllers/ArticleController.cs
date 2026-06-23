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
            return Ok(Array.Empty<object>());

        try
        {
            var suggestions = await _context.Articles
                .Where(a => EF.Functions.ILike(a.Title, $"%{query}%"))
                .Select(a => new { a.Id, a.Title })
                .Take(5)
                .ToListAsync();

            return Ok(suggestions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }




[HttpGet]
public async Task<ActionResult<IEnumerable<ArticleReadDto>>> GetArticles()
{
    // Стягиваем ВСЕ статьи из базы одним рекурсивным SQL-запросом.
    // Запрос вытаскивает id, title и parent_id для построения бесконечного дерева.
    var allMenuNodes = await _context.Articles
        .AsNoTracking()
        .Select(a => new ArticleMenuDto
        {
            Id = a.Id,
            Title = a.Title,
            ParentId = a.ParentId,
            Children = new List<ArticleMenuDto>()
        })
        .ToListAsync();

    var dict = allMenuNodes.ToDictionary(n => n.Id);
    
    // Сюда будем складывать дочерние деревья, сгруппированные по ParentId
    var childrenGroupedByParent = allMenuNodes
        .Where(n => n.ParentId != null)
        .GroupBy(n => n.ParentId!.Value)
        .ToDictionary(g => g.Key, g => g.ToList());

    // Рекурсивная функция, которая привязывает детей к их родителям на любую глубину
    void BuildMenuTree(ArticleMenuDto parent)
    {
        if (childrenGroupedByParent.TryGetValue(parent.Id, out var children))
        {
            parent.Children = children;
            foreach (var child in children)
            {
                BuildMenuTree(child); // Спускаемся бесконечно вглубь дерева
            }
        }
    }

    //Загружаем корневые статьи со всеми их реальными данными (Авторы, Категории, Контент)
    var rootArticles = await _context.Articles
        .Where(a => a.ParentId == null)
        .Include(a => a.Author)
        .Include(a => a.Categories)
        .ToListAsync();

    //Маппим корневые статьи в итоговый DTO и привязываем к ним собранные бесконечные деревья
    var articleDtos = rootArticles.Select(a => {
        // Ищем корневой узел в нашей плоской структуре меню
        List<ArticleMenuDto> rootChildren = new();
        if (childrenGroupedByParent.TryGetValue(a.Id, out var children))
        {
            rootChildren = children;
            foreach (var child in rootChildren)
            {
                BuildMenuTree(child); // Раскрываем дерево детей до самого конца
            }
        }

        return new ArticleReadDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt,
            AuthorId = a.AuthorId,
            AuthorName = a.Author?.Name ?? "Неизвестный автор",
            Categories = a.Categories.Select(c => c.Name).ToList(),
            Children = rootChildren // Отдаем фронтенду полностью собранное бесконечное дерево
        };
    }).ToList();

    return Ok(articleDtos);
}



[HttpGet("{id}")]
public async Task<ActionResult<ArticleReadDto>> GetArticle(int id)
{
    // Загружаем текущую статью со всеми связями
    var article = await _context.Articles
        .Include(a => a.Author)
        .Include(a => a.Categories)
        .Include(a => a.VirtualMachines) // Машины самой статьи
        .AsNoTracking()
        .FirstOrDefaultAsync(a => a.Id == id);

    if (article == null) return NotFound();

    // СОБИРАЕМ ИНФРАСТРУКТУРУ РОДИТЕЛЕЙ (Наверх по дереву подсистем)
    var allVms = new List<VirtualMachineDto>();

    // Сначала добавляем машины текущей статьи
    if (article.VirtualMachines != null)
    {
        allVms.AddRange(article.VirtualMachines.Select(vm => new VirtualMachineDto
        {
            Id = vm.Id,
            Name = vm.Name,
            IpAddress = vm.IpAddress,
            OS = vm.OS,
            Status = vm.Status
        }));
    }

    // Если у статьи есть родитель, поднимаемся вверх и забираем его машины тоже
    int? currentParentId = article.ParentId;
    while (currentParentId != null)
    {
        var parentArticle = await _context.Articles
            .Include(a => a.VirtualMachines)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == currentParentId.Value);

        if (parentArticle != null)
        {
            if (parentArticle.VirtualMachines != null)
            {
                foreach (var vm in parentArticle.VirtualMachines)
                {
                    // Защита от дубликатов: добавляем сервер, только если его еще нет в списке
                    if (!allVms.Any(v => v.Id == vm.Id))
                    {
                        allVms.Add(new VirtualMachineDto
                        {
                            Id = vm.Id,
                            Name = vm.Name,
                            IpAddress = vm.IpAddress,
                            OS = vm.OS,
                            Status = vm.Status
                        });
                    }
                }
            }
            currentParentId = parentArticle.ParentId; // Идем еще выше по иерархии (если есть)
        }
        else
        {
            break;
        }
    }

    string? userRole = null;
    if (User.Identity != null && User.Identity.IsAuthenticated)
    {
        userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value 
                   ?? User.FindFirst("role")?.Value;
    }
    
    bool isUserAdmin = userRole == "admin";

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
        Categories = article.Categories.Select(c => c.Name).ToList(),
        VirtualMachines = isUserAdmin ? allVms : new List<VirtualMachineDto>()
    };

    return Ok(articleDto);
}



[HttpGet("{id}/sidebar")]
public async Task<ActionResult<SidebarResponseDto>> GetSidebarTree(int id)
{
    var currentArticle = await _context.Articles
        .Select(a => new { a.Id, a.ParentId })
        .FirstOrDefaultAsync(a => a.Id == id);

    if (currentArticle == null) 
        return NotFound(new { message = "Статья не найдена" });

    var allNodes = await _context.Articles
        .AsNoTracking()
        .Select(a => new ArticleMenuDto
        {
            Id = a.Id,
            Title = a.Title,
            ParentId = a.ParentId,
            Children = new List<ArticleMenuDto>()
        })
        .ToListAsync();

    var dict = allNodes.ToDictionary(n => n.Id);
    
    //ВЫЧИСЛЯЕМ ПУТЬ СТАТЬИ ДЛЯ АВТО-РАСКРЫТИЯ
    var expandedIds = new List<string>();
    int? currentParentId = currentArticle.ParentId;
    
    while (currentParentId != null && dict.TryGetValue(currentParentId.Value, out var pNode))
    {
        expandedIds.Add(pNode.Id.ToString()); 
        currentParentId = pNode.ParentId;
    }

    // Ищем корень всей ветки
    int rootId = currentArticle.Id;
    int? parentId = currentArticle.ParentId;
    while (parentId != null && dict.TryGetValue(parentId.Value, out var parentNode))
    {
        rootId = parentNode.Id;
        parentId = parentNode.ParentId;
    }

    // Собираем дерево в памяти
    var rootNodes = new List<ArticleMenuDto>();
    foreach (var item in allNodes)
    {
        if (item.Id == rootId)
        {
            rootNodes.Add(item);
        }
        else if (item.ParentId != null && dict.TryGetValue(item.ParentId.Value, out var parentNode))
        {
            parentNode.Children.Add(item);
        }
    }

    var response = new SidebarResponseDto
    {
        Tree = rootNodes,
        ExpandedIds = expandedIds
    };

    return Ok(response);
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

        //Привязываем категории к статье
        if (dto.CategoryIds != null && dto.CategoryIds.Any())
        {
            var categories = await _context.Categories
                .Where(c => dto.CategoryIds.Contains(c.Id))
                .ToListAsync();
            
            article.Categories = categories;
        }

        //Привязываем виртуальные машины ко множественной промежуточной таблице
        if (dto.VirtualMachineIds != null && dto.VirtualMachineIds.Any())
        {
            var selectedVms = await _context.VirtualMachines
                .Where(vm => dto.VirtualMachineIds.Contains(vm.Id))
                .ToListAsync();
            
            article.VirtualMachines = selectedVms;
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
            Categories = article.Categories.Select(c => c.Name).ToList(),
            
            //Маппим связанные машины в итоговый DTO ответа для фронтенда
            VirtualMachines = article.VirtualMachines.Select(vm => new VirtualMachineDto
            {
                Id = vm.Id,
                Name = vm.Name,
                IpAddress = vm.IpAddress,
                OS = vm.OS,
                Status = vm.Status
            }).ToList()
        };

        return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, responseDto);
    }


    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutArticle(int id, ArticleCreateDto dto)
    {
        var article = await _context.Articles
            .Include(a => a.Categories)
            .Include(a => a.VirtualMachines) //Подгружаем связанные машины перед обновлением
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            return NotFound(new { message = $"Статья для обновления с ID {id} не найдена." });
        }

        // Логируем старый контент в историю изменений, если текст поменялся
        if (article.Content != dto.Content)
        {
            var historyEntry = new HistoryOfChanges
            {
                ArticleId = article.Id,
                OldContent = article.Content,
                EditorId = dto.AuthorId, 
                ChangedAt = DateTime.UtcNow
            };
            _context.HistoryOfChanges.Add(historyEntry);
        }

        article.Title = dto.Title;
        article.Content = dto.Content;
        article.ParentId = dto.ParentId;
        article.UpdatedAt = DateTime.UtcNow;

        // Обновляем связи с категориями
        article.Categories.Clear(); 
        if (dto.CategoryIds != null && dto.CategoryIds.Any())
        {
            var categories = await _context.Categories
                .Where(c => dto.CategoryIds.Contains(c.Id))
                .ToListAsync();
            
            article.Categories = categories;
        }

        //Синхронизируем связи с виртуальными машинами («многие-ко-многим»)
        article.VirtualMachines.Clear(); // Сбрасываем старые привязанные сервера для этой статьи
        if (dto.VirtualMachineIds != null && dto.VirtualMachineIds.Any())
        {
            var selectedVms = await _context.VirtualMachines
                .Where(vm => dto.VirtualMachineIds.Contains(vm.Id))
                .ToListAsync();
            
            article.VirtualMachines = selectedVms;
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
