import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured');
    return Response.json(
      { error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.' }, 
      { status: 500 }
    );
  }

  const { prompt, size = '1024x1024', quality = 'hd', style = 'vivid' } = await request.json();

  if (!prompt) {
    return Response.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const { image } = await generateImage({
      model: openai.image('dall-e-3'),
      prompt,
      size: size as any,
      providerOptions: {
        openai: { 
          quality,
          style
        },
      },
    });

    return Response.json({ 
      image: image.base64,
      mediaType: image.mediaType 
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    
    // More detailed error messages
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return Response.json(
        { error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.' }, 
        { status: 401 }
      );
    }
    
    if (error.message?.includes('429')) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    if (error.message?.includes('quota')) {
      return Response.json(
        { error: 'OpenAI quota exceeded. Please check your OpenAI account.' }, 
        { status: 402 }
      );
    }
    
    return Response.json(
      { error: error.message || 'Failed to generate image' }, 
      { status: 500 }
    );
  }
}