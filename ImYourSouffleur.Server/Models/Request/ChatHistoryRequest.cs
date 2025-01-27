namespace ImYourSouffleur.Server.Models.Request
{
    public class ChatHistoryRequest
    {
        public string Context { get; set; }
        public List<ChatMessage> Messages { get; set; } = new();
    }

    public class ChatMessage
    {
        public AuthorRole Role { get; set; }
        public string Content { get; set; } = string.Empty;
     
    }

    public enum AuthorRole
    {
        User,
        Assistant,
        System
    }
}
