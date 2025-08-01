import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';

export async function POST(request: Request) {
  const { messages, action } = await request.json();

  if (action === 'generate-image') {
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;

    try {
      const { image } = await generateImage({
        model: openai.image('dall-e-3'),
        prompt,
        size: '1024x1024',
        providerOptions: {
          openai: { 
            quality: 'hd',
            style: 'vivid'
          },
        },
      });

      return Response.json({ 
        image: image.base64,
        mediaType: image.mediaType 
      });
    } catch (error: any) {
      console.error('Image generation error:', error);
      return Response.json(
        { error: error.message || 'Failed to generate image' }, 
        { status: 500 }
      );
    }
  }

  // For future: streaming text responses
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    system: 'You are a helpful AI assistant that helps users create image prompts. When a user asks for an image, enhance their prompt to be more descriptive and suitable for DALL-E 3.',
  });

  return result.toDataStreamResponse();
}