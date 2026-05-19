namespace Egov.DTOs;

public class UserReadDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    
    // Вместо сложного объекта Role передаем клиенту только строку с названием роли
    public string RoleName { get; set; } = null!;
}
