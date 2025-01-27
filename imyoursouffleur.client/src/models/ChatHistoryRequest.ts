

export enum AuthorRole {
    User,
    Assistant,
    System
}

export class ChatHistoryRequest {
    messages: ChatMessage[];
    context: string;

    constructor(context:string, messages: ChatMessage[]) {       
        this.messages = messages;
        this.context = context;
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