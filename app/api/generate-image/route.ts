import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return Response.json({ error: 'Prompt is required' }, { status: 400 });
  }

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
  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json(
      { error: 'Failed to generate image' }, 
      { status: 500 }
    );
  }
}