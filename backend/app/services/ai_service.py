import openai
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.model = "gpt-4o-mini"
    
    async def generate_lesson(
        self, 
        topic: str, 
        prompt: str, 
        category: Optional[str] = None,
        sub_category: Optional[str] = None
        ) -> str:
        """
        Generate an AI lesson based on topic and prompt.
        Falls back to mock response if OpenAI API is not available.
        """
        try:
            if not self.api_key:
                return self._generate_mock_lesson(topic, prompt, category, sub_category)
            
            # Construct the system message
            system_message = self._build_system_message(category, sub_category)
            
            # Construct the user message
            user_message = f"Topic: {topic}\n\nRequest: {prompt}"
            
            response = await self._call_openai_api(system_message, user_message)
            return response
            
        except Exception as e:
            print(f"Error generating AI lesson: {e}")
            # Fallback to mock lesson
            return self._generate_mock_lesson(topic, prompt, category, sub_category)
    
    def _build_system_message(self, category: Optional[str], sub_category: Optional[str]) -> str:
        """Build system message for OpenAI based on category context"""
        base_message = """You are an expert educator and tutor. Your role is to create engaging, 
        educational lessons that are clear, informative, and easy to understand. 
        
        Guidelines:
        - Provide comprehensive but digestible explanations
        - Use examples and analogies when helpful
        - Structure your response with clear sections
        - Include key takeaways or summary points
        - Keep the tone engaging and educational
        """
        
        if category and sub_category:
            context = f"\n\nContext: You are teaching about {sub_category} in the {category} domain."
            return base_message + context
        elif category:
            context = f"\n\nContext: You are teaching in the {category} domain."
            return base_message + context
        
        return base_message
    
    async def _call_openai_api(self, system_message: str, user_message: str) -> str:
        """Make API call to OpenAI"""
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            raise Exception(f"OpenAI API error: {e}")
    
    def _generate_mock_lesson(
        self, 
        topic: str, 
        prompt: str, 
        category: Optional[str] = None,
        sub_category: Optional[str] = None
        ) -> str:
        """Generate a mock lesson when OpenAI API is not available"""
        
        category_context = ""
        if category and sub_category:
            category_context = f" in {category} - {sub_category}"
        elif category:
            category_context = f" in {category}"
        
        mock_lesson = f"""
        # {topic}{category_context}

        ## Introduction
        This is a comprehensive lesson about **{topic}** based on your request: "{prompt}"

        ## Key Concepts

        ### What is {topic}?
        {topic} is an important subject that deserves careful study and understanding. This lesson will provide you with fundamental knowledge and practical insights.

        ### Why Study {topic}?
        Understanding {topic} is valuable because:
        - It provides foundational knowledge in this field
        - It helps develop critical thinking skills  
        - It has practical applications in real-world scenarios
        - It connects to broader concepts and ideas

        ## Main Content

        ### Core Principles
        The fundamental principles of {topic} include several key elements that work together to create a comprehensive understanding. These principles have been developed through extensive research and practical application.

        ### Practical Examples
        Here are some practical examples to help illustrate the concepts:

        1. **Example 1**: Real-world applications demonstrate how these principles work in practice
        2. **Example 2**: Case studies show the impact and importance of understanding this topic
        3. **Example 3**: Current examples highlight the relevance in today's world

        ### Advanced Concepts
        For those interested in deeper learning, advanced concepts in {topic} include:
        - Complex interactions between different elements
        - Historical development and evolution
        - Future trends and developments
        - Connections to other fields of study

        ## Summary and Key Takeaways

        ### What We've Learned
        - {topic} is a multifaceted subject with many important aspects
        - Understanding the core principles is essential for practical application
        - Real-world examples help illustrate theoretical concepts
        - Advanced concepts provide pathways for deeper learning

        ### Next Steps
        To continue your learning journey:
        - Practice applying these concepts in different contexts
        - Explore related topics and connections
        - Seek out additional resources and materials
        - Consider practical applications in your own life or work

        *Note: This lesson was generated using the AI Learning Platform. For the most current information, consider consulting additional authoritative sources.*
        """
        return mock_lesson.strip()

# Create a global instance
ai_service = AIService()