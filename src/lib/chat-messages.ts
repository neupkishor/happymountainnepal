
// This file centralizes the logic for generating pre-filled chat messages.

interface ChatMessage {
  whatsapp: string;
  email: {
    subject: string;
    body: string;
  };
}

/**
 * Generates the default chat message for general inquiries.
 */
export function getGeneralChatMessage(): ChatMessage {
  const message = "Hello, Can I learn more about Happy Mountain Nepal, [userTempId]?";
  return {
    whatsapp: message,
    email: {
      subject: "General Inquiry about Happy Mountain Nepal",
      body: message,
    },
  };
}

/**
 * Generates a chat message specific to a tour package.
 * @param packageName The name of the tour package.
 */
export function getTourChatMessage(packageName: string): ChatMessage {
  const message = `Hello, Can I get more info on ${packageName}, [userTempId]?`;
  return {
    whatsapp: message,
    email: {
      subject: `Inquiry about: ${packageName}`,
      body: message,
    },
  };
}

/**
 * Generates a chat message specific to a blog article.
 * @param articleName The title of the blog article.
 */
export function getBlogChatMessage(articleName: string): ChatMessage {
  const message = `Wow, I liked the article "${articleName}", [userTempId]!`;
  return {
    whatsapp: message,
    email: {
      subject: `Regarding your article: "${articleName}"`,
      body: message,
    },
  };
}
