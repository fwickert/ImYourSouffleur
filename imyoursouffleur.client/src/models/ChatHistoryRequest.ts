

export enum AuthorRole {
    User,
    Assistant,
    System
}

export class ChatHistoryRequest {
    messages: ChatMessage[];
    

    constructor(messages: ChatMessage[]) {       
        this.messages = messages;
    }
}

export class ChatMessage {
    role: AuthorRole;
    content: string;
    constructor(content: string, role: AuthorRole) {
        this.role = role;
        this.content = content;
    }
}