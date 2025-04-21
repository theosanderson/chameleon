import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { theme } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }
    
    // Ensure the API key is set
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates word lists for the game Chameleon. Your response should be exactly 16 related words or short phrases on the given theme, formatted as a JSON array with a property called 'items'. Often the word will be a category and the items should be examples of that category. For example, if the theme is 'fruits', the items could be ['apple', 'banana', 'cherry', ...]. Sometimes the word might just be a theme and you need to generate a list of words generally on that theme. If all the words in your list have a common form like Dr ____ you can probably leave out the Dr."
        },
        {
          role: "user",
          content: `Generate 16 items for the Chameleon game on the theme: ${theme}. Format your response as a JSON object with a single property 'items' containing an array of 16 strings. Example: {"items": ["word1", "word2", ..., "word16"]}`
        }
      ]
    });

    let content;
    try {
      content = JSON.parse(response.choices[0].message.content);
      
      if (!Array.isArray(content.items) || content.items.length !== 16) {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      
      // Fallback to extract items from unstructured response
      const text = response.choices[0].message.content;
      const matches = text.match(/\[([\s\S]*)\]/);
      
      if (matches && matches[1]) {
        try {
          const extractedArray = JSON.parse(`[${matches[1]}]`);
          if (Array.isArray(extractedArray) && extractedArray.length === 16) {
            content = { items: extractedArray };
          } else {
            throw new Error('Could not extract 16 items');
          }
        } catch (e) {
          throw new Error('Failed to parse response');
        }
      } else {
        throw new Error('Failed to extract items from response');
      }
    }

    return res.status(200).json({ items: content.items });
  } catch (error) {
    console.error('Error generating tiles:', error);
    return res.status(500).json({ error: 'Failed to generate tiles' });
  }
}
