import { NextRequest, NextResponse } from 'next/server';
import { SageMakerRuntimeClient, InvokeEndpointCommand } from '@aws-sdk/client-sagemaker-runtime';

export const maxDuration = 60; // 1 minute for LLM processing

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Initialize SageMaker Runtime client
    const client = new SageMakerRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // System prompt for converting news articles to subway surfers story format
    const systemPrompt = `You are an expert storyteller who converts news articles into engaging, casual stories perfect for short-form video content like "Subway Surfers" Reddit story videos.

Your task is to rewrite news articles in a storytelling format with these characteristics:
- Use a casual, conversational tone like you're telling a friend an interesting story
- Start with an attention-grabbing hook (e.g., "So you won't believe what happened...", "Okay, this is wild...", "Listen to this crazy story...")
- Break down complex information into simple, easy-to-follow narrative beats
- Use everyday language and relatable examples - avoid jargon
- Add emotional context and human interest elements
- Keep sentences short and punchy for better pacing
- Include rhetorical questions to maintain engagement (e.g., "Can you imagine?", "What would you do?")
- Use storytelling techniques like building suspense, highlighting conflicts, and revealing outcomes
- Maintain factual accuracy while making it more dramatic and engaging
- Keep the story flowing naturally without being overly formal
- Aim for a length of 100-200 words for a 30-60 second video

Remember: You're creating content that people would want to listen to while watching gameplay footage. Make it interesting, relatable, and easy to follow!`;

    // Format the prompt using Llama 3.1 chat template
    const formattedPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

Please rewrite this news article in an engaging storytelling format:

${text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

    // Prepare the payload
    const payload = {
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: 512,
        top_p: 0.9,
        temperature: 0.7,
      },
    };

    console.log('[process-text] Calling SageMaker endpoint...');

    // Call SageMaker endpoint
    const command = new InvokeEndpointCommand({
      EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME!,
      ContentType: 'application/json',
      Body: JSON.stringify(payload),
    });

    const response = await client.send(command);

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.Body));

    console.log('[process-text] SageMaker response:', responseBody);

    // Extract the generated text
    // The response format from SageMaker typically has the generated text in a specific field
    let processedText = '';

    if (Array.isArray(responseBody) && responseBody.length > 0) {
      processedText = responseBody[0].generated_text || responseBody[0].text || '';
    } else if (typeof responseBody === 'object') {
      processedText = responseBody.generated_text || responseBody[0]?.generated_text || responseBody.text || '';
    } else if (typeof responseBody === 'string') {
      processedText = responseBody;
    }

    // Clean up the response to remove the prompt if it's included
    if (processedText.includes('<|start_header_id|>assistant<|end_header_id|>')) {
      processedText = processedText.split('<|start_header_id|>assistant<|end_header_id|>').pop()?.trim() || processedText;
    }

    // Remove any trailing special tokens
    processedText = processedText
      .replace(/<\|eot_id\|>/g, '')
      .replace(/<\|end_of_text\|>/g, '')
      .trim();

    console.log('[process-text] Processed text:', processedText);

    return NextResponse.json({
      processedText,
      originalText: text,
    });

  } catch (error) {
    console.error('Process text error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process text' },
      { status: 500 }
    );
  }
}
