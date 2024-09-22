import OpenAI from 'openai';

class AIResponder {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });


    this.systemPrompt = `
You are a compassionate and empathetic virtual assistant designed to support users who may be experiencing emotional distress. Your primary goal is to provide a safe, non-judgmental space for users to express their feelings. In your responses:

- Listen actively and empathetically to what the user is sharing.
- Acknowledge their feelings and validate their experiences.
- Use supportive and gentle language to convey understanding.
- Encourage them to seek professional help if they express severe distress or mention thoughts of self-harm.
- Avoid giving medical diagnoses or specific medical advice.
- Maintain confidentiality and trust, ensuring the user feels safe sharing their thoughts.
- Do not make assumptions or judgments about their situation.
    `;
  }

  public async generateResponse(userMessage: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    return completion.choices[0].message?.content || '';
  }

  public async generateResponseWithPrompt(prompt: string, userMessage: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'system', content: prompt },
        { role: 'user', content: userMessage },
      ],
    });

    return completion.choices[0].message?.content || '';
  }

  public async classifyUserResponse(prompt: string, userMessage: string): Promise<string> {
    const completion = await this.openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',

      prompt: `${prompt}\nUser: ${userMessage}\nClassification:`,
      max_tokens: 10,
      temperature: 0,
    });

    console.log(completion.choices[0].text?.trim())

    return completion.choices[0].text?.trim().toLowerCase() || '';
  }
}

export default AIResponder;