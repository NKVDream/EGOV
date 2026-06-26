namespace Egov.DTOs;

public class UserReadDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    
    public string RoleName { get; set; } = null!;
}
