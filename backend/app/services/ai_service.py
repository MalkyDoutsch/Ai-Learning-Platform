import openai
from typing import Optional
import json

class AIService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        if api_key:
            openai.api_key = api_key
    
    async def generate_lesson(self, prompt: str, category: str, subcategory: str) -> dict:
        if not self.api_key:
            return {
                "content": "Please configure your OpenAI API key to generate lessons.",
                "metadata": {"error": "No API key configured"}
            }
        
        try:
            client = openai.OpenAI(api_key=self.api_key)
            
            system_prompt = f"""You are an expert teacher creating a lesson about {subcategory} in the {category} category.
            Create a comprehensive, well-structured lesson that includes:
            1. Introduction
            2. Key concepts
            3. Examples
            4. Practice exercises
            5. Summary
            Format the response in markdown."""
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            return {
                "content": content,
                "metadata": {
                    "model": "gpt-3.5-turbo",
                    "tokens": response.usage.total_tokens
                }
            }
        except Exception as e:
            return {
                "content": f"Error generating lesson: {str(e)}",
                "metadata": {"error": str(e)}
            }