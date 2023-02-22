using Welcome.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddSingleton<IDictionary<string, AgentInfo>>(opt => new Dictionary<string, AgentInfo>());
builder.Services.AddSingleton<IDictionary<string, CustomerInfo>>(opt => new Dictionary<string, CustomerInfo>());
builder.Services.AddSingleton<IDictionary<string, List<UserConnection>>>(opt => new Dictionary<string, List<UserConnection>>());

builder.Services.AddCors();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = string.Empty;
});


app.UseDeveloperExceptionPage();

app.UseAuthorization();

app.MapControllers();

app.Run();
