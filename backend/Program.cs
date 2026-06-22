using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Egov.Data;
using Egov.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>//настройка CORS для связи с фронтом
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://localhost:5173",
            "http://localhost:3000"
            )//реакт на этом порту
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");//подключение к БД
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<JwtService>(); // Серивис регистрации токенов

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Egov API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme//схема безопасности JWT Bearer для свагера
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введите JWT-токен в формате: Bearer {ваш_токен}"
    });

    // Делаем так, чтобы Swagger прикреплял токен к защищенным запросам
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Egov API v1");
        c.RoutePrefix = string.Empty; // Открывает Swagger сразу на главной странице
    });
}

app.UseCors("AllowReact");

app.UseHttpsRedirection();

app.UseAuthentication(); //кто пользак
app.UseAuthorization();//что ему можно

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate(); 
        Console.WriteLine("--> Миграции успешно применены!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--> Ошибка при применении миграций: {ex.Message}");
    }
}

app.Run();